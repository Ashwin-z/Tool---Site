"use client";

import { useCallback, useMemo, useRef, useState } from "react";

type RGB = { r: number; g: number; b: number };

type HSL = { h: number; s: number; l: number };

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function pad2(hex: string) {
  return hex.padStart(2, "0");
}

function rgbToHex({ r, g, b }: RGB) {
  const rr = pad2(clamp(Math.round(r), 0, 255).toString(16));
  const gg = pad2(clamp(Math.round(g), 0, 255).toString(16));
  const bb = pad2(clamp(Math.round(b), 0, 255).toString(16));
  return `#${rr}${gg}${bb}`.toUpperCase();
}

function parseHex(input: string): RGB | null {
  const raw = input.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]+$/.test(raw)) return null;
  if (raw.length === 3) {
    const r = parseInt(raw[0] + raw[0], 16);
    const g = parseInt(raw[1] + raw[1], 16);
    const b = parseInt(raw[2] + raw[2], 16);
    return { r, g, b };
  }
  if (raw.length === 6) {
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rr = clamp(r, 0, 255) / 255;
  const gg = clamp(g, 0, 255) / 255;
  const bb = clamp(b, 0, 255) / 255;

  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rr:
        h = ((gg - bb) / delta) % 6;
        break;
      case gg:
        h = (bb - rr) / delta + 2;
        break;
      case bb:
        h = (rr - gg) / delta + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const hh = ((h % 360) + 360) % 360;
  const ss = clamp(s, 0, 100) / 100;
  const ll = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hh < 60) {
    r1 = c;
    g1 = x;
  } else if (hh < 120) {
    r1 = x;
    g1 = c;
  } else if (hh < 180) {
    g1 = c;
    b1 = x;
  } else if (hh < 240) {
    g1 = x;
    b1 = c;
  } else if (hh < 300) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function rgbString(rgb: RGB) {
  const r = clamp(Math.round(rgb.r), 0, 255);
  const g = clamp(Math.round(rgb.g), 0, 255);
  const b = clamp(Math.round(rgb.b), 0, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

function hslString(hsl: HSL) {
  const h = clamp(Math.round(hsl.h), 0, 360);
  const s = clamp(Math.round(hsl.s), 0, 100);
  const l = clamp(Math.round(hsl.l), 0, 100);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export default function ColorConverterTool() {
  const [hex, setHex] = useState("#6C63FF");
  const parsed = useMemo(() => parseHex(hex), [hex]);

  const rgb = useMemo<RGB>(() => parsed ?? { r: 108, g: 99, b: 255 }, [parsed]);
  const hsl = useMemo(() => rgbToHsl(rgb), [rgb]);

  const setRgb = (next: RGB) => {
    setHex(rgbToHex(next));
  };

  const setHsl = (next: HSL) => {
    setHex(rgbToHex(hslToRgb(next)));
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* */
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div>
            <h2 className="font-display text-sm font-bold tracking-tight text-white">Color Converter</h2>
            <p className="mt-1 text-xs text-muted">Convert between HEX, RGB, and HSL.</p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg border border-border"
              style={{ background: rgbString(rgb) }}
              title={rgbString(rgb)}
            />
            <div className="text-right">
              <div className="text-xs text-muted">Preview</div>
              <div className="font-mono text-xs text-white/70">{rgbToHex(rgb)}</div>
            </div>
          </div>
        </div>

        {/* Color Picker Gradient */}
        <div className="border-b border-border px-5 py-4">
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Pick a Color</label>
          <ColorPickerGradient hsl={hsl} onChange={setHsl} />
        </div>

        <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-3">
          <Field label="HEX">
            <div className="flex gap-2">
              <input
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 font-mono text-sm font-bold text-white outline-none focus:border-[#6c63ff]/50"
                placeholder="#RRGGBB"
              />
              <button
                onClick={() => copy(rgbToHex(rgb))}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-xs font-semibold text-white transition hover:border-border-strong"
              >
                Copy
              </button>
            </div>
            {!parsed && (
              <div className="mt-1 text-[11px] text-amber-300">Enter a valid HEX color like #09F or #0099FF.</div>
            )}
          </Field>

          <Field label="RGB">
            <div className="grid grid-cols-3 gap-2">
              <NumInput label="R" value={rgb.r} onChange={(v) => setRgb({ ...rgb, r: v })} min={0} max={255} />
              <NumInput label="G" value={rgb.g} onChange={(v) => setRgb({ ...rgb, g: v })} min={0} max={255} />
              <NumInput label="B" value={rgb.b} onChange={(v) => setRgb({ ...rgb, b: v })} min={0} max={255} />
            </div>
            <button
              onClick={() => copy(rgbString(rgb))}
              className="mt-2 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-xs font-semibold text-white transition hover:border-border-strong"
            >
              Copy rgb(...)
            </button>
          </Field>

          <Field label="HSL">
            <div className="grid grid-cols-3 gap-2">
              <NumInput
                label="H"
                value={hsl.h}
                onChange={(v) => setRgb(hslToRgb({ ...hsl, h: v }))}
                min={0}
                max={360}
              />
              <NumInput
                label="S"
                value={hsl.s}
                onChange={(v) => setRgb(hslToRgb({ ...hsl, s: v }))}
                min={0}
                max={100}
              />
              <NumInput
                label="L"
                value={hsl.l}
                onChange={(v) => setRgb(hslToRgb({ ...hsl, l: v }))}
                min={0}
                max={100}
              />
            </div>
            <button
              onClick={() => copy(hslString(hsl))}
              className="mt-2 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-xs font-semibold text-white transition hover:border-border-strong"
            >
              Copy hsl(...)
            </button>
          </Field>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="🎨" title="HEX" desc="#RRGGBB and #RGB inputs supported." />
        <InfoCard icon="🧪" title="RGB" desc="Great for CSS and UI work." />
        <InfoCard icon="🌈" title="HSL" desc="Handy for hue and lightness tuning." />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</label>
      {children}
    </div>
  );
}

function NumInput({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(parseFloat(e.target.value), min, max))}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-[#6c63ff]/50"
      />
    </div>
  );
}

function ColorPickerGradient({ hsl, onChange }: { hsl: HSL; onChange: (hsl: HSL) => void }) {
  const satLightRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"sl" | "hue" | null>(null);

  const handleSLMove = useCallback(
    (clientX: number, clientY: number) => {
      const el = satLightRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clamp((clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((clientY - rect.top) / rect.height, 0, 1);
      onChange({ h: hsl.h, s: Math.round(x * 100), l: Math.round((1 - y) * 100) });
    },
    [hsl.h, onChange]
  );

  const handleHueMove = useCallback(
    (clientX: number) => {
      const el = hueRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clamp((clientX - rect.left) / rect.width, 0, 1);
      onChange({ h: Math.round(x * 360), s: hsl.s, l: hsl.l });
    },
    [hsl.s, hsl.l, onChange]
  );

  const onPointerDownSL = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging("sl");
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleSLMove(e.clientX, e.clientY);
  };

  const onPointerDownHue = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging("hue");
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleHueMove(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging === "sl") handleSLMove(e.clientX, e.clientY);
    else if (dragging === "hue") handleHueMove(e.clientX);
  };

  const onPointerUp = () => setDragging(null);

  const pureHue = `hsl(${hsl.h}, 100%, 50%)`;

  return (
    <div className="space-y-3">
      {/* Saturation / Lightness area */}
      <div
        ref={satLightRef}
        className="relative h-48 w-full cursor-crosshair overflow-hidden rounded-xl border border-border"
        style={{ background: pureHue }}
        onPointerDown={onPointerDownSL}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* white → transparent overlay (left to right = no saturation to full saturation isn't quite right
             for HSL, so we simulate: white overlay for lightness, dark overlay for darkness) */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #fff, transparent)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #000, transparent)" }} />
        {/* Thumb */}
        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_4px_rgba(0,0,0,.6)]"
          style={{
            left: `${hsl.s}%`,
            top: `${100 - hsl.l}%`,
          }}
        />
      </div>

      {/* Hue slider */}
      <div
        ref={hueRef}
        className="relative h-5 w-full cursor-pointer overflow-hidden rounded-full border border-border"
        style={{
          background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
        }}
        onPointerDown={onPointerDownHue}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_4px_rgba(0,0,0,.6)]"
          style={{ left: `${(hsl.h / 360) * 100}%` }}
        />
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
