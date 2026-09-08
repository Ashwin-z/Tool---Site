"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob, formatBytes, sanitizeBaseName } from "@/lib/client-pdf-utils";

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB

type LoadedPdf = {
  file: File;
  bytes: ArrayBuffer;
  pageCount: number;
  pageBoxes: Array<{ x: number; y: number; width: number; height: number }>;
};

type CropRect = { x: number; y: number; width: number; height: number };
type Handle = "move" | "nw" | "ne" | "sw" | "se";
type PageCropMap = Record<number, CropRect>;
type PagePreviewMap = Record<number, string>;
type PageLoadingMap = Record<number, boolean>;

type Interaction = {
  pageNumber: number;
  handle: Handle;
  startX: number;
  startY: number;
  startRect: CropRect;
};

const MIN_SIZE = 0.08;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createFullPageCrop(): CropRect {
  return { x: 0, y: 0, width: 1, height: 1 };
}

function normalizeCropRect(rect: CropRect): CropRect {
  const width = clamp(rect.width, MIN_SIZE, 1);
  const height = clamp(rect.height, MIN_SIZE, 1);
  const x = clamp(rect.x, 0, 1 - width);
  const y = clamp(rect.y, 0, 1 - height);
  return { x, y, width, height };
}

function createInitialPageCropMap(pageCount: number): PageCropMap {
  return Object.fromEntries(Array.from({ length: pageCount }, (_, index) => [index + 1, createFullPageCrop()]));
}

function isCustomizedRect(rect: CropRect): boolean {
  const full = createFullPageCrop();
  return (
    Math.abs(rect.x - full.x) > 0.001 ||
    Math.abs(rect.y - full.y) > 0.001 ||
    Math.abs(rect.width - full.width) > 0.001 ||
    Math.abs(rect.height - full.height) > 0.001
  );
}

function formatCropSummary(rect: CropRect): string {
  return `X ${Math.round(rect.x * 100)}% · Y ${Math.round(rect.y * 100)}% · W ${Math.round(rect.width * 100)}% · H ${Math.round(rect.height * 100)}%`;
}

function getPdfRectFromPercent(box: { x: number; y: number; width: number; height: number }, rect: CropRect) {
  const cropX = box.x + box.width * rect.x;
  const cropY = box.y + box.height * (1 - rect.y - rect.height);
  const cropWidth = box.width * rect.width;
  const cropHeight = box.height * rect.height;
  return { cropX, cropY, cropWidth, cropHeight };
}

function resizeRect(rect: CropRect, handle: Handle, dx: number, dy: number): CropRect {
  if (handle === "move") {
    return normalizeCropRect({
      ...rect,
      x: rect.x + dx,
      y: rect.y + dy,
    });
  }

  const left = rect.x;
  const top = rect.y;
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;

  let nextLeft = left;
  let nextTop = top;
  let nextRight = right;
  let nextBottom = bottom;

  if (handle === "nw" || handle === "sw") {
    nextLeft = clamp(left + dx, 0, right - MIN_SIZE);
  }

  if (handle === "nw" || handle === "ne") {
    nextTop = clamp(top + dy, 0, bottom - MIN_SIZE);
  }

  if (handle === "ne" || handle === "se") {
    nextRight = clamp(right + dx, left + MIN_SIZE, 1);
  }

  if (handle === "sw" || handle === "se") {
    nextBottom = clamp(bottom + dy, top + MIN_SIZE, 1);
  }

  return normalizeCropRect({
    x: nextLeft,
    y: nextTop,
    width: nextRight - nextLeft,
    height: nextBottom - nextTop,
  });
}

async function loadPdf(file: File): Promise<LoadedPdf> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pageBoxes = pdf.getPages().map((page) => page.getMediaBox());

  return { file, bytes, pageCount: pdf.getPageCount(), pageBoxes };
}

let pdfjsPromise: Promise<any> | null = null;

async function getPdfjs() {
  if (!pdfjsPromise) {
    const importPdfjs = new Function("moduleUrl", "return import(moduleUrl);") as (moduleUrl: string) => Promise<any>;
    pdfjsPromise = importPdfjs("/vendor/pdfjs/pdf.mjs").then((pdfjs) => {
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";
      }
      return pdfjs;
    });
  }

  return pdfjsPromise;
}

