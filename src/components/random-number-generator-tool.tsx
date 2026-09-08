"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Mode = "integer" | "decimal" | "dice" | "coin" | "list";

interface IntegerOpts { min: number; max: number; count: number }
interface DecimalOpts { min: number; max: number; decimals: number; count: number }
interface ListOpts { items: string; picks: number; allowDuplicates: boolean }

function randInt(min: number, max: number): number {
  const range = max - min + 1;
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return min + (arr[0] % range);
}

function randFloat(min: number, max: number, decimals: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  const t = arr[0] / 0xFFFFFFFF;
  return Number((min + t * (max - min)).toFixed(decimals));
}

function pickFromList(items: string[], picks: number, allowDuplicates: boolean): string[] {
  if (!items.length) return [];
  if (allowDuplicates) {
    return Array.from({ length: picks }, () => items[randInt(0, items.length - 1)]);
  }
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(picks, shuffled.length));
}

/* ────────────────────────────────────────────
   Visual dice face — SVG dot patterns (1-6)
   For sides > 6 we show the number instead
   ──────────────────────────────────────────── */
const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 28], [72, 28], [28, 50], [72, 50], [28, 72], [72, 72]],
};

function DiceFace({ value, rolling, sides }: { value: number; rolling: boolean; sides: number }) {
  const showDots = sides <= 6 && value >= 1 && value <= 6;
  return (
    <div
      className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-border-strong bg-surface-2 shadow-[0_4px_20px_rgba(0,0,0,.5)] transition-transform duration-500 ${
        rolling ? "animate-dice-roll" : ""
      }`}
    >
      {showDots ? (
        <svg viewBox="0 0 100 100" className="h-full w-full p-2">
          {DOT_POSITIONS[value].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={9} fill="white" />
          ))}
        </svg>
      ) : (
        <span className="font-mono text-2xl font-black text-white">{value}</span>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   Visual coin — heads / tails with flip anim
   ──────────────────────────────────────────── */
function CoinFace({ value, flipping }: { value: "Heads" | "Tails"; flipping: boolean }) {
  const isHeads = value === "Heads";
  return (
    <div
      className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[3px] shadow-[0_4px_20px_rgba(0,0,0,.5)] transition-transform duration-600 ${
        isHeads
          ? "border-[#ffa640]/60 bg-gradient-to-br from-[#ffa640] to-[#e68a00]"
          : "border-[#6c63ff]/60 bg-gradient-to-br from-[#6c63ff] to-[#4b44cc]"
      } ${flipping ? "animate-coin-flip" : ""}`}
    >
      {/* inner ring */}
      <div
        className={`absolute inset-2 rounded-full border-2 ${
          isHeads ? "border-[#ffcc80]/40" : "border-[#a5a0ff]/30"
        }`}
      />
      <span className="relative z-10 text-center text-[10px] font-black uppercase leading-tight tracking-wider text-white">
        {isHeads ? "H" : "T"}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────── */
export default function RandomNumberGeneratorTool() {
  const [mode, setMode] = useState<Mode>("integer");
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [animating, setAnimating] = useState(false);

  /* integer opts */
  const [intOpts, setIntOpts] = useState<IntegerOpts>({ min: 1, max: 100, count: 5 });
  /* decimal opts */
  const [decOpts, setDecOpts] = useState<DecimalOpts>({ min: 0, max: 1, decimals: 4, count: 5 });
  /* dice — sides + number of dice */
  const [diceSides, setDiceSides] = useState(6);
  const [diceCount, setDiceCount] = useState(3);
  /* coin — number of coins */
  const [coinCount, setCoinCount] = useState(3);
  /* list opts */
  const [listOpts, setListOpts] = useState<ListOpts>({ items: "Red\nBlue\nGreen\nYellow\nPurple\nOrange", picks: 2, allowDuplicates: false });

  const mounted = useRef(false);

  const generate = useCallback(() => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    switch (mode) {
      case "integer":
        setResults(Array.from({ length: intOpts.count }, () => String(randInt(intOpts.min, intOpts.max))));
        break;
      case "decimal":
        setResults(Array.from({ length: decOpts.count }, () => String(randFloat(decOpts.min, decOpts.max, decOpts.decimals))));
        break;
      case "dice":
        setResults(Array.from({ length: diceCount }, () => String(randInt(1, diceSides))));
        break;
      case "coin":
        setResults(Array.from({ length: coinCount }, () => (randInt(0, 1) === 0 ? "Heads" : "Tails")));
        break;
      case "list": {
        const items = listOpts.items.split("\n").map((s) => s.trim()).filter(Boolean);
        setResults(pickFromList(items, listOpts.picks, listOpts.allowDuplicates));
        break;
      }
    }
    setCopied(false);
  }, [mode, intOpts, decOpts, diceSides, diceCount, coinCount, listOpts]);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; generate(); return; }
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(results.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* */ }
  };

  /* summaries */
  const summary = (() => {
    if (mode === "dice" && results.length) {
      const nums = results.map(Number);
      const sum = nums.reduce((a, b) => a + b, 0);
      const avg = (sum / nums.length).toFixed(1);
      return `Sum: ${sum}  ·  Avg: ${avg}  ·  Min: ${Math.min(...nums)}  ·  Max: ${Math.max(...nums)}`;
    }
    if (mode === "coin" && results.length) {
      const heads = results.filter((r) => r === "Heads").length;
      const tails = results.length - heads;
      return `Heads: ${heads} (${((heads / results.length) * 100).toFixed(0)}%)  ·  Tails: ${tails} (${((tails / results.length) * 100).toFixed(0)}%)`;
    }
    if (mode === "integer" && results.length) {
      const nums = results.map(Number);
      const sum = nums.reduce((a, b) => a + b, 0);
      return `Sum: ${sum.toLocaleString()}  ·  Avg: ${(sum / nums.length).toFixed(1)}`;
    }
    return null;
  })();

  const modes: { value: Mode; icon: string; label: string }[] = [
    { value: "integer", icon: "🔢", label: "Integer" },
    { value: "decimal", icon: "📊", label: "Decimal" },
    { value: "dice", icon: "🎲", label: "Dice" },
    { value: "coin", icon: "🪙", label: "Coin Flip" },
    { value: "list", icon: "📋", label: "Pick from List" },
  ];

  return (
    <div className="space-y-4">
      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes diceRoll {
          0%   { transform: rotateX(0deg) rotateZ(0deg) scale(1); }
          25%  { transform: rotateX(180deg) rotateZ(90deg) scale(0.85); }
          50%  { transform: rotateX(360deg) rotateZ(180deg) scale(1.05); }
          75%  { transform: rotateX(540deg) rotateZ(270deg) scale(0.95); }
          100% { transform: rotateX(720deg) rotateZ(360deg) scale(1); }
        }
        .animate-dice-roll { animation: diceRoll 0.6s cubic-bezier(.25,.46,.45,.94); }
        @keyframes coinFlip {
          0%   { transform: rotateY(0deg) scale(1); }
          50%  { transform: rotateY(900deg) scale(0.8); }
          100% { transform: rotateY(1800deg) scale(1); }
        }
        .animate-coin-flip { animation: coinFlip 0.6s cubic-bezier(.25,.46,.45,.94); }
      `}</style>

      {/* ── Mode toggle ── */}
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
              mode === m.value
                ? "border-[#6c63ff]/50 bg-[#6c63ff]/15 text-[#a5a0ff]"
                : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground"
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* ── Options card ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#6c63ff]" />
          <h2 className="font-display text-sm font-bold tracking-tight">Settings</h2>
        </div>

        <div className="space-y-4 px-5 py-4">
          {mode === "integer" && (
            <>
              <Row label="Min">
                <NumberInput value={intOpts.min} onChange={(v) => setIntOpts((p) => ({ ...p, min: v }))} />
              </Row>
              <Row label="Max">
                <NumberInput value={intOpts.max} onChange={(v) => setIntOpts((p) => ({ ...p, max: v }))} />
              </Row>
              <SliderRow label="Count" value={intOpts.count} min={1} max={100} onChange={(v) => setIntOpts((p) => ({ ...p, count: v }))} />
            </>
          )}

          {mode === "decimal" && (
            <>
              <Row label="Min">
                <NumberInput value={decOpts.min} onChange={(v) => setDecOpts((p) => ({ ...p, min: v }))} step={0.1} />
              </Row>
              <Row label="Max">
                <NumberInput value={decOpts.max} onChange={(v) => setDecOpts((p) => ({ ...p, max: v }))} step={0.1} />
              </Row>
              <SliderRow label="Decimals" value={decOpts.decimals} min={1} max={10} onChange={(v) => setDecOpts((p) => ({ ...p, decimals: v }))} />
              <SliderRow label="Count" value={decOpts.count} min={1} max={100} onChange={(v) => setDecOpts((p) => ({ ...p, count: v }))} />
            </>
          )}

          {mode === "dice" && (
            <>
              {/* Dice count with +/- buttons */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Number of dice</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDiceCount((c) => Math.max(1, c - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 text-sm font-bold text-white transition hover:border-border-strong"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-mono text-sm font-bold text-white">{diceCount}</span>
                  <button
                    onClick={() => setDiceCount((c) => Math.min(30, c + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 text-sm font-bold text-white transition hover:border-border-strong"
                  >
                    +
                  </button>
                </div>
              </div>
              <SliderRow label="Sides per die" value={diceSides} min={2} max={20} onChange={setDiceSides} />
            </>
          )}

          {mode === "coin" && (
            /* Coin count with +/- buttons */
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Number of coins</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCoinCount((c) => Math.max(1, c - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 text-sm font-bold text-white transition hover:border-border-strong"
                >
                  −
                </button>
                <span className="w-8 text-center font-mono text-sm font-bold text-white">{coinCount}</span>
                <button
                  onClick={() => setCoinCount((c) => Math.min(30, c + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 text-sm font-bold text-white transition hover:border-border-strong"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {mode === "list" && (
            <>
              <div>
                <label className="mb-1 block text-xs text-muted">Items (one per line)</label>
                <textarea
                  value={listOpts.items}
                  onChange={(e) => setListOpts((p) => ({ ...p, items: e.target.value }))}
                  rows={5}
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-white outline-none placeholder:text-muted-3 focus:border-[#6c63ff]/50"
                />
              </div>
              <SliderRow label="Picks" value={listOpts.picks} min={1} max={50} onChange={(v) => setListOpts((p) => ({ ...p, picks: v }))} />
              <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={listOpts.allowDuplicates}
                  onChange={(e) => setListOpts((p) => ({ ...p, allowDuplicates: e.target.checked }))}
                  className="accent-[#6c63ff]"
                />
                Allow duplicates
              </label>
            </>
          )}
        </div>
      </div>

      {/* ── Roll / Flip / Generate button ── */}
      <button
        onClick={generate}
        className="w-full rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#38d9a9] py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
      >
        {mode === "dice" ? "🎲 Roll Dice" : mode === "coin" ? "🪙 Flip Coins" : "↻ Generate"}
      </button>

      {/* ── Results card ── */}
      {results.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_40px_rgba(0,0,0,.45)]">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
              <h3 className="font-display text-sm font-bold tracking-tight text-white">Results</h3>
            </div>
            <button
              onClick={copyAll}
              className="rounded-md border border-border-strong px-3 py-1.5 text-xs text-muted transition hover:text-foreground"
            >
              {copied ? "Copied!" : "Copy All"}
            </button>
          </div>

          {summary && (
            <div className="border-b border-border px-5 py-2.5 text-xs text-muted">
              {summary}
            </div>
          )}

          {/* ── Visual dice ── */}
          {mode === "dice" && (
            <div className="flex flex-wrap items-center justify-center gap-4 px-5 py-6">
              {results.map((r, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <DiceFace value={Number(r)} rolling={animating} sides={diceSides} />
                  <span className="mt-1 text-xs font-bold text-muted">{r}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Visual coins ── */}
          {mode === "coin" && (
            <div className="flex flex-wrap items-center justify-center gap-4 px-5 py-6">
              {results.map((r, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <CoinFace value={r as "Heads" | "Tails"} flipping={animating} />
                  <span className={`mt-1 text-xs font-bold ${r === "Heads" ? "text-[#ffa640]" : "text-[#6c63ff]"}`}>
                    {r}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Text results for other modes ── */}
          {mode !== "dice" && mode !== "coin" && (
            <div className="flex flex-wrap gap-2 px-5 py-4">
              {results.map((r, i) => (
                <span
                  key={i}
                  className="rounded-lg border border-border bg-surface-2 px-3.5 py-2 font-mono text-sm font-bold text-white"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="🔐" title="Cryptographically Secure" desc="Uses crypto.getRandomValues() for true randomness, not Math.random()." />
        <InfoCard icon="🎯" title="Visual Dice & Coins" desc="See actual dice faces and coin sides with roll/flip animations." />
        <InfoCard icon="🔒" title="100% Private" desc="All generation happens in your browser. Nothing is sent to any server." />
      </div>
    </div>
  );
}

/* ── Sub-components ── */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, step }: { value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <input
      type="number"
      value={value}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-32 rounded-md border border-border bg-surface-2 px-3 py-2 text-right font-mono text-xs text-white outline-none focus:border-[#6c63ff]/50"
    />
  );
}

function SliderRow({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted">
        <span>{label}</span>
        <span className="font-mono font-bold text-white">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-3 accent-[#6c63ff]"
      />
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
