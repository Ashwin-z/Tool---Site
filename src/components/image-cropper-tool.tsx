"use client";

import { useCallback, useRef, useState } from "react";
import JSZip from "jszip";

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB

/* ── aspect ratio presets ── */
interface AspectPreset { label: string; ratio: number | null; }

const aspectPresets: AspectPreset[] = [
  { label: "Free", ratio: null },
  { label: "1:1", ratio: 1 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "3:4", ratio: 3 / 4 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "9:16", ratio: 9 / 16 },
  { label: "3:2", ratio: 3 / 2 },
  { label: "2:3", ratio: 2 / 3 },
  { label: "5:4", ratio: 5 / 4 },
  { label: "4:5", ratio: 4 / 5 },
];

/* ── format helpers ── */
type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

function mimeToExt(mime: OutputFormat): string {
  switch (mime) {
    case "image/png": return ".png";
    case "image/webp": return ".webp";
    case "image/jpeg":
    default: return ".jpg";
  }
}

function mimeToLabel(mime: OutputFormat): string {
  switch (mime) {
    case "image/png": return "PNG";
    case "image/webp": return "WebP";
    case "image/jpeg":
    default: return "JPG";
  }
}

/* ── robust canvas export: uses toDataURL to guarantee correct MIME ── */
async function canvasToVerifiedBlob(
  canvas: HTMLCanvasElement,
  requestedMime: OutputFormat,
  quality?: number,
): Promise<{ blob: Blob; actualMime: OutputFormat }> {
  const dataUrl = canvas.toDataURL(requestedMime, quality);
  /* Extract the MIME the browser actually produced (may differ if unsupported) */
  const actualMime = (dataUrl.substring(5, dataUrl.indexOf(";")) || requestedMime) as OutputFormat;
  const res = await fetch(dataUrl);
  const rawBlob = await res.blob();
  return { blob: new Blob([rawBlob], { type: actualMime }), actualMime };
}

/* ── types ── */
interface CroppedResult {
  id: string;
  name: string;
  originalWidth: number;
  originalHeight: number;
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
  originalSize: number;
  newSize: number;
  outputFormat: OutputFormat;
  url: string;
  blob: Blob;
}

/* ── helpers ── */
function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

const ACCEPTED = "image/jpeg,image/png,image/webp,image/bmp,image/gif,image/avif,image/tiff";

