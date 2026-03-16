"use client";

import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════
   BMI CALCULATOR — Metric + Imperial
   ═══════════════════════════════════════════════════════ */

type UnitSystem = "metric" | "imperial";

interface BmiResult {
  bmi: number;
  category: string;
  color: string;
  emoji: string;
  min: number;
  max: number;
  healthyMin: number;
  healthyMax: number;
}

const BMI_CATEGORIES: { max: number; label: string; color: string; emoji: string; barColor: string }[] = [
  { max: 16, label: "Severe Thinness", color: "text-red-400", emoji: "⚠️", barColor: "bg-red-500" },
  { max: 17, label: "Moderate Thinness", color: "text-orange-400", emoji: "⚠️", barColor: "bg-orange-500" },
  { max: 18.5, label: "Mild Thinness", color: "text-amber-400", emoji: "⚡", barColor: "bg-amber-500" },
  { max: 25, label: "Normal", color: "text-emerald-400", emoji: "✅", barColor: "bg-emerald-500" },
  { max: 30, label: "Overweight", color: "text-amber-400", emoji: "⚡", barColor: "bg-amber-500" },
  { max: 35, label: "Obese Class I", color: "text-orange-400", emoji: "⚠️", barColor: "bg-orange-500" },
  { max: 40, label: "Obese Class II", color: "text-red-400", emoji: "⚠️", barColor: "bg-red-500" },
  { max: Infinity, label: "Obese Class III", color: "text-red-500", emoji: "🚨", barColor: "bg-red-600" },
];

function calcBmi(weightKg: number, heightM: number): BmiResult {
  const bmi = weightKg / (heightM * heightM);
  const cat = BMI_CATEGORIES.find((c) => bmi < c.max) || BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
  const healthyMin = 18.5 * heightM * heightM;
  const healthyMax = 24.9 * heightM * heightM;
  return {
    bmi,
    category: cat.label,
    color: cat.color,
    emoji: cat.emoji,
    min: healthyMin,
    max: healthyMax,
    healthyMin,
    healthyMax,
  };
}

