"use client";

import { useCallback, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  MAX_CONVERSION_FILES,
  downloadBlob,
  formatBytes,
  sanitizeBaseName,
} from "@/lib/client-pdf-utils";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

type QueuedImage = {
  id: string;
  file: File;
};

type OutputMode = "merged" | "separate";

type OutputPdf = {
  id: string;
  sourceName: string;
  fileName: string;
  blob: Blob;
};

type ConversionResult = {
  mode: OutputMode;
  files: OutputPdf[];
  primaryBlob: Blob;
  primaryFileName: string;
  imageCount: number;
};

const SUPPORTED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "jfif", "png", "webp", "gif", "bmp", "svg"];

let idCounter = 0;
function uid(): string {
  return `img_${++idCounter}_${Date.now()}`;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function isSupportedImage(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return SUPPORTED_IMAGE_EXTENSIONS.includes(extension);
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const [, base64 = ""] = dataUrl.split(",");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

async function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unsupported image format."));
    image.src = source;
  });
}

async function rasterizeImageForPdf(pdf: PDFDocument, file: File) {
  const dataUrl = await fileToDataUrl(file);
  const imageElement = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = imageElement.naturalWidth || imageElement.width;
  canvas.height = imageElement.naturalHeight || imageElement.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to prepare the image for PDF conversion.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

  return pdf.embedPng(dataUrlToUint8Array(canvas.toDataURL("image/png")));
}

async function embedImage(pdf: PDFDocument, file: File) {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const bytes = await file.arrayBuffer();
  const isJpegLike = ["image/jpeg", "image/jpg", "image/pjpeg", "image/jfif"].includes(mimeType)
    || ["jpg", "jpeg", "jfif"].includes(extension);
  const isPngLike = mimeType === "image/png" || extension === "png";

  if (isJpegLike) {
    try {
      return await pdf.embedJpg(bytes);
    } catch {
      return rasterizeImageForPdf(pdf, file);
    }
  }

  if (isPngLike) {
    try {
      return await pdf.embedPng(bytes);
    } catch {
      return rasterizeImageForPdf(pdf, file);
    }
  }

  return rasterizeImageForPdf(pdf, file);
}

async function buildPdfBlobFromImage(file: File): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const embeddedImage = await embedImage(pdf, file);
  const page = pdf.addPage([embeddedImage.width, embeddedImage.height]);

  page.drawImage(embeddedImage, {
    x: 0,
    y: 0,
    width: embeddedImage.width,
    height: embeddedImage.height,
  });

  const pdfBytes = await pdf.save();
  const pdfBuffer = pdfBytes.buffer.slice(
    pdfBytes.byteOffset,
    pdfBytes.byteOffset + pdfBytes.byteLength,
  ) as ArrayBuffer;
  return new Blob([pdfBuffer], { type: "application/pdf" });
}

