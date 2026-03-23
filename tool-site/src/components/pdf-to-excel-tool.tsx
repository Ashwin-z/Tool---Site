"use client";

import { useCallback, useRef, useState } from "react";
import JSZip from "jszip";
import {
  downloadBlob,
  formatBytes,
  sanitizeBaseName,
} from "@/lib/client-pdf-utils";

/* ── Constants ─────────────────────────────────────────── */

const MAX_FILES = 25;

/* ── Types ─────────────────────────────────────────────── */

type QueuedPdf = {
  id: string;
  file: File;
};

type ConvertedDoc = {
  fileName: string;
  blob: Blob;
};

type ConversionResult = {
  files: ConvertedDoc[];
  zipBlob: Blob | null;
};

/* ── Helpers ───────────────────────────────────────────── */

let idCounter = 0;
function uid(): string {
  return `pdf_${++idCounter}_${Date.now()}`;
}

async function convertPdfToExcel(file: File): Promise<{ blob: Blob; warning: string | null }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/tools/pdf-to-excel", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Failed to convert the PDF file to Excel.";
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload?.error) message = payload.error;
    } catch {
      // ignore JSON parsing issues
    }
    throw new Error(message);
  }

  const warningHeader = response.headers.get("X-Conversion-Warning");
  const warning = warningHeader ? decodeURIComponent(warningHeader) : null;

  return {
    blob: await response.blob(),
    warning,
  };
}

async function zipConvertedFiles(files: ConvertedDoc[]): Promise<Blob | null> {
  if (files.length <= 1) return files[0]?.blob ?? null;

  const zip = new JSZip();
  files.forEach((f) => zip.file(f.fileName, f.blob));
  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

/* ── Component ─────────────────────────────────────────── */

export default function PdfToExcelTool() {
  const [queue, setQueue] = useState<QueuedPdf[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── File handling ── */

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const pdfs = Array.from(fileList).filter((f) => /\.pdf$/i.test(f.name));
      if (!pdfs.length) {
        setErrorMessage("Please upload PDF files.");
        return;
      }

      const remainingSlots = MAX_FILES - queue.length;
      if (remainingSlots <= 0) {
        setErrorMessage(`You can convert a maximum of ${MAX_FILES} PDF files at a time.`);
        return;
      }

      const limited = pdfs.slice(0, remainingSlots);
      setQueue((prev) => [...prev, ...limited.map((file) => ({ id: uid(), file }))]);
      setResult(null);
      setErrorMessage(
        pdfs.length > remainingSlots
          ? `Only the first ${remainingSlots} file${remainingSlots > 1 ? "s were" : " was"} added.`
          : null,
      );
    },
    [queue.length],
  );

  const removeFile = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  /* ── Conversion ── */

  const handleConvert = useCallback(async () => {
    if (!queue.length) return;

    setProcessing(true);
    setErrorMessage(null);
    setResult(null);
    setProgress({ current: 0, total: queue.length });

    try {
      const files: ConvertedDoc[] = [];

      for (let i = 0; i < queue.length; i++) {
        setProgress({ current: i + 1, total: queue.length });
        const file = queue[i].file;
        const { blob, warning } = await convertPdfToExcel(file);
        if (warning) {
          setErrorMessage(warning);
        }
        files.push({
          fileName: `${sanitizeBaseName(file.name)}.xlsx`,
          blob,
        });
      }

      const zipBlob = await zipConvertedFiles(files);
      setResult({ files, zipBlob });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to convert one or more PDF files.",
      );
    } finally {
      setProcessing(false);
    }
  }, [queue]);

  /* ── Downloads ── */

  const handleDownloadAll = useCallback(() => {
    if (!result?.zipBlob) return;
    const fileName = result.files.length > 1 ? "pdf-to-excel.zip" : result.files[0].fileName;
    downloadBlob(result.zipBlob, fileName);
  }, [result]);

  const handleDownloadSingle = useCallback((file: ConvertedDoc) => {
    downloadBlob(file.blob, file.fileName);
  }, []);

  /* ── Reset ── */

  const handleReset = useCallback(() => {
    setQueue([]);
    setResult(null);
    setErrorMessage(null);
    setProgress({ current: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const totalSize = queue.reduce((sum, item) => sum + item.file.size, 0);

  /* ── UI ── */

  return (
    <div className="space-y-4">
      {!result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#38d9a9] to-[#ff6584]" />

          <div className="px-5 py-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-14 transition ${
                dragOver
                  ? "border-[#6c63ff] bg-[#6c63ff]/5"
                  : queue.length
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-border hover:border-border-strong"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">
                📊
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                Drop your PDF files here or <span className="text-[#6c63ff]">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-2">
                Convert up to {MAX_FILES} PDF files into editable Excel sheets. Best results are achieved with table-based PDFs; complex magazine-style layouts may only convert partially.
              </p>
            </div>
          </div>

          {queue.length > 0 && (
            <div className="border-t border-border">
              <div className="flex items-center justify-between px-5 py-3">
                <h3 className="font-display text-sm font-bold text-white">
                  {queue.length} PDF file{queue.length > 1 ? "s" : ""} selected
                  <span className="ml-2 text-xs font-normal text-muted-2">
                    ({formatBytes(totalSize)} total)
                  </span>
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
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
              📊 Convert to Excel
            </button>
          </div>
        </div>
      )}

      {processing && (
        <div className="flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface px-5 py-12">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-[#6c63ff]" />
            <div
              className="absolute inset-2 animate-spin rounded-full border-4 border-border border-b-[#38d9a9]"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>
          <p className="text-sm font-semibold text-white">
            {queue.length > 1
              ? `Converting file ${progress.current} of ${progress.total}…`
              : "Converting PDF to Excel…"}
          </p>
          <p className="text-xs text-muted-2">
            This may take a minute — the server is extracting table-like text and building your spreadsheet.
          </p>
          {queue.length > 1 && (
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-[#6c63ff] transition-all duration-300"
                style={{
                  width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
          )}
        </div>
      )}

      {result && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400">
                ✓
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-white">
                {result.files.length === 1 ? "Your Excel spreadsheet is ready!" : "Your Excel spreadsheets are ready!"}
              </h3>
              <button
                onClick={handleDownloadAll}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
              >
                ⬇ Download {result.files.length > 1 ? "All (ZIP)" : "XLSX"}
              </button>
              <p className="mt-4 text-sm text-muted">
                {result.files.length} PDF file{result.files.length > 1 ? "s" : ""} converted to Excel.
              </p>
            </div>

            {result.files.length > 1 && (
              <div className="border-t border-border">
                <div className="max-h-60 divide-y divide-white/5 overflow-y-auto px-5 py-2">
                  {result.files.map((f) => (
                    <div key={f.fileName} className="flex items-center gap-3 py-2">
                      <span className="text-base">📊</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{f.fileName}</p>
                        <p className="text-[10px] text-muted-2">{formatBytes(f.blob.size)}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadSingle(f)}
                        className="rounded-lg bg-surface-3/50 px-3 py-1.5 text-[10px] font-semibold text-muted transition hover:bg-surface-3 hover:text-foreground"
                      >
                        ⬇ Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface px-5 py-4 text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[.03]"
            >
              Convert More PDFs
            </button>
          </div>
        </>
      )}
    </div>
  );
}