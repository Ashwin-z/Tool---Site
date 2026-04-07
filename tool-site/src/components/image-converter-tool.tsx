"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import JSZip from "jszip";

/* ── types ── */
type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

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

function pct(original: number, converted: number): string {
  if (original === 0) return "0";
  const diff = ((1 - converted / original) * 100).toFixed(1);
  return Number(diff) >= 0 ? diff : `+${Math.abs(Number(diff)).toFixed(1)}`;
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

const MAX_FILES = 25;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ACCEPTED = "image/jpeg,image/png,image/webp,image/bmp,image/gif,image/avif,image/tiff,image/svg+xml";

function convertImageFromDataUrl(
  dataUrl: string,
  name: string,
  originalFormat: string,
  originalSize: number,
  outputFormat: OutputFormat,
  quality: number,
  bgColor: string,
): Promise<ConvertedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;

      /* Always fill background to replace transparency */
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0);

      /* Use toDataURL to verify actual output format */
      const qualityParam = outputFormat === "image/png" ? undefined : quality / 100;
      const dataUrlOut = canvas.toDataURL(outputFormat, qualityParam);
      const actualMime = (dataUrlOut.substring(5, dataUrlOut.indexOf(";")) || outputFormat) as OutputFormat;

      fetch(dataUrlOut)
        .then((res) => res.blob())
        .then((rawBlob) => {
          const blob = new Blob([rawBlob], { type: actualMime });
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
        })
        .catch(reject);
    };
    img.onerror = () => reject(new Error("Invalid image"));
    img.src = dataUrl;
  });
}