async function renderPagePreview(bytes: ArrayBuffer, pageNumber: number): Promise<string> {
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1.15 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Could not create a preview canvas.");

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport, canvas } as never).promise;
  return canvas.toDataURL("image/png", 0.92);
}

async function cropPdfBytes(bytes: ArrayBuffer, options: { pageRects: PageCropMap }): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(bytes.slice(0));
  const pages = pdf.getPages();

  for (const [index, page] of pages.entries()) {
    const rect = options.pageRects[index + 1] ?? createFullPageCrop();
    if (!isCustomizedRect(rect)) continue;

    const mediaBox = page.getMediaBox();
    const { cropX, cropY, cropWidth, cropHeight } = getPdfRectFromPercent(mediaBox, rect);
    page.setCropBox(cropX, cropY, cropWidth, cropHeight);
  }

  return pdf.save();
}

function getPreviewStyle(box: { width: number; height: number }) {
  return { aspectRatio: `${box.width} / ${box.height}` } as React.CSSProperties;
}

export default function CropPdfTool() {
  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCropRects, setPageCropRects] = useState<PageCropMap>({});
  const [previewUrls, setPreviewUrls] = useState<PagePreviewMap>({});
  const [previewLoadingPages, setPreviewLoadingPages] = useState<PageLoadingMap>({});
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const previewTokenRef = useRef(0);

  const pageNumbers = useMemo(() => {
    if (!pdf) return [] as number[];
    return Array.from({ length: pdf.pageCount }, (_, index) => index + 1);
  }, [pdf]);

  const currentBox = useMemo(() => {
    if (!pdf) return { x: 0, y: 0, width: 1, height: 1 };
    return pdf.pageBoxes[currentPage - 1] ?? pdf.pageBoxes[0] ?? { x: 0, y: 0, width: 1, height: 1 };
  }, [currentPage, pdf]);

  const currentCrop = pageCropRects[currentPage] ?? createFullPageCrop();
  const activePreviewUrl = previewUrls[currentPage] ?? null;
  const activePreviewLoading = previewLoadingPages[currentPage] ?? false;

  const changedPagesCount = useMemo(() => {
    return pageNumbers.filter((pageNumber) => isCustomizedRect(pageCropRects[pageNumber] ?? createFullPageCrop())).length;
  }, [pageCropRects, pageNumbers]);

  const setCropForPage = useCallback((pageNumber: number, rect: CropRect) => {
    setPageCropRects((previous) => ({
      ...previous,
      [pageNumber]: normalizeCropRect(rect),
    }));
  }, []);

  const resetCurrentCrop = useCallback(() => {
    setCropForPage(currentPage, createFullPageCrop());
  }, [currentPage, setCropForPage]);

  const copyActiveCropToAllPages = useCallback(() => {
    setPageCropRects(Object.fromEntries(pageNumbers.map((pageNumber) => [pageNumber, { ...currentCrop }])) as PageCropMap);
  }, [currentCrop, pageNumbers]);

  const resetAllCrops = useCallback(() => {
    if (!pdf) return;
    setPageCropRects(createInitialPageCropMap(pdf.pageCount));
  }, [pdf]);

  const resetAll = useCallback(() => {
    setPdf(null);
    setCurrentPage(1);
    setPageCropRects({});
    setPreviewUrls({});
    setPreviewLoadingPages({});
    setProcessing(false);
    setDragOver(false);
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const loadFile = useCallback(async (incoming: File) => {
    setErrorMessage(null);
    if (incoming.size > MAX_FILE_SIZE) {
      setErrorMessage(`File exceeds the 1GB size limit.`);
      return;
    }
    setPreviewUrls({});
    setPreviewLoadingPages({});
    setCurrentPage(1);

    if (!incoming.name.toLowerCase().endsWith(".pdf")) {
      setPdf(null);
      setPageCropRects({});
      setErrorMessage("Please upload a valid PDF file.");
      return;
    }

    try {
      const loaded = await loadPdf(incoming);
      setPdf(loaded);
      setPageCropRects(createInitialPageCropMap(loaded.pageCount));
    } catch {
      setPdf(null);
      setPageCropRects({});
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
      setPreviewUrls({});
      setPreviewLoadingPages({});
      return;
    }

    const token = ++previewTokenRef.current;
    setPreviewUrls({});
    setPreviewLoadingPages(Object.fromEntries(pageNumbers.map((pageNumber) => [pageNumber, true])) as PageLoadingMap);

    void (async () => {
      for (const pageNumber of pageNumbers) {
        try {
          const url = await renderPagePreview(pdf.bytes, pageNumber);
          if (previewTokenRef.current !== token) return;

          setPreviewUrls((previous) => ({
            ...previous,
            [pageNumber]: url,
          }));
        } catch (error) {
          console.error("[CropPdf] Preview render error:", error);
          if (previewTokenRef.current !== token) return;

          const details = error instanceof Error ? error.message : String(error);
          setErrorMessage((previous) => previous ?? `Preview rendering failed: ${details}`);
        } finally {
          if (previewTokenRef.current !== token) return;

          setPreviewLoadingPages((previous) => ({
            ...previous,
            [pageNumber]: false,
          }));
        }
      }
    })();
  }, [pageNumbers, pdf]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!interactionRef.current || !previewRef.current) return;

      const bounds = previewRef.current.getBoundingClientRect();
      const x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
      const y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
      const dx = x - interactionRef.current.startX;
      const dy = y - interactionRef.current.startY;
      const nextRect = normalizeCropRect(resizeRect(interactionRef.current.startRect, interactionRef.current.handle, dx, dy));

      setCropForPage(interactionRef.current.pageNumber, nextRect);
    };

    const onUp = () => {
      interactionRef.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [setCropForPage]);

  const beginInteraction = useCallback(
    (handle: Handle) => (event: React.PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (!previewRef.current) return;

      const bounds = previewRef.current.getBoundingClientRect();
      const startX = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
      const startY = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);

      interactionRef.current = {
        pageNumber: currentPage,
        handle,
        startX,
        startY,
        startRect: currentCrop,
      };
    },
    [currentCrop, currentPage],
  );

  const handleDownload = useCallback(async () => {
    if (!pdf) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      const croppedBytes = await cropPdfBytes(pdf.bytes, {
        pageRects: pageCropRects,
      });

      downloadBlob(new Blob([new Uint8Array(croppedBytes)], { type: "application/pdf" }), `${sanitizeBaseName(pdf.file.name)}_cropped.pdf`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to crop the PDF.");
    } finally {
      setProcessing(false);
    }
  }, [pageCropRects, pdf]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((value) => clamp(value - 1, 1, pdf?.pageCount ?? 1));
  }, [pdf?.pageCount]);

  const goToNextPage = useCallback(() => {
    setCurrentPage((value) => clamp(value + 1, 1, pdf?.pageCount ?? 1));
  }, [pdf?.pageCount]);

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
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-14 transition ${dragOver ? "border-[#6c63ff] bg-[#6c63ff]/5" : "border-border hover:border-border-strong"}`}
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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">✂️</div>
              <p className="mt-3 text-sm font-semibold text-white">
                Drop your PDF here or <span className="text-[#6c63ff]">browse</span>
              </p>
              <p className="mt-1 max-w-2xl text-center text-xs text-muted-2">
                Open every page in a gallery workspace, edit one page at a time in a larger canvas, and keep different crop sizes on different pages.
              </p>
            </div>
          </div>
        </div>
      )}

      {pdf && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#38d9a9] to-[#ffb347]" />

          <div className="grid gap-6 px-5 py-5 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Selected file</p>
                <h2 className="mt-2 break-all text-sm font-semibold text-white">{pdf.file.name}</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted">
                  <div className="rounded-xl bg-surface px-3 py-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-[#70708a]">Pages</div>
                    <div className="mt-1 text-sm font-semibold text-white">{pdf.pageCount}</div>
                  </div>
                  <div className="rounded-xl bg-surface px-3 py-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-[#70708a]">File size</div>
                    <div className="mt-1 text-sm font-semibold text-white">{formatBytes(pdf.file.size)}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Active page</p>
                  <span className="rounded-full border border-border bg-surface-3/50 px-2.5 py-1 text-[11px] font-semibold text-white">
                    {currentPage} / {pdf.pageCount}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToPreviousPage}
                    className="rounded-lg border border-border bg-surface-3/50 px-3 py-2 text-sm text-white transition hover:border-border-strong hover:bg-surface-3"
                  >
                    ‹
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={pdf.pageCount}
                    value={currentPage}
                    onChange={(event) => setCurrentPage(clamp(Number(event.target.value) || 1, 1, pdf.pageCount))}
                    className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-center text-sm text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={goToNextPage}
                    className="rounded-lg border border-border bg-surface-3/50 px-3 py-2 text-sm text-white transition hover:border-border-strong hover:bg-surface-3"
                  >
                    ›
                  </button>
                </div>

                <div className="mt-4 rounded-xl bg-surface p-3 text-xs text-muted">
                  <p className="font-semibold text-white">{isCustomizedRect(currentCrop) ? "Custom crop saved" : "Full page kept"}</p>
                  <p className="mt-1">{formatCropSummary(currentCrop)}</p>
                </div>

                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={resetCurrentCrop}
                    className="rounded-xl border border-border bg-surface-3/50 px-4 py-3 text-sm font-semibold text-white transition hover:border-border-strong hover:bg-surface-3"
                  >
                    Reset this page
                  </button>
                  <button
                    type="button"
                    onClick={copyActiveCropToAllPages}
                    className="rounded-xl border border-[#38d9a9]/20 bg-[#38d9a9]/10 px-4 py-3 text-sm font-semibold text-[#c6fff0] transition hover:border-[#38d9a9]/30 hover:bg-[#38d9a9]/15"
                  >
                    Copy this crop to all pages
                  </button>
                  <button
                    type="button"
                    onClick={resetAllCrops}
                    className="rounded-xl border border-border bg-surface-3/50 px-4 py-3 text-sm font-semibold text-white transition hover:border-border-strong hover:bg-surface-3"
                  >
                    Reset every page crop
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Document crop status</p>
                <div className="mt-4 grid gap-3 text-sm">
                  <div className="rounded-xl bg-surface px-3 py-3 text-muted">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-[#70708a]">Pages with custom crop</div>
                    <div className="mt-1 text-lg font-semibold text-white">{changedPagesCount}</div>
                  </div>
                  <div className="rounded-xl bg-surface px-3 py-3 text-muted">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-[#70708a]">Editing workflow</div>
                    <div className="mt-1 leading-6">
                      Pick a page from the gallery, resize its crop box in the large editor, then move to another page for a different size.
                    </div>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {errorMessage}
                </div>
              )}

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={processing}
                  className="rounded-xl bg-[#e93b34] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(233,59,52,.35)] transition hover:bg-[#d9322b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processing ? "Cropping…" : "Export cropped PDF"}
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="rounded-xl border border-border bg-surface-3/50 px-4 py-3 text-sm font-semibold text-white transition hover:border-border-strong hover:bg-surface-3"
                >
                  Remove file
                </button>
              </div>
            </aside>

            <div className="space-y-5">
              <section className="rounded-2xl border border-border bg-surface-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Large page editor</p>
                    <h3 className="mt-1 text-sm font-semibold text-white">Page {currentPage}</h3>
                  </div>
                  <div className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted">
                    {isCustomizedRect(currentCrop) ? "Custom crop applied" : "No crop yet"}
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-[#f8fafc] p-4 shadow-[0_12px_40px_rgba(15,23,42,.08)]">
                  <div ref={previewRef} className="relative mx-auto w-full max-w-[980px] select-none touch-none" style={getPreviewStyle(currentBox)}>
                    {activePreviewUrl ? (
                      <Image src={activePreviewUrl} alt={`Preview of page ${currentPage}`} fill unoptimized className="object-contain object-top" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center text-sm text-slate-500">
                        {activePreviewLoading ? "Rendering page preview…" : errorMessage ?? "Preview unavailable"}
                      </div>
                    )}

                    {activePreviewUrl && (
                      <div className="absolute inset-0">
                        <div
                          className="absolute cursor-move border-2 border-[#2ea8ff] bg-[#2ea8ff]/15 shadow-[0_0_0_9999px_rgba(0,0,0,.08)]"
                          style={{
                            left: `${currentCrop.x * 100}%`,
                            top: `${currentCrop.y * 100}%`,
                            width: `${currentCrop.width * 100}%`,
                            height: `${currentCrop.height * 100}%`,
                          }}
                          onPointerDown={beginInteraction("move")}
                        >
                          {(["nw", "ne", "sw", "se"] as const).map((handle) => {
                            const cornerStyles: Record<typeof handle, string> = {
                              nw: "-left-2 -top-2 cursor-nwse-resize",
                              ne: "-right-2 -top-2 cursor-nesw-resize",
                              sw: "-left-2 -bottom-2 cursor-nesw-resize",
                              se: "-right-2 -bottom-2 cursor-nwse-resize",
                            };

                            return (
                              <button
                                key={handle}
                                type="button"
                                aria-label={`Resize from ${handle}`}
                                className={`absolute h-4 w-4 rounded-full border border-white bg-[#2ea8ff] ${cornerStyles[handle]}`}
                                onPointerDown={beginInteraction(handle)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <p className="text-muted">Drag the blue box to reposition it, or pull the corners to give this page its own custom crop size.</p>
                  <div className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-[#c6d2ff]">
                    {formatCropSummary(currentCrop)}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-surface-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">All pages gallery</p>
                    <h3 className="mt-1 text-sm font-semibold text-white">Pick any page and give it a different crop</h3>
                  </div>
                  <div className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted">
                    {pdf.pageCount} page thumbnails
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {pageNumbers.map((pageNumber) => {
                    const previewUrl = previewUrls[pageNumber];
                    const loading = previewLoadingPages[pageNumber] ?? false;
                    const pageBox = pdf.pageBoxes[pageNumber - 1] ?? currentBox;
                    const pageCrop = pageCropRects[pageNumber] ?? createFullPageCrop();
                    const isActive = pageNumber === currentPage;
                    const customized = isCustomizedRect(pageCrop);

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`overflow-hidden rounded-2xl border text-left transition ${isActive ? "border-[#2ea8ff] bg-[#151f2d] shadow-[0_18px_40px_rgba(46,168,255,.18)]" : "border-border bg-surface hover:border-border-strong hover:bg-surface"}`}
                      >
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-2">Page {pageNumber}</p>
                            <p className="mt-1 text-xs text-muted">{customized ? "Custom crop" : "Full page"}</p>
                          </div>
                          {isActive && (
                            <span className="rounded-full bg-[#2ea8ff] px-2.5 py-1 text-[11px] font-semibold text-white">Editing</span>
                          )}
                        </div>

                        <div className="p-4">
                          <div className="overflow-hidden rounded-xl border border-border bg-[#f8fafc] p-3">
                            <div className="relative mx-auto w-full" style={getPreviewStyle(pageBox)}>
                              {previewUrl ? (
                                <Image src={previewUrl} alt={`Thumbnail of page ${pageNumber}`} fill unoptimized className="object-contain object-top" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-xs text-slate-500">
                                  {loading ? "Loading…" : "No preview"}
                                </div>
                              )}

                              {previewUrl && customized && (
                                <div
                                  className="pointer-events-none absolute border-2 border-[#2ea8ff] bg-[#2ea8ff]/10"
                                  style={{
                                    left: `${pageCrop.x * 100}%`,
                                    top: `${pageCrop.y * 100}%`,
                                    width: `${pageCrop.width * 100}%`,
                                    height: `${pageCrop.height * 100}%`,
                                  }}
                                />
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                            <span className={`rounded-full px-2.5 py-1 font-semibold ${customized ? "bg-[#38d9a9]/10 text-[#aef5df]" : "bg-surface-3/50 text-muted"}`}>
                              {customized ? "Unique crop" : "Unchanged"}
                            </span>
                            <span className="text-muted">{formatCropSummary(pageCrop)}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}