"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

type ErrorCorrection = "L" | "M" | "Q" | "H";

const MAX_TEXT_LENGTH = 3000;

function normalizeHexColor(value: string, fallback: string): string {
  const trimmed = value.trim();
  const shortHex = /^#[0-9A-Fa-f]{3}$/;
  const fullHex = /^#[0-9A-Fa-f]{6}$/;
  if (shortHex.test(trimmed) || fullHex.test(trimmed)) return trimmed;
  return fallback;
}

export default function QrCodeGeneratorTool() {
  const [text, setText] = useState("https://toolmint.tools");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrection>("M");
  const [size] = useState(320);

  const [svgContent, setSvgContent] = useState("");
  const [pngDataUrl, setPngDataUrl] = useState("");
  const [error, setError] = useState("");

  const byteLength = useMemo(() => new TextEncoder().encode(text).length, [text]);

  const generate = useCallback(async () => {
    const payload = text.trim();
    if (!payload) {
      setSvgContent("");
      setPngDataUrl("");
      setError("Enter text or a URL to generate a QR code.");
      return;
    }

    if (payload.length > MAX_TEXT_LENGTH) {
      setSvgContent("");
      setPngDataUrl("");
      setError("Input is too long. Please shorten your text.");
      return;
    }

    const dark = normalizeHexColor(fgColor, "#000000");
    const light = normalizeHexColor(bgColor, "#FFFFFF");

    try {
      const [svg, png] = await Promise.all([
        QRCode.toString(payload, {
          type: "svg",
          width: size,
          margin: 2,
          errorCorrectionLevel: errorCorrection,
          color: { dark, light },
        }),
        QRCode.toDataURL(payload, {
          width: size * 2,
          margin: 2,
          errorCorrectionLevel: errorCorrection,
          color: { dark, light },
        }),
      ]);

      setSvgContent(svg);
      setPngDataUrl(png);
      setError("");
    } catch {
      setSvgContent("");
      setPngDataUrl("");
      setError("Could not generate QR code for this input. Try shortening or simplifying the content.");
    }
  }, [bgColor, errorCorrection, fgColor, size, text]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await generate();
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
  }, [generate]);

  const downloadPNG = useCallback(() => {
    if (!pngDataUrl) return;
    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = pngDataUrl;
    link.click();
  }, [pngDataUrl]);

  const downloadSVG = useCallback(() => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "qr-code.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [svgContent]);

  const copyToClipboard = useCallback(async () => {
    if (!pngDataUrl) return;

    try {
      const response = await fetch(pngDataUrl);
      const pngBlob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": pngBlob }),
      ]);
    } catch {
      try {
        await navigator.clipboard.writeText(text.trim());
      } catch {
        setError("Clipboard copy is blocked in this browser. Please use Download instead.");
      }
    }
  }, [pngDataUrl, text]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">QR Code Generator</h2>
          <p className="mt-1 text-xs text-muted">Generate QR codes from text, URLs, or any content.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 px-5 py-5 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Text or URL</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="Enter text, URL, email, phone number..."
                className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 font-mono text-sm text-white outline-none placeholder:text-white/20 focus:border-[#6c63ff]/50"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-muted-2">
                <span>ECC: {errorCorrection}</span>
                <span>{byteLength} bytes</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Foreground</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={normalizeHexColor(fgColor, "#000000")}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent"
                  />
                  <input
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-white outline-none focus:border-[#6c63ff]/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={normalizeHexColor(bgColor, "#FFFFFF")}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent"
                  />
                  <input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-white outline-none focus:border-[#6c63ff]/50"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Error Correction</label>
              <select
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value as ErrorCorrection)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-[#6c63ff]/50"
              >
                <option value="L">L (faster, less recovery)</option>
                <option value="M">M (balanced)</option>
                <option value="Q">Q (better recovery)</option>
                <option value="H">H (highest recovery)</option>
              </select>
            </div>

            {error && (
              <div className="rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-400">{error}</div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex min-h-[220px] min-w-[220px] items-center justify-center rounded-xl border border-border bg-white p-4">
              {svgContent ? (
                <div dangerouslySetInnerHTML={{ __html: svgContent }} />
              ) : (
                <span className="text-sm text-gray-400">Enter text to generate</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={downloadPNG}
                disabled={!pngDataUrl}
                className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-white transition hover:border-border-strong disabled:opacity-40"
              >
                Download PNG
              </button>
              <button
                onClick={downloadSVG}
                disabled={!svgContent}
                className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-white transition hover:border-border-strong disabled:opacity-40"
              >
                Download SVG
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!pngDataUrl}
                className="rounded-lg border border-[#6c63ff]/40 bg-[#6c63ff]/10 px-4 py-2 text-xs font-semibold text-[#6c63ff] transition hover:bg-[#6c63ff]/20 disabled:opacity-40"
              >
                Copy Image
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="Fast" title="Instant" desc="QR code generates as you type with local processing." />
        <InfoCard icon="Style" title="Customizable" desc="Pick custom foreground/background and error-correction level." />
        <InfoCard icon="Export" title="Export" desc="Download as PNG or SVG, or copy to clipboard." />
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
