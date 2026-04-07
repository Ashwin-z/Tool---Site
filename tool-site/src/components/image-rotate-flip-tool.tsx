"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import JSZip from "jszip";

/* ── types ── */
interface ProcessedImage {
  id: string;
  name: string;
  originalSize: number;
  newSize: number;
  width: number;
  height: number;
  originalUrl: string;
  url: string;
  blob: Blob;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

/* ── helpers ── */
function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const MAX_FILES = 25;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ACCEPTED = "image/jpeg,image/png,image/webp,image/bmp,image/gif,image/avif,image/tiff";

async function applyTransform(
  dataUrl: string,
  name: string,
  originalSize: number,
  rotation: number,
  flipH: boolean,
  flipV: boolean,
  format: "image/jpeg" | "image/webp" | "image/png",
  quality: number,
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const rad = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const w = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
      const h = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;

      ctx.translate(w / 2, h / 2);
      ctx.rotate(rad);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Transform failed"));
          resolve({
            id: crypto.randomUUID(),
            name,
            originalSize,
            newSize: blob.size,
            width: w,
            height: h,
            originalUrl: dataUrl,
            url: URL.createObjectURL(blob),
            blob,
            rotation,
            flipH,
            flipV,
          });
        },
        format,
        format === "image/png" ? undefined : quality / 100,
      );
    };
    img.onerror = () => reject(new Error("Invalid image"));
    img.src = dataUrl;
  });
}

