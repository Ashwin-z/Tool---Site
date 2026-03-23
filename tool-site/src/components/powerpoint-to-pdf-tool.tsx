"use client";

import { useCallback, useRef, useState } from "react";
import JSZip from "jszip";
import {
  MAX_CONVERSION_FILES,
  downloadBlob,
  formatBytes,
  sanitizeBaseName,
} from "@/lib/client-pdf-utils";

type QueuedDeck = {
  id: string;
  file: File;
};

type ConvertedPdf = {
  fileName: string;
  blob: Blob;
};

type ConversionResult = {
  files: ConvertedPdf[];
  zipBlob: Blob | null;
};

let idCounter = 0;
function uid(): string {
  return `ppt_${++idCounter}_${Date.now()}`;
}

function isPowerPointFile(file: File): boolean {
  return /\.(pptx|ppt)$/i.test(file.name);
}

async function convertPowerPointToPdf(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/tools/powerpoint-to-pdf", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Failed to convert the PowerPoint file to PDF.";

    try {
      const payload = (await response.json()) as { error?: string };
      if (payload?.error) message = payload.error;
    } catch {
      // ignore JSON parsing issues
    }

    throw new Error(message);
  }

  return response.blob();
}

async function zipConvertedFiles(files: ConvertedPdf[]): Promise<Blob | null> {
  if (files.length <= 1) return files[0]?.blob ?? null;

  const zip = new JSZip();
  files.forEach((file) => zip.file(file.fileName, file.blob));
  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

export default function PowerPointToPdfTool() {
  const [queue, setQueue] = useState<QueuedDeck[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const decks = Array.from(fileList).filter(isPowerPointFile);
    if (!decks.length) {
      setErrorMessage("Please upload PowerPoint files in .ppt or .pptx format.");
      return;
    }

    const remainingSlots = MAX_CONVERSION_FILES - queue.length;
    if (remainingSlots <= 0) {
      setErrorMessage(`You can convert a maximum of ${MAX_CONVERSION_FILES} PowerPoint files at a time.`);
      return;
    }

    const limitedFiles = decks.slice(0, remainingSlots);
    setQueue((prev) => [...prev, ...limitedFiles.map((file) => ({ id: uid(), file }))]);
    setResult(null);
    setErrorMessage(
      decks.length > remainingSlots
        ? `Only the first ${remainingSlots} PowerPoint file${remainingSlots > 1 ? "s were" : " was"} added.`
        : null,
    );
  }, [queue.length]);

  const removeFile = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
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
    setErrorMessage(null);
    setResult(null);
    setProgress({ current: 0, total: queue.length });

    try {
      const files: ConvertedPdf[] = [];

      for (let index = 0; index < queue.length; index += 1) {
        setProgress({ current: index + 1, total: queue.length });
        const sourceFile = queue[index].file;
        const blob = await convertPowerPointToPdf(sourceFile);
        files.push({
          fileName: `${sanitizeBaseName(sourceFile.name)}.pdf`,
          blob,
        });
      }

      const zipBlob = await zipConvertedFiles(files);
      setResult({ files, zipBlob });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to convert one or more PowerPoint files to PDF.",
      );
    } finally {
      setProcessing(false);
    }
  }, [queue]);

  const handleDownloadAll = useCallback(() => {
    if (!result?.zipBlob) return;
    downloadBlob(result.zipBlob, result.files.length > 1 ? "powerpoint-to-pdf.zip" : result.files[0].fileName);
  }, [result]);

  const handleDownloadSingle = useCallback((file: ConvertedPdf) => {
    downloadBlob(file.blob, file.fileName);
  }, []);

  const handleReset = useCallback(() => {
    setQueue([]);
    setResult(null);
    setErrorMessage(null);
    setProgress({ current: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const totalSize = queue.reduce((sum, item) => sum + item.file.size, 0);

  return (
    <div className="space-y-4">
      {!result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#f472b6] to-[#38d9a9]" />

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
                    ? "border-pink-500/40 bg-pink-500/5"
                    : "border-border hover:border-border-strong"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".ppt,.pptx"
                multiple
                className="hidden"
                onChange={(event) => {
                  addFiles(event.target.files);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">
                📽️
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                Drop your PowerPoint files here or <span className="text-[#6c63ff]">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-2">
                Convert up to {MAX_CONVERSION_FILES} .ppt or .pptx files into PDF with full slide fidelity on Windows.
              </p>
            </div>
          </div>

          {queue.length > 0 && (
            <div className="border-t border-border">
              <div className="flex items-center justify-between px-5 py-3">
                <h3 className="font-display text-sm font-bold text-white">
                  {queue.length} PowerPoint file{queue.length > 1 ? "s" : ""} selected
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
                {queue.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <span className="text-base">📄</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{item.file.name}</p>
                      <p className="text-[10px] text-muted-2">{formatBytes(item.file.size)}</p>
                    </div>
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
              className="absolute inset-2 animate-spin rounded-full border-4 border-border border-b-[#f472b6]"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>
          <p className="text-sm font-semibold text-white">Converting your PowerPoint files…</p>
          {progress.total > 0 && (
            <p className="text-xs text-muted">Converting file {progress.current} of {progress.total}</p>
          )}
        </div>
      )}

      {result && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400">✓</div>
              <h3 className="mt-4 font-display text-xl font-bold text-white">
                {result.files.length > 1 ? `${result.files.length} PDFs are ready!` : "Your PDF is ready!"}
              </h3>
              <button
                onClick={handleDownloadAll}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
              >
                ⬇ Download {result.files.length > 1 ? "ZIP" : "PDF"}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">Converted Files</h3>
            </div>
            <div className="divide-y divide-white/5">
              {result.files.map((file) => (
                <div key={file.fileName} className="flex items-center gap-3 px-5 py-4">
                  <span className="text-base">📄</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{file.fileName}</p>
                    <p className="mt-1 text-[10px] text-muted">{formatBytes(file.blob.size)}</p>
                  </div>
                  <button
                    onClick={() => handleDownloadSingle(file)}
                    className="rounded-lg bg-surface-3/50 px-3 py-2 text-xs font-semibold text-white transition hover:bg-surface-3"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-border px-5 py-4 text-center">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[.03]"
              >
                Convert More Files
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
