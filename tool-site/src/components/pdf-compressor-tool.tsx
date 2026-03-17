"use client";

import { useState, useRef, useCallback } from "react";

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
    sub: "30% - 70% smaller, readable quality",
    icon: "⚡",
    color: "text-red-400",
    activeRing: "ring-red-500/50",
    activeBg: "bg-red-500/10",
  },
  {
    id: "recommended",
    label: "Recommended Compression",
    sub: "15% - 50% smaller, balanced quality",
    icon: "✅",
    color: "text-emerald-400",
    activeRing: "ring-emerald-500/50",
    activeBg: "bg-emerald-500/10",
  },
  {
    id: "less",
    label: "Less Compression",
    sub: "Light compression, best quality",
    icon: "🔒",
    color: "text-amber-400",
    activeRing: "ring-amber-500/50",
    activeBg: "bg-amber-500/10",
  },
];

/* Balanced settings:
   - Extreme: aggressive but still readable
   - Recommended: safe balance
   - Less: light compression

   Note:
   Exact compression % can never be guaranteed for every PDF because some PDFs
   are image-heavy, some are vector/text-heavy, and some are already optimized.
   These settings are tuned so typical scanned/image PDFs land near your target ranges.
*/
const CANVAS_ATTEMPTS: Record<CompressionLevel, { scale: number; quality: number }[]> = {
  extreme: [
    { scale: 0.70, quality: 0.22 },
    { scale: 0.75, quality: 0.28 },
    { scale: 0.80, quality: 0.33 },
    { scale: 0.85, quality: 0.38 },
    { scale: 0.92, quality: 0.42 },
    { scale: 1.0,  quality: 0.48 },
  ],
  recommended: [
    { scale: 0.82, quality: 0.38 },
    { scale: 0.88, quality: 0.45 },
    { scale: 0.92, quality: 0.52 },
    { scale: 0.96, quality: 0.58 },
    { scale: 1.0,  quality: 0.64 },
  ],
  less: [
    { scale: 0.95, quality: 0.60 },
    { scale: 1.0,  quality: 0.68 },
    { scale: 1.0,  quality: 0.76 },
    { scale: 1.0,  quality: 0.82 },
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

function getSavedPercent(original: number, compressed: number): number {
  if (!original || compressed >= original) return 0;
  return Math.max(0, Math.round(((original - compressed) / original) * 100));
}

function isCanvasResultAcceptable(
  level: CompressionLevel,
  savedPct: number,
  quality: number,
  scale: number,
): boolean {
  if (level === "extreme") {
    // Accept moderate compression; the priority is keeping text readable
    return savedPct >= 25 || (savedPct >= 15 && (quality >= 0.33 || scale >= 0.85));
  }

  if (level === "recommended") {
    return savedPct >= 15 || (savedPct >= 10 && quality >= 0.45 && scale >= 0.88);
  }

  // less mode: light compression, best quality
  return savedPct >= 5 || (savedPct >= 3 && quality >= 0.60 && scale >= 0.95);
}

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

  return await outDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });
}

/* Render each page via canvas → JPEG → embed back into a new PDF.
   Uses super-sampling: render at 1.3-1.5× target resolution then
   downscale with high-quality bicubic interpolation so that text
   edges stay crisp even at moderate JPEG quality settings. */
