"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB

/* ── preset sizes ── */
interface Preset {
  label: string;
  w: number;
  h: number;
}

const presets: Preset[] = [
  { label: "Instagram Post", w: 1080, h: 1080 },
  { label: "Instagram Story", w: 1080, h: 1920 },
  { label: "Facebook Cover", w: 820, h: 312 },
  { label: "Twitter Header", w: 1500, h: 500 },
  { label: "LinkedIn Banner", w: 1584, h: 396 },
  { label: "YouTube Thumbnail", w: 1280, h: 720 },
  { label: "HD (1280×720)", w: 1280, h: 720 },
  { label: "Full HD (1920×1080)", w: 1920, h: 1080 },
  { label: "4K (3840×2160)", w: 3840, h: 2160 },
  { label: "Passport Photo", w: 600, h: 600 },
  { label: "Icon (512×512)", w: 512, h: 512 },
  { label: "Favicon (64×64)", w: 64, h: 64 },
];

/* ── types ── */
interface ResizedImage {
  id: string;
  name: string;
  originalWidth: number;
  originalHeight: number;
  newWidth: number;
  newHeight: number;
  originalSize: number;
  newSize: number;
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

async function resizeImage(
  file: File,
  targetW: number,
  targetH: number,
  maintainAspect: boolean,
  format: "image/jpeg" | "image/webp" | "image/png",
  quality: number,
): Promise<ResizedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = targetW;
        let h = targetH;

        if (maintainAspect) {
          const ratio = img.naturalWidth / img.naturalHeight;
          if (w && h) {
            // Fit within the box
            const targetRatio = w / h;
            if (ratio > targetRatio) {
              h = Math.round(w / ratio);
            } else {
              w = Math.round(h * ratio);
            }
          } else if (w) {
            h = Math.round(w / ratio);
          } else if (h) {
            w = Math.round(h * ratio);
          }
        }

        if (!w) w = img.naturalWidth;
        if (!h) h = img.naturalHeight;

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;

