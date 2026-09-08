"use client";

import { useMemo, useState } from "react";

type Sex = "male" | "female";

type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very";

const activityOptions: { id: ActivityLevel; label: string; factor: number; desc: string }[] = [
  { id: "sedentary", label: "Sedentary", factor: 1.2, desc: "Little or no exercise" },
  { id: "light", label: "Light", factor: 1.375, desc: "1–3 days/week" },
  { id: "moderate", label: "Moderate", factor: 1.55, desc: "3–5 days/week" },
  { id: "active", label: "Active", factor: 1.725, desc: "6–7 days/week" },
  { id: "very", label: "Very Active", factor: 1.9, desc: "Hard exercise + physical job" },
];

type MacroPresetId = "balanced" | "highProtein" | "lowCarb";

const macroPresets: {
  id: MacroPresetId;
  label: string;
  proteinPct: number;
  fatPct: number;
  carbsPct: number;
}[] = [
  { id: "balanced", label: "Balanced", proteinPct: 0.3, fatPct: 0.3, carbsPct: 0.4 },
  { id: "highProtein", label: "High Protein", proteinPct: 0.35, fatPct: 0.3, carbsPct: 0.35 },
  { id: "lowCarb", label: "Lower Carb", proteinPct: 0.35, fatPct: 0.4, carbsPct: 0.25 },
];

function clampNumber(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function round(n: number, decimals = 0) {
  const p = Math.pow(10, decimals);
  return Math.round(n * p) / p;
}

function mifflinStJeorBmr(sex: Sex, weightKg: number, heightCm: number, ageYears: number) {
  // Mifflin-St Jeor
  const s = sex === "male" ? 5 : -161;
  return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + s;
}

export default function CalorieCalculatorTool() {
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("25");
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("70");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [macroPreset, setMacroPreset] = useState<MacroPresetId>("balanced");

  const computed = useMemo(() => {
    const ageNum = clampNumber(parseFloat(age), 5, 120);
    const heightNum = clampNumber(parseFloat(heightCm), 80, 250);
    const weightNum = clampNumber(parseFloat(weightKg), 20, 350);

    if (!Number.isFinite(ageNum) || !Number.isFinite(heightNum) || !Number.isFinite(weightNum)) return null;

    const activityFactor = activityOptions.find((a) => a.id === activity)?.factor ?? 1.55;
    const bmr = mifflinStJeorBmr(sex, weightNum, heightNum, ageNum);
    const tdee = bmr * activityFactor;

    const preset = macroPresets.find((p) => p.id === macroPreset) ?? macroPresets[0];

    const proteinKcal = tdee * preset.proteinPct;
    const fatKcal = tdee * preset.fatPct;
    const carbsKcal = tdee * preset.carbsPct;

    const proteinG = proteinKcal / 4;
    const carbsG = carbsKcal / 4;
    const fatG = fatKcal / 9;

    return {
      ageNum,
      heightNum,
      weightNum,
      activityFactor,
      bmr,
      tdee,
      preset,
      macros: {
        proteinG,
        fatG,
        carbsG,
      },
    };
  }, [sex, age, heightCm, weightKg, activity, macroPreset]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Your Details</h2>
          <p className="mt-1 text-xs text-muted">Calculates BMR and daily calorie needs (TDEE). Includes a simple macro split.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-2">
          <Field label="Sex">
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as Sex)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6c63ff]/50"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </Field>

          <Field label="Activity level">
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6c63ff]/50"
            >
              {activityOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} — {a.desc}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Age (years)">
            <input
              type="number"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={5}
              max={120}
              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-[#6c63ff]/50"
            />
          </Field>

          <Field label="Height (cm)">
            <input
              type="number"
              inputMode="decimal"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              min={80}
              max={250}
              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-[#6c63ff]/50"
            />
          </Field>

          <Field label="Weight (kg)">
            <input
              type="number"
              inputMode="decimal"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              min={20}
              max={350}
              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-[#6c63ff]/50"
            />
          </Field>

          <Field label="Macro preset">
            <select
              value={macroPreset}
              onChange={(e) => setMacroPreset(e.target.value as MacroPresetId)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-white outline-none focus:border-[#6c63ff]/50"
            >
              {macroPresets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {computed && (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ResultCard title="BMR" subtitle="Calories/day" value={Math.round(computed.bmr).toLocaleString()} accent="bg-[#6c63ff]" />
            <ResultCard
              title="TDEE"
              subtitle="Maintenance calories/day"
              value={Math.round(computed.tdee).toLocaleString()}
              accent="bg-[#38d9a9]"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
              <span className="h-2 w-2 rounded-full bg-[#ff6584]" />
              <h3 className="font-display text-sm font-bold tracking-tight text-white">Daily Macros (approx.)</h3>
              <span className="ml-auto text-xs text-muted">{computed.preset.label}</span>
            </div>

            <div className="grid grid-cols-1 divide-y divide-white/5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <MacroItem
                label="Protein"
                grams={round(computed.macros.proteinG)}
                kcal={round(computed.tdee * computed.preset.proteinPct)}
                color="text-[#6c63ff]"
              />
              <MacroItem
                label="Fat"
                grams={round(computed.macros.fatG)}
                kcal={round(computed.tdee * computed.preset.fatPct)}
                color="text-[#ffa640]"
              />
              <MacroItem
                label="Carbs"
                grams={round(computed.macros.carbsG)}
                kcal={round(computed.tdee * computed.preset.carbsPct)}
                color="text-[#38d9a9]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <InfoCard icon="🔥" title="BMR" desc="Estimated calories your body burns at rest." />
            <InfoCard icon="⚡" title="TDEE" desc="Estimated maintenance calories based on activity." />
            <InfoCard icon="🥗" title="Macros" desc="A simple split of protein, fat, and carbs." />
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function ResultCard({
  title,
  subtitle,
  value,
  accent,
}: {
  title: string;
  subtitle: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_40px_rgba(0,0,0,.45)]">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className={`h-2 w-2 rounded-full ${accent}`} />
        <h3 className="font-display text-sm font-bold tracking-tight text-white">{title}</h3>
        <span className="ml-auto text-xs text-muted">{subtitle}</span>
      </div>
      <div className="px-5 py-6">
        <div className="font-mono text-4xl font-extrabold tracking-tight text-white">{value}</div>
      </div>
    </div>
  );
}

function MacroItem({
  label,
  grams,
  kcal,
  color,
}: {
  label: string;
  grams: number;
  kcal: number;
  color: string;
}) {
  return (
    <div className="px-5 py-4">
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className={`mt-1 font-mono text-2xl font-bold ${color}`}>{grams}g</div>
      <div className="mt-1 text-xs text-muted-2">≈ {Math.round(kcal).toLocaleString()} kcal</div>
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