async function canvasCompress(
  data: Uint8Array,
  scale: number,
  quality: number,
  pdfjsLib: typeof import("pdfjs-dist"),
  PDFDocument: typeof import("pdf-lib").PDFDocument,
): Promise<Uint8Array> {
  const srcPdf = await pdfjsLib.getDocument({ data }).promise;
  const outDoc = await PDFDocument.create();

  // Super-sample factor – render higher-res, then down-sample for cleaner AA
  const ssf = scale < 0.85 ? 1.5 : 1.3;

  for (let i = 1; i <= srcPdf.numPages; i++) {
    const page = await srcPdf.getPage(i);
    const origVp = page.getViewport({ scale: 1 });

    /* ---- 1. Render at super-sampled resolution ---- */
    const hiScale = scale * ssf;
    const hiVp = page.getViewport({ scale: hiScale });

    const hiCanvas = document.createElement("canvas");
    hiCanvas.width = Math.max(1, Math.floor(hiVp.width));
    hiCanvas.height = Math.max(1, Math.floor(hiVp.height));

    const hiCtx = hiCanvas.getContext("2d");
    if (!hiCtx) throw new Error("Failed to create canvas context");

    hiCtx.fillStyle = "#ffffff";
    hiCtx.fillRect(0, 0, hiCanvas.width, hiCanvas.height);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page.render as any)({
      canvasContext: hiCtx,
      viewport: hiVp,
      background: "white",
    }).promise;

    /* ---- 2. Down-sample to target resolution ---- */
    const outVp = page.getViewport({ scale });
    const outCanvas = document.createElement("canvas");
    outCanvas.width = Math.max(1, Math.floor(outVp.width));
    outCanvas.height = Math.max(1, Math.floor(outVp.height));

    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) throw new Error("Failed to create output canvas context");

    outCtx.fillStyle = "#ffffff";
    outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);
    outCtx.imageSmoothingEnabled = true;
    outCtx.imageSmoothingQuality = "high";
    outCtx.drawImage(hiCanvas, 0, 0, outCanvas.width, outCanvas.height);

    // Free the hi-res canvas immediately
    hiCanvas.width = 0;
    hiCanvas.height = 0;

    /* ---- 3. JPEG encode ---- */
    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
      outCanvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create JPEG blob"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        quality,
      );
    });

    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const jpegImage = await outDoc.embedJpg(jpegBytes);

    const newPage = outDoc.addPage([origVp.width, origVp.height]);
    newPage.drawImage(jpegImage, {
      x: 0,
      y: 0,
      width: origVp.width,
      height: origVp.height,
    });

    outCanvas.width = 0;
    outCanvas.height = 0;
  }

  outDoc.setTitle("");
  outDoc.setAuthor("");
  outDoc.setSubject("");
  outDoc.setKeywords([]);
  outDoc.setProducer("");
  outDoc.setCreator("");

  return await outDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });
}

