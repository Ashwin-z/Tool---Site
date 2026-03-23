"use client";

import { useCallback, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  MAX_CONVERSION_FILES,
  downloadBlob,
  formatBytes,
} from "@/lib/client-pdf-utils";

type QueuedImage = {
  id: string;
  file: File;
};

type ConversionResult = {
  fileName: string;
  blob: Blob;
  imageCount: number;
};

const SUPPORTED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg"];

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

async function embedImage(pdf: PDFDocument, file: File) {
  const mimeType = file.type.toLowerCase();
  const bytes = await file.arrayBuffer();

  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    return pdf.embedJpg(bytes);
  }

  if (mimeType === "image/png") {
    return pdf.embedPng(bytes);
  }

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

export default function ImageToPdfTool() {
  const [queue, setQueue] = useState<QueuedImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const validImages = Array.from(fileList).filter(isSupportedImage);

    if (!validImages.length) {
      setErrorMessage("Please upload image files such as JPG, PNG, WEBP, GIF, BMP, or SVG.");
      return;
    }

    const remainingSlots = MAX_CONVERSION_FILES - queue.length;
    if (remainingSlots <= 0) {
      setErrorMessage(`You can convert a maximum of ${MAX_CONVERSION_FILES} images at a time.`);
      return;
    }

    const limitedImages = validImages.slice(0, remainingSlots);
    setQueue((prev) => [...prev, ...limitedImages.map((file) => ({ id: uid(), file }))]);
    setResult(null);
    setErrorMessage(
      validImages.length > remainingSlots
        ? `Only the first ${remainingSlots} image file${remainingSlots > 1 ? "s were" : " was"} added.`
        : null,
    );
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
      setResult({
        fileName: `images-to-pdf-${Date.now()}.pdf`,
        blob: new Blob([pdfBuffer], { type: "application/pdf" }),
        imageCount: queue.length,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to convert the selected images to PDF.",
      );
    } finally {
      setProcessing(false);
    }
  }, [queue]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    downloadBlob(result.blob, result.fileName);
  }, [result]);

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
                accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.svg"
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
              <p className="mt-3 text-sm font-semibold text-white">
                Drop your image files here or <span className="text-[#6c63ff]">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-2">
                Convert up to {MAX_CONVERSION_FILES} image files into one PDF. Supports JPG, PNG, WEBP, GIF, BMP, and SVG.
              </p>
            </div>
          </div>

          {queue.length > 0 && (
            <div className="border-t border-border">
              <div className="flex items-center justify-between px-5 py-3">
                <h3 className="font-display text-sm font-bold text-white">
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
                      <p className="truncate text-sm font-medium text-white">{item.file.name}</p>
                      <p className="text-[10px] text-muted-2">{formatBytes(item.file.size)}</p>
                    </div>
                    <button
                      onClick={() => moveFile(index, index - 1)}
                      disabled={index === 0}
                      className="rounded-lg bg-surface-3/50 px-3 py-2 text-xs font-semibold text-white transition hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveFile(index, index + 1)}
                      disabled={index === queue.length - 1}
                      className="rounded-lg bg-surface-3/50 px-3 py-2 text-xs font-semibold text-white transition hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeFile(item.id)}
                      className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
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
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      {queue.length > 0 && !result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-t border-border px-5 py-4 text-center">
            <button
              onClick={handleConvert}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
            >
              📄 Convert to PDF
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
          <p className="text-sm font-semibold text-white">Creating your PDF…</p>
        </div>
      )}

      {result && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400">✓</div>
              <h3 className="mt-4 font-display text-xl font-bold text-white">Your PDF is ready!</h3>
              <button
                onClick={handleDownload}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
              >
                ⬇ Download PDF
              </button>
              <p className="mt-4 text-sm text-muted">{result.imageCount} image files converted into one PDF.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface px-5 py-4 text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[.03]"
            >
              Convert More Images
            </button>
          </div>
        </>
      )}
    </div>
  );
}
