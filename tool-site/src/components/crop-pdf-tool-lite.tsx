"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob, formatBytes, sanitizeBaseName } from "@/lib/client-pdf-utils";

type PageBox = { x: number; y: number; width: number; height: number };
type LoadedPdf = { file: File; bytes: ArrayBuffer; pageCount: number; pageBoxes: PageBox[] };
type PageScope = "all" | "current";
type CropInsets = { left: number; top: number; right: number; bottom: number };

const DEFAULT_INSETS: CropInsets = { left: 10, top: 10, right: 10, bottom: 10 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeInsets(insets: CropInsets): CropInsets {
  const left = clamp(insets.left, 0, 45);
  const right = clamp(insets.right, 0, 45);
  const top = clamp(insets.top, 0, 45);
  const bottom = clamp(insets.bottom, 0, 45);

  if (left + right > 90) return DEFAULT_INSETS;
  if (top + bottom > 90) return DEFAULT_INSETS;

  return { left, top, right, bottom };
}

async function loadPdf(file: File): Promise<LoadedPdf> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pageBoxes = pdf.getPages().map((page) => page.getMediaBox());
  return { file, bytes, pageCount: pdf.getPageCount(), pageBoxes };
}

async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }
  return pdfjs;
}

async function renderPreview(bytes: ArrayBuffer, pageNumber: number): Promise<string> {
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 0.82 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Could not create preview canvas.");

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport, canvas } as never).promise;
  return canvas.toDataURL("image/png", 0.92);
}

async function cropPdf(bytes: ArrayBuffer, options: { scope: PageScope; currentPage: number; insets: CropInsets }) {
  const pdf = await PDFDocument.load(bytes.slice(0));
  const pages = pdf.getPages();
  const indexes = options.scope === "all" ? pages.map((_, index) => index) : [options.currentPage - 1];
  const insets = normalizeInsets(options.insets);

  for (const index of indexes) {
    const page = pages[index];
    if (!page) continue;

    const box = page.getMediaBox();
    const x = box.x + (box.width * insets.left) / 100;
    const y = box.y + (box.height * insets.bottom) / 100;
    const width = box.width * (1 - (insets.left + insets.right) / 100);
    const height = box.height * (1 - (insets.top + insets.bottom) / 100);
    page.setCropBox(x, y, width, height);
  }

  return pdf.save();
}