export default function BmiCalculatorTool() {
  const [unit, setUnit] = useState<UnitSystem>("metric");

  // Metric
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");

  // Imperial
  const [weightLbs, setWeightLbs] = useState("");
  const [heightIn, setHeightIn] = useState("");

  const result = useMemo<BmiResult | null>(() => {
    if (unit === "metric") {
      const w = parseFloat(weightKg);
      const h = parseFloat(heightCm) / 100;
      if (!w || !h || w <= 0 || h <= 0) return null;
      return calcBmi(w, h);
    } else {
      const w = parseFloat(weightLbs);
      const totalInches = parseFloat(heightIn) || 0;
      if (!w || totalInches <= 0) return null;
      const wKg = w * 0.453592;
      const hM = totalInches * 0.0254;
      return calcBmi(wKg, hM);
    }
  }, [unit, weightKg, heightCm, weightLbs, heightIn]);

  // BMI scale position (0-100%)
  const scalePos = result ? Math.min(100, Math.max(0, ((result.bmi - 10) / 35) * 100)) : 0;

  return (
    <div className="space-y-4">
      {/* ── Input card ── */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Enter Your Details</h2>
          <div className="flex rounded-lg border border-white/10 bg-[#17171f] p-0.5 text-xs">
            <button
              onClick={() => setUnit("metric")}
              className={`rounded-md px-3 py-1.5 font-semibold transition ${unit === "metric" ? "bg-[#6c63ff] text-white" : "text-[#9b9bb3] hover:text-white"}`}
            >
              Metric
            </button>
            <button
              onClick={() => setUnit("imperial")}
              className={`rounded-md px-3 py-1.5 font-semibold transition ${unit === "imperial" ? "bg-[#6c63ff] text-white" : "text-[#9b9bb3] hover:text-white"}`}
            >
              Imperial
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4 px-5 py-5">
          {unit === "metric" ? (
            <>
              <InputField label="Weight (kg)" value={weightKg} onChange={setWeightKg} placeholder="70" />
              <InputField label="Height (cm)" value={heightCm} onChange={setHeightCm} placeholder="175" />
            </>
          ) : (
            <>
              <InputField label="Weight (lbs)" value={weightLbs} onChange={setWeightLbs} placeholder="154" />
              <InputField label="Height (inches)" value={heightIn} onChange={setHeightIn} placeholder="69" />
            </>
          )}
        </div>
      </div>

      {/* ── Result ── */}
      {result && (
        <>
          {/* BMI Score */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
            <div className="border-b border-white/10 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-[#6c63ff]" />
                Your BMI
              </h3>
            </div>
            <div className="px-5 py-6 text-center">
              <div className={`font-display text-6xl font-bold ${result.color}`}>
                {result.bmi.toFixed(1)}
              </div>
              <div className={`mt-2 text-lg font-semibold ${result.color}`}>
                {result.emoji} {result.category}
              </div>
            </div>

            {/* Scale bar */}
            <div className="px-5 pb-5">
              <div className="relative h-3 w-full overflow-hidden rounded-full">
                <div className="absolute inset-0 flex">
                  <div className="h-full flex-1 bg-red-500" />
                  <div className="h-full flex-1 bg-orange-500" />
                  <div className="h-full flex-1 bg-amber-400" />
                  <div className="h-full flex-[2] bg-emerald-500" />
                  <div className="h-full flex-1 bg-amber-400" />
                  <div className="h-full flex-1 bg-orange-500" />
                  <div className="h-full flex-1 bg-red-500" />
                  <div className="h-full flex-1 bg-red-600" />
                </div>
                <div
                  className="absolute top-0 h-full w-1 -translate-x-1/2 rounded bg-white shadow-[0_0_6px_rgba(255,255,255,.6)]"
                  style={{ left: `${scalePos}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-[#57576f]">
                <span>10</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>35</span>
                <span>40+</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard
              emoji="⚖️"
              label="Healthy Weight Range"
              value={
                unit === "metric"
                  ? `${result.healthyMin.toFixed(1)} – ${result.healthyMax.toFixed(1)} kg`
                  : `${(result.healthyMin / 0.453592).toFixed(1)} – ${(result.healthyMax / 0.453592).toFixed(1)} lbs`
              }
            />
            <InfoCard
              emoji="📊"
              label="BMI Prime"
              value={(result.bmi / 25).toFixed(2)}
              sub="Ratio of BMI to upper normal (25)"
            />
          </div>

          {/* Categories table */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
            <div className="border-b border-white/10 px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">BMI Categories</h3>
            </div>
            <div className="divide-y divide-white/5">
              {BMI_CATEGORIES.map((cat) => (
                <div
                  key={cat.label}
                  className={`flex items-center gap-3 px-5 py-2.5 text-sm ${
                    result.category === cat.label ? "bg-white/5" : ""
                  }`}
                >
                  <div className={`h-2.5 w-2.5 rounded-full ${cat.barColor}`} />
                  <span className={`flex-1 ${result.category === cat.label ? "font-semibold text-white" : "text-[#9b9bb3]"}`}>
                    {cat.label}
                  </span>
                  <span className="text-xs text-[#57576f]">
                    {cat.max === Infinity ? "≥ 40" : cat === BMI_CATEGORIES[0] ? "< 16" : `${BMI_CATEGORIES[BMI_CATEGORIES.indexOf(cat) - 1]?.max ?? 0} – ${cat.max}`}
                  </span>
                  {result.category === cat.label && <span className="text-xs text-[#6c63ff]">← You</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#57576f]">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-32 rounded-lg border border-white/15 bg-[#17171f] px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-[#515168] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}

function InfoCard({ emoji, label, value, sub }: { emoji: string; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111118] px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-lg">{emoji}</div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#57576f]">{label}</div>
        <div className="font-display text-lg font-bold text-white">{value}</div>
        {sub && <div className="text-[10px] text-[#9b9bb3]">{sub}</div>}
      </div>
    </div>
  );
}