        // Use high-quality downscaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Resize failed"));
            resolve({
              id: crypto.randomUUID(),
              name: file.name,
              originalWidth: img.naturalWidth,
              originalHeight: img.naturalHeight,
              newWidth: w,
              newHeight: h,
              originalSize: file.size,
              newSize: blob.size,
              originalUrl: reader.result as string,
              url: URL.createObjectURL(blob),
              blob,
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

export default function ImageResizerTool() {
  const [image, setImage] = useState<ResizedImage | null>(null);
  const [srcFile, setSrcFile] = useState<File | null>(null);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [format, setFormat] = useState<"image/jpeg" | "image/webp" | "image/png">("image/jpeg");
  const [quality, setQuality] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<ResizedImage | null>(null);
  const srcFileRef = useRef<File | null>(null);
  imageRef.current = image;
  srcFileRef.current = srcFile;

  const handleFile = useCallback(
    async (files: FileList | File[]) => {
      const file = Array.from(files).find((f) => f.type.startsWith("image/"));
      if (!file) return;
      if (file.size > MAX_FILE_SIZE) {
        alert(`File exceeds the 1GB size limit.`);
        return;
      }
      setSrcFile(file);
      setProcessing(true);
      try {
        if (imageRef.current) URL.revokeObjectURL(imageRef.current.url);
        const result = await resizeImage(file, width, height, maintainAspect, format, quality);
        setImage(result);
      } catch {
        /* skip bad file */
      } finally {
        setProcessing(false);
      }
    },
    [width, height, maintainAspect, format, quality],
  );

  /* auto-re-resize when settings change */
  useEffect(() => {
    const currentFile = srcFileRef.current;
    if (!currentFile) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setProcessing(true);
      try {
        const result = await resizeImage(currentFile, width, height, maintainAspect, format, quality);
        if (!cancelled) {
          if (imageRef.current) URL.revokeObjectURL(imageRef.current.url);
          setImage((prev) => (prev ? { ...result, originalUrl: prev.originalUrl } : result));
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
  }, [width, height, maintainAspect, format, quality]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFile(e.dataTransfer.files);
    },
    [handleFile],
  );

  const applyPreset = (preset: Preset) => {
    setWidth(preset.w);
    setHeight(preset.h);
    setSelectedPreset(preset.label);
  };

  const downloadResult = () => {
    if (!image) return;
    const ext = format === "image/webp" ? ".webp" : format === "image/png" ? ".png" : ".jpg";
    const baseName = image.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = image.url;
    a.download = `${baseName}-${image.newWidth}x${image.newHeight}${ext}`;
    a.click();
  };

  const clearImage = () => {
    if (image) URL.revokeObjectURL(image.url);
    setImage(null);
    setSrcFile(null);
  };

  return (
    <div className="space-y-4">
      {/* ── Settings card ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        {/* Dimension inputs */}
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-4">
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
              Width (px)
            </label>
            <input
              type="number"
              min={1}
              value={width}
              onChange={(e) => {
                setWidth(Number(e.target.value) || 0);
                setSelectedPreset("");
              }}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6c63ff]/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
              Height (px)
            </label>
            <input
              type="number"
              min={1}
              value={height}
              onChange={(e) => {
                setHeight(Number(e.target.value) || 0);
                setSelectedPreset("");
              }}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6c63ff]/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
              Format
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
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-2 accent-[#6c63ff]"
            />
          </div>
        </div>

        {/* Maintain aspect toggle */}
        <div className="border-t border-border px-5 py-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={maintainAspect}
              onChange={(e) => setMaintainAspect(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-surface-2 accent-[#6c63ff]"
            />
            Maintain aspect ratio (fit within dimensions)
          </label>
        </div>

        {/* Presets */}
        <div className="border-t border-border px-5 py-4">
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
            Quick Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  selectedPreset === p.label
                    ? "border-[#6c63ff] bg-[#6c63ff]/20 text-[#6c63ff]"
                    : "border-border bg-surface-2 text-muted hover:border-border-strong hover:text-foreground"
                }`}
              >
                {p.label}
                <span className="ml-1 text-[10px] text-muted-2">{p.w}×{p.h}</span>
              </button>
            ))}
          </div>
        </div>
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
          className="hidden"
          onChange={(e) => e.target.files && handleFile(e.target.files)}
        />
        <span className="text-4xl">📐</span>
        <p className="mt-3 text-sm font-semibold text-white">
          {processing ? "Resizing…" : "Drop an image here or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted-2">
          Resize to {width} × {height} px • JPG, PNG, WebP
        </p>
      </div>

      {/* ── Before / After preview ── */}
      {image && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="font-display text-sm font-bold text-white">Preview — {image.name}</h3>
            <div className="flex gap-2">
              <button
                onClick={downloadResult}
                className="rounded-lg bg-[#6c63ff] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#5b54e0]"
              >
                ⬇ Download
              </button>
              <button
                onClick={clearImage}
                className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-white transition hover:border-border-strong"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px bg-surface-3/50">
            <div className="flex flex-col items-center bg-surface p-4">
              <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-2">Original ({image.originalWidth}×{image.originalHeight})</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.originalUrl} alt="Original" className="max-h-[400px] rounded-lg border border-border object-contain" />
              <span className="mt-2 text-xs text-muted">{fmtSize(image.originalSize)}</span>
            </div>
            <div className="flex flex-col items-center bg-surface p-4">
              <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-2">Resized ({image.newWidth}×{image.newHeight})</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="Resized" className="max-h-[400px] rounded-lg border border-border object-contain" />
              <span className="mt-2 text-xs text-[#38d9a9]">{fmtSize(image.newSize)}</span>
            </div>
          </div>
          {/* Info bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 border-t border-border px-5 py-3">
            <span className="text-xs text-muted">
              {image.originalWidth}×{image.originalHeight} → <span className="font-bold text-[#38d9a9]">{image.newWidth}×{image.newHeight}</span>
            </span>
            <span className="text-xs text-muted">
              {fmtSize(image.originalSize)} → <span className="font-bold text-white">{fmtSize(image.newSize)}</span>
            </span>
          </div>
        </div>
      )}

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="📐" title="Exact Dimensions" desc="Set custom pixel sizes or pick from 12 social-media & display presets." />
        <InfoCard icon="⚡" title="Instant Resize" desc="Upload an image and see the resized result instantly with before/after preview." />
        <InfoCard icon="🔒" title="100% Private" desc="Everything runs in your browser. No images are uploaded or stored." />
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
