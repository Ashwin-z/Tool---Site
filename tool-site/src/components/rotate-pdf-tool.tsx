"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { degrees, PDFDocument } from "pdf-lib";
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

function normalizeRotation(value: number): number {
  return ((value % 360) + 360) % 360;
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

async function renderPreview(bytes: ArrayBuffer, rotation: number): Promise<string> {
  const pdfjs = await getPdfjs();
  const pdf = await pdfjs.getDocument({ data: bytes.slice(0) }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 0.95, rotation });
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

async function rotatePdfBytes(bytes: ArrayBuffer, rotation: number): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(bytes.slice(0));

  for (const page of pdf.getPages()) {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(normalizeRotation(currentRotation + rotation)));
  }

  return pdf.save();
}

export default function RotatePdfTool() {
  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [rotation, setRotation] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const renderTokenRef = useRef(0);

  const loadFile = useCallback(async (incoming: File) => {
    setErrorMessage(null);
    setPreviewUrl(null);
    setRotation(0);

    if (!incoming.name.toLowerCase().endsWith(".pdf")) {
      setPdf(null);
      setErrorMessage("Please upload a valid PDF file.");
      return;
    }

    try {
      const loaded = await loadPdf(incoming);
      setPdf(loaded);
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
      setPreviewUrl(null);
      setPreviewLoading(false);
      return;
    }

    const renderToken = ++renderTokenRef.current;
    setPreviewLoading(true);

    renderPreview(pdf.bytes, rotation)
      .then((url) => {
        if (renderTokenRef.current === renderToken) {
          setPreviewUrl(url);
        }
      })
      .catch(() => {
        if (renderTokenRef.current === renderToken) {
          setPreviewUrl(null);
          setErrorMessage("Preview rendering failed for this PDF.");
        }
      })
      .finally(() => {
        if (renderTokenRef.current === renderToken) {
          setPreviewLoading(false);
        }
      });
  }, [pdf, rotation]);

  const handleRotateLeft = useCallback(() => {
    setRotation((current) => normalizeRotation(current - 90));
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation((current) => normalizeRotation(current + 90));
  }, []);

  const handleReset = useCallback(() => {
    setRotation(0);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!pdf) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      const rotatedBytes = await rotatePdfBytes(pdf.bytes, rotation);
      downloadBlob(
        new Blob([rotatedBytes], { type: "application/pdf" }),
        `${sanitizeBaseName(pdf.file.name)}_rotated.pdf`,
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to rotate the PDF.");
    } finally {
      setProcessing(false);
    }
  }, [pdf, rotation]);

  const handleResetAll = useCallback(() => {
    setPdf(null);
    setRotation(0);
    setPreviewUrl(null);
    setPreviewLoading(false);
    setProcessing(false);
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const rotationLabel = `${rotation}°`;
  const isLandscapePreview = rotation === 90 || rotation === 270;

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
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-14 transition ${
                dragOver
                  ? "border-[#6c63ff] bg-[#6c63ff]/5"
                  : "border-white/10 hover:border-white/20"
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
                🔄
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                Drop your PDF here or <span className="text-[#6c63ff]">browse</span>
              </p>
              <p className="mt-1 text-xs text-[#57576f]">
                Rotate left, rotate right, and reset with an instant live preview. Everything runs locally in your browser.
              </p>
            </div>
          </div>
        </div>
      )}

      {pdf && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#38d9a9] to-[#ffb347]" />

          <div className="grid gap-6 px-5 py-5 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-[#17171f] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8fa8]">Selected file</p>
                <h2 className="mt-2 break-all text-sm font-semibold text-white">{pdf.file.name}</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-[#9b9bb3]">
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    <span className="block text-[#6c63ff]">Pages</span>
                    <span className="font-semibold text-white">{pdf.pageCount}</span>
                  </div>
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    <span className="block text-[#6c63ff]">Size</span>
                    <span className="font-semibold text-white">{formatBytes(pdf.file.size)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#17171f] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8fa8]">Rotate controls</p>
                <p className="mt-2 text-sm text-[#9b9bb3]">
                  Current rotation: <span className="font-semibold text-white">{rotationLabel}</span>
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleRotateLeft}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white transition hover:border-[#6c63ff]/40 hover:bg-[#6c63ff]/10"
                  >
                    Rotate left
                  </button>
                  <button
                    type="button"
                    onClick={handleRotateRight}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white transition hover:border-[#6c63ff]/40 hover:bg-[#6c63ff]/10"
                  >
                    Rotate right
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={rotation === 0}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white transition hover:border-[#ffb347]/40 hover:bg-[#ffb347]/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={processing}
                    className="flex-1 rounded-xl bg-[#6c63ff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5a52df] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processing ? "Preparing…" : "Download rotated PDF"}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#17171f] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8fa8]">Live preview</p>
                  <p className="mt-1 text-sm text-[#9b9bb3]">
                    Showing page 1 at {rotationLabel}. The same rotation is applied to every page on download.
                  </p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-[#c7c7d6]">
                  {previewLoading ? "Refreshing…" : "Ready"}
                </span>
              </div>

              <div className="mt-4 flex justify-center">
                <div
                  className={`relative w-full max-w-[420px] overflow-hidden rounded-[22px] border border-[#d1d5db] bg-[#f8fafc] p-4 shadow-[0_12px_40px_rgba(15,23,42,.08)] ${
                    isLandscapePreview ? "aspect-[297/210]" : "aspect-[210/297]"
                  }`}
                >
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Live preview of the rotated PDF"
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-[18px] border border-dashed border-slate-300 bg-white text-sm text-slate-500">
                      {previewLoading ? "Rendering preview…" : "Preview unavailable"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}