async function buildZipBlob(files: OutputPdf[]): Promise<Blob | null> {
  if (files.length <= 1) return null;

  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.fileName, file.blob);
  }

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export default function ImageToPdfTool() {
  const [queue, setQueue] = useState<QueuedImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [outputMode, setOutputMode] = useState<OutputMode>("merged");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const validImages = Array.from(fileList).filter(isSupportedImage);

    if (!validImages.length) {
      setErrorMessage("Please upload image files such as JPG, JFIF, PNG, WEBP, GIF, BMP, or SVG.");
      return;
    }

    const oversized = validImages.filter((f) => f.size > MAX_FILE_SIZE);
    const validFiles = validImages.filter((f) => f.size <= MAX_FILE_SIZE);

    if (oversized.length) {
      setErrorMessage(`${oversized.length} file${oversized.length > 1 ? "s" : ""} exceeded the ${MAX_FILE_SIZE / (1024 * 1024)}MB size limit and ${oversized.length > 1 ? "were" : "was"} skipped.`);
    }

    if (!validFiles.length) return;

    const remainingSlots = MAX_CONVERSION_FILES - queue.length;
    if (remainingSlots <= 0) {
      setErrorMessage(`You can convert a maximum of ${MAX_CONVERSION_FILES} images at a time.`);
      return;
    }

    const limitedImages = validFiles.slice(0, remainingSlots);
    setQueue((prev) => [...prev, ...limitedImages.map((file) => ({ id: uid(), file }))]);
    setResult(null);
    if (validFiles.length > remainingSlots) {
      setErrorMessage(`Only the first ${remainingSlots} image file${remainingSlots > 1 ? "s were" : " was"} added.`);
    }
  }, [queue.length]);

  const removeFile = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
    setResult(null);
  }, []);

  const moveFile = useCallback((fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      return moveItem(prev, fromIndex, toIndex);
    });
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      addFiles(event.dataTransfer.files);
    },
    [addFiles],
  );

  const handleConvert = useCallback(async () => {
    if (!queue.length) return;

    setProcessing(true);
    setResult(null);
    setErrorMessage(null);

    try {
      if (outputMode === "merged") {
        const pdf = await PDFDocument.create();

        for (const item of queue) {
          const embeddedImage = await embedImage(pdf, item.file);
          const page = pdf.addPage([embeddedImage.width, embeddedImage.height]);
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: embeddedImage.width,
            height: embeddedImage.height,
          });
        }

        const pdfBytes = await pdf.save();
        const pdfBuffer = pdfBytes.buffer.slice(
          pdfBytes.byteOffset,
          pdfBytes.byteOffset + pdfBytes.byteLength,
        ) as ArrayBuffer;
        const blob = new Blob([pdfBuffer], { type: "application/pdf" });
        const fileName = `images-to-pdf-${Date.now()}.pdf`;

        setResult({
          mode: "merged",
          files: [{ id: "merged", sourceName: "All images", fileName, blob }],
          primaryBlob: blob,
          primaryFileName: fileName,
          imageCount: queue.length,
        });
      } else {
        const files = await Promise.all(
          queue.map(async (item) => ({
            id: item.id,
            sourceName: item.file.name,
            fileName: `${sanitizeBaseName(item.file.name)}.pdf`,
            blob: await buildPdfBlobFromImage(item.file),
          })),
        );

        const zipBlob = await buildZipBlob(files);
        const primaryBlob = zipBlob ?? files[0].blob;
        const primaryFileName =
          zipBlob != null
            ? `images-to-pdf-${Date.now()}.zip`
            : files[0].fileName;

        setResult({
          mode: "separate",
          files,
          primaryBlob,
          primaryFileName,
          imageCount: queue.length,
        });
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to convert the selected images to PDF.",
      );
    } finally {
      setProcessing(false);
    }
  }, [outputMode, queue]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    downloadBlob(result.primaryBlob, result.primaryFileName);
  }, [result]);

  const handleDownloadSingle = useCallback((file: OutputPdf) => {
    downloadBlob(file.blob, file.fileName);
  }, []);

  const handleReset = useCallback(() => {
    setQueue([]);
    setResult(null);
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const totalSize = queue.reduce((sum, item) => sum + item.file.size, 0);

  return (
    <div className="space-y-4">
      {!result && !processing && (
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
                  : queue.length
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-border hover:border-border-strong"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*,.jpg,.jpeg,.jfif,.png,.webp,.gif,.bmp,.svg"
                multiple
                className="hidden"
                onChange={(event) => {
                  addFiles(event.target.files);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">
                🖼️
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                Drop your image files here or <span className="text-[#6c63ff]">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-2">
                Convert up to {MAX_CONVERSION_FILES} image files into one PDF. Supports JPG, JFIF, PNG, WEBP, GIF, BMP, and SVG.
              </p>
            </div>
          </div>

          {queue.length > 0 && (
            <div className="border-t border-border">
              <div className="flex items-center justify-between px-5 py-3">
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  {queue.length} image{queue.length > 1 ? "s" : ""} selected
                  <span className="ml-2 text-xs font-normal text-muted-2">({formatBytes(totalSize)} total)</span>
                </h3>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleReset();
                  }}
                  className="text-[10px] font-semibold text-[#ff6584] transition hover:text-[#ff8da6]"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-80 divide-y divide-white/5 overflow-y-auto px-5 pb-3">
                {queue.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6c63ff]/10 text-sm font-bold text-[#a39cff]">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{item.file.name}</p>
                      <p className="text-[10px] text-muted-2">{formatBytes(item.file.size)}</p>
                    </div>
                    <button
                      onClick={() => moveFile(index, index - 1)}
                      disabled={index === 0}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 dark:border-transparent dark:bg-surface-3/50 dark:text-white dark:hover:bg-surface-3 dark:disabled:bg-surface-3/30 dark:disabled:text-white/40"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveFile(index, index + 1)}
                      disabled={index === queue.length - 1}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 dark:border-transparent dark:bg-surface-3/50 dark:text-white dark:hover:bg-surface-3 dark:disabled:bg-surface-3/30 dark:disabled:text-white/40"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeFile(item.id)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 dark:border-transparent dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {errorMessage && !processing && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      {queue.length > 0 && !result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-3">Output mode</p>
                <p className="mt-1 text-sm text-muted">Choose one merged PDF or separate PDFs for each image.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setOutputMode("merged")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    outputMode === "merged"
                      ? "bg-[#6c63ff] text-white shadow-[0_4px_20px_rgba(108,99,255,.35)]"
                      : "border border-border bg-surface-2 text-foreground hover:bg-surface-3"
                  }`}
                >
                  One merged PDF
                </button>
                <button
                  onClick={() => setOutputMode("separate")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    outputMode === "separate"
                      ? "bg-[#6c63ff] text-white shadow-[0_4px_20px_rgba(108,99,255,.35)]"
                      : "border border-border bg-surface-2 text-foreground hover:bg-surface-3"
                  }`}
                >
                  Separate PDFs
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-border px-5 py-4 text-center">
            <button
              onClick={handleConvert}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
            >
              📄 {outputMode === "merged" ? "Convert to PDF" : "Create PDFs"}
            </button>
          </div>
        </div>
      )}

      {processing && (
        <div className="flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface px-5 py-12">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-[#6c63ff]" />
            <div
              className="absolute inset-2 animate-spin rounded-full border-4 border-border border-b-[#ffb347]"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>
          <p className="text-sm font-semibold text-foreground">
            {outputMode === "merged" ? "Creating your PDF…" : "Creating your PDF files…"}
          </p>
        </div>
      )}

      {result && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400">✓</div>
              <h3 className="mt-4 font-display text-xl font-bold text-foreground">
                {result.mode === "merged" ? "Your PDF is ready!" : "Your PDF files are ready!"}
              </h3>
              <button
                onClick={handleDownload}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
              >
                ⬇ {result.mode === "merged" ? "Download PDF" : result.files.length > 1 ? "Download All PDFs" : "Download PDF"}
              </button>
              <p className="mt-4 text-sm text-muted">
                {result.mode === "merged"
                  ? `${result.imageCount} image files converted into one PDF.`
                  : `${result.imageCount} image files converted into ${result.files.length} individual PDF${result.files.length > 1 ? "s" : ""}.`}
              </p>
            </div>
          </div>

          {result.mode === "separate" && (
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="border-b border-border px-5 py-3">
                <h3 className="font-display text-sm font-bold text-foreground">Output Files</h3>
              </div>

              <div className="divide-y divide-white/5">
                {result.files.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 px-5 py-4">
                    <span className="text-base">📄</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{file.fileName}</p>
                      <p className="mt-1 text-[10px] text-muted">Source: {file.sourceName}</p>
                    </div>
                    <button
                      onClick={() => handleDownloadSingle(file)}
                      className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-surface-3"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-border bg-surface px-5 py-4 text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-3"
            >
              Convert More Images
            </button>
          </div>
        </>
      )}
    </div>
  );
}
