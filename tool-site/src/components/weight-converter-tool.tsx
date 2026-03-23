"use client";

import { useCallback, useState } from "react";

interface Unit { id: string; label: string; abbr: string; toBase: number }

const units: Unit[] = [
  { id: "kg", label: "Kilogram", abbr: "kg", toBase: 1 },
  { id: "g", label: "Gram", abbr: "g", toBase: 0.001 },
  { id: "mg", label: "Milligram", abbr: "mg", toBase: 1e-6 },
  { id: "ug", label: "Microgram", abbr: "μg", toBase: 1e-9 },
  { id: "t", label: "Metric Ton", abbr: "t", toBase: 1000 },
  { id: "lb", label: "Pound", abbr: "lb", toBase: 0.453592 },
  { id: "oz", label: "Ounce", abbr: "oz", toBase: 0.0283495 },
  { id: "st", label: "Stone", abbr: "st", toBase: 6.35029 },
  { id: "ust", label: "US Ton (short)", abbr: "US ton", toBase: 907.185 },
  { id: "imt", label: "Imperial Ton (long)", abbr: "imp ton", toBase: 1016.05 },
  { id: "ct", label: "Carat", abbr: "ct", toBase: 0.0002 },
];

function convert(value: number, from: Unit, to: Unit): number {
  return (value * from.toBase) / to.toBase;
}

function formatNum(n: number): string {
  if (n === 0) return "0";
  if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && Math.abs(n) > 0)) return n.toExponential(6);
  return parseFloat(n.toPrecision(10)).toString();
}

export default function WeightConverterTool() {
  const [fromUnit, setFromUnit] = useState("kg");
  const [toUnit, setToUnit] = useState("lb");
  const [fromVal, setFromVal] = useState("1");
  const [copied, setCopied] = useState(false);

  const from = units.find((u) => u.id === fromUnit)!;
  const to = units.find((u) => u.id === toUnit)!;
  const numericFrom = parseFloat(fromVal) || 0;
  const result = convert(numericFrom, from, to);
  const resultStr = formatNum(result);

  const swap = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromVal(resultStr);
  }, [fromUnit, toUnit, resultStr]);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(resultStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* */ }
  };

  const allConversions = units
    .filter((u) => u.id !== fromUnit)
    .map((u) => ({ unit: u, value: formatNum(convert(numericFrom, from, u)) }));

  return (
    <div className="space-y-4">
      {/* ── Main converter card ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
          {/* From */}
          <div className="p-5">
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">From</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="mb-3 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6c63ff]/50"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.label} ({u.abbr})</option>
              ))}
            </select>
            <input
              type="number"
              value={fromVal}
              onChange={(e) => setFromVal(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 font-mono text-2xl font-bold text-white outline-none focus:border-[#6c63ff]/50"
            />
          </div>

          {/* Swap */}
          <div className="flex items-center justify-center p-2">
            <button
              onClick={swap}
              className="rounded-full border border-border bg-surface-2 p-3 text-lg transition hover:border-border-strong hover:text-foreground"
            >
              ⇄
            </button>
          </div>

          {/* To */}
          <div className="p-5">
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">To</label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="mb-3 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6c63ff]/50"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.label} ({u.abbr})</option>
              ))}
            </select>
            <div
              onClick={copyResult}
              className="group w-full cursor-pointer rounded-lg border border-border bg-surface-2 px-4 py-3 font-mono text-2xl font-bold text-[#38d9a9] transition hover:border-[#38d9a9]/30"
              title="Click to copy"
            >
              {resultStr}
              <span className="ml-2 text-xs font-normal text-muted-2 opacity-0 transition group-hover:opacity-100">
                {copied ? "Copied!" : "Click to copy"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border px-5 py-3 text-center text-xs text-muted">
          {numericFrom} {from.abbr} = {resultStr} {to.abbr}
        </div>
      </div>

      {/* ── All conversions ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <span className="h-2 w-2 rounded-full bg-[#ffa640]" />
          <h3 className="font-display text-sm font-bold tracking-tight text-white">
            {numericFrom} {from.abbr} in all units
          </h3>
        </div>
        <div className="grid grid-cols-1 divide-y divide-white/5 sm:grid-cols-2 sm:divide-y-0">
          {allConversions.map(({ unit, value }) => (
            <div key={unit.id} className="flex items-center justify-between border-b border-border px-5 py-2.5 sm:odd:border-r">
              <span className="text-xs text-muted">{unit.label} <span className="text-muted-2">({unit.abbr})</span></span>
              <span className="font-mono text-sm font-bold text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="⚖️" title="11 Units" desc="Metric, imperial, stones, carats, and both short & long tons." />
        <InfoCard icon="⚡" title="Instant" desc="Results update in real time as you type." />
        <InfoCard icon="🔒" title="Private" desc="All calculations happen locally in your browser." />
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
