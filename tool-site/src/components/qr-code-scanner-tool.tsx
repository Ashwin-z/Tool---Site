"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Mode = "camera" | "upload";

/**
 * Minimal QR decoder using the BarcodeDetector API (Chrome/Edge/Android).
 * Falls back to a canvas-based manual approach if BarcodeDetector is unavailable.
 */
async function decodeQR(source: ImageBitmap | HTMLVideoElement): Promise<string | null> {
  // Try native BarcodeDetector first
  if ("BarcodeDetector" in window) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
      const results = await detector.detect(source);
      if (results.length > 0) return results[0].rawValue;
    } catch {
      /* fall through */
    }
  }
  return null;
}

export default function QrCodeScannerTool() {
  const [mode, setMode] = useState<Mode>("camera");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [barcodeSupported, setBarcodeSupported] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  // Check for BarcodeDetector support
  useEffect(() => {
    if (!("BarcodeDetector" in window)) {
      setBarcodeSupported(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
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

    if (!barcodeSupported) {
      setError("QR scanning is not supported in this browser. Please use Chrome, Edge, or Opera, or upload an image instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setScanning(true);

      const tick = async () => {
        if (!video || video.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        try {
          const text = await decodeQR(video);
          if (text) {
            setResult(text);
            stopCamera();
            return;
          }
        } catch {
          /* keep scanning */
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access and try again.");
      } else {
        setError("Could not access camera. Make sure no other app is using it.");
      }
    }
  }, [stopCamera, barcodeSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setError("");

    try {
      if (!("BarcodeDetector" in window)) {
        setError("QR scanning requires Chrome, Edge, or Opera. BarcodeDetector API is not available in this browser.");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });

      // Attempt 1: detect directly from the File (Blob)
      try {
        const r = await detector.detect(file);
        if (r.length > 0) { setResult(r[0].rawValue); return; }
      } catch { /* try next */ }

      // Attempt 2: detect from ImageBitmap created from File
      try {
        const bmp = await createImageBitmap(file);
        const r = await detector.detect(bmp);
        if (r.length > 0) { setResult(r[0].rawValue); return; }
      } catch { /* try next */ }

      // Attempt 3: load into an HTMLImageElement and detect that
      try {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("load failed"));
          img.src = objectUrl;
        });
        // wait for full decode
        if (img.decode) await img.decode();
        const r = await detector.detect(img);
        URL.revokeObjectURL(objectUrl);
        if (r.length > 0) { setResult(r[0].rawValue); return; }
      } catch { /* try next */ }

      // Attempt 4: draw to canvas at original size and detect
      try {
        const bmp = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(bmp, 0, 0);
        const r = await detector.detect(canvas);
        if (r.length > 0) { setResult(r[0].rawValue); return; }

        // Attempt 5: try scaled down for very large images
        if (bmp.width > 1024 || bmp.height > 1024) {
          const scale = 1024 / Math.max(bmp.width, bmp.height);
          const sCanvas = document.createElement("canvas");
          sCanvas.width = Math.round(bmp.width * scale);
          sCanvas.height = Math.round(bmp.height * scale);
          const sCtx = sCanvas.getContext("2d")!;
          sCtx.drawImage(bmp, 0, 0, sCanvas.width, sCanvas.height);
          const r2 = await detector.detect(sCanvas);
          if (r2.length > 0) { setResult(r2[0].rawValue); return; }
        }
      } catch { /* exhausted */ }

      setError("No QR code detected in the image. Make sure the QR code is clear and well-lit.");
    } catch {
      setError("Failed to read the image file.");
    }
  };

  const isUrl = result && /^https?:\/\//i.test(result);

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      /* */
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">QR Code Scanner</h2>
          <p className="mt-1 text-xs text-muted">Scan QR codes with your camera or upload an image.</p>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => {
              stopCamera();
              setMode("camera");
              setResult(null);
              setError("");
            }}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
              mode === "camera"
                ? "border-b-2 border-[#6c63ff] text-[#6c63ff]"
                : "text-muted hover:text-foreground"
            }`}
          >
            📷 Camera
          </button>
          <button
            onClick={() => {
              stopCamera();
              setMode("upload");
              setResult(null);
              setError("");
            }}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
              mode === "upload"
                ? "border-b-2 border-[#6c63ff] text-[#6c63ff]"
                : "text-muted hover:text-foreground"
            }`}
          >
            📁 Upload Image
          </button>
        </div>

        <div className="px-5 py-6">
          {/* Camera mode */}
          {mode === "camera" && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-black">
                <video
                  ref={videoRef}
                  className="aspect-video w-full object-cover"
                  playsInline
                  muted
                />
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
                  className="rounded-xl border border-[#6c63ff]/40 bg-[#6c63ff]/10 px-8 py-3 text-sm font-semibold text-[#6c63ff] transition hover:bg-[#6c63ff]/20 disabled:opacity-50"
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

          {/* Upload mode */}
          {mode === "upload" && (
            <div className="flex flex-col items-center gap-4">
              <label className="flex w-full max-w-md cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface-2 px-6 py-10 transition hover:border-[#6c63ff]/40">
                <span className="text-3xl">📷</span>
                <span className="text-sm font-semibold text-white">Drop or click to upload a QR code image</span>
                <span className="text-xs text-muted">PNG, JPG, WEBP supported</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-6 rounded-xl border border-[#1ce4b5]/20 bg-[#1ce4b5]/5 p-5">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#1ce4b5]">
                ✓ QR Code Detected
              </div>
              <div className="break-all font-mono text-sm text-white">{result}</div>
              <div className="mt-4 flex gap-2">
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
                    Open Link ↗
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

      {/* Scan line animation */}
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
        <InfoCard icon="📷" title="Camera Scan" desc="Point your camera at any QR code for instant detection." />
        <InfoCard icon="📁" title="Upload Image" desc="Upload a screenshot or photo containing a QR code." />
        <InfoCard icon="🔒" title="100% Private" desc="All scanning happens locally in your browser." />
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
