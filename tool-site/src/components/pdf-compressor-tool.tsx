"use client";

import { useCallback, useRef, useState } from "react";

type CompressionLevel = "extreme" | "recommended" | "less";

interface QueuedFile {
  id: string;
  file: File;
}

interface CompressedFile {
  fileName: string;
  originalSize: number;
  compressedSize: number;
  blob: Blob;
  method: "ghostscript" | "original";
}

interface CompressionResult {
  files: CompressedFile[];
  totalOriginal: number;
  totalCompressed: number;
  zipBlob: Blob | null;
}

const LEVELS: {
  id: CompressionLevel;
  label: string;
  sub: string;
  icon: string;
  color: string;
  activeRing: string;
  activeBg: string;
}[] = [
  {
    id: "extreme",
    label: "Extreme Compression",
    sub: "Highest reduction, best for large PDFs",
    icon: "⚡",
    color: "text-red-400",
    activeRing: "ring-red-500/50",
    activeBg: "bg-red-500/10",
  },
  {
    id: "recommended",
    label: "Recommended Compression",
    sub: "Balanced size and readability",
    icon: "✅",
    color: "text-emerald-400",
    activeRing: "ring-emerald-500/50",
    activeBg: "bg-emerald-500/10",
  },
  {
    id: "less",
    label: "Less Compression",
    sub: "Largest quality retention",
    icon: "🔒",
    color: "text-amber-400",
    activeRing: "ring-amber-500/50",
    activeBg: "bg-amber-500/10",
  },
];

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

let idCounter = 0;
function uid(): string {
  return `f_${++idCounter}_${Date.now()}`;
}

async function compressOnePdfOnServer(
  file: File,
  level: CompressionLevel,
): Promise<CompressedFile> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("level", level);

  const response = await fetch("/api/tools/pdf-compressor", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "Failed to compress PDF.";

    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) errorMessage = data.error;
    } catch {
      const text = await response.text();
      if (text) errorMessage = text;
    }

    throw new Error(errorMessage);
  }

  const blob = await response.blob();
  const fileName = decodeURIComponent(
    response.headers.get("x-file-name") ?? `${file.name.replace(/\.pdf$/i, "")}_compressed.pdf`,
  );
  const originalSize = Number(response.headers.get("x-original-size") ?? file.size);
  const compressedSize = Number(response.headers.get("x-compressed-size") ?? blob.size);
  const method =
    response.headers.get("x-compression-method") === "ghostscript"
      ? "ghostscript"
      : "original";

  return {
    fileName,
    originalSize,
    compressedSize,
    blob,
    method,
  };
}

async function compressAllOnServer(
  files: File[],
  level: CompressionLevel,
  onFileProgress?: (fileIdx: number, total: number) => void,
): Promise<CompressionResult> {
  const compressed: CompressedFile[] = [];
  let totalOriginal = 0;
  let totalCompressed = 0;

  for (let i = 0; i < files.length; i++) {
    onFileProgress?.(i + 1, files.length);
    const result = await compressOnePdfOnServer(files[i], level);
    compressed.push(result);
    totalOriginal += result.originalSize;
    totalCompressed += result.compressedSize;
  }

  let zipBlob: Blob | null = null;

  if (compressed.length > 1) {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    for (const file of compressed) {
      zip.file(file.fileName, file.blob);
    }

    zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
  } else if (compressed.length === 1) {
    zipBlob = compressed[0].blob;
  }

  return { files: compressed, totalOriginal, totalCompressed, zipBlob };
}

