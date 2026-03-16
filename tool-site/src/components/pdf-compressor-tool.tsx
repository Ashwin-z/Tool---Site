"use client";

import { useState, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   PDF COMPRESSOR — Hybrid: structural + canvas approach
   • Tries structural optimization first (safe, lossless)
   • Then tries canvas-JPEG rendering
   • Picks whichever is smallest (never bigger than original)
   • Multi-file → ZIP download
   ═══════════════════════════════════════════════════════ */

type CompressionLevel = "extreme" | "recommended" | "less";

interface QueuedFile {
  id: string;
  file: File;
}

interface CompressedFile {
  fileName: string;
  originalSize: number;
  compressedSize: number;
  data: Uint8Array<ArrayBuffer>;
  method: "structural" | "canvas" | "original";
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
    sub: "Less quality, high compression",
    icon: "⚡",
    color: "text-red-400",
    activeRing: "ring-red-500/50",
    activeBg: "bg-red-500/10",
  },
  {
    id: "recommended",
    label: "Recommended Compression",
    sub: "Good quality, good compression",
    icon: "✅",
    color: "text-emerald-400",
    activeRing: "ring-emerald-500/50",
    activeBg: "bg-emerald-500/10",
  },
  {
    id: "less",
    label: "Less Compression",
    sub: "High quality, less compression",
    icon: "🔒",
    color: "text-amber-400",
    activeRing: "ring-amber-500/50",
    activeBg: "bg-amber-500/10",
  },
];

/* Canvas-JPEG settings per level — multiple attempts (most aggressive first).
   The compressor tries each config and picks the smallest result that
   is still smaller than the original. This lets extreme mode push hard
   while the smart picker guarantees the file never gets bigger. */
const CANVAS_ATTEMPTS: Record<CompressionLevel, { scale: number; quality: number }[]> = {
  extreme: [
    { scale: 0.5,  quality: 0.05 },   // ultra-aggressive: very small JPEGs
    { scale: 0.6,  quality: 0.08 },
    { scale: 0.7,  quality: 0.12 },
    { scale: 0.8,  quality: 0.18 },
    { scale: 1.0,  quality: 0.25 },   // fallback: moderate lossy
  ],
  recommended: [
    { scale: 0.7,  quality: 0.20 },
    { scale: 0.85, quality: 0.30 },
    { scale: 1.0,  quality: 0.40 },
  ],
  less: [
    { scale: 0.9,  quality: 0.40 },
    { scale: 1.0,  quality: 0.55 },
    { scale: 1.2,  quality: 0.65 },
  ],
};

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

let idCounter = 0;
function uid(): string {
  return `f_${++idCounter}_${Date.now()}`;
}

/* ─── Method 1: Structural / lossless compression ─── */
async function structuralCompress(
  data: Uint8Array,
  PDFDocument: typeof import("pdf-lib").PDFDocument,
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(data, { ignoreEncryption: true });
  const outDoc = await PDFDocument.create();
  const pages = await outDoc.copyPages(srcDoc, srcDoc.getPageIndices());
  for (const p of pages) outDoc.addPage(p);
  outDoc.setTitle("");
  outDoc.setAuthor("");
  outDoc.setSubject("");
  outDoc.setKeywords([]);
  outDoc.setProducer("");
  outDoc.setCreator("");
  return await outDoc.save({ useObjectStreams: true, addDefaultPage: false });
}

