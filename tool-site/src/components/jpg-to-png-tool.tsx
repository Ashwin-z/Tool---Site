"use client";

import { useCallback, useRef, useState } from "react";
import JSZip from "jszip";

/* ── types ── */
interface ConvertedImage {
  id: string;
  name: string;
  originalFormat: string;
  originalSize: number;
  newSize: number;
  width: number;
  height: number;
  originalUrl: string;
  url: string;
  blob: Blob;
}

/* ── helpers ── */
function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function friendlyFormat(mime: string): string {
  if (mime.includes("png")) return "PNG";
  if (mime.includes("webp")) return "WebP";
  if (mime.includes("bmp")) return "BMP";
  if (mime.includes("gif")) return "GIF";
  if (mime.includes("avif")) return "AVIF";
  if (mime.includes("tiff")) return "TIFF";
  if (mime.includes("svg")) return "SVG";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "JPG";
  return mime.split("/")[1]?.toUpperCase() || "IMG";
}

const ACCEPTED = "image/jpeg,image/webp,image/bmp,image/gif,image/avif,image/tiff,image/svg+xml,image/png";

const MAX_FILES = 25;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

function convertToPngFromDataUrl(
  dataUrl: string,
  name: string,
  originalFormat: string,
  originalSize: number,
): Promise<ConvertedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Conversion failed"));
          resolve({
            id: crypto.randomUUID(),
            name,
            originalFormat,
            originalSize,
            newSize: blob.size,
            width: img.naturalWidth,
            height: img.naturalHeight,
            originalUrl: dataUrl,
            url: URL.createObjectURL(blob),
            blob,
          });
        },
        "image/png",
      );
    };
    img.onerror = () => reject(new Error("Invalid image"));
    img.src = dataUrl;
  });
}

export default function JpgToPngTool() {
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<ConvertedImage[]>([]);
  imagesRef.current = images;

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const allImgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (allImgs.length === 0) return;

    const oversized = allImgs.filter((f) => f.size > MAX_FILE_SIZE);
    const validImgs = allImgs.filter((f) => f.size <= MAX_FILE_SIZE);

    if (oversized.length) {
      setLimitWarning(`${oversized.length} file${oversized.length > 1 ? "s" : ""} exceeded the ${MAX_FILE_SIZE / (1024 * 1024)}MB size limit and ${oversized.length > 1 ? "were" : "was"} skipped.`);
      setTimeout(() => setLimitWarning(null), 5000);
    }

    if (!validImgs.length) return;

    const remaining = MAX_FILES - imagesRef.current.length;
    if (remaining <= 0) {
      setLimitWarning(`Maximum ${MAX_FILES} images allowed. Please remove some images first.`);
      setTimeout(() => setLimitWarning(null), 5000);
      return;
    }

    const imgs = validImgs.slice(0, remaining);
    if (validImgs.length > remaining) {
      setLimitWarning(`Only the first ${remaining} of ${validImgs.length} images were added (max ${MAX_FILES}).`);
      setTimeout(() => setLimitWarning(null), 5000);
    }

    setProcessing(true);
    try {
      const results = await Promise.all(
        imgs.map(
          (f) =>
            new Promise<ConvertedImage>((res, rej) => {
              const reader = new FileReader();
              reader.onload = async () => {
                try {
                  const r = await convertToPngFromDataUrl(reader.result as string, f.name, f.type, f.size);
                  res(r);
                } catch (e) { rej(e); }
              };
              reader.onerror = () => rej(new Error("Read failed"));
              reader.readAsDataURL(f);
            }),
        ),
      );
      setImages((prev) => [...prev, ...results]);
      setPreviewIdx((p) => p ?? 0);
    } catch { /* skip bad files */ } finally { setProcessing(false); }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); },
    [handleFiles],
  );

  /* ── downloads ── */
  const downloadOne = (img: ConvertedImage) => {
    const a = document.createElement("a");
    a.href = img.url;
    a.download = `${img.name.replace(/\.[^.]+$/, "")}.png`;
    a.click();
  };

  const downloadAll = () => images.forEach(downloadOne);

  const downloadZip = async () => {
    if (images.length === 0) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      images.forEach((img) => zip.file(`${img.name.replace(/\.[^.]+$/, "")}.png`, img.blob));
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `converted-png-${images.length}-images.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally { setZipping(false); }
  };

  const removeImage = (id: string) => {
    setImages((prev) => { const item = prev.find((i) => i.id === id); if (item) URL.revokeObjectURL(item.url); return prev.filter((i) => i.id !== id); });
    setPreviewIdx(null);
  };

  const clearAll = () => { images.forEach((img) => URL.revokeObjectURL(img.url)); setImages([]); setPreviewIdx(null); };

  return (
    <div className="space-y-4">
      {/* ── Info banner ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />
        <div className="p-5">
          <p className="text-sm leading-6 text-muted">
            <span className="font-semibold text-white">Lossless conversion to PNG.</span>{" "}
            PNG preserves full transparency and uses lossless compression — ideal for logos,
            icons, screenshots, and graphics. Drop any image format below.
          </p>
        </div>
      </div>

      {/* ── Limit warning ── */}
      {limitWarning && (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-600/50 dark:bg-yellow-500/10 dark:text-yellow-300">
          ⚠️ {limitWarning}
        </div>
      )}

      {/* ── Drop zone ── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition ${
          dragOver
            ? "border-[#6c63ff] bg-[#6c63ff]/10"
            : "border-border bg-surface hover:border-border-strong"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <span className="text-4xl">🖼️</span>
        <p className="mt-3 text-sm font-semibold text-white">
          {processing ? "Converting…" : "Drop images here or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted-2">
          JPG, WebP, BMP, GIF, AVIF, TIFF, SVG, PNG → PNG • Max {MAX_FILES} images
        </p>
      </div>

      {/* ── Before / After preview ── */}
      {previewIdx !== null && images[previewIdx] && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="font-display text-sm font-bold text-white">Preview — {images[previewIdx].name.replace(/\.[^.]+$/, "")}.png</h3>
            <button onClick={() => setPreviewIdx(null)} className="text-xs text-muted-2 hover:text-foreground">✕ Close</button>
          </div>
          <div className="grid grid-cols-2 gap-px bg-surface-3/50">
            <div className="flex flex-col items-center bg-surface p-4">
              <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-2">Original</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[previewIdx].originalUrl} alt="Original" className="max-h-[400px] rounded-lg border border-border object-contain" />
              <span className="mt-2 text-xs text-muted">{fmtSize(images[previewIdx].originalSize)}</span>
            </div>
            <div className="flex flex-col items-center bg-surface p-4">
              <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-2">Converted (PNG)</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[previewIdx].url} alt="Converted" className="max-h-[400px] rounded-lg border border-border object-contain" />
              <span className="mt-2 text-xs text-[#38d9a9]">{fmtSize(images[previewIdx].newSize)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {images.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
              <h3 className="font-display text-sm font-bold tracking-tight text-white">{images.length} image{images.length > 1 ? "s" : ""} converted to PNG</h3>
            </div>
            <div className="flex gap-2">
              {images.length > 1 && (
                <button onClick={downloadZip} disabled={zipping} className="rounded-lg bg-[#38d9a9] px-4 py-2 text-xs font-semibold text-[#111118] transition hover:bg-[#2fc49b] disabled:opacity-50">
                  {zipping ? "Zipping…" : "📦 Download ZIP"}
                </button>
              )}
              <button onClick={downloadAll} className="rounded-lg bg-[#6c63ff] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#5b54e0]">Download All</button>
              <button onClick={clearAll} className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-white transition hover:border-border-strong">Clear</button>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {images.map((img, idx) => (
              <div key={img.id} className="flex items-center gap-4 px-5 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.name} className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{img.name.replace(/\.[^.]+$/, "")}.png</p>
                  <p className="mt-0.5 text-xs text-muted-2">{friendlyFormat(img.originalFormat)} → <span className="text-[#38d9a9]">PNG</span> • {img.width}×{img.height}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-muted">{fmtSize(img.originalSize)} → <span className="font-bold text-white">{fmtSize(img.newSize)}</span></p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setPreviewIdx(idx)} className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-white transition hover:border-[#6c63ff]/40" title="Preview">👁</button>
                  <button onClick={() => downloadOne(img)} className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-white transition hover:border-[#6c63ff]/40" title="Download">⬇</button>
                  <button onClick={() => removeImage(img.id)} className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-white transition hover:border-red-400/40" title="Remove">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="🖼️" title="Any Image → PNG" desc="Convert JPG, WebP, BMP, GIF, AVIF, TIFF, and SVG files to PNG format." />
        <InfoCard icon="🔍" title="Lossless & Transparent" desc="PNG uses lossless compression and preserves transparency from the source." />
        <InfoCard icon="🔒" title="100% Private" desc="All conversions run in your browser. No images are uploaded anywhere." />
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
