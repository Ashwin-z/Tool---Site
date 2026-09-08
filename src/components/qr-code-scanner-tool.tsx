"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const CAMERA_SCAN_WIDTH = 1280;
const UPLOAD_SCAN_LARGE = 2200;
const UPLOAD_SCAN_SMALL = 1100;

type Mode = "camera" | "upload";

type DetectorResult = { rawValue?: string };
type BarcodeDetectorInstance = {
  detect: (source: ImageBitmapSource) => Promise<DetectorResult[]>;
};
type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance;

function getBarcodeDetectorCtor(): BarcodeDetectorCtor | null {
  const detector = (window as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
  return typeof detector === "function" ? detector : null;
}

async function detectWithBarcodeDetector(source: ImageBitmapSource): Promise<string | null> {
  const Detector = getBarcodeDetectorCtor();
  if (!Detector) return null;

  try {
    const detector = new Detector({ formats: ["qr_code"] });
    const results = await detector.detect(source);
    const match = results.find((item) => typeof item.rawValue === "string" && item.rawValue.trim().length > 0);
    return match?.rawValue?.trim() ?? null;
  } catch {
    return null;
  }
}

function drawSourceToCanvas(
  source: CanvasImageSource,
  canvas: HTMLCanvasElement,
  maxDimension: number
): CanvasRenderingContext2D | null {
  const sourceAny = source as { videoWidth?: number; videoHeight?: number; naturalWidth?: number; naturalHeight?: number; width?: number; height?: number };
  const sourceWidth = sourceAny.videoWidth || sourceAny.naturalWidth || sourceAny.width || 0;
  const sourceHeight = sourceAny.videoHeight || sourceAny.naturalHeight || sourceAny.height || 0;

  if (!sourceWidth || !sourceHeight) return null;

  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
  const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.clearRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
  return ctx;
}

function decodeWithJsQR(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || canvas.width === 0 || canvas.height === 0) return null;

  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });
    return decoded?.data?.trim() || null;
  } catch {
    return null;
  }
}

async function decodeFromVideoFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<string | null> {
  const nativeResult = await detectWithBarcodeDetector(video);
  if (nativeResult) return nativeResult;

  const ctx = drawSourceToCanvas(video, canvas, CAMERA_SCAN_WIDTH);
  if (!ctx) return null;

  const detectorCanvasResult = await detectWithBarcodeDetector(canvas);
  if (detectorCanvasResult) return detectorCanvasResult;

  return decodeWithJsQR(canvas);
}

async function decodeFromImageFile(file: File, canvas: HTMLCanvasElement): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  try {
    const nativeResult = await detectWithBarcodeDetector(bitmap);
    if (nativeResult) return nativeResult;

    for (const size of [UPLOAD_SCAN_LARGE, UPLOAD_SCAN_SMALL]) {
      const ctx = drawSourceToCanvas(bitmap, canvas, size);
      if (!ctx) continue;

      const detectorCanvasResult = await detectWithBarcodeDetector(canvas);
      if (detectorCanvasResult) return detectorCanvasResult;

      const jsqrResult = decodeWithJsQR(canvas);
      if (jsqrResult) return jsqrResult;
    }

    return null;
  } finally {
    bitmap.close();
  }
}

