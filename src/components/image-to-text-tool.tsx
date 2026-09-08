"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════
   IMAGE TO TEXT (OCR) TOOL
   – Drag-drop / paste / browse image
   – Client-side OCR via Tesseract.js
   – Multi-language support
   – Copy / download extracted text
   ═══════════════════════════════════════════════════════ */

const LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "hin", label: "Hindi" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "por", label: "Portuguese" },
  { code: "ita", label: "Italian" },
  { code: "jpn", label: "Japanese" },
  { code: "kor", label: "Korean" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
  { code: "chi_tra", label: "Chinese (Traditional)" },
  { code: "ara", label: "Arabic" },
  { code: "rus", label: "Russian" },
  { code: "urd", label: "Urdu" },
  { code: "tha", label: "Thai" },
  { code: "vie", label: "Vietnamese" },
  { code: "nld", label: "Dutch" },
  { code: "pol", label: "Polish" },
  { code: "tur", label: "Turkish" },
  { code: "ben", label: "Bengali" },
] as const;

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read the uploaded image."));
    image.src = src;
  });
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not prepare the image for OCR."));
        return;
      }
      resolve(blob);
    }, type);
  });
}

async function preprocessImageForOcr(file: File): Promise<Blob> {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageElement(sourceUrl);
    const longestEdge = Math.max(image.naturalWidth, image.naturalHeight, 1);
    const scale = Math.min(3, Math.max(1.8, 2200 / longestEdge));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("Could not prepare the image for OCR.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    let minLuma = 255;
    let maxLuma = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const luma = pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114;
      if (luma < minLuma) minLuma = luma;
      if (luma > maxLuma) maxLuma = luma;
    }

    const lumaRange = Math.max(1, maxLuma - minLuma);
    const contrast = 42;
    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let index = 0; index < pixels.length; index += 4) {
      const luma = pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114;
      const normalized = ((luma - minLuma) / lumaRange) * 255;
      const contrasted = contrastFactor * (normalized - 128) + 128;
      const clamped = Math.max(0, Math.min(255, contrasted));
      pixels[index] = clamped;
      pixels[index + 1] = clamped;
      pixels[index + 2] = clamped;
      pixels[index + 3] = 255;
    }

    context.putImageData(imageData, 0, 0);
    return await canvasToBlob(canvas, "image/png");
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export default function ImageToTextTool() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState("eng");
  const [extractedText, setExtractedText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "recognizing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<import("tesseract.js").Worker | null>(null);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      void workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [imageUrl]);

  /* ── load image ── */
  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (JPG, PNG, BMP, WebP, GIF).");
      setStatus("error");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(`File too large (${fmtSize(file.size)}). Maximum is ${fmtSize(MAX_FILE_SIZE)}.`);
      setStatus("error");
      return;
    }
    // Revoke previous URL
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImageUrl(url);
    setExtractedText("");
    setStatus("idle");
    setErrorMsg("");
    setProgress(0);
    setWordCount(0);
    setCharCount(0);
    setConfidence(0);
  }, [imageUrl]);

  /* ── OCR extraction ── */
  const extractText = useCallback(async () => {
    if (!imageFile) return;
    setStatus("loading");
    setProgress(0);
    setExtractedText("");
    setErrorMsg("");

    try {
      const Tesseract = await import("tesseract.js");
      const preparedImage = await preprocessImageForOcr(imageFile);
      let useDirectRecognizeFallback = false;

      // Terminate previous worker if any
      if (workerRef.current) {
        await workerRef.current.terminate();
        workerRef.current = null;
      }

      const logger = (message: { status: string; progress: number }) => {
        if (message.status === "recognizing text") {
          setStatus("recognizing");
          setProgress(Math.round(message.progress * 100));
        } else {
          setStatus("loading");
          setProgress(Math.round(message.progress * 100));
        }
      };

      let worker: Awaited<ReturnType<typeof Tesseract.createWorker>> | null = null;
      try {
        worker = await Tesseract.createWorker(language, undefined, { logger });
        workerRef.current = worker;
        await worker.setParameters({
          preserve_interword_spaces: "1",
          tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
          user_defined_dpi: "300",
        });
      } catch {
        useDirectRecognizeFallback = true;
      }

      const { data } = useDirectRecognizeFallback
        ? await Tesseract.recognize(preparedImage, language, {
            logger,
          })
        : await worker!.recognize(preparedImage);

      setExtractedText(data.text);
      setConfidence(Math.round(data.confidence));

      const text = data.text.trim();
      setWordCount(text ? text.split(/\s+/).length : 0);
      setCharCount(text.length);
      setStatus("done");

      if (worker) {
        await worker.terminate();
        workerRef.current = null;
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "OCR extraction failed.");
      setStatus("error");
    }
  }, [imageFile, language]);

  /* ── file handlers ── */
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) loadImage(file);
    },
    [loadImage],
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) loadImage(file);
          return;
        }
      }
    },
    [loadImage],
  );

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadImage(file);
    },
    [loadImage],
  );

  /* ── copy / download ── */
  const copyText = useCallback(async () => {
    await navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [extractedText]);

  const downloadText = useCallback(() => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${imageFile?.name.replace(/\.[^.]+$/, "") || "extracted"}-text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [extractedText, imageFile]);

  const reset = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageFile(null);
    setImageUrl(null);
    setExtractedText("");
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
    setWordCount(0);
    setCharCount(0);
    setConfidence(0);
    if (inputRef.current) inputRef.current.value = "";
  }, [imageUrl]);

  const isProcessing = status === "loading" || status === "recognizing";

  return (
    <div className="space-y-4" onPaste={onPaste}>
      {/* ── Upload area ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">
            Upload Image
          </h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-white outline-none transition focus:border-[#6c63ff]/60"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {!imageUrl ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`m-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-16 transition ${
              dragOver
                ? "border-[#6c63ff] bg-[#6c63ff]/10"
                : "border-border bg-surface-2/50 hover:border-[#6c63ff]/40"
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/15 text-3xl">
              📷
            </div>
            <div className="text-sm font-semibold text-white">
              Drop an image here, paste from clipboard, or click to browse
            </div>
            <div className="text-[11px] text-muted-2">
              JPG, PNG, BMP, WebP, GIF • Max {fmtSize(MAX_FILE_SIZE)}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={onFileInput}
              className="hidden"
            />
          </div>
        ) : (
          <div className="p-4">
            {/* Preview + info */}
            <div className="flex flex-wrap items-start gap-4">
              <div className="relative shrink-0 overflow-hidden rounded-xl border border-border bg-[#0a0a10]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-64 max-w-full object-contain"
                />
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="font-semibold text-white">{imageFile?.name}</div>
                <div className="text-xs text-muted">{fmtSize(imageFile?.size ?? 0)}</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={extractText}
                    disabled={isProcessing}
                    className="rounded-lg bg-[#6c63ff] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#5b53ee] active:scale-95 disabled:opacity-50"
                  >
                    {isProcessing ? "Processing…" : "Extract Text"}
                  </button>
                  <button
                    onClick={reset}
                    disabled={isProcessing}
                    className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            {isProcessing && (
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted">
                    {status === "loading" ? "Loading language data…" : "Recognizing text…"}
                  </span>
                  <span className="font-semibold text-[#6c63ff]">{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#38d9a9] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {status === "error" && errorMsg && (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-5 py-3 text-sm text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* ── Extracted Text ── */}
      {(status === "done" || extractedText) && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold tracking-tight text-white">
              <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
              Extracted Text
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={copyText}
                className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-foreground"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
              <button
                onClick={downloadText}
                className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-foreground"
              >
                Download .txt
              </button>
            </div>
          </div>

          <div className="px-5 py-4">
            {extractedText.trim() ? (
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-surface-2 p-4 font-sans text-sm leading-7 text-foreground/85">
                {extractedText}
              </pre>
            ) : (
              <p className="text-sm text-muted-2">No text detected in this image.</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-px border-t border-border bg-surface-3/50">
            <StatCell label="Words" value={wordCount.toLocaleString()} />
            <StatCell label="Characters" value={charCount.toLocaleString()} />
            <StatCell label="Confidence" value={`${confidence}%`} />
          </div>
        </div>
      )}

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard
          icon="🔍"
          title="Powered by Tesseract.js"
          desc="Industry-leading open-source OCR engine running entirely in your browser. Supports 100+ languages."
        />
        <InfoCard
          icon="📋"
          title="Paste from Clipboard"
          desc="Take a screenshot and press Ctrl+V (or ⌘+V on Mac) to paste directly — no file saving needed."
        />
        <InfoCard
          icon="🔒"
          title="100% Private"
          desc="All OCR processing happens locally in your browser. No images are uploaded to any server."
        />
      </div>
    </div>
  );
}

/* ── sub-components ── */

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className="mt-1 font-display text-lg font-bold text-white">{value}</div>
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