export default function ImageRotateFlipTool() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  /* Global defaults — used for new uploads + "Apply to All" */
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  /* Format & quality — always global */
  const [format, setFormat] = useState<"image/jpeg" | "image/webp" | "image/png">("image/jpeg");
  const [quality, setQuality] = useState(92);
  /* UI state */
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<ProcessedImage[]>([]);
  const formatRef = useRef(format);
  const qualityRef = useRef(quality);
  imagesRef.current = images;
  formatRef.current = format;
  qualityRef.current = quality;

  /* ── Upload: apply current global rotation/flip to new images ── */
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
              new Promise<ProcessedImage>((res, rej) => {
                const reader = new FileReader();
                reader.onload = async () => {
                  try {
                    const result = await applyTransform(reader.result as string, f.name, f.size, rotation, flipH, flipV, format, quality);
                    res(result);
                  } catch (e) { rej(e); }
                };
                reader.onerror = () => rej(new Error("Read failed"));
                reader.readAsDataURL(f);
              }),
          ),
        );
        setImages((prev) => [...prev, ...results]);
        setPreviewIdx((p) => p ?? 0);
      } catch { /* skip */ } finally { setProcessing(false); }
    },
    [rotation, flipH, flipV, format, quality],
  );

  /* ── Re-process ALL when format/quality change (keeps each image's own rotation/flip) ── */
  useEffect(() => {
    const current = imagesRef.current;
    if (current.length === 0) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setProcessing(true);
      try {
        const results = await Promise.all(
          current.map((img) =>
            applyTransform(img.originalUrl, img.name, img.originalSize, img.rotation, img.flipH, img.flipV, format, quality),
          ),
        );
        if (!cancelled) {
          const ids = current.map((img) => img.id);
          current.forEach((img) => URL.revokeObjectURL(img.url));
          setImages(results.map((r, i) => ({ ...r, id: ids[i] })));
        }
      } catch { /* */ } finally { if (!cancelled) setProcessing(false); }
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, quality]);

  /* ── Per-image transform helpers ── */
  const reprocessImage = useCallback(async (id: string, newRotation: number, newFlipH: boolean, newFlipV: boolean) => {
    const img = imagesRef.current.find((i) => i.id === id);
    if (!img) return;
    try {
      const result = await applyTransform(img.originalUrl, img.name, img.originalSize, newRotation, newFlipH, newFlipV, formatRef.current, qualityRef.current);
      setImages((prev) =>
        prev.map((i) => {
          if (i.id === id) {
            URL.revokeObjectURL(i.url);
            return { ...result, id, originalUrl: i.originalUrl };
          }
          return i;
        }),
      );
    } catch { /* */ }
  }, []);

  const rotateImage = useCallback((id: string, deg: number) => {
    const img = imagesRef.current.find((i) => i.id === id);
    if (!img) return;
    const newRotation = ((img.rotation + deg) % 360 + 360) % 360;
    reprocessImage(id, newRotation, img.flipH, img.flipV);
  }, [reprocessImage]);

  const flipImageH = useCallback((id: string) => {
    const img = imagesRef.current.find((i) => i.id === id);
    if (!img) return;
    reprocessImage(id, img.rotation, !img.flipH, img.flipV);
  }, [reprocessImage]);

  const flipImageV = useCallback((id: string) => {
    const img = imagesRef.current.find((i) => i.id === id);
    if (!img) return;
    reprocessImage(id, img.rotation, img.flipH, !img.flipV);
  }, [reprocessImage]);

  /* ── Apply global settings to ALL images ── */
  const applyToAll = useCallback(async () => {
    const current = imagesRef.current;
    if (current.length === 0) return;
    setProcessing(true);
    try {
      const results = await Promise.all(
        current.map((img) =>
          applyTransform(img.originalUrl, img.name, img.originalSize, rotation, flipH, flipV, format, quality),
        ),
      );
      const ids = current.map((img) => img.id);
      current.forEach((img) => URL.revokeObjectURL(img.url));
      setImages(results.map((r, i) => ({ ...r, id: ids[i] })));
    } catch { /* */ } finally { setProcessing(false); }
  }, [rotation, flipH, flipV, format, quality]);

  const onDrop = useCallback(
    (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); },
    [handleFiles],
  );

  /* ── downloads ── */
  const downloadOne = (img: ProcessedImage) => {
    const ext = format === "image/webp" ? ".webp" : format === "image/png" ? ".png" : ".jpg";
    const baseName = img.name.replace(/\.[^.]+$/, "");
    const tag = `${img.rotation > 0 ? `r${img.rotation}` : ""}${img.flipH ? "fh" : ""}${img.flipV ? "fv" : ""}` || "transformed";
    const a = document.createElement("a");
    a.href = img.url;
    a.download = `${baseName}-${tag}${ext}`;
    a.click();
  };

  const downloadAll = () => images.forEach(downloadOne);

  const downloadZip = async () => {
    if (images.length === 0) return;
    setZipping(true);
    try {
      const ext = format === "image/webp" ? ".webp" : format === "image/png" ? ".png" : ".jpg";
      const zip = new JSZip();
      images.forEach((img) => {
        const baseName = img.name.replace(/\.[^.]+$/, "");
        const tag = `${img.rotation > 0 ? `r${img.rotation}` : ""}${img.flipH ? "fh" : ""}${img.flipV ? "fv" : ""}` || "transformed";
        zip.file(`${baseName}-${tag}${ext}`, img.blob);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `rotated-images-${images.length}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally { setZipping(false); }
  };

  const removeImage = (id: string) => {
    setImages((prev) => { const item = prev.find((i) => i.id === id); if (item) URL.revokeObjectURL(item.url); return prev.filter((i) => i.id !== id); });
    setPreviewIdx(null);
  };

  const clearAll = () => { images.forEach((img) => URL.revokeObjectURL(img.url)); setImages([]); setPreviewIdx(null); };

  const rotateBy = (deg: number) => setRotation((r) => ((r + deg) % 360 + 360) % 360);

  return (
    <div className="space-y-4">
      {/* ── Global settings card ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="p-5">
          {images.length > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#6c63ff]/10 px-3 py-2">
              <span className="text-xs text-[#a39cff]">💡 Use controls below to set defaults for new uploads, or click</span>
              <button
                onClick={applyToAll}
                disabled={processing}
                className="rounded-md bg-[#6c63ff] px-3 py-1 text-[11px] font-bold text-white transition hover:bg-[#5b54e0] disabled:opacity-50"
              >
                Apply to All
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Rotation */}
            <div>
              <label className="mb-3 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Rotation — {rotation}°</label>
              <div className="mb-3 flex flex-wrap gap-2">
                {[
                  { label: "↶ 90° Left", deg: -90 },
                  { label: "↷ 90° Right", deg: 90 },
                  { label: "180°", deg: 180 },
                  { label: "Reset", deg: -rotation },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => btn.label === "Reset" ? setRotation(0) : rotateBy(btn.deg)}
                    className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-white transition hover:border-border-strong hover:text-foreground"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <input type="range" min={0} max={359} step={1} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-2 accent-[#6c63ff]" />
              <div className="mt-1 flex justify-between text-[10px] text-muted-2"><span>0°</span><span>359°</span></div>
            </div>

            {/* Flip & format */}
            <div className="space-y-4">
              <div>
                <label className="mb-3 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Flip</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFlipH((v) => !v)}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${flipH ? "border-[#6c63ff] bg-[#6c63ff]/20 text-[#6c63ff]" : "border-border bg-surface-2 text-white hover:border-border-strong"}`}
                  >
                    ↔ Horizontal
                  </button>
                  <button
                    onClick={() => setFlipV((v) => !v)}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${flipV ? "border-[#6c63ff] bg-[#6c63ff]/20 text-[#6c63ff]" : "border-border bg-surface-2 text-white hover:border-border-strong"}`}
                  >
                    ↕ Vertical
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Format</label>
                  <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6c63ff]/50">
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/webp">WebP</option>
                    <option value="image/png">PNG</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Quality — {quality}%</label>
                  <input type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-2 accent-[#6c63ff]" />
                </div>
              </div>
            </div>
          </div>

          {images.length > 0 && processing && (
            <div className="mt-3 text-center text-xs text-muted">⏳ Re-processing…</div>
          )}
        </div>
      </div>

      {/* ── Drop zone ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition ${dragOver ? "border-[#6c63ff] bg-[#6c63ff]/10" : "border-border bg-surface hover:border-border-strong"}`}
      >
        <input ref={inputRef} type="file" accept={ACCEPTED} multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        <span className="text-4xl">🔄</span>
        <p className="mt-3 text-sm font-semibold text-white">{processing ? "Processing…" : "Drop images here or click to browse"}</p>
        <p className="mt-1 text-xs text-muted-2">JPG, PNG, WebP, BMP, GIF, AVIF, TIFF • Max {MAX_FILES} images</p>
      </div>

      {limitWarning && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          ⚠️ {limitWarning}
        </div>
      )}

      {/* ── Before / After preview ── */}
      {previewIdx !== null && images[previewIdx] && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="font-display text-sm font-bold text-white">Preview — {images[previewIdx].name}</h3>
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
                    onClick={() => setPreviewIdx(Math.min(images.length - 1, (previewIdx ?? 0) + 1))}
                    disabled={previewIdx === images.length - 1}
                    className="rounded-md border border-border bg-surface-2 px-2 py-1 text-xs text-white transition hover:border-border-strong disabled:opacity-30"
                  >
                    Next ›
                  </button>
                </div>
              )}
              <button onClick={() => setPreviewIdx(null)} className="text-xs text-muted-2 hover:text-foreground">✕ Close</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px bg-surface-3/50">
            <div className="flex flex-col items-center bg-surface p-4">
              <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-2">Original</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[previewIdx].originalUrl} alt="Original" className="max-h-[400px] rounded-lg border border-border object-contain" />
              <span className="mt-2 text-xs text-muted">{fmtSize(images[previewIdx].originalSize)}</span>
            </div>
            <div className="flex flex-col items-center bg-surface p-4">
              <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-2">Transformed</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[previewIdx].url} alt="Transformed" className="max-h-[400px] rounded-lg border border-border object-contain" />
              <span className="mt-2 text-xs text-[#38d9a9]">{fmtSize(images[previewIdx].newSize)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Results with per-image controls ── */}
      {images.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
              <h3 className="font-display text-sm font-bold tracking-tight text-white">{images.length} image{images.length > 1 ? "s" : ""} transformed</h3>
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
              <div key={img.id} className="px-5 py-3">
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.name} className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover" />

                  {/* Name & current settings */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{img.name}</p>
                    <p className="mt-0.5 text-xs text-muted-2">
                      {img.width}×{img.height}
                      {img.rotation > 0 && <span className="ml-1 text-[#6c63ff]">↻{img.rotation}°</span>}
                      {img.flipH && <span className="ml-1 text-[#6c63ff]">↔</span>}
                      {img.flipV && <span className="ml-1 text-[#6c63ff]">↕</span>}
                    </p>
                  </div>

                  {/* Sizes */}
                  <div className="hidden text-right sm:block">
                    <p className="text-xs text-muted">{fmtSize(img.originalSize)} → <span className="font-bold text-white">{fmtSize(img.newSize)}</span></p>
                  </div>

                  {/* Preview / Download / Remove */}
                  <div className="flex shrink-0 gap-1.5">
                    <button onClick={() => setPreviewIdx(idx)} className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-white transition hover:border-[#6c63ff]/40" title="Preview">👁</button>
                    <button onClick={() => downloadOne(img)} className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-white transition hover:border-[#6c63ff]/40" title="Download">⬇</button>
                    <button onClick={() => removeImage(img.id)} className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-white transition hover:border-red-400/40" title="Remove">✕</button>
                  </div>
                </div>

                {/* Per-image transform controls */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-[72px]">
                  <button
                    onClick={() => rotateImage(img.id, -90)}
                    className="rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] font-semibold text-muted transition hover:border-[#6c63ff]/40 hover:text-foreground"
                    title="Rotate 90° Left"
                  >
                    ↶ 90°
                  </button>
                  <button
                    onClick={() => rotateImage(img.id, 90)}
                    className="rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] font-semibold text-muted transition hover:border-[#6c63ff]/40 hover:text-foreground"
                    title="Rotate 90° Right"
                  >
                    ↷ 90°
                  </button>
                  <button
                    onClick={() => rotateImage(img.id, 180)}
                    className="rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] font-semibold text-muted transition hover:border-[#6c63ff]/40 hover:text-foreground"
                    title="Rotate 180°"
                  >
                    180°
                  </button>
                  <div className="mx-1 h-4 w-px bg-surface-3" />
                  <button
                    onClick={() => flipImageH(img.id)}
                    className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                      img.flipH
                        ? "border-[#6c63ff]/60 bg-[#6c63ff]/20 text-[#6c63ff]"
                        : "border-border bg-surface-2 text-muted hover:border-[#6c63ff]/40 hover:text-foreground"
                    }`}
                    title="Flip Horizontal"
                  >
                    ↔ Flip H
                  </button>
                  <button
                    onClick={() => flipImageV(img.id)}
                    className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                      img.flipV
                        ? "border-[#6c63ff]/60 bg-[#6c63ff]/20 text-[#6c63ff]"
                        : "border-border bg-surface-2 text-muted hover:border-[#6c63ff]/40 hover:text-foreground"
                    }`}
                    title="Flip Vertical"
                  >
                    ↕ Flip V
                  </button>
                  {(img.rotation !== 0 || img.flipH || img.flipV) && (
                    <>
                      <div className="mx-1 h-4 w-px bg-surface-3" />
                      <button
                        onClick={() => reprocessImage(img.id, 0, false, false)}
                        className="rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] font-semibold text-[#ff6584] transition hover:border-red-400/40 hover:text-[#ff8da6]"
                        title="Reset transforms"
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="🔄" title="Per-Image Control" desc="Rotate and flip each image individually with inline controls, or apply settings to all at once." />
        <InfoCard icon="↔️" title="Flip & Mirror" desc="Flip images horizontally, vertically, or both. Combine with rotation for any orientation." />
        <InfoCard icon="🔒" title="100% Private" desc="All transformations run in your browser. No images are uploaded or stored anywhere." />
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