export default function QrCodeScannerTool() {
  const [mode, setMode] = useState<Mode>("camera");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [decoderHint, setDecoderHint] = useState("Using built-in scanner.");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraSupported(false);
    }

    if (getBarcodeDetectorCtor()) {
      setDecoderHint("Using built-in scanner with fallback.");
    } else {
      setDecoderHint("Using compatibility scanner fallback.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    setResult(null);
    setError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraSupported(false);
      setError("Camera access is not supported in this browser.");
      return;
    }

    if (!window.isSecureContext && !/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) {
      setError("Camera requires HTTPS (or localhost). Open this page over a secure connection.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      setScanning(true);

      let busy = false;
      const tick = async () => {
        if (!videoRef.current || !canvasRef.current) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        if (!busy && video.readyState >= 2) {
          busy = true;
          const text = await decodeFromVideoFrame(videoRef.current, canvasRef.current);
          busy = false;

          if (text) {
            setResult(text);
            stopCamera();
            return;
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access and try again.");
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setError("No camera was found on this device.");
      } else {
        setError("Could not access camera. Make sure no other app is using it.");
      }
    }
  }, [stopCamera]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WEBP, etc.).");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image is too large. Please upload an image under 25MB.");
      event.target.value = "";
      return;
    }

    setResult(null);
    setError("");

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setError("Scanner is not ready yet. Please try again.");
        return;
      }

      const text = await decodeFromImageFile(file, canvas);
      if (text) {
        setResult(text);
      } else {
        setError("No QR code detected in the image. Try a clearer or higher-contrast image.");
      }
    } catch {
      setError("Failed to read the image file.");
    } finally {
      event.target.value = "";
    }
  }, []);

  const isUrl = !!result && /^https?:\/\//i.test(result);

  const copyResult = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      setError("Could not copy automatically. Please copy the text manually.");
    }
  }, [result]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">QR Code Scanner</h2>
          <p className="mt-1 text-xs text-muted">Scan QR codes with your camera or upload an image.</p>
        </div>

        <div className="flex border-b border-border">
          <button
            onClick={() => {
              stopCamera();
              setMode("camera");
              setResult(null);
              setError("");
            }}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
              mode === "camera" ? "border-b-2 border-[#6c63ff] text-[#6c63ff]" : "text-muted hover:text-foreground"
            }`}
          >
            Camera
          </button>
          <button
            onClick={() => {
              stopCamera();
              setMode("upload");
              setResult(null);
              setError("");
            }}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
              mode === "upload" ? "border-b-2 border-[#6c63ff] text-[#6c63ff]" : "text-muted hover:text-foreground"
            }`}
          >
            Upload Image
          </button>
        </div>

        <div className="px-5 py-6">
          <p className="mb-3 text-[11px] text-muted-2">{decoderHint}</p>

          {mode === "camera" && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-black">
                <video ref={videoRef} className="aspect-video w-full object-cover" playsInline muted />
                {scanning && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-48 w-48 rounded-2xl border-2 border-[#1ce4b5]/60 shadow-[0_0_30px_rgba(28,228,181,.15)]">
                      <div className="animate-scan h-0.5 w-full bg-[#1ce4b5]/80" />
                    </div>
                  </div>
                )}
                {!scanning && !result && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="text-sm text-muted">Camera preview</span>
                  </div>
                )}
              </div>

              {!scanning && !result && (
                <button
                  onClick={startCamera}
                  disabled={!cameraSupported}
                  className="rounded-xl border border-[#6c63ff]/40 bg-[#6c63ff]/10 px-8 py-3 text-sm font-semibold text-[#6c63ff] transition hover:bg-[#6c63ff]/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Start Scanning
                </button>
              )}

              {scanning && (
                <button
                  onClick={stopCamera}
                  className="rounded-xl border border-red-400/40 bg-red-400/10 px-8 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-400/20"
                >
                  Stop
                </button>
              )}
            </div>
          )}

          {mode === "upload" && (
            <div className="flex flex-col items-center gap-4">
              <label className="flex w-full max-w-md cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface-2 px-6 py-10 transition hover:border-[#6c63ff]/40">
                <span className="text-3xl">Scan</span>
                <span className="text-sm font-semibold text-white">Drop or click to upload a QR code image</span>
                <span className="text-xs text-muted">PNG, JPG, WEBP, GIF supported</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {error && (
            <div className="mt-4 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 rounded-xl border border-[#1ce4b5]/20 bg-[#1ce4b5]/5 p-5">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#1ce4b5]">QR Code Detected</div>
              <div className="break-all font-mono text-sm text-white">{result}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={copyResult}
                  className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-white transition hover:border-border-strong"
                >
                  Copy
                </button>
                {isUrl && (
                  <a
                    href={result}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-[#6c63ff]/40 bg-[#6c63ff]/10 px-4 py-2 text-xs font-semibold text-[#6c63ff] transition hover:bg-[#6c63ff]/20"
                  >
                    Open Link
                  </a>
                )}
                <button
                  onClick={() => {
                    setResult(null);
                    setError("");
                  }}
                  className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-white transition hover:border-border-strong"
                >
                  Scan Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(11.5rem); }
          100% { transform: translateY(0); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="Camera" title="Camera Scan" desc="Point your camera at any QR code for instant detection." />
        <InfoCard icon="Upload" title="Upload Image" desc="Upload a screenshot or photo containing a QR code." />
        <InfoCard icon="Private" title="100% Private" desc="All scanning happens locally in your browser." />
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