async function compressOnePdf(
  file: File,
  level: CompressionLevel,
  pdfjsLib: typeof import("pdfjs-dist"),
  PDFDocument: typeof import("pdf-lib").PDFDocument,
): Promise<CompressedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const originalBytes = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
  const originalSize = originalBytes.byteLength;
  const MIN_VALID_SIZE = 500;

  let structBytes: Uint8Array<ArrayBuffer>;
  try {
    structBytes = (await structuralCompress(
      originalBytes,
      PDFDocument,
    )) as Uint8Array<ArrayBuffer>;
  } catch {
    structBytes = originalBytes;
  }

  const structSavedPct = getSavedPercent(originalSize, structBytes.byteLength);
  const structValid =
    structBytes.byteLength >= MIN_VALID_SIZE && structBytes.byteLength < originalSize;

  const attempts = CANVAS_ATTEMPTS[level];

  let bestCanvasBytes: Uint8Array<ArrayBuffer> | null = null;
  let bestCanvasSavedPct = 0;
  let bestCanvasMeta: { scale: number; quality: number } | null = null;

  for (const { scale, quality } of attempts) {
    try {
      const attempt = (await canvasCompress(
        originalBytes,
        scale,
        quality,
        pdfjsLib,
        PDFDocument,
      )) as Uint8Array<ArrayBuffer>;

      const isValid = attempt.byteLength >= MIN_VALID_SIZE;
      const isSmallerThanOriginal = attempt.byteLength < originalSize;
      if (!isValid || !isSmallerThanOriginal) continue;

      const savedPct = getSavedPercent(originalSize, attempt.byteLength);
      const acceptable = isCanvasResultAcceptable(level, savedPct, quality, scale);

      if (!acceptable) continue;

      if (!bestCanvasBytes || attempt.byteLength < bestCanvasBytes.byteLength) {
        bestCanvasBytes = attempt;
        bestCanvasSavedPct = savedPct;
        bestCanvasMeta = { scale, quality };
      }
    } catch {
      // ignore failed attempt
    }
  }

  let bestData: Uint8Array<ArrayBuffer> = originalBytes;
  let method: CompressedFile["method"] = "original";

  if (level === "extreme") {
    if (bestCanvasBytes) {
      bestData = bestCanvasBytes;
      method = "canvas";
    } else if (structValid) {
      bestData = structBytes;
      method = "structural";
    }
  } else if (level === "recommended") {
    if (bestCanvasBytes && structValid) {
      // prefer canvas only if it gives useful reduction,
      // otherwise use structural for safer text clarity
      if (bestCanvasSavedPct >= Math.max(15, structSavedPct + 6)) {
        bestData = bestCanvasBytes;
        method = "canvas";
      } else if (structBytes.byteLength <= bestCanvasBytes.byteLength) {
        bestData = structBytes;
        method = "structural";
      } else {
        bestData = bestCanvasBytes;
        method = "canvas";
      }
    } else if (bestCanvasBytes) {
      bestData = bestCanvasBytes;
      method = "canvas";
    } else if (structValid) {
      bestData = structBytes;
      method = "structural";
    }
  } else {
    if (structValid) {
      bestData = structBytes;
      method = "structural";
    } else if (bestCanvasBytes) {
      // less mode only falls back to canvas if structural does not help
      bestData = bestCanvasBytes;
      method = "canvas";
    }
  }

  // fallback safety: if chosen result somehow became too aggressive in less mode
  if (level === "less" && method === "canvas" && bestCanvasMeta) {
    const savedPct = getSavedPercent(originalSize, bestData.byteLength);
    if (savedPct > 30) {
      if (structValid) {
        bestData = structBytes;
        method = "structural";
      }
    }
  }

  return {
    fileName: file.name.replace(/\.pdf$/i, "") + "_compressed.pdf",
    originalSize,
    compressedSize: bestData.byteLength,
    data: bestData,
    method,
  };
}

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

    zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 1 },
    });
  } else if (compressed.length === 1) {
    zipBlob = new Blob([compressed[0].data], { type: "application/pdf" });
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
    a.download =
      result.files.length > 1 ? "compressed_pdfs.zip" : result.files[0].fileName;
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
                Upload one or multiple .pdf files
              </p>
            </div>
          </div>

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
                {queue.map((q) => (
                  <div key={q.id} className="flex items-center gap-3 py-2.5">
                    <span className="text-base">📄</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {q.file.name}
                      </p>
                      <p className="text-[10px] text-[#57576f]">
                        {fmtSize(q.file.size)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(q.id);
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

      {queue.length > 0 && !result && !processing && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
          <div className="border-b border-white/10 px-5 py-3">
            <h3 className="font-display text-sm font-bold text-white">
              Compression Level
            </h3>
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
                <span
                  className={`mt-2 text-sm font-semibold ${
                    level === l.id ? l.color : "text-white"
                  }`}
                >
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
            Testing multiple compression levels to find the smallest readable result…
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
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80">
                  Total Savings
                </p>
                <p className="mt-1 text-3xl font-black text-emerald-400">
                  {totalSavedPct}%
                </p>
                <p className="mt-1 text-xs text-[#9b9bb3]">
                  {fmtSize(result.totalOriginal)} → {fmtSize(result.totalCompressed)}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
            <div className="border-b border-white/10 px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">
                Compressed Files
              </h3>
            </div>

            <div className="divide-y divide-white/5">
              {result.files.map((cf) => {
                const savedPct =
                  cf.originalSize > 0
                    ? Math.max(
                        0,
                        Math.round(
                          ((cf.originalSize - cf.compressedSize) / cf.originalSize) * 100,
                        ),
                      )
                    : 0;

                return (
                  <div key={cf.fileName} className="flex items-center gap-3 px-5 py-4">
                    <span className="text-base">📄</span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {cf.fileName}
                      </p>
                      <p className="mt-1 text-[10px] text-[#9b9bb3]">
                        {fmtSize(cf.originalSize)} → {fmtSize(cf.compressedSize)} • Saved{" "}
                        {savedPct}% • Method: {cf.method}
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