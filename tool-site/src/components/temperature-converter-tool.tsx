"use client";

import { useCallback, useState } from "react";

type TempUnit = "c" | "f" | "k" | "r" | "de" | "n" | "re" | "ro";

interface Unit { id: TempUnit; label: string; abbr: string }

const units: Unit[] = [
  { id: "c", label: "Celsius", abbr: "°C" },
  { id: "f", label: "Fahrenheit", abbr: "°F" },
  { id: "k", label: "Kelvin", abbr: "K" },
  { id: "r", label: "Rankine", abbr: "°R" },
  { id: "de", label: "Delisle", abbr: "°De" },
  { id: "n", label: "Newton", abbr: "°N" },
  { id: "re", label: "Réaumur", abbr: "°Ré" },
  { id: "ro", label: "Rømer", abbr: "°Rø" },
];

/* convert everything through Celsius as base */
function toCelsius(value: number, from: TempUnit): number {
  switch (from) {
    case "c": return value;
    case "f": return (value - 32) * (5 / 9);
    case "k": return value - 273.15;
    case "r": return (value - 491.67) * (5 / 9);
    case "de": return 100 - value * (2 / 3);
    case "n": return value * (100 / 33);
    case "re": return value * (5 / 4);
    case "ro": return (value - 7.5) * (40 / 21);
  }
}

function fromCelsius(c: number, to: TempUnit): number {
  switch (to) {
    case "c": return c;
    case "f": return c * (9 / 5) + 32;
    case "k": return c + 273.15;
    case "r": return (c + 273.15) * (9 / 5);
    case "de": return (100 - c) * (3 / 2);
    case "n": return c * (33 / 100);
    case "re": return c * (4 / 5);
    case "ro": return c * (21 / 40) + 7.5;
  }
}

function convert(value: number, from: TempUnit, to: TempUnit): number {
  return fromCelsius(toCelsius(value, from), to);
}

function formatNum(n: number): string {
  if (n === 0) return "0";
  return parseFloat(n.toPrecision(10)).toString();
}

/* fun fact based on celsius */
function getFunFact(celsius: number): string {
  if (celsius <= -273.15) return "❄️ Absolute zero — the coldest possible temperature.";
  if (celsius < -89) return "🥶 Colder than the coldest recorded temperature on Earth (−89.2 °C, Antarctica).";
  if (celsius < 0) return "❄️ Below freezing point of water.";
  if (celsius === 0) return "🧊 Freezing point of water.";
  if (celsius < 20) return "🌤️ Cool — light jacket weather.";
  if (celsius < 37) return "☀️ Comfortable room to warm weather range.";
  if (celsius >= 37 && celsius < 38) return "🌡️ Normal human body temperature.";
  if (celsius < 100) return "🔥 Hot — approaching boiling water.";
  if (celsius === 100) return "♨️ Boiling point of water at sea level.";
  if (celsius < 1000) return "🔥 Extremely hot — oven and furnace range.";
  if (celsius < 5500) return "🌋 Molten lava territory.";
  return "☀️ Hotter than the surface of the Sun (≈5,500 °C).";
}

export default function TemperatureConverterTool() {
  const [fromUnit, setFromUnit] = useState<TempUnit>("c");
  const [toUnit, setToUnit] = useState<TempUnit>("f");
  const [fromVal, setFromVal] = useState("0");
  const [copied, setCopied] = useState(false);

  const from = units.find((u) => u.id === fromUnit)!;
  const to = units.find((u) => u.id === toUnit)!;
  const numericFrom = parseFloat(fromVal) || 0;
  const result = convert(numericFrom, fromUnit, toUnit);
  const resultStr = formatNum(result);
  const celsius = toCelsius(numericFrom, fromUnit);
  const funFact = getFunFact(celsius);

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
    .map((u) => ({ unit: u, value: formatNum(convert(numericFrom, fromUnit, u.id)) }));

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
              onChange={(e) => setFromUnit(e.target.value as TempUnit)}
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
              onChange={(e) => setToUnit(e.target.value as TempUnit)}
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

        {/* Formula + fun fact */}
        <div className="space-y-1 border-t border-border px-5 py-3 text-center text-xs text-muted">
          <div>{numericFrom} {from.abbr} = {resultStr} {to.abbr}</div>
          <div className="text-muted-2">{funFact}</div>
        </div>
      </div>

      {/* ── All conversions ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <span className="h-2 w-2 rounded-full bg-[#ffa640]" />
          <h3 className="font-display text-sm font-bold tracking-tight text-white">
            {numericFrom} {from.abbr} in all scales
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

      {/* ── Reference points ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <span className="h-2 w-2 rounded-full bg-[#ff6584]" />
          <h3 className="font-display text-sm font-bold tracking-tight text-white">Reference Points</h3>
        </div>
        <div className="grid grid-cols-1 divide-y divide-white/5 sm:grid-cols-2 sm:divide-y-0">
          {[
            ["Absolute Zero", "-273.15 °C / -459.67 °F / 0 K"],
            ["Water Freezes", "0 °C / 32 °F / 273.15 K"],
            ["Body Temperature", "37 °C / 98.6 °F / 310.15 K"],
            ["Water Boils", "100 °C / 212 °F / 373.15 K"],
          ].map(([label, val]) => (
            <div key={label} className="flex items-center justify-between border-b border-border px-5 py-2.5 sm:odd:border-r">
              <span className="text-xs font-semibold text-muted">{label}</span>
              <span className="font-mono text-[11px] text-white/70">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="🌡️" title="8 Scales" desc="Celsius, Fahrenheit, Kelvin, Rankine, Delisle, Newton, Réaumur & Rømer." />
        <InfoCard icon="⚡" title="Instant" desc="Results update in real time as you type." />
        <InfoCard icon="💡" title="Fun Facts" desc="Context-aware notes about your temperature value." />
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