export default function ImageConverterTool() {
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(92);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<ConvertedImage[]>([]);
  imagesRef.current = images;

  /* ── upload handler ── */
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
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
        setTimeout(() => setLimitWarning(null), 4000);
        return;
      }
      if (validImgs.length > remaining) {
        setLimitWarning(`Only the first ${remaining} of ${validImgs.length} images were added (max ${MAX_FILES}).`);
        setTimeout(() => setLimitWarning(null), 4000);
      }
      const imgs = validImgs.slice(0, remaining);
      setProcessing(true);
      try {
        const results = await Promise.all(
          imgs.map(
            (f) =>
              new Promise<ConvertedImage>((res, rej) => {
                const reader = new FileReader();
                reader.onload = async () => {
                  try {
                    const r = await convertImageFromDataUrl(
                      reader.result as string,
                      f.name,
                      f.type,
                      f.size,
                      outputFormat,
                      quality,
                      bgColor,
                    );
                    res(r);
                  } catch (e) {
                    rej(e);
                  }
                };
                reader.onerror = () => rej(new Error("Read failed"));
                reader.readAsDataURL(f);
              }),
          ),
        );
        setImages((prev) => [...prev, ...results]);
        setPreviewIdx((p) => p ?? 0);
      } catch {
        /* skip bad files */
      } finally {
        setProcessing(false);
      }
    },
    [outputFormat, quality, bgColor],
  );

  /* ── auto re-convert when settings change ── */
  useEffect(() => {
    const current = imagesRef.current;
    if (current.length === 0) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setProcessing(true);
      try {
        const results = await Promise.all(
          current.map((img) =>
            convertImageFromDataUrl(
              img.originalUrl,
              img.name,
              img.originalFormat,
              img.originalSize,
              outputFormat,
              quality,
              bgColor,
            ),
          ),
        );
        if (!cancelled) {
          current.forEach((img) => URL.revokeObjectURL(img.url));
          setImages(results);
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
  }, [outputFormat, quality, bgColor]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  /* ── downloads ── */
  const ext = mimeToExt(outputFormat);

  const downloadOne = (img: ConvertedImage) => {
    const a = document.createElement("a");
    a.href = img.url;
    a.download = `${img.name.replace(/\.[^.]+$/, "")}${ext}`;
    a.click();
  };

  const downloadAll = () => images.forEach(downloadOne);

  const downloadZip = async () => {
    if (images.length === 0) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      images.forEach((img) =>
        zip.file(`${img.name.replace(/\.[^.]+$/, "")}${ext}`, img.blob),
      );
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `converted-${mimeToLabel(outputFormat).toLowerCase()}-${images.length}-images.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setZipping(false);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.id !== id);
    });
    setPreviewIdx(null);
  };

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    setImages([]);
    setPreviewIdx(null);
  };

  const totalOrig = images.reduce((s, i) => s + i.originalSize, 0);
  const totalNew = images.reduce((s, i) => s + i.newSize, 0);
  const savedPct = pct(totalOrig, totalNew);

  return (
    <div className="space-y-4">
      {/* ── Settings ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          {/* Output format */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
              Convert To
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6c63ff]/50"
            >
              <option value="image/png">PNG (lossless, transparency)</option>
              <option value="image/jpeg">JPEG (smaller file)</option>
              <option value="image/webp">WebP (modern, smallest)</option>
            </select>
            <p className="mt-1 text-[10px] text-[#38d9a9]">
              Output: {mimeToLabel(outputFormat)}
            </p>
          </div>

          {/* Quality */}
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
              <span>Smallest file</span>
              <span>Best quality</span>
            </div>
            {outputFormat === "image/png" && (
              <p className="mt-1 text-[10px] text-muted-2">
                Ignored for PNG (always lossless)
              </p>
            )}
          </div>

          {/* Background color */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
              Background Color (replaces transparency)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-lg border border-border bg-transparent [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-1"
              />
              <div className="flex gap-2">
                {["#ffffff", "#000000", "#f5f5f5", "#eeeeee"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setBgColor(c)}
                    className={`h-8 w-8 rounded-lg border-2 transition ${
                      bgColor === c ? "border-[#6c63ff] ring-2 ring-[#6c63ff]/40" : "border-white/20"
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <span className="rounded bg-surface-2 px-2 py-1 font-mono text-xs text-white">{bgColor}</span>
            </div>
          </div>
        </div>

        {images.length > 0 && processing && (
          <div className="border-t border-border px-5 py-3 text-center text-xs text-muted">
            ⏳ Re-converting with new settings…
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
        <span className="text-4xl">🔄</span>
        <p className="mt-3 text-sm font-semibold text-white">
          {processing ? "Converting…" : "Drop images here or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted-2">
          JPG, PNG, WebP, BMP, GIF, AVIF, TIFF, SVG → {mimeToLabel(outputFormat)} • Max {MAX_FILES} images
        </p>
      </div>

      {limitWarning && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          ⚠️ {limitWarning}
        </div>
      )}

      {/* ── Large Before / After preview ── */}
      {previewIdx !== null && images[previewIdx] && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="font-display text-sm font-bold text-white">
              Preview — {images[previewIdx].name.replace(/\.[^.]+$/, "")}
              {ext}
            </h3>
            <div className="flex items-center gap-3">
              {images.length > 1 && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setPreviewIdx(Math.max(0, (previewIdx ?? 0) - 1))}
                    disabled={previewIdx === 0}
                    className="rounded-md border border-border bg-surface-2 px-2 py-1 text-xs text-white transition hover:border-border-strong disabled:opacity-30"
                  >
                    ‹ Prev
                  </button>
                  <button
                    onClick={() =>
                      setPreviewIdx(
                        Math.min(images.length - 1, (previewIdx ?? 0) + 1),
                      )
                    }
                    disabled={previewIdx === images.length - 1}
                    className="rounded-md border border-border bg-surface-2 px-2 py-1 text-xs text-white transition hover:border-border-strong disabled:opacity-30"
                  >
                    Next ›
                  </button>
                </div>
              )}
              <button
                onClick={() => setPreviewIdx(null)}
                className="text-xs text-muted-2 hover:text-foreground"
              >
                ✕ Close
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px bg-surface-3/50">
            <div className="flex flex-col items-center bg-surface p-4">
              <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                Original ({friendlyFormat(images[previewIdx].originalFormat)})
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[previewIdx].originalUrl}
                alt="Original"
                className="max-h-[400px] rounded-lg border border-border object-contain"
              />
              <span className="mt-2 text-xs text-muted">
                {fmtSize(images[previewIdx].originalSize)}
              </span>
            </div>
            <div className="flex flex-col items-center bg-surface p-4">
              <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                Converted ({mimeToLabel(outputFormat)})
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[previewIdx].url}
                alt="Converted"
                className="max-h-[400px] rounded-lg border border-border object-contain"
              />
              <span className="mt-2 text-xs text-[#38d9a9]">
                {fmtSize(images[previewIdx].newSize)}
              </span>
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
              <h3 className="font-display text-sm font-bold tracking-tight text-white">
                {images.length} image{images.length > 1 ? "s" : ""} converted
              </h3>
              <span className="rounded-full bg-[#38d9a9]/10 px-2.5 py-0.5 text-xs font-bold text-[#38d9a9]">
                {Number(savedPct) >= 0
                  ? `Saved ${savedPct}%`
                  : `+${Math.abs(Number(savedPct))}% larger`}
              </span>
              <span className="text-xs text-muted-2">
                {fmtSize(totalOrig)} → {fmtSize(totalNew)}
              </span>
            </div>
            <div className="flex gap-2">
              {images.length > 1 && (
                <button
                  onClick={downloadZip}
                  disabled={zipping}
                  className="rounded-lg bg-[#38d9a9] px-4 py-2 text-xs font-semibold text-[#111118] transition hover:bg-[#2fc49b] disabled:opacity-50"
                >
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

          <div className="divide-y divide-white/5">
            {images.map((img, idx) => (
              <div key={img.id} className="flex items-center gap-4 px-5 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.name}
                  className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {img.name.replace(/\.[^.]+$/, "")}
                    {ext}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-2">
                    {friendlyFormat(img.originalFormat)} →{" "}
                    <span className="text-[#38d9a9]">
                      {mimeToLabel(outputFormat)}
                    </span>{" "}
                    • {img.width}×{img.height}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-muted">
                    {fmtSize(img.originalSize)} →{" "}
                    <span className="font-bold text-[#38d9a9]">
                      {fmtSize(img.newSize)}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => setPreviewIdx(idx)}
                    className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-white transition hover:border-[#6c63ff]/40"
                    title="Preview"
                  >
                    👁
                  </button>
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
        <InfoCard
          icon="🔄"
          title="Universal Converter"
          desc="Convert between JPG, PNG, WebP, and more. Supports BMP, GIF, AVIF, TIFF, SVG input."
        />
        <InfoCard
          icon="🎨"
          title="Full Control"
          desc="Adjust quality, choose output format, and set background colors for transparent images."
        />
        <InfoCard
          icon="🔒"
          title="100% Private"
          desc="All conversions happen in your browser. No images are uploaded anywhere."
        />
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <span className="text-xl">{icon}</span>
      <h4 className="mt-2 text-sm font-semibold text-white">{title}</h4>
      <p className="mt-1 text-xs leading-5 text-muted">{desc}</p>
    </div>
  );
}
