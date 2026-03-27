"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { rgb, PDFDocument, StandardFonts } from "pdf-lib";
import {
  downloadBlob,
  formatBytes,
  sanitizeBaseName,
} from "@/lib/client-pdf-utils";

type LoadedPdf = {
  file: File;
  bytes: ArrayBuffer;
  pageCount: number;
};

type PageMode = "single" | "facing";
type MarginPreset = "small" | "recommended" | "big";
type PositionKey =
  | "topLeft"
  | "topCenter"
  | "topRight"
  | "middleLeft"
  | "middleCenter"
  | "middleRight"
  | "bottomLeft"
  | "bottomCenter"
  | "bottomRight";

type PdfPosition = {
  x: number;
  y: number;
  align: "left" | "center" | "right";
};

type GridIndex = {
  row: number;
  col: number;
};

const POSITION_LABELS: Record<PositionKey, string> = {
  topLeft: "Top left",
  topCenter: "Top center",
  topRight: "Top right",
  middleLeft: "Middle left",
  middleCenter: "Middle center",
  middleRight: "Middle right",
  bottomLeft: "Bottom left",
  bottomCenter: "Bottom center",
  bottomRight: "Bottom right",
};

const POSITION_ORDER: PositionKey[] = [
  "topLeft",
  "topCenter",
  "topRight",
  "middleLeft",
  "middleCenter",
  "middleRight",
  "bottomLeft",
  "bottomCenter",
  "bottomRight",
];

const MARGIN_VALUES: Record<MarginPreset, number> = {
  small: 18,
  recommended: 32,
  big: 48,
};

const POSITION_GRID_INDEX: Record<PositionKey, GridIndex> = {
  topLeft: { row: 0, col: 0 },
  topCenter: { row: 0, col: 1 },
  topRight: { row: 0, col: 2 },
  middleLeft: { row: 1, col: 0 },
  middleCenter: { row: 1, col: 1 },
  middleRight: { row: 1, col: 2 },
  bottomLeft: { row: 2, col: 0 },
  bottomCenter: { row: 2, col: 1 },
  bottomRight: { row: 2, col: 2 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeRotation(value: number): number {
  return ((value % 360) + 360) % 360;
}

function safePageNumber(value: number, min: number, max: number): number {
  return clamp(Number.isFinite(value) ? Math.floor(value) : min, min, max);
}

function formatTemplate(template: string, pageNumber: number, pageIndex: number, totalSelected: number): string {
  const trimmed = template.trim();
  const base = trimmed.length ? trimmed : "{n}";

  return base
    .replaceAll("{n}", String(pageNumber))
    .replaceAll("{p}", String(pageIndex))
    .replaceAll("{t}", String(totalSelected));
}

function getFacingPosition(position: PositionKey, pageIndex: number): PositionKey {
  if (pageIndex % 2 !== 0) return position;

  switch (position) {
    case "topLeft":
      return "topRight";
    case "topRight":
      return "topLeft";
    case "middleLeft":
      return "middleRight";
    case "middleRight":
      return "middleLeft";
    case "bottomLeft":
      return "bottomRight";
    case "bottomRight":
      return "bottomLeft";
    default:
      return position;
  }
}

function getPosition(pageWidth: number, pageHeight: number, position: PositionKey, margin: number, fontSize: number): PdfPosition {
  const lineHeight = fontSize;
  const middleY = pageHeight / 2 - lineHeight / 2;

  switch (position) {
    case "topLeft":
      return { x: margin, y: pageHeight - margin - lineHeight, align: "left" };
    case "topCenter":
      return { x: pageWidth / 2, y: pageHeight - margin - lineHeight, align: "center" };
    case "topRight":
      return { x: pageWidth - margin, y: pageHeight - margin - lineHeight, align: "right" };
    case "middleLeft":
      return { x: margin, y: middleY, align: "left" };
    case "middleCenter":
      return { x: pageWidth / 2, y: middleY, align: "center" };
    case "middleRight":
      return { x: pageWidth - margin, y: middleY, align: "right" };
    case "bottomLeft":
      return { x: margin, y: margin, align: "left" };
    case "bottomCenter":
      return { x: pageWidth / 2, y: margin, align: "center" };
    case "bottomRight":
    default:
      return { x: pageWidth - margin, y: margin, align: "right" };
  }
}

async function loadPdf(file: File): Promise<LoadedPdf> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);

  return {
    file,
    bytes,
    pageCount: pdf.getPageCount(),
  };
}