/* ─── Method 2: Canvas-JPEG rendering (lossy, good for image-heavy) ─── */
async function canvasCompress(
  data: Uint8Array,
  scale: number,
  quality: number,
  pdfjsLib: typeof import("pdfjs-dist"),
  PDFDocument: typeof import("pdf-lib").PDFDocument,
): Promise<Uint8Array> {
  const srcPdf = await pdfjsLib.getDocument({ data }).promise;
  const totalPages = srcPdf.numPages;
  const outDoc = await PDFDocument.create();

  for (let i = 1; i <= totalPages; i++) {
    const page = await srcPdf.getPage(i);
    const origVp = page.getViewport({ scale: 1 });
    const renderVp = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(renderVp.width);
    canvas.height = Math.floor(renderVp.height);
    /* pdfjs-dist v5: pass `canvas` (required). canvasContext is optional/legacy. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page.render as any)({ canvas, viewport: renderVp }).promise;

    const jpegBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", quality),
    );
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const jpegImage = await outDoc.embedJpg(jpegBytes);
    const newPage = outDoc.addPage([origVp.width, origVp.height]);
    newPage.drawImage(jpegImage, { x: 0, y: 0, width: origVp.width, height: origVp.height });

    canvas.width = 0;
    canvas.height = 0;
  }

  outDoc.setTitle("");
  outDoc.setAuthor("");
  outDoc.setSubject("");
  outDoc.setKeywords([]);
  outDoc.setProducer("");
  outDoc.setCreator("");
  return await outDoc.save({ useObjectStreams: true, addDefaultPage: false });
}

/* ─── Smart compress: try structural + all canvas configs, pick smallest ─── */
async function compressOnePdf(
  file: File,
  level: CompressionLevel,
  pdfjsLib: typeof import("pdfjs-dist"),
  PDFDocument: typeof import("pdf-lib").PDFDocument,
): Promise<CompressedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const originalBytes = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
  const originalSize = originalBytes.byteLength;

  /* Method 1: Structural (lossless — never hurts quality) */
  let structBytes: Uint8Array<ArrayBuffer>;
  try {
    structBytes = await structuralCompress(originalBytes, PDFDocument) as Uint8Array<ArrayBuffer>;
  } catch {
    structBytes = originalBytes;
  }

  /* Method 2: Canvas-JPEG — try every config for this level (most aggressive first).
     Keep track of the SMALLEST successful result. */
  const attempts = CANVAS_ATTEMPTS[level];
  let bestCanvasBytes: Uint8Array<ArrayBuffer> = originalBytes;

  /* A valid compressed PDF must be at least this many bytes */
  const MIN_VALID_SIZE = 500;

  for (const { scale, quality } of attempts) {
    try {
      const attempt = await canvasCompress(originalBytes, scale, quality, pdfjsLib, PDFDocument) as Uint8Array<ArrayBuffer>;
      /* Only accept if it's a valid-sized PDF and smaller than current best */
      if (attempt.byteLength >= MIN_VALID_SIZE && attempt.byteLength < bestCanvasBytes.byteLength) {
        bestCanvasBytes = attempt;
      }
    } catch {
      /* skip failed attempt */
    }
  }

  /* Pick the overall winner: smallest that is actually smaller than original
     and still a valid-sized file */
  let bestData: Uint8Array<ArrayBuffer> = originalBytes;
  let method: CompressedFile["method"] = "original";

  const canvasValid = bestCanvasBytes.byteLength >= MIN_VALID_SIZE && bestCanvasBytes.byteLength < originalSize;
  const structValid = structBytes.byteLength >= MIN_VALID_SIZE && structBytes.byteLength < originalSize;

  if (canvasValid && (!structValid || bestCanvasBytes.byteLength <= structBytes.byteLength)) {
    bestData = bestCanvasBytes;
    method = "canvas";
  } else if (structValid) {
    bestData = structBytes;
    method = "structural";
  }

  return {
    fileName: file.name.replace(/\.pdf$/i, "") + "_compressed.pdf",
    originalSize,
    compressedSize: bestData.byteLength,
    data: bestData,
    method,
  };
}

/* ─── Compress all + ZIP ─── */
async function compressAll(
  files: File[],
  level: CompressionLevel,
  onFileProgress?: (fileIdx: number, total: number) => void,
): Promise<CompressionResult> {
  const [pdfjsLib, { PDFDocument }, JSZip] = await Promise.all([
    import("pdfjs-dist"),
    import("pdf-lib"),
    import("jszip").then((m) => m.default),
  ]);

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const compressed: CompressedFile[] = [];
  let totalOriginal = 0;
  let totalCompressed = 0;

  for (let i = 0; i < files.length; i++) {
    onFileProgress?.(i + 1, files.length);
    const cf = await compressOnePdf(files[i], level, pdfjsLib, PDFDocument);
    compressed.push(cf);
    totalOriginal += cf.originalSize;
    totalCompressed += cf.compressedSize;
  }

  let zipBlob: Blob | null = null;
  if (compressed.length > 1) {
    const zip = new JSZip();
    for (const cf of compressed) zip.file(cf.fileName, cf.data);
    zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 1 } });
  } else if (compressed.length === 1) {
    zipBlob = new Blob([compressed[0].data], { type: "application/pdf" });
  }

  return { files: compressed, totalOriginal, totalCompressed, zipBlob };
}