export default function PdfCompressorTool() {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [level, setLevel] = useState<CompressionLevel>("recommended");
  const [processing, setProcessing] = useState(false);
  const [fileProgress, setFileProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const pdfs = Array.from(fileList).filter((file) => file.type === "application/pdf");
    if (!pdfs.length) return;

    setQueue((prev) => [...prev, ...pdfs.map((file) => ({ id: uid(), file }))]);
    setResult(null);
    setErrorMessage(null);
  }, []);

  const removeFile = useCallback((id: string) => {
    setQueue((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleCompress = useCallback(async () => {
    if (!queue.length) return;

    setProcessing(true);
    setResult(null);
    setErrorMessage(null);
    setFileProgress({ current: 0, total: queue.length });

    try {
      const res = await compressAllOnServer(
        queue.map((item) => item.file),
        level,
        (current, total) => setFileProgress({ current, total }),
      );
      setResult(res);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to compress PDF.";
      setErrorMessage(message);
    } finally {
      setProcessing(false);
    }
  }, [level, queue]);

  const handleDownloadAll = useCallback(() => {
    if (!result?.zipBlob) return;
    const url = URL.createObjectURL(result.zipBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.files.length > 1 ? "compressed_pdfs.zip" : result.files[0].fileName;
    link.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const handleDownloadSingle = useCallback((cf: CompressedFile) => {
    const url = URL.createObjectURL(cf.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = cf.fileName;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleReset = useCallback(() => {
    setQueue([]);
    setResult(null);
    setErrorMessage(null);
    setFileProgress({ current: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const totalSavedPct =
    result && result.totalOriginal > 0
      ? Math.max(
          0,
          Math.round(((result.totalOriginal - result.totalCompressed) / result.totalOriginal) * 100),
        )
      : 0;

  return (
    <div className="space-y-4">
      {!result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

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
                    : "border-white/10 hover:border-white/20"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">
                📁
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                Drop your PDFs here or <span className="text-[#6c63ff]">browse</span>
              </p>
              <p className="mt-1 text-xs text-[#57576f]">
                Upload one or multiple .pdf files for native server-side compression
              </p>
            </div>
          </div>

          {queue.length > 0 && (
            <div className="border-t border-white/10">
              <div className="flex items-center justify-between px-5 py-3">
                <h3 className="font-display text-sm font-bold text-white">
                  {queue.length} file{queue.length > 1 ? "s" : ""} selected
                  <span className="ml-2 text-xs font-normal text-[#57576f]">
                    ({fmtSize(queue.reduce((sum, item) => sum + item.file.size, 0))} total)
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

              <div className="max-h-60 divide-y divide-white/5 overflow-y-auto px-5 pb-3">
                {queue.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2.5">
                    <span className="text-base">📄</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{item.file.name}</p>
                      <p className="text-[10px] text-[#57576f]">{fmtSize(item.file.size)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(item.id);
                      }}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#57576f] transition hover:bg-[#ff6584]/10 hover:text-[#ff6584]"
                      title="Remove file"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
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
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
          <div className="border-b border-white/10 px-5 py-3">
            <h3 className="font-display text-sm font-bold text-white">Compression Level</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 px-5 py-5 sm:grid-cols-3">
            {LEVELS.map((option) => (
              <button
                key={option.id}
                onClick={() => setLevel(option.id)}
                className={`flex flex-col items-center rounded-xl border px-4 py-5 text-center transition ${
                  level === option.id
                    ? `ring-2 ${option.activeRing} ${option.activeBg} border-transparent`
                    : "border-white/10 hover:border-white/20 hover:bg-white/[.02]"
                }`}
              >
                <span className="text-2xl">{option.icon}</span>
                <span
                  className={`mt-2 text-sm font-semibold ${
                    level === option.id ? option.color : "text-white"
                  }`}
                >
                  {option.label}
                </span>
                <span className="mt-1 text-[10px] text-[#57576f]">{option.sub}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-white/10 px-5 py-4 text-center">
            <button
              onClick={handleCompress}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
            >
              🗜️ Compress {queue.length > 1 ? `${queue.length} PDFs` : "PDF"}
            </button>
          </div>
        </div>
      )}

      {processing && (
        <div className="flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#111118] px-5 py-12">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/10 border-t-[#6c63ff]" />
            <div
              className="absolute inset-2 animate-spin rounded-full border-4 border-white/5 border-b-[#ff6584]"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>

          <p className="text-sm font-semibold text-white">Compressing your PDFs…</p>

          {fileProgress.total > 0 && (
            <>
              <p className="text-xs text-[#9b9bb3]">
                Compressing file {fileProgress.current} of {fileProgress.total}
              </p>
              <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#38d9a9] transition-all duration-500"
                  style={{ width: `${(fileProgress.current / fileProgress.total) * 100}%` }}
                />
              </div>
            </>
          )}

          <p className="text-[10px] text-[#57576f]">
            Running native server-side PDF compression with Ghostscript…
          </p>
        </div>
      )}

      {result && (
        <>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />

            <div className="flex flex-col items-center px-5 py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <svg
                  className="h-8 w-8 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="mt-4 font-display text-xl font-bold text-white">
                {result.files.length > 1
                  ? `${result.files.length} PDFs have been compressed!`
                  : "PDF has been compressed!"}
              </h3>

              <button
                onClick={handleDownloadAll}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
              >
                ⬇ Download {result.files.length > 1 ? "ZIP" : "PDF"}
              </button>

              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80">Total Savings</p>
                <p className="mt-1 text-3xl font-black text-emerald-400">{totalSavedPct}%</p>
                <p className="mt-1 text-xs text-[#9b9bb3]">
                  {fmtSize(result.totalOriginal)} → {fmtSize(result.totalCompressed)}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
            <div className="border-b border-white/10 px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">Compressed Files</h3>
            </div>

            <div className="divide-y divide-white/5">
              {result.files.map((cf) => {
                const savedPct =
                  cf.originalSize > 0
                    ? Math.max(
                        0,
                        Math.round(((cf.originalSize - cf.compressedSize) / cf.originalSize) * 100),
                      )
                    : 0;

                return (
                  <div key={cf.fileName} className="flex items-center gap-3 px-5 py-4">
                    <span className="text-base">📄</span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{cf.fileName}</p>
                      <p className="mt-1 text-[10px] text-[#9b9bb3]">
                        {fmtSize(cf.originalSize)} → {fmtSize(cf.compressedSize)} • Saved {savedPct}%
                      </p>
                    </div>

                    <button
                      onClick={() => handleDownloadSingle(cf)}
                      className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                    >
                      Download
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/10 px-5 py-4 text-center">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[.03]"
              >
                Compress More PDFs
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