export default function ImageCropperTool() {
  /* source image state */
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [srcFile, setSrcFile] = useState<File | null>(null);
  const [imgNatW, setImgNatW] = useState(0);
  const [imgNatH, setImgNatH] = useState(0);

  /* crop box (in %, 0-100) */
  const [cropX, setCropX] = useState(10);
  const [cropY, setCropY] = useState(10);
  const [cropW, setCropW] = useState(80);
  const [cropH, setCropH] = useState(80);

  /* settings */
  const [aspect, setAspect] = useState<number | null>(null);
  const [format, setFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(92);

  /* results */
  const [results, setResults] = useState<CroppedResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  /* drag state */
  const [dragging, setDragging] = useState<null | "move" | "nw" | "ne" | "sw" | "se">(null);
  const dragStart = useRef({ mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* We store format in a ref so the crop function always reads the latest value */
  const formatRef = useRef<OutputFormat>(format);
  formatRef.current = format;
  const qualityRef = useRef(quality);
  qualityRef.current = quality;

  /* load image */
  const loadImage = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      alert(`File exceeds the 1GB size limit.`);
      return;
    }
    const url = URL.createObjectURL(file);
    setSrcFile(file);
    setSrcUrl(url);
    const img = new Image();
    img.onload = () => {
      setImgNatW(img.naturalWidth);
      setImgNatH(img.naturalHeight);
      setCropX(10); setCropY(10); setCropW(80); setCropH(80);
    };
    img.src = url;
  }, []);

  const onFileDrop = useCallback(
    (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/")); if (f) loadImage(f); },
    [loadImage],
  );

  /* apply aspect ratio */
  const applyAspect = (ratio: number | null) => {
    setAspect(ratio);
    if (ratio === null) return;
    const newH = cropW / ratio;
    if (cropY + newH <= 100) { setCropH(newH); }
    else { const maxH = 100 - cropY; setCropH(maxH); setCropW(maxH * ratio); }
  };

  /* pointer handlers */
  const getRelativePos = (e: React.PointerEvent | PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { px: 0, py: 0 };
    return { px: ((e.clientX - rect.left) / rect.width) * 100, py: ((e.clientY - rect.top) / rect.height) * 100 };
  };

  const onPointerDown = (e: React.PointerEvent, handle: "move" | "nw" | "ne" | "sw" | "se") => {
    e.preventDefault(); e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const { px, py } = getRelativePos(e);
    dragStart.current = { mx: px, my: py, x: cropX, y: cropY, w: cropW, h: cropH };
    setDragging(handle);
  };

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const { px, py } = getRelativePos(e);
      const dx = px - dragStart.current.mx;
      const dy = py - dragStart.current.my;
      const { x: sx, y: sy, w: sw, h: sh } = dragStart.current;

      if (dragging === "move") {
        setCropX(clamp(sx + dx, 0, 100 - sw));
        setCropY(clamp(sy + dy, 0, 100 - sh));
      } else {
        let nx = sx, ny = sy, nw = sw, nh = sh;
        if (dragging === "nw" || dragging === "sw") { const newX = clamp(sx + dx, 0, sx + sw - 5); nw = sw + (sx - newX); nx = newX; }
        if (dragging === "ne" || dragging === "se") { nw = clamp(sw + dx, 5, 100 - sx); }
        if (dragging === "nw" || dragging === "ne") { const newY = clamp(sy + dy, 0, sy + sh - 5); nh = sh + (sy - newY); ny = newY; }
        if (dragging === "sw" || dragging === "se") { nh = clamp(sh + dy, 5, 100 - sy); }

        if (aspect !== null) { nh = nw / aspect; if (ny + nh > 100) { nh = 100 - ny; nw = nh * aspect; } }

        setCropX(nx); setCropY(ny); setCropW(Math.max(nw, 5)); setCropH(Math.max(nh, 5));
      }
    },
    [dragging, aspect],
  );

  const onPointerUp = () => setDragging(null);

  /* ── perform crop ── */
  const doCrop = async () => {
    if (!srcUrl || !srcFile) return;
    setProcessing(true);

    /* Read the latest format/quality from refs so we ALWAYS get the current value */
    const currentFormat = formatRef.current;
    const currentQuality = qualityRef.current;

    try {
      const img = new Image();
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(); img.src = srcUrl; });

      const px = Math.round((cropX / 100) * img.naturalWidth);
      const py = Math.round((cropY / 100) * img.naturalHeight);
      const pw = Math.round((cropW / 100) * img.naturalWidth);
      const ph = Math.round((cropH / 100) * img.naturalHeight);

      const canvas = document.createElement("canvas");
      canvas.width = pw;
      canvas.height = ph;
      const ctx = canvas.getContext("2d")!;

      /* For JPEG, fill white background (no transparency) */
      if (currentFormat === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pw, ph);
      }

      ctx.drawImage(img, px, py, pw, ph, 0, 0, pw, ph);

      /* Export via toDataURL for reliable format verification */
      const qualityParam = currentFormat === "image/png" ? undefined : currentQuality / 100;
      const { blob, actualMime } = await canvasToVerifiedBlob(canvas, currentFormat, qualityParam);

      const result: CroppedResult = {
        id: crypto.randomUUID(),
        name: srcFile.name,
        originalWidth: img.naturalWidth,
        originalHeight: img.naturalHeight,
        cropX: px, cropY: py, cropW: pw, cropH: ph,
        originalSize: srcFile.size,
        newSize: blob.size,
        outputFormat: actualMime,
        url: URL.createObjectURL(blob),
        blob,
      };
      setResults((prev) => [result, ...prev]);
    } catch { /* */ } finally { setProcessing(false); }
  };

  /* ── downloads ── */
  const downloadOne = (r: CroppedResult) => {
    const ext = mimeToExt(r.outputFormat);
    const baseName = r.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = r.url;
    a.download = `${baseName}-cropped-${r.cropW}x${r.cropH}${ext}`;
    a.click();
  };

  const downloadAll = () => results.forEach(downloadOne);

  const downloadZip = async () => {
    if (results.length === 0) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      results.forEach((r, i) => {
        const ext = mimeToExt(r.outputFormat);
        const baseName = r.name.replace(/\.[^.]+$/, "");
        zip.file(`${baseName}-cropped-${r.cropW}x${r.cropH}-${i + 1}${ext}`, r.blob);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `cropped-images-${results.length}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally { setZipping(false); }
  };

  const removeResult = (id: string) => {
    setResults((prev) => { const item = prev.find((i) => i.id === id); if (item) URL.revokeObjectURL(item.url); return prev.filter((i) => i.id !== id); });
    setPreviewIdx(null);
  };

  const clearResults = () => { results.forEach((r) => URL.revokeObjectURL(r.url)); setResults([]); setPreviewIdx(null); };

  const resetImage = () => {
    if (srcUrl) URL.revokeObjectURL(srcUrl);
    setSrcUrl(null); setSrcFile(null); setImgNatW(0); setImgNatH(0);
  };

  /* pixel readouts */
  const pxX = Math.round((cropX / 100) * imgNatW);
  const pxY = Math.round((cropY / 100) * imgNatH);
  const pxW = Math.round((cropW / 100) * imgNatW);
  const pxH = Math.round((cropH / 100) * imgNatH);

  return (
    <div className="space-y-4">
      {/* ── Settings bar ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          {/* Aspect */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Aspect Ratio</label>
            <div className="flex flex-wrap gap-1.5">
              {aspectPresets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyAspect(p.ratio)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                    (aspect === null && p.ratio === null) || aspect === p.ratio
                      ? "border-[#6c63ff] bg-[#6c63ff]/20 text-[#6c63ff]"
                      : "border-border bg-surface-2 text-muted hover:border-border-strong hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Output Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as OutputFormat)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6c63ff]/50"
            >
              <option value="image/png">PNG (lossless, transparency)</option>
              <option value="image/jpeg">JPEG (smaller file)</option>
              <option value="image/webp">WebP (modern, smallest)</option>
            </select>
            <p className="mt-1 text-[10px] text-[#38d9a9]">Currently: {mimeToLabel(format)}</p>
          </div>

          {/* Quality */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Quality — {quality}%</label>
            <input type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-2 accent-[#6c63ff]" />
            <p className="mt-1 text-[10px] text-muted-2">{format === "image/png" ? "Ignored for PNG (always lossless)" : "Lower = smaller file"}</p>
          </div>
        </div>
      </div>

      {/* ── Crop canvas or drop zone ── */}
      {!srcUrl ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onFileDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-20 text-center transition ${
            dragOver ? "border-[#6c63ff] bg-[#6c63ff]/10" : "border-border bg-surface hover:border-border-strong"
          }`}
        >
          <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden" onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0])} />
          <span className="text-4xl">✂️</span>
          <p className="mt-3 text-sm font-semibold text-white">Drop an image here or click to browse</p>
          <p className="mt-1 text-xs text-muted-2">JPG, PNG, WebP, BMP, GIF, AVIF, TIFF supported</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted">
                {imgNatW} × {imgNatH} px — Crop: <span className="font-bold text-white">{pxW} × {pxH}</span> px
                <span className="ml-2 text-muted-2">at ({pxX}, {pxY})</span>
              </p>
              <span className="rounded-full bg-[#6c63ff]/10 px-2 py-0.5 text-[10px] font-bold text-[#6c63ff]">→ {mimeToLabel(format)}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={doCrop}
                disabled={processing}
                className="rounded-lg bg-[#6c63ff] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#5b54e0] disabled:opacity-50"
              >
                {processing ? "Cropping…" : `✂ Crop as ${mimeToLabel(format)}`}
              </button>
              <button onClick={resetImage} className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-white transition hover:border-border-strong">
                Change Image
              </button>
            </div>
          </div>

          {/* Interactive crop area */}
          <div
            ref={containerRef}
            className="relative mx-auto select-none"
            style={{ maxHeight: 600, overflow: "hidden" }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={srcUrl} alt="Source" className="block w-full" draggable={false} style={{ maxHeight: 600, objectFit: "contain", width: "100%" }} />

            {/* Dark overlay */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-0 top-0 bg-black/60" style={{ width: "100%", height: `${cropY}%` }} />
              <div className="absolute bottom-0 left-0 bg-black/60" style={{ width: "100%", height: `${100 - cropY - cropH}%` }} />
              <div className="absolute left-0 bg-black/60" style={{ top: `${cropY}%`, width: `${cropX}%`, height: `${cropH}%` }} />
              <div className="absolute right-0 bg-black/60" style={{ top: `${cropY}%`, width: `${100 - cropX - cropW}%`, height: `${cropH}%` }} />
            </div>

            {/* Crop box */}
            <div className="absolute border-2 border-white/90" style={{ left: `${cropX}%`, top: `${cropY}%`, width: `${cropW}%`, height: `${cropH}%` }}>
              <div className="absolute inset-0 cursor-move" onPointerDown={(e) => onPointerDown(e, "move")} />
              {/* Rule-of-thirds */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/3 top-0 h-full w-px bg-white/25" />
                <div className="absolute left-2/3 top-0 h-full w-px bg-white/25" />
                <div className="absolute left-0 top-1/3 h-px w-full bg-white/25" />
                <div className="absolute left-0 top-2/3 h-px w-full bg-white/25" />
              </div>
              {/* Corner handles */}
              {(["nw", "ne", "sw", "se"] as const).map((h) => (
                <div
                  key={h}
                  onPointerDown={(e) => onPointerDown(e, h)}
                  className={`absolute z-10 h-4 w-4 border-2 border-white bg-[#6c63ff] ${
                    h === "nw" ? "-left-2 -top-2 cursor-nw-resize" :
                    h === "ne" ? "-right-2 -top-2 cursor-ne-resize" :
                    h === "sw" ? "-bottom-2 -left-2 cursor-sw-resize" :
                    "-bottom-2 -right-2 cursor-se-resize"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Cropped result preview ── */}
      {previewIdx !== null && results[previewIdx] && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="font-display text-sm font-bold text-white">Preview — {results[previewIdx].name.replace(/\.[^.]+$/, "")}{mimeToExt(results[previewIdx].outputFormat)}</h3>
            <button onClick={() => setPreviewIdx(null)} className="text-xs text-muted-2 hover:text-foreground">✕ Close</button>
          </div>
          <div className="flex flex-col items-center bg-surface p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={results[previewIdx].url} alt="Cropped" className="max-h-[400px] rounded-lg border border-border object-contain" />
            <div className="mt-3 text-center text-xs text-muted">
              {results[previewIdx].cropW} × {results[previewIdx].cropH} px • {mimeToLabel(results[previewIdx].outputFormat)} • {fmtSize(results[previewIdx].newSize)}
            </div>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {results.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
              <h3 className="font-display text-sm font-bold tracking-tight text-white">
                {results.length} cropped image{results.length > 1 ? "s" : ""}
              </h3>
            </div>
            <div className="flex gap-2">
              {results.length > 1 && (
                <button onClick={downloadZip} disabled={zipping} className="rounded-lg bg-[#38d9a9] px-4 py-2 text-xs font-semibold text-[#111118] transition hover:bg-[#2fc49b] disabled:opacity-50">
                  {zipping ? "Zipping…" : "📦 Download ZIP"}
                </button>
              )}
              {results.length > 1 && (
                <button onClick={downloadAll} className="rounded-lg bg-[#6c63ff] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#5b54e0]">Download All</button>
              )}
              <button onClick={clearResults} className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-white transition hover:border-border-strong">Clear</button>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {results.map((r, idx) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.url} alt={r.name} className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{r.name.replace(/\.[^.]+$/, "")}{mimeToExt(r.outputFormat)}</p>
                  <p className="mt-0.5 text-xs text-muted-2">
                    {r.originalWidth}×{r.originalHeight} → <span className="text-[#38d9a9]">{r.cropW}×{r.cropH}</span>
                    <span className="ml-2 rounded bg-[#6c63ff]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#6c63ff]">{mimeToLabel(r.outputFormat)}</span>
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-muted">{fmtSize(r.originalSize)} → <span className="font-bold text-white">{fmtSize(r.newSize)}</span></p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setPreviewIdx(idx)} className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-white transition hover:border-[#6c63ff]/40" title="Preview">👁</button>
                  <button onClick={() => downloadOne(r)} className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-white transition hover:border-[#6c63ff]/40" title="Download">⬇</button>
                  <button onClick={() => removeResult(r.id)} className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-white transition hover:border-red-400/40" title="Remove">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="✂️" title="Visual Cropping" desc="Drag corners or the crop box to select the exact area you want. Rule-of-thirds grid included." />
        <InfoCard icon="📐" title="Aspect Presets" desc="Lock to 1:1, 4:3, 16:9, 9:16, and more — or crop freely with no constraint." />
        <InfoCard icon="🔒" title="100% Private" desc="All processing happens in your browser. No images are uploaded or stored anywhere." />
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <span className="text-xl">{icon}</span>
      <h4 className="mt-2 text-sm font-semibold text-white">{title}</h4>
      <p className="mt-1 text-xs leading-5 text-muted">{desc}</p>
    </div>
  );
}