/* ═════════════════ Component ═════════════════ */

export default function PdfCompressorTool() {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [level, setLevel] = useState<CompressionLevel>("recommended");
  const [processing, setProcessing] = useState(false);
  const [fileProgress, setFileProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const pdfs = Array.from(fileList).filter((f) => f.type === "application/pdf");
    if (!pdfs.length) return;
    setQueue((prev) => [...prev, ...pdfs.map((file) => ({ id: uid(), file }))]);
    setResult(null);
  }, []);

  const removeFile = useCallback((id: string) => {
    setQueue((prev) => prev.filter((f) => f.id !== id));
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
    setFileProgress({ current: 0, total: queue.length });
    try {
      const res = await compressAll(
        queue.map((q) => q.file),
        level,
        (current, total) => setFileProgress({ current, total }),
      );
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Failed to compress one or more PDFs. They may be encrypted or corrupted.");
    } finally {
      setProcessing(false);
    }
  }, [queue, level]);

  const handleDownloadAll = useCallback(() => {
    if (!result?.zipBlob) return;
    const url = URL.createObjectURL(result.zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.files.length > 1 ? "compressed_pdfs.zip" : result.files[0].fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const handleDownloadSingle = useCallback((cf: CompressedFile) => {
    const blob = new Blob([cf.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = cf.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleReset = useCallback(() => {
    setQueue([]);
    setResult(null);
    setFileProgress({ current: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const totalSavedPct = result && result.totalOriginal > 0
    ? Math.max(0, Math.round(((result.totalOriginal - result.totalCompressed) / result.totalOriginal) * 100))
    : 0;

  return (
    <div className="space-y-4">
      {/* ── Upload / Drop zone ── */}
      {!result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

          <div className="px-5 py-5">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
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
                onChange={(e) => { addFiles(e.target.files); if (inputRef.current) inputRef.current.value = ""; }}
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">📁</div>
              <p className="mt-3 text-sm font-semibold text-white">
                Drop your PDFs here or <span className="text-[#6c63ff]">browse</span>
              </p>
              <p className="mt-1 text-xs text-[#57576f]">Upload one or multiple .pdf files</p>
            </div>
          </div>

          {/* ── File queue ── */}
          {queue.length > 0 && (
            <div className="border-t border-white/10">
              <div className="flex items-center justify-between px-5 py-3">
                <h3 className="font-display text-sm font-bold text-white">
                  {queue.length} file{queue.length > 1 ? "s" : ""} selected
                  <span className="ml-2 text-xs font-normal text-[#57576f]">
                    ({fmtSize(queue.reduce((s, q) => s + q.file.size, 0))} total)
                  </span>
                </h3>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  className="text-[10px] font-semibold text-[#ff6584] transition hover:text-[#ff8da6]"
                >
                  Clear all
                </button>
              </div>
              <div className="max-h-60 divide-y divide-white/5 overflow-y-auto px-5 pb-3">
                {queue.map((q) => (
                  <div key={q.id} className="flex items-center gap-3 py-2.5">
                    <span className="text-base">📄</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{q.file.name}</p>
                      <p className="text-[10px] text-[#57576f]">{fmtSize(q.file.size)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(q.id); }}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#57576f] transition hover:bg-[#ff6584]/10 hover:text-[#ff6584]"
                      title="Remove file"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Compression Level ── */}
      {queue.length > 0 && !result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
          <div className="border-b border-white/10 px-5 py-3">
            <h3 className="font-display text-sm font-bold text-white">Compression Level</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 px-5 py-5 sm:grid-cols-3">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`flex flex-col items-center rounded-xl border px-4 py-5 text-center transition ${
                  level === l.id
                    ? `ring-2 ${l.activeRing} ${l.activeBg} border-transparent`
                    : "border-white/10 hover:border-white/20 hover:bg-white/[.02]"
                }`}
              >
                <span className="text-2xl">{l.icon}</span>
                <span className={`mt-2 text-sm font-semibold ${level === l.id ? l.color : "text-white"}`}>
                  {l.label}
                </span>
                <span className="mt-1 text-[10px] text-[#57576f]">{l.sub}</span>
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

      {/* ── Processing ── */}
      {processing && (
        <div className="flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#111118] px-5 py-12">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/10 border-t-[#6c63ff]" />
            <div className="absolute inset-2 animate-spin rounded-full border-4 border-white/5 border-b-[#ff6584]" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
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
          <p className="text-[10px] text-[#57576f]">Testing multiple compression levels to find the smallest readable result…</p>
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />

            <div className="flex flex-col items-center px-5 py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
                ⬇️ {result.files.length > 1 ? "Download ZIP" : "Download Compressed PDF"}
              </button>

              {/* Saved badge */}
              <div className="mt-6 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 font-display text-sm font-bold text-emerald-400">
                  {totalSavedPct}%
                </div>
                <span className="text-sm font-semibold text-emerald-400">Saved</span>
              </div>
              <p className="mt-2 text-sm text-[#9b9bb3]">
                Your {result.files.length > 1 ? "PDFs are" : "PDF is"} now{" "}
                <span className="font-semibold text-white">{totalSavedPct}% smaller!</span>
              </p>

              {/* Size comparison */}
              <div className="mt-5 flex items-center gap-3">
                <div className="rounded-lg bg-white/5 px-4 py-2 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#57576f]">Original</div>
                  <div className="font-display text-sm font-bold text-[#ff6584] line-through decoration-[#ff6584]/40">
                    {fmtSize(result.totalOriginal)}
                  </div>
                </div>
                <svg className="h-4 w-4 text-[#57576f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="rounded-lg bg-emerald-500/5 px-4 py-2 text-center ring-1 ring-emerald-500/20">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500/70">Compressed</div>
                  <div className="font-display text-sm font-bold text-emerald-400">
                    {fmtSize(result.totalCompressed)}
                  </div>
                </div>
              </div>

              {/* Visual bar */}
              <div className="mt-6 w-full max-w-sm">
                <div className="flex justify-between text-[10px] text-[#57576f]">
                  <span>Original</span>
                  <span>Compressed</span>
                </div>
                <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="flex h-full items-center justify-end overflow-hidden rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(5, 100 - totalSavedPct)}%`,
                      background: "linear-gradient(90deg, #38d9a9, #6c63ff)",
                    }}
                  >
                    <span className="pr-2 text-[8px] font-bold text-white">
                      {(100 - totalSavedPct).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Per-file breakdown ── */}
          {result.files.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
              <div className="border-b border-white/10 px-5 py-3">
                <h3 className="font-display text-sm font-bold text-white">
                  {result.files.length > 1 ? "Individual Files" : "File Details"}
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {result.files.map((cf, idx) => {
                  const pct = cf.originalSize > 0
                    ? Math.max(0, Math.round(((cf.originalSize - cf.compressedSize) / cf.originalSize) * 100))
                    : 0;
                  return (
                    <div key={idx} className="flex items-center gap-3 px-5 py-3">
                      <span className="text-base">📄</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{cf.fileName}</p>
                        <p className="text-[10px] text-[#57576f]">
                          {fmtSize(cf.originalSize)} → {fmtSize(cf.compressedSize)}{" "}
                          <span className="font-semibold text-emerald-400">({pct}% saved)</span>
                          {cf.method === "structural" && (
                            <span className="ml-1.5 text-[#57576f]">· lossless</span>
                          )}
                          {cf.method === "original" && (
                            <span className="ml-1.5 text-amber-400/70">· already optimized</span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadSingle(cf)}
                        className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] font-semibold text-[#9b9bb3] transition hover:border-[#6c63ff]/40 hover:text-white"
                      >
                        ⬇ Download
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-[#6c63ff] transition hover:text-[#8b84ff]"
            >
              ← Compress more PDFs
            </button>
          </div>
        </>
      )}
    </div>
  );
}
