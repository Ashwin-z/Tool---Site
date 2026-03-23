"use client";

import { useCallback, useRef, useState } from "react";
import JSZip from "jszip";
import {
  MAX_CONVERSION_FILES,
  downloadBlob,
  formatBytes,
  sanitizeBaseName,
} from "@/lib/client-pdf-utils";

/* ── Types ─────────────────────────────────────────────── */

type ConvertedPage = {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
};

type QualityPreset = "high" | "medium" | "low";

const QUALITY_MAP: Record<QualityPreset, { scale: number; jpegQuality: number; label: string }> = {
  high:   { scale: 3, jpegQuality: 0.95, label: "High (300 DPI)" },
  medium: { scale: 2, jpegQuality: 0.85, label: "Medium (200 DPI)" },
  low:    { scale: 1, jpegQuality: 0.70, label: "Low (100 DPI)" },
};

/* ── Helpers ───────────────────────────────────────────── */

async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }
  return pdfjs;
}

async function renderPageToJpg(
  pdfBytes: ArrayBuffer,
  pageNumber: number,
  scale: number,
  jpegQuality: number,
): Promise<ConvertedPage> {
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data: pdfBytes.slice(0) }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context.");

  // White background for JPEG (no alpha channel)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;

  const dataUrl = canvas.toDataURL("image/jpeg", jpegQuality);

  // Convert data URL to Blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  return {
    pageNumber,
    dataUrl,
    blob,
    width: canvas.width,
    height: canvas.height,
  };
}

async function getPdfPageCount(bytes: ArrayBuffer): Promise<number> {
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
  return pdf.numPages;
}

/* ── Component ─────────────────────────────────────────── */

export default function PdfToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [quality, setQuality] = useState<QualityPreset>("high");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pages, setPages] = useState<ConvertedPage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── File handling ── */

  const loadFile = useCallback(async (incoming: File) => {
    setErrorMessage(null);
    setPages([]);

    if (!incoming.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please upload a valid PDF file.");
      return;
    }

    try {
      const bytes = await incoming.arrayBuffer();
      const count = await getPdfPageCount(bytes);
      setFile(incoming);
      setPdfBytes(bytes);
      setPageCount(count);
    } catch {
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

  /* ── Conversion ── */

  const handleConvert = useCallback(async () => {
    if (!pdfBytes || !file) return;

    setProcessing(true);
    setPages([]);
    setErrorMessage(null);
    setProgress({ done: 0, total: pageCount });

    const { scale, jpegQuality } = QUALITY_MAP[quality];

    try {
      const results: ConvertedPage[] = [];

      for (let i = 1; i <= pageCount; i++) {
        const page = await renderPageToJpg(pdfBytes, i, scale, jpegQuality);
        results.push(page);
        setProgress({ done: i, total: pageCount });
      }

      setPages(results);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to convert the PDF to images.",
      );
    } finally {
      setProcessing(false);
    }
  }, [pdfBytes, file, pageCount, quality]);

  /* ── Downloads ── */

  const handleDownloadSingle = useCallback(
    (page: ConvertedPage) => {
      if (!file) return;
      const baseName = sanitizeBaseName(file.name);
      downloadBlob(page.blob, `${baseName}_page${page.pageNumber}.jpg`);
    },
    [file],
  );

  const handleDownloadAll = useCallback(async () => {
    if (!pages.length || !file) return;

    const baseName = sanitizeBaseName(file.name);

    if (pages.length === 1) {
      downloadBlob(pages[0].blob, `${baseName}_page1.jpg`);
      return;
    }

    const zip = new JSZip();
    for (const p of pages) {
      zip.file(`${baseName}_page${p.pageNumber}.jpg`, p.blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, `${baseName}_images.zip`);
  }, [pages, file]);

  /* ── Reset ── */

  const handleReset = useCallback(() => {
    setFile(null);
    setPdfBytes(null);
    setPageCount(0);
    setPages([]);
    setErrorMessage(null);
    setProgress({ done: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const totalSize = pages.reduce((sum, p) => sum + p.blob.size, 0);

  /* ── UI ── */

  return (
    <div className="space-y-4">
      {/* ── Upload area ── */}
      {!pages.length && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ffb347] to-[#38d9a9]" />

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
                  : file
                    ? "border-emerald-500/40 bg-emerald-500/5"
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
                📄
              </div>

              {file ? (
                <>
                  <p className="mt-3 text-sm font-semibold text-white">{file.name}</p>
                  <p className="mt-1 text-xs text-muted-2">
                    {formatBytes(file.size)} · {pageCount} page{pageCount !== 1 ? "s" : ""}
                  </p>
                  <p className="mt-2 text-xs text-[#6c63ff]">Click or drop to change file</p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm font-semibold text-white">
                    Drop your PDF file here or <span className="text-[#6c63ff]">browse</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-2">
                    Convert every page of your PDF into high-quality JPG images.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ── Quality picker ── */}
          {file && (
            <div className="border-t border-border px-5 py-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-3">
                Image Quality
              </h3>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(QUALITY_MAP) as QualityPreset[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setQuality(key)}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                      quality === key
                        ? "bg-[#6c63ff] text-white shadow-[0_4px_12px_rgba(108,99,255,.35)]"
                        : "bg-surface-3/50 text-muted hover:bg-surface-3 hover:text-foreground"
                    }`}
                  >
                    {QUALITY_MAP[key].label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Error message ── */}
      {errorMessage && !processing && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      {/* ── Convert button ── */}
      {file && !pages.length && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-t border-border px-5 py-4 text-center">
            <button
              onClick={handleConvert}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
            >
              🖼️ Convert to JPG
            </button>
          </div>
        </div>
      )}

      {/* ── Processing spinner ── */}
      {processing && (
        <div className="flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface px-5 py-12">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-[#6c63ff]" />
            <div
              className="absolute inset-2 animate-spin rounded-full border-4 border-border border-b-[#ffb347]"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>
          <p className="text-sm font-semibold text-white">
            Converting page {progress.done} of {progress.total}…
          </p>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-[#6c63ff] transition-all duration-300"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {pages.length > 0 && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  {pages.length} page{pages.length !== 1 ? "s" : ""} converted
                </h3>
                <p className="text-xs text-muted-2">
                  Total size: {formatBytes(totalSize)} · Quality: {QUALITY_MAP[quality].label}
                </p>
              </div>
              <button
                onClick={handleDownloadAll}
                className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
              >
                ⬇ Download {pages.length > 1 ? "All (ZIP)" : "JPG"}
              </button>
            </div>

            {/* Page grid */}
            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-4">
              {pages.map((page) => (
                <div
                  key={page.pageNumber}
                  className="group overflow-hidden rounded-xl border border-border bg-surface-2 transition hover:border-[#6c63ff]/30"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={page.dataUrl}
                      alt={`Page ${page.pageNumber}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  {/* Info + download */}
                  <div className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="text-xs font-medium text-white">Page {page.pageNumber}</p>
                      <p className="text-[10px] text-muted-2">
                        {page.width}×{page.height} · {formatBytes(page.blob.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownloadSingle(page)}
                      className="rounded-lg bg-surface-3/50 px-2.5 py-1.5 text-[10px] font-semibold text-muted transition hover:bg-surface-3 hover:text-foreground"
                    >
                      ⬇
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface px-5 py-4 text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[.03]"
            >
              Convert Another PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
