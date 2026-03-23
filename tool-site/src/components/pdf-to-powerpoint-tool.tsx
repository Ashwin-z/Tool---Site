"use client";

import { useCallback, useRef, useState } from "react";
import {
  downloadBlob,
  formatBytes,
  sanitizeBaseName,
} from "@/lib/client-pdf-utils";

/* ── Types ─────────────────────────────────────────────── */

type ConvertedSlide = {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
};

/* ── Helpers ───────────────────────────────────────────── */

async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }
  return pdfjs;
}

async function getPdfPageCount(bytes: ArrayBuffer): Promise<number> {
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
  return pdf.numPages;
}

/** Render a single PDF page to a high-quality PNG data-url for PPTX embedding. */
async function renderPageToImage(
  pdfBytes: ArrayBuffer,
  pageNumber: number,
  scale: number,
): Promise<ConvertedSlide> {
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data: pdfBytes.slice(0) }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;

  return {
    pageNumber,
    dataUrl: canvas.toDataURL("image/png", 1),
    width: canvas.width,
    height: canvas.height,
  };
}

/** Build a PPTX file from rendered slide images using pptxgenjs. */
async function buildPptx(slides: ConvertedSlide[]): Promise<Blob> {
  // Dynamic import so pptxgenjs is only loaded client-side
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();

  for (const slide of slides) {
    // Determine slide dimensions in inches (pptxgenjs default is 10 × 7.5)
    const aspectRatio = slide.width / slide.height;
    let slideW = 10;
    let slideH = slideW / aspectRatio;

    // If the computed height is larger than a reasonable max, constrain by height
    if (slideH > 7.5) {
      slideH = 7.5;
      slideW = slideH * aspectRatio;
    }

    pptx.defineLayout({ name: `Page${slide.pageNumber}`, width: slideW, height: slideH });
    pptx.layout = `Page${slide.pageNumber}`;

    const pptxSlide = pptx.addSlide();
    pptxSlide.addImage({
      data: slide.dataUrl,
      x: 0,
      y: 0,
      w: slideW,
      h: slideH,
    });
  }

  const output = await pptx.write({ outputType: "blob" });
  return output as Blob;
}

/* ── Component ─────────────────────────────────────────── */

export default function PdfToPowerpointTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [slideCount, setSlideCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── File handling ── */

  const loadFile = useCallback(async (incoming: File) => {
    setErrorMessage(null);
    setResultBlob(null);
    setSlideCount(0);

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
    setResultBlob(null);
    setErrorMessage(null);
    setProgress({ done: 0, total: pageCount });

    const scale = 2; // 200 DPI — good balance of quality and file size

    try {
      const slides: ConvertedSlide[] = [];

      for (let i = 1; i <= pageCount; i++) {
        const slide = await renderPageToImage(pdfBytes, i, scale);
        slides.push(slide);
        setProgress({ done: i, total: pageCount });
      }

      const blob = await buildPptx(slides);
      setResultBlob(blob);
      setSlideCount(slides.length);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to convert the PDF to PowerPoint.",
      );
    } finally {
      setProcessing(false);
    }
  }, [pdfBytes, file, pageCount]);

  /* ── Download ── */

  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    const baseName = sanitizeBaseName(file.name);
    downloadBlob(resultBlob, `${baseName}.pptx`);
  }, [resultBlob, file]);

  /* ── Reset ── */

  const handleReset = useCallback(() => {
    setFile(null);
    setPdfBytes(null);
    setPageCount(0);
    setResultBlob(null);
    setSlideCount(0);
    setErrorMessage(null);
    setProgress({ done: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  /* ── UI ── */

  return (
    <div className="space-y-4">
      {/* ── Upload area ── */}
      {!resultBlob && !processing && (
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
                📊
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
                    Convert every page of your PDF into a PowerPoint slide. Runs entirely in your browser.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Error message ── */}
      {errorMessage && !processing && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      {/* ── Convert button ── */}
      {file && !resultBlob && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-t border-border px-5 py-4 text-center">
            <button
              onClick={handleConvert}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
            >
              📊 Convert to PowerPoint
            </button>
          </div>
        </div>
      )}

      {/* ── Processing ── */}
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
            Rendering page {progress.done} of {progress.total}…
          </p>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-[#6c63ff] transition-all duration-300"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {resultBlob && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400">
                ✓
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-white">
                Your PowerPoint is ready!
              </h3>
              <button
                onClick={handleDownload}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
              >
                ⬇ Download PPTX
              </button>
              <p className="mt-4 text-sm text-muted">
                {slideCount} slide{slideCount !== 1 ? "s" : ""} created · {formatBytes(resultBlob.size)}
              </p>
            </div>
          </div>

          {/* Reset */}
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