async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  return pdfjs;
}

async function renderPdfPagePreview(bytes: ArrayBuffer, pageNumber: number): Promise<string> {
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 0.72 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create a preview canvas.");
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: context, viewport, canvas } as never).promise;
  return canvas.toDataURL("image/png", 0.92);
}

async function renderPdfPageNumbers(
  bytes: ArrayBuffer,
  options: {
    pageMode: PageMode;
    position: PositionKey;
    margin: MarginPreset;
    firstNumber: number;
    startPage: number;
    endPage: number;
    textTemplate: string;
  },
): Promise<ArrayBuffer> {
  const pdf = await PDFDocument.load(bytes.slice(0));
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const pageCount = pages.length;
  const fromPage = safePageNumber(options.startPage, 1, pageCount);
  const toPage = safePageNumber(options.endPage, fromPage, pageCount);
  const first = Math.min(fromPage, toPage);
  const last = Math.max(fromPage, toPage);
  const margin = MARGIN_VALUES[options.margin];
  const fontSize = 11.5;
  const selectedCount = last - first + 1;

  for (let index = first; index <= last; index += 1) {
    const page = pages[index - 1];
    const currentPageNumber = options.firstNumber + (index - first);
    const pageText = formatTemplate(options.textTemplate, currentPageNumber, index, selectedCount);
    const activePosition = options.pageMode === "facing" ? getFacingPosition(options.position, index) : options.position;
    const { x, y, align } = getPosition(page.getWidth(), page.getHeight(), activePosition, margin, fontSize);
    const textWidth = font.widthOfTextAtSize(pageText, fontSize);
    const textX = align === "center" ? x - textWidth / 2 : align === "right" ? x - textWidth : x;

    page.drawText(pageText, {
      x: textX,
      y,
      size: fontSize,
      font,
      color: rgb(0.15, 0.15, 0.15),
    });
  }

  const output = await pdf.save();
  const arrayBuffer = new ArrayBuffer(output.byteLength);
  new Uint8Array(arrayBuffer).set(output);
  return arrayBuffer;
}

function getPreviewPages(startPage: number, endPage: number, pageCount: number): number[] {
  const first = safePageNumber(startPage, 1, pageCount);
  const last = safePageNumber(endPage, first, pageCount);
  const normalizedFirst = Math.min(first, last);
  const normalizedLast = Math.max(first, last);

  if (normalizedFirst === normalizedLast || pageCount === 1) {
    return [normalizedFirst];
  }

  return [normalizedFirst, Math.min(normalizedFirst + 1, normalizedLast)];
}