export default function CropPdfToolLite() {
  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scope, setScope] = useState<PageScope>("all");
  const [insets, setInsets] = useState<CropInsets>(DEFAULT_INSETS);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewTokenRef = useRef(0);

  const pageBox = useMemo(() => pdf?.pageBoxes[currentPage - 1] ?? pdf?.pageBoxes[0] ?? { x: 0, y: 0, width: 1, height: 1 }, [currentPage, pdf]);

  const cropBox = useMemo(() => {
    const left = clamp(insets.left, 0, 45);
    const right = clamp(insets.right, 0, 45);
    const top = clamp(insets.top, 0, 45);
    const bottom = clamp(insets.bottom, 0, 45);
    return { x: left, y: top, width: 100 - left - right, height: 100 - top - bottom };
  }, [insets]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setScope("all");
    setInsets(DEFAULT_INSETS);
    setPreviewUrl(null);
    setPreviewLoading(false);
    setProcessing(false);
    setErrorMessage(null);
    setPdf(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const loadFile = useCallback(async (file: File) => {
    setErrorMessage(null);
    setPreviewUrl(null);

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setPdf(null);
      setErrorMessage("Please upload a valid PDF file.");
      return;
    }

    try {
      const loaded = await loadPdf(file);
      setPdf(loaded);
      setCurrentPage(1);
      setScope("all");
      setInsets(DEFAULT_INSETS);
    } catch {
      setPdf(null);
      setErrorMessage("Could not read the PDF file. It may be corrupted or password-protected.");
    }
  }, []);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList?.length) return;
    loadFile(fileList[0]);
  }, [loadFile]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    addFiles(event.dataTransfer.files);
  }, [addFiles]);

  useEffect(() => {
    if (!pdf) {
      setPreviewLoading(false);
      setPreviewUrl(null);
      return;
    }

    const token = ++previewTokenRef.current;
    setPreviewLoading(true);

    renderPreview(pdf.bytes, currentPage)
      .then((url) => {
        if (previewTokenRef.current === token) setPreviewUrl(url);
      })
      .catch(() => {
        if (previewTokenRef.current === token) setErrorMessage("Preview rendering failed for this PDF.");
      })
      .finally(() => {
        if (previewTokenRef.current === token) setPreviewLoading(false);
      });
  }, [currentPage, pdf]);

  const handleDownload = useCallback(async () => {
    if (!pdf) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      const bytes = await cropPdf(pdf.bytes, { scope, currentPage, insets });
      downloadBlob(new Blob([bytes], { type: "application/pdf" }), `${sanitizeBaseName(pdf.file.name)}_cropped.pdf`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to crop the PDF.");
    } finally {
      setProcessing(false);
    }
  }, [currentPage, insets, pdf, scope]);

  const previewStyle = { aspectRatio: `${pageBox.width} / ${pageBox.height}` } as React.CSSProperties;

  return (
    <div className="space-y-4">
      {!pdf && !processing && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-[0_20px_60px_rgba(0,0,0,.55)]">
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
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-14 transition ${dragOver ? "border-[#6c63ff] bg-[#6c63ff]/5" : "border-white/10 hover:border-white/20"}`}
            >
              <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(event) => { addFiles(event.target.files); if (inputRef.current) inputRef.current.value = ""; }} />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">✂️</div>
              <p className="mt-3 text-sm font-semibold text-white">Drop your PDF here or <span className="text-[#6c63ff]">browse</span></p>
              <p className="mt-1 text-xs text-[#57576f]">Crop by page area, switch between all pages or current page, and preview instantly.</p>
            </div>
          </div>
        </div>
      )}

      {pdf && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#38d9a9] to-[#ffb347]" />
          <div className="grid gap-6 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-[#17171f] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8fa8]">Selected file</p>
                    <h2 className="mt-2 break-all text-sm font-semibold text-white">{pdf.file.name}</h2>
                  </div>
                  <div className="text-right text-xs text-[#9b9bb3]"><div>{pdf.pageCount} pages</div><div>{formatBytes(pdf.file.size)}</div></div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#17171f] px-4 py-3 text-sm text-white">
                <button type="button" onClick={() => setCurrentPage((value) => clamp(value - 1, 1, pdf.pageCount))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:bg-white/10">‹</button>
                <div className="flex items-center gap-2"><span className="text-[#9b9bb3]">Page</span><input type="number" min={1} max={pdf.pageCount} value={currentPage} onChange={(event) => setCurrentPage(clamp(Number(event.target.value) || 1, 1, pdf.pageCount))} className="w-16 rounded-lg border border-white/10 bg-[#111118] px-2 py-1 text-center text-white outline-none" /><span className="text-[#9b9bb3]">/ {pdf.pageCount}</span></div>
                <button type="button" onClick={() => setCurrentPage((value) => clamp(value + 1, 1, pdf.pageCount))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:bg-white/10">›</button>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#17171f] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8fa8]">Crop preview</p>
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#f8fafc] p-4 shadow-[0_12px_40px_rgba(15,23,42,.08)]">
                  <div className="relative mx-auto w-full max-w-[560px] select-none" style={previewStyle}>
                    {previewUrl ? <Image src={previewUrl} alt={`Preview of page ${currentPage}`} fill unoptimized className="object-contain object-top" /> : <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">{previewLoading ? "Rendering preview…" : "Preview unavailable"}</div>}
                    {previewUrl && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute border-2 border-[#2ea8ff] bg-[#2ea8ff]/15" style={{ left: `${cropBox.x}%`, top: `${cropBox.y}%`, width: `${cropBox.width}%`, height: `${cropBox.height}%` }} />
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-xs text-[#7f7f95]">Adjust the crop insets to define the visible area. The overlay updates live.</p>
              </div>

              {errorMessage && <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{errorMessage}</div>}
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-[#17171f] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8fa8]">Pages</p>
                <div className="mt-3 flex items-center gap-6 text-sm text-white">
                  <label className="flex items-center gap-2"><input type="radio" checked={scope === "all"} onChange={() => setScope("all")} className="h-4 w-4 accent-[#38d9a9]" />All pages</label>
                  <label className="flex items-center gap-2"><input type="radio" checked={scope === "current"} onChange={() => setScope("current")} className="h-4 w-4 accent-[#38d9a9]" />Current page</label>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#17171f] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8fa8]">Crop insets</p>
                {(["left", "top", "right", "bottom"] as const).map((side) => (
                  <label key={side} className="mt-3 block text-sm text-[#9b9bb3]">
                    <span className="mb-2 block capitalize text-white">{side}</span>
                    <input type="range" min={0} max={45} value={insets[side]} onChange={(event) => setInsets((prev) => normalizeInsets({ ...prev, [side]: Number(event.target.value) }))} className="w-full accent-[#38d9a9]" />
                  </label>
                ))}
                <div className="mt-3 rounded-xl bg-[#111118] px-3 py-2 text-xs text-[#9b9bb3]">Left {insets.left}% · Top {insets.top}% · Right {insets.right}% · Bottom {insets.bottom}%</div>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={handleDownload} disabled={processing} className="flex-1 rounded-xl bg-[#e93b34] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(233,59,52,.35)] transition hover:bg-[#d9322b] disabled:cursor-not-allowed disabled:opacity-60">{processing ? "Cropping…" : "Crop PDF"}</button>
                <button type="button" onClick={reset} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10">Reset all</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}