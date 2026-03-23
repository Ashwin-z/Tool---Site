"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import JSZip from "jszip";

/* ── types ── */
interface CompressedImage {
  id: string;
  name: string;
  originalSize: number;
  compressedSize: number;
  originalUrl: string;
  compressedUrl: string;
  compressedBlob: Blob;
  width: number;
  height: number;
}

const MAX_FILES = 25;

/* ── helpers ── */
function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function pct(original: number, compressed: number): string {
  if (original === 0) return "0";
  return ((1 - compressed / original) * 100).toFixed(1);
}

async function compressImage(
  file: File,
  quality: number,
  maxWidth: number,
  format: "image/jpeg" | "image/webp" | "image/png",
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth;
        let h = img.naturalHeight;

        if (maxWidth > 0 && w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Compression failed"));
            const compressedUrl = URL.createObjectURL(blob);
            resolve({
              id: crypto.randomUUID(),
              name: file.name,
              originalSize: file.size,
              compressedSize: blob.size,
              originalUrl: reader.result as string,
              compressedUrl,
              compressedBlob: blob,
              width: w,
              height: h,
            });
          },
          format,
          format === "image/png" ? undefined : quality / 100,
        );
      };
      img.onerror = () => reject(new Error("Invalid image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export default function ImageCompressorTool() {
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [quality, setQuality] = useState(75);
  const [maxWidth, setMaxWidth] = useState(0); // 0 = keep original
  const [format, setFormat] = useState<"image/jpeg" | "image/webp" | "image/png">("image/jpeg");
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<CompressedImage[]>([]);
  imagesRef.current = images;

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const allImgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (allImgs.length === 0) return;
      const remaining = MAX_FILES - imagesRef.current.length;
      if (remaining <= 0) {
        setLimitWarning(`Maximum ${MAX_FILES} images allowed. Please remove some images first.`);
        setTimeout(() => setLimitWarning(null), 4000);
        return;
      }
      if (allImgs.length > remaining) {
        setLimitWarning(`Only the first ${remaining} of ${allImgs.length} images were added (max ${MAX_FILES}).`);
        setTimeout(() => setLimitWarning(null), 4000);
      }
      const imgs = allImgs.slice(0, remaining);
      setProcessing(true);
      try {
        const results = await Promise.all(imgs.map((f) => compressImage(f, quality, maxWidth, format)));
        setImages((prev) => [...prev, ...results]);
        setPreviewIdx((p) => p ?? 0);
      } catch {
        /* silently skip bad files */
      } finally {
        setProcessing(false);
      }
    },
    [quality, maxWidth, format],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const downloadOne = (img: CompressedImage) => {
    const ext = format === "image/webp" ? ".webp" : format === "image/png" ? ".png" : ".jpg";
    const baseName = img.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = img.compressedUrl;
    a.download = `${baseName}-compressed${ext}`;
    a.click();
  };

  const downloadAll = () => {
    images.forEach((img) => downloadOne(img));
  };

  const downloadZip = async () => {
    if (images.length === 0) return;
    setZipping(true);
    try {
      const ext = format === "image/webp" ? ".webp" : format === "image/png" ? ".png" : ".jpg";
      const zip = new JSZip();
      images.forEach((img) => zip.file(`${img.name.replace(/\.[^.]+$/, "")}-compressed${ext}`, img.compressedBlob));
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `compressed-images-${images.length}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally { setZipping(false); }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.compressedUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
    setPreviewIdx(null);
  };

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.compressedUrl));
    setImages([]);
    setPreviewIdx(null);
  };

  /* auto-recompress when settings change */
  useEffect(() => {
    const current = imagesRef.current;
    if (current.length === 0) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setProcessing(true);
      try {
        const results = await Promise.all(
          current.map(async (img) => {
            const resp = await fetch(img.originalUrl);
            const blob = await resp.blob();
            const file = new File([blob], img.name, { type: blob.type });
            return compressImage(file, quality, maxWidth, format);
          }),
        );
        if (!cancelled) {
          const merged = results.map((r, i) => ({ ...r, originalUrl: current[i].originalUrl }));
          current.forEach((img) => URL.revokeObjectURL(img.compressedUrl));
          setImages(merged);
        }
      } catch {
        /* */
      } finally {
        if (!cancelled) setProcessing(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [quality, maxWidth, format]);

  /* ── totals ── */
  const totalOriginal = images.reduce((s, i) => s + i.originalSize, 0);
  const totalCompressed = images.reduce((s, i) => s + i.compressedSize, 0);

  return (
    <div className="space-y-4">
      {/* ── Settings card ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          {/* Quality slider */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
              Quality — {quality}%
            </label>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-2 accent-[#6c63ff]"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-2">
              <span>Smallest</span>
              <span>Best quality</span>
            </div>
          </div>

          {/* Max width */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
              Max Width (px)
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={maxWidth || ""}
              placeholder="No limit"
              onChange={(e) => setMaxWidth(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6c63ff]/50"
            />
          </div>

          {/* Format */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
              Output Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as typeof format)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6c63ff]/50"
            >
              <option value="image/jpeg">JPEG</option>
              <option value="image/webp">WebP</option>
              <option value="image/png">PNG</option>
            </select>
          </div>
        </div>

        {images.length > 0 && processing && (
          <div className="border-t border-border px-5 py-3 text-center text-xs text-muted">
            ⏳ Re-compressing with new settings…
          </div>
        )}
      </div>

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
          dragOver ? "border-[#6c63ff] bg-[#6c63ff]/10" : "border-border bg-surface hover:border-border-strong"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <span className="text-4xl">🖼️</span>
        <p className="mt-3 text-sm font-semibold text-white">
          {processing ? "Compressing…" : "Drop images here or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted-2">JPG, PNG, WebP — up to 50 MB each • Max {MAX_FILES} images</p>
      </div>

      {limitWarning && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          ⚠️ {limitWarning}
        </div>
      )}

      {/* ── Before / After preview ── */}
      {previewIdx !== null && images[previewIdx] && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="font-display text-sm font-bold text-white">Preview — {images[previewIdx].name}</h3>
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
              <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-2">Compressed</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[previewIdx].compressedUrl} alt="Compressed" className="max-h-[400px] rounded-lg border border-border object-contain" />
              <span className="mt-2 text-xs text-[#38d9a9]">{fmtSize(images[previewIdx].compressedSize)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {images.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {/* Header with totals */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
              <h3 className="font-display text-sm font-bold tracking-tight text-white">
                {images.length} image{images.length > 1 ? "s" : ""} compressed
              </h3>
              <span className="rounded-full bg-[#38d9a9]/10 px-2.5 py-0.5 text-xs font-bold text-[#38d9a9]">
                Saved {pct(totalOriginal, totalCompressed)}%
              </span>
              <span className="text-xs text-muted-2">
                {fmtSize(totalOriginal)} → {fmtSize(totalCompressed)}
              </span>
            </div>
            <div className="flex gap-2">
              {images.length > 1 && (
                <button onClick={downloadZip} disabled={zipping} className="rounded-lg bg-[#38d9a9] px-4 py-2 text-xs font-semibold text-[#111118] transition hover:bg-[#2fc49b] disabled:opacity-50">
                  {zipping ? "Zipping…" : "📦 Download ZIP"}
                </button>
              )}
              <button
                onClick={downloadAll}
                className="rounded-lg bg-[#6c63ff] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#5b54e0]"
              >
                Download All
              </button>
              <button
                onClick={clearAll}
                className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-white transition hover:border-border-strong"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Image list */}
          <div className="divide-y divide-white/5">
            {images.map((img, idx) => (
              <div key={img.id} className="flex items-center gap-4 px-5 py-3">
                {/* Thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.compressedUrl}
                  alt={img.name}
                  className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover"
                />

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{img.name}</p>
                  <p className="mt-0.5 text-xs text-muted-2">
                    {img.width} × {img.height} px
                  </p>
                </div>

                {/* Sizes */}
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-muted">
                    {fmtSize(img.originalSize)} → <span className="font-bold text-[#38d9a9]">{fmtSize(img.compressedSize)}</span>
                  </p>
                  <p className="text-xs font-bold text-[#38d9a9]">-{pct(img.originalSize, img.compressedSize)}%</p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setPreviewIdx(idx)} className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-white transition hover:border-[#6c63ff]/40" title="Preview">👁</button>
                  <button
                    onClick={() => downloadOne(img)}
                    className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-white transition hover:border-[#6c63ff]/40"
                    title="Download"
                  >
                    ⬇
                  </button>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-white transition hover:border-red-400/40"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="⚡" title="Lightning Fast" desc="Compression runs locally in your browser — no upload, no server." />
        <InfoCard icon="🎯" title="Fine Control" desc="Adjust quality, max width, and output format to hit your target size." />
        <InfoCard icon="🔒" title="100% Private" desc="Images never leave your device. Nothing is stored or sent anywhere." />
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