export default function AddPageNumbersTool() {
  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [pageMode, setPageMode] = useState<PageMode>("single");
  const [position, setPosition] = useState<PositionKey>("bottomRight");
  const [margin, setMargin] = useState<MarginPreset>("recommended");
  const [firstNumber, setFirstNumber] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [textTemplate, setTextTemplate] = useState("Page {n}");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewTokenRef = useRef(0);

  const previewPages = useMemo(() => {
    if (!pdf) return [];
    return getPreviewPages(startPage, endPage, pdf.pageCount);
  }, [endPage, pdf, startPage]);

  const loadFile = useCallback(async (incoming: File) => {
    setErrorMessage(null);
    setPreviewUrls([]);
    setPageMode("single");
    setPosition("bottomRight");
    setMargin("recommended");
    setFirstNumber(1);
    setStartPage(1);
    setTextTemplate("Page {n}");

    if (!incoming.name.toLowerCase().endsWith(".pdf")) {
      setPdf(null);
      setErrorMessage("Please upload a valid PDF file.");
      return;
    }

    try {
      const loaded = await loadPdf(incoming);
      setPdf(loaded);
      setEndPage(loaded.pageCount);
    } catch {
      setPdf(null);
      setErrorMessage("Could not read the PDF file. It may be corrupted or password-protected.");
    }
  }, []);

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      loadFile(fileList[0]);
    },
    [loadFile],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      addFiles(event.dataTransfer.files);
    },
    [addFiles],
  );

  useEffect(() => {
    if (!pdf) {
      setPreviewUrls([]);
      setPreviewLoading(false);
      return;
    }

    const token = ++previewTokenRef.current;
    const fromPage = safePageNumber(startPage, 1, pdf.pageCount);
    const toPage = safePageNumber(endPage, fromPage, pdf.pageCount);
    const normalizedStart = Math.min(fromPage, toPage);
    const normalizedEnd = Math.max(fromPage, toPage);

    setPreviewLoading(true);

    (async () => {
      try {
        const previewBytes = await renderPdfPageNumbers(pdf.bytes, {
          pageMode,
          position,
          margin,
          firstNumber,
          startPage: normalizedStart,
          endPage: normalizedEnd,
          textTemplate,
        });

        const urls: string[] = [];
        for (const pageNumber of previewPages) {
          urls.push(await renderPdfPagePreview(previewBytes, pageNumber));
        }

        if (previewTokenRef.current === token) {
          setPreviewUrls(urls);
          setErrorMessage(null);
        }
      } catch (error) {
        if (previewTokenRef.current === token) {
          setPreviewUrls([]);
          setErrorMessage(error instanceof Error ? error.message : "Preview rendering failed for this PDF.");
        }
      } finally {
        if (previewTokenRef.current === token) {
          setPreviewLoading(false);
        }
      }
    })();
  }, [endPage, firstNumber, margin, pdf, pageMode, position, previewPages, startPage, textTemplate]);

  const handleDownload = useCallback(async () => {
    if (!pdf) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      const fromPage = safePageNumber(startPage, 1, pdf.pageCount);
      const toPage = safePageNumber(endPage, fromPage, pdf.pageCount);
      const normalizedStart = Math.min(fromPage, toPage);
      const normalizedEnd = Math.max(fromPage, toPage);

      const numberedBytes = await renderPdfPageNumbers(pdf.bytes, {
        pageMode,
        position,
        margin,
        firstNumber,
        startPage: normalizedStart,
        endPage: normalizedEnd,
        textTemplate,
      });

      downloadBlob(
        new Blob([new Uint8Array(numberedBytes)], { type: "application/pdf" }),
        `${sanitizeBaseName(pdf.file.name)}_numbered.pdf`,
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to add page numbers.");
    } finally {
      setProcessing(false);
    }
  }, [endPage, firstNumber, margin, pageMode, pdf, position, startPage, textTemplate]);

  const handleResetAll = useCallback(() => {
    setPdf(null);
    setPageMode("single");
    setPosition("bottomRight");
    setMargin("recommended");
    setFirstNumber(1);
    setStartPage(1);
    setEndPage(1);
    setTextTemplate("Page {n}");
    setPreviewUrls([]);
    setPreviewLoading(false);
    setProcessing(false);
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const selectedRangeLabel = pdf ? `${Math.min(startPage, endPage)}–${Math.max(startPage, endPage)}` : "1–1";

  return (
    <div className="space-y-4">
      {!pdf && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#38d9a9] to-[#ffb347]" />

          <div className="px-5 py-5">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-14 transition ${
                dragOver
                  ? "border-[#6c63ff] bg-[#6c63ff]/5"
                  : "border-border hover:border-border-strong"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(event) => {
                  addFiles(event.target.files);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">
                #
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                Drop your PDF here or <span className="text-[#6c63ff]">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-2">
                Add page numbers, choose position, margin, facing pages, and preview the result instantly.
              </p>
            </div>
          </div>
        </div>
      )}

      {pdf && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#38d9a9] to-[#ffb347]" />

          <div className="grid gap-6 px-5 py-5 lg:grid-cols-[420px_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-surface-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Selected file</p>
                <h2 className="mt-2 break-all text-sm font-semibold text-white">{pdf.file.name}</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted">
                  <div className="rounded-lg bg-surface-3/50 px-3 py-2">
                    <span className="block text-[#6c63ff]">Pages</span>
                    <span className="font-semibold text-white">{pdf.pageCount}</span>
                  </div>
                  <div className="rounded-lg bg-surface-3/50 px-3 py-2">
                    <span className="block text-[#6c63ff]">Size</span>
                    <span className="font-semibold text-white">{formatBytes(pdf.file.size)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Page mode</p>
                <div className="mt-3 flex items-center gap-6 text-sm text-white">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={pageMode === "single"}
                      onChange={() => setPageMode("single")}
                      className="h-4 w-4 accent-[#38d9a9]"
                    />
                    Single page
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={pageMode === "facing"}
                      onChange={() => setPageMode("facing")}
                      className="h-4 w-4 accent-[#38d9a9]"
                    />
                    Facing pages
                  </label>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Position</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 max-w-[170px]">
                    {POSITION_ORDER.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPosition(key)}
                        className={`flex aspect-square items-center justify-center rounded-lg border transition ${
                          position === key
                            ? "border-[#38d9a9] bg-[#38d9a9]/10 text-white"
                            : "border-border bg-surface-3/50 text-muted hover:border-border-strong hover:text-foreground"
                        }`}
                        aria-label={POSITION_LABELS[key]}
                        title={POSITION_LABELS[key]}
                      >
                        <span className="grid h-7 w-7 grid-cols-3 grid-rows-3 gap-0.5 rounded-sm border border-border-strong p-1">
                          {Array.from({ length: 9 }).map((_, index) => {
                            const row = Math.floor(index / 3);
                            const col = index % 3;
                            const isActive = POSITION_GRID_INDEX[key].row === row && POSITION_GRID_INDEX[key].col === col;

                            return (
                              <span
                                key={`${key}-${index}`}
                                className={`rounded-full ${isActive ? "bg-red-500" : "bg-white/15"}`}
                              />
                            );
                          })}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-2">Choose where the number appears on each page.</p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Margin</label>
                    <select
                      value={margin}
                      onChange={(event) => setMargin(event.target.value as MarginPreset)}
                      className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none transition focus:border-[#38d9a9]"
                    >
                      <option value="small">Small</option>
                      <option value="recommended">Recommended</option>
                      <option value="big">Big</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">First number</label>
                    <input
                      type="number"
                      min={1}
                      value={firstNumber}
                      onChange={(event) => setFirstNumber(safePageNumber(Number(event.target.value), 1, 999999))}
                      className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none transition focus:border-[#38d9a9]"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">From page</label>
                    <input
                      type="number"
                      min={1}
                      max={pdf.pageCount}
                      value={startPage}
                      onChange={(event) => setStartPage(safePageNumber(Number(event.target.value), 1, pdf.pageCount))}
                      className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none transition focus:border-[#38d9a9]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">To page</label>
                    <input
                      type="number"
                      min={1}
                      max={pdf.pageCount}
                      value={endPage}
                      onChange={(event) => setEndPage(safePageNumber(Number(event.target.value), 1, pdf.pageCount))}
                      className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none transition focus:border-[#38d9a9]"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Text</label>
                  <input
                    type="text"
                    value={textTemplate}
                    onChange={(event) => setTextTemplate(event.target.value)}
                    placeholder="Page {n}"
                    className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white outline-none transition focus:border-[#38d9a9]"
                  />
                  <p className="mt-2 text-xs text-muted-2">Use {"{n}"} for the page number, {"{p}"} for the current page, and {"{t}"} for the selected page count.</p>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={processing}
                    className="flex-1 rounded-xl bg-[#e93b34] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(233,59,52,.35)] transition hover:bg-[#d9322b] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processing ? "Processing…" : "Add page numbers"}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="rounded-xl border border-border bg-surface-3/50 px-4 py-3 text-sm font-semibold text-white transition hover:border-border-strong hover:bg-surface-3"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-surface-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Live preview</p>
                  <p className="mt-1 text-sm text-muted">
                    Preview updates as you change settings. Showing pages {selectedRangeLabel}.
                  </p>
                </div>
                <span className="rounded-full bg-surface-3/50 px-3 py-1 text-xs font-semibold text-foreground/75">
                  {previewLoading ? "Refreshing…" : "Ready"}
                </span>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {previewUrls.map((url, index) => (
                  <div key={url} className="rounded-[22px] border border-[#d1d5db] bg-[#f8fafc] p-4 shadow-[0_12px_40px_rgba(15,23,42,.08)]">
                    <div className="mx-auto aspect-[210/297] w-full max-w-[190px] overflow-hidden rounded-sm bg-white shadow-[0_10px_28px_rgba(15,23,42,.14)]">
                      <Image
                        src={url}
                        alt={`Preview of numbered page ${index + 1}`}
                        width={420}
                        height={594}
                        unoptimized
                        className="h-full w-full object-contain object-top"
                      />
                    </div>
                    <p className="mt-4 text-center text-sm font-medium text-[#111827]">
                      Page {previewPages[index] ?? index + 1}
                    </p>
                  </div>
                ))}

                {!previewUrls.length && (
                  <div className="rounded-[22px] border border-[#d1d5db] bg-[#f8fafc] p-4 shadow-[0_12px_40px_rgba(15,23,42,.08)] md:col-span-2">
                    <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">
                      {previewLoading ? "Rendering preview…" : "Preview unavailable"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}