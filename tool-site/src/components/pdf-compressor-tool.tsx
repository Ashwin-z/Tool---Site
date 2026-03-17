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
  method: "image-recompress" | "structural" | "canvas" | "original";
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
    sub: "50% - 85% smaller, good quality",
    icon: "⚡",
    color: "text-red-400",
    activeRing: "ring-red-500/50",
    activeBg: "bg-red-500/10",
  },
  {
    id: "recommended",
    label: "Recommended Compression",
    sub: "30% - 65% smaller, balanced quality",
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

/*
  IMAGE-LEVEL compression settings.
  These control JPEG quality for embedded images only — text & vectors stay untouched.
  This is the same approach iLovePDF and similar tools use.
*/
const IMAGE_QUALITY: Record<CompressionLevel, number> = {
  extreme: 0.15,
  recommended: 0.35,
  less: 0.60,
};

/* Scale factor for embedded images (reduces pixel dimensions) */
const IMAGE_SCALE: Record<CompressionLevel, number> = {
  extreme: 0.55,
  recommended: 0.72,
  less: 0.88,
};

/* Fallback canvas-based settings (only used when image recompress has no effect) */
const CANVAS_SETTINGS: Record<CompressionLevel, { scale: number; quality: number }> = {
  extreme: { scale: 0.80, quality: 0.30 },
  recommended: { scale: 0.90, quality: 0.50 },
  less: { scale: 1.0, quality: 0.70 },
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

/* ------------------------------------------------------------------ */
/*  Image-level recompression using pdf-lib's low-level API            */
/*  Walks every PDF object, finds image XObjects, decodes them via     */
/*  canvas, re-encodes as JPEG at the target quality/scale, and        */
/*  replaces the stream data in-place.  Text & vectors are UNTOUCHED.  */
/* ------------------------------------------------------------------ */
async function imageRecompress(
  data: Uint8Array,
  level: CompressionLevel,
  pdfLib: typeof import("pdf-lib"),
): Promise<Uint8Array> {
  const { PDFDocument, PDFName, PDFRawStream, PDFStream, PDFNumber } = pdfLib;

  const doc = await PDFDocument.load(data, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  const quality = IMAGE_QUALITY[level];
  const scale = IMAGE_SCALE[level];
  let imagesProcessed = 0;

  const context = doc.context;
  context.enumerateIndirectObjects().forEach(([ref, obj]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfObj = obj as any;
    const dict = pdfObj.dict || pdfObj.dictionary;
    if (!dict) return;

    const subtype = dict.get(PDFName.of("Subtype"));
    if (!subtype) return;
    const subtypeStr = subtype instanceof PDFName ? subtype.toString() : "";
    if (subtypeStr !== "/Image") return;

    const type = dict.get(PDFName.of("Type"));
    const typeStr = type instanceof PDFName ? type.toString() : "";
    if (typeStr && typeStr !== "/XObject") return;

    const widthObj = dict.get(PDFName.of("Width"));
    const heightObj = dict.get(PDFName.of("Height"));
    if (!widthObj || !heightObj) return;

    const width = widthObj instanceof PDFNumber ? widthObj.asNumber() : parseInt(widthObj.toString(), 10);
    const height = heightObj instanceof PDFNumber ? heightObj.asNumber() : parseInt(heightObj.toString(), 10);
    if (!width || !height || width < 4 || height < 4) return;
    if (width * height < 2500) return; // skip tiny icons

    // Get the raw stream bytes
    let imageBytes: Uint8Array;
    try {
      if (pdfObj instanceof PDFRawStream) {
        imageBytes = pdfObj.asUint8Array();
      } else if (pdfObj instanceof PDFStream) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stream = pdfObj as any;
        if (typeof stream.getContents === "function") {
          imageBytes = stream.getContents();
        } else if (typeof stream.getUnencodedContents === "function") {
          imageBytes = stream.getUnencodedContents();
        } else {
          return;
        }
      } else {
        return;
      }
    } catch {
      return;
    }

    // Check bits per component
    const bpc = dict.get(PDFName.of("BitsPerComponent"));
    const bitsPerComponent = bpc instanceof PDFNumber ? bpc.asNumber() : parseInt(bpc?.toString() || "8", 10);
    if (bitsPerComponent !== 8) return;

    // Determine color space
    const csObj = dict.get(PDFName.of("ColorSpace"));
    const csStr = csObj instanceof PDFName ? csObj.toString() : csObj?.toString() || "";
    let channels = 3;
    if (csStr.includes("Gray") || csStr.includes("CalGray")) channels = 1;
    else if (csStr.includes("CMYK")) channels = 4;
    else if (csStr.includes("RGB") || csStr.includes("CalRGB")) channels = 3;

    const expectedLength = width * height * channels;
    if (imageBytes.length < expectedLength * 0.8) return; // compressed/encoded, skip

    const newW = Math.max(1, Math.round(width * scale));
    const newH = Math.max(1, Math.round(height * scale));

    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = width;
    srcCanvas.height = height;
    const srcCtx = srcCanvas.getContext("2d");
    if (!srcCtx) return;

    const imgData = srcCtx.createImageData(width, height);
    const rgba = imgData.data;

    if (channels === 3) {
      for (let p = 0, r = 0; p < width * height; p++, r += 4) {
        rgba[r] = imageBytes[p * 3];
        rgba[r + 1] = imageBytes[p * 3 + 1];
        rgba[r + 2] = imageBytes[p * 3 + 2];
        rgba[r + 3] = 255;
      }
    } else if (channels === 1) {
      for (let p = 0, r = 0; p < width * height; p++, r += 4) {
        const v = imageBytes[p];
        rgba[r] = v; rgba[r + 1] = v; rgba[r + 2] = v; rgba[r + 3] = 255;
      }
    } else if (channels === 4) {
      for (let p = 0, r = 0; p < width * height; p++, r += 4) {
        const c = imageBytes[p * 4] / 255;
        const m = imageBytes[p * 4 + 1] / 255;
        const y = imageBytes[p * 4 + 2] / 255;
        const k = imageBytes[p * 4 + 3] / 255;
        rgba[r] = 255 * (1 - c) * (1 - k);
        rgba[r + 1] = 255 * (1 - m) * (1 - k);
        rgba[r + 2] = 255 * (1 - y) * (1 - k);
        rgba[r + 3] = 255;
      }
    }

    srcCtx.putImageData(imgData, 0, 0);

    const outCanvas = document.createElement("canvas");
    outCanvas.width = newW;
    outCanvas.height = newH;
    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) { srcCanvas.width = 0; return; }

    outCtx.imageSmoothingEnabled = true;
    outCtx.imageSmoothingQuality = "high";
    outCtx.drawImage(srcCanvas, 0, 0, newW, newH);
    srcCanvas.width = 0; srcCanvas.height = 0;

    const dataUrl = outCanvas.toDataURL("image/jpeg", quality);
    outCanvas.width = 0; outCanvas.height = 0;

    const base64 = dataUrl.split(",")[1];
    if (!base64) return;
    const binaryStr = atob(base64);
    const jpegBytes = new Uint8Array(binaryStr.length);
    for (let j = 0; j < binaryStr.length; j++) jpegBytes[j] = binaryStr.charCodeAt(j);

    if (jpegBytes.length >= imageBytes.length) return; // not smaller, skip

    // Replace stream: create a new PDFRawStream with JPEG data and updated dict
    dict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
    dict.set(PDFName.of("Width"), PDFNumber.of(newW));
    dict.set(PDFName.of("Height"), PDFNumber.of(newH));
    dict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
    dict.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
    dict.set(PDFName.of("Length"), PDFNumber.of(jpegBytes.length));
    dict.delete(PDFName.of("DecodeParms"));
    dict.delete(PDFName.of("SMask"));

    // Replace the object in the PDF context with a new raw stream
    const newStream = PDFRawStream.of(dict, jpegBytes);
    context.assign(ref, newStream);

    imagesProcessed++;
  });

  if (imagesProcessed === 0) {
    throw new Error("No images found to recompress");
  }

  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setProducer("");
  doc.setCreator("");

  return await doc.save({ useObjectStreams: true, addDefaultPage: false });
}

/* ------------------------------------------------------------------ */
/*  Canvas fallback: render whole pages (only for PDFs with no         */
/*  recompressible images, e.g. pure scanned image PDFs)               */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Main per-file compression pipeline                                 */
/*  Priority:                                                          */
/*   1. Image-level recompression (text stays perfect)                 */
/*   2. Structural (metadata strip, object streams)                    */
/*   3. Canvas fallback (only if nothing else works)                   */
/* ------------------------------------------------------------------ */
async function compressOnePdf(
  file: File,
  level: CompressionLevel,
  pdfjsLib: typeof import("pdfjs-dist"),
  pdfLib: typeof import("pdf-lib"),
): Promise<CompressedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const originalBytes = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
  const originalSize = originalBytes.byteLength;
  const MIN_VALID_SIZE = 500;

  /* --- Step 1: Try image-level recompression (best approach) --- */
  let imageRecompressBytes: Uint8Array<ArrayBuffer> | null = null;
  try {
    const result = (await imageRecompress(
      originalBytes,
      level,
      pdfLib,
    )) as Uint8Array<ArrayBuffer>;
    if (result.byteLength >= MIN_VALID_SIZE && result.byteLength < originalSize) {
      imageRecompressBytes = result;
    }
  } catch {
    // No images to recompress or format not supported
  }

  /* --- Step 2: Structural compress (strip metadata, object streams) --- */
  let structBytes: Uint8Array<ArrayBuffer>;
  try {
    structBytes = (await structuralCompress(
      originalBytes,
      pdfLib.PDFDocument,
    )) as Uint8Array<ArrayBuffer>;
  } catch {
    structBytes = originalBytes;
  }
  const structValid =
    structBytes.byteLength >= MIN_VALID_SIZE && structBytes.byteLength < originalSize;

  /* --- Step 3: Canvas fallback (last resort) --- */
  let canvasBytes: Uint8Array<ArrayBuffer> | null = null;
  if (
    !imageRecompressBytes ||
    getSavedPercent(originalSize, imageRecompressBytes.byteLength) < 10
  ) {
    try {
      const { scale, quality } = CANVAS_SETTINGS[level];
      const result = (await canvasCompress(
        originalBytes,
        scale,
        quality,
        pdfjsLib,
        pdfLib.PDFDocument,
      )) as Uint8Array<ArrayBuffer>;
      if (result.byteLength >= MIN_VALID_SIZE && result.byteLength < originalSize) {
        canvasBytes = result;
      }
    } catch {
      // Canvas failed
    }
  }

  /* --- Pick the best result --- */
  let bestData: Uint8Array<ArrayBuffer> = originalBytes;
  let method: CompressedFile["method"] = "original";

  const candidates: { data: Uint8Array<ArrayBuffer>; method: CompressedFile["method"] }[] = [];

  if (imageRecompressBytes) {
    candidates.push({ data: imageRecompressBytes, method: "image-recompress" });
  }
  if (structValid) {
    candidates.push({ data: structBytes, method: "structural" });
  }
  if (canvasBytes) {
    candidates.push({ data: canvasBytes, method: "canvas" });
  }

  if (candidates.length > 0) {
    // Prefer image-recompress if it saved meaningfully (text stays perfect)
    const imageCandidate = candidates.find((c) => c.method === "image-recompress");
    if (
      imageCandidate &&
      getSavedPercent(originalSize, imageCandidate.data.byteLength) >= 8
    ) {
      bestData = imageCandidate.data;
      method = imageCandidate.method;
    } else {
      // Pick smallest
      candidates.sort((a, b) => a.data.byteLength - b.data.byteLength);
      bestData = candidates[0].data;
      method = candidates[0].method;
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
  const [pdfjsLib, pdfLib, JSZip] = await Promise.all([
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

    const cf = await compressOnePdf(files[i], level, pdfjsLib, pdfLib);
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
            Optimizing embedded images while preserving text quality…
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
                        {savedPct}%
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