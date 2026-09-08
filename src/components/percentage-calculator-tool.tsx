"use client";

import { useState, useCallback } from "react";

/* ──────────────────── helpers ──────────────────────── */

const fmt = (n: number) => {
  if (Number.isNaN(n) || !Number.isFinite(n)) return "—";
  return parseFloat(n.toFixed(6)).toLocaleString(undefined, { maximumFractionDigits: 6 });
};

/* ──────────────────── Section 1: Basic % ──────────────── */

function BasicPercentage() {
  const [pct, setPct] = useState("");
  const [of, setOf] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculate = useCallback(() => {
    const p = parseFloat(pct);
    const o = parseFloat(of);
    if (Number.isNaN(p) || Number.isNaN(o)) return;
    setResult(fmt((p / 100) * o));
  }, [pct, of]);

  return (
    <CalcCard
      title="Percentage Calculator"
      subtitle="What is X% of Y?"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">What is</span>
        <NumInput value={pct} onChange={setPct} placeholder="X" />
        <span className="text-muted">% of</span>
        <NumInput value={of} onChange={setOf} placeholder="Y" />
        <span className="text-muted">?</span>
        <CalcButton onClick={calculate} />
      </div>
      {result !== null && <Result label={`${pct}% of ${of}`} value={result} />}
    </CalcCard>
  );
}

/* ──────────────────── Section 2: Common Phrases ──────── */

function CommonPhrases() {
  /* 2a — What is X% of Y? */
  const [a1, setA1] = useState("");
  const [a2, setA2] = useState("");
  const [r1, setR1] = useState<string | null>(null);

  /* 2b — X is what % of Y? */
  const [b1, setB1] = useState("");
  const [b2, setB2] = useState("");
  const [r2, setR2] = useState<string | null>(null);

  /* 2c — X is Y% of what? */
  const [c1, setC1] = useState("");
  const [c2, setC2] = useState("");
  const [r3, setR3] = useState<string | null>(null);

  return (
    <CalcCard
      title="Percentage Calculator in Common Phrases"
      subtitle="Quick formulas for everyday percentage questions"
    >
      <div className="space-y-4">
        {/* 2a */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted">What is</span>
          <NumInput value={a1} onChange={setA1} placeholder="%" />
          <span className="text-muted">% of</span>
          <NumInput value={a2} onChange={setA2} placeholder="Y" />
          <span className="text-muted">?</span>
          <CalcButton
            onClick={() => {
              const p = parseFloat(a1);
              const y = parseFloat(a2);
              if (!Number.isNaN(p) && !Number.isNaN(y)) setR1(fmt((p / 100) * y));
            }}
          />
        </div>
        {r1 !== null && <Result label={`${a1}% of ${a2}`} value={r1} />}

        <div className="h-px bg-surface-3/50" />

        {/* 2b */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <NumInput value={b1} onChange={setB1} placeholder="X" />
          <span className="text-muted">is what % of</span>
          <NumInput value={b2} onChange={setB2} placeholder="Y" />
          <span className="text-muted">?</span>
          <CalcButton
            onClick={() => {
              const x = parseFloat(b1);
              const y = parseFloat(b2);
              if (!Number.isNaN(x) && !Number.isNaN(y) && y !== 0) setR2(fmt((x / y) * 100) + "%");
            }}
          />
        </div>
        {r2 !== null && <Result label={`${b1} is what % of ${b2}`} value={r2} />}

        <div className="h-px bg-surface-3/50" />

        {/* 2c */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <NumInput value={c1} onChange={setC1} placeholder="X" />
          <span className="text-muted">is</span>
          <NumInput value={c2} onChange={setC2} placeholder="%" />
          <span className="text-muted">% of what?</span>
          <CalcButton
            onClick={() => {
              const x = parseFloat(c1);
              const p = parseFloat(c2);
              if (!Number.isNaN(x) && !Number.isNaN(p) && p !== 0) setR3(fmt((x / p) * 100));
            }}
          />
        </div>
        {r3 !== null && <Result label={`${c1} is ${c2}% of`} value={r3} />}
      </div>
    </CalcCard>
  );
}

/* ──────────────── Section 3: Percentage Difference ───── */

function PercentageDifference() {
  const [v1, setV1] = useState("");
  const [v2, setV2] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculate = useCallback(() => {
    const a = parseFloat(v1);
    const b = parseFloat(v2);
    if (Number.isNaN(a) || Number.isNaN(b)) return;
    const avg = (Math.abs(a) + Math.abs(b)) / 2;
    if (avg === 0) {
      setResult("0%");
      return;
    }
    const diff = (Math.abs(a - b) / avg) * 100;
    setResult(fmt(diff) + "%");
  }, [v1, v2]);

  return (
    <CalcCard
      title="Percentage Difference Calculator"
      subtitle="Find the percentage difference between two values"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Value 1</span>
        <NumInput value={v1} onChange={setV1} placeholder="V1" />
        <span className="text-muted">Value 2</span>
        <NumInput value={v2} onChange={setV2} placeholder="V2" />
        <CalcButton onClick={calculate} />
      </div>
      {result !== null && (
        <Result label={`Difference between ${v1} and ${v2}`} value={result} />
      )}
    </CalcCard>
  );
}

/* ──────────────── Section 4: Percentage Change ─────── */

function PercentageChange() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [result, setResult] = useState<{ value: string; direction: "increase" | "decrease" } | null>(null);

  const calculate = useCallback(() => {
    const f = parseFloat(from);
    const t = parseFloat(to);
    if (Number.isNaN(f) || Number.isNaN(t) || f === 0) return;
    const change = ((t - f) / Math.abs(f)) * 100;
    setResult({
      value: fmt(Math.abs(change)) + "%",
      direction: change >= 0 ? "increase" : "decrease",
    });
  }, [from, to]);

  return (
    <CalcCard
      title="Percentage Change Calculator"
      subtitle="Find the percentage increase or decrease between two values"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">From</span>
        <NumInput value={from} onChange={setFrom} placeholder="Original" />
        <span className="text-muted">→ To</span>
        <NumInput value={to} onChange={setTo} placeholder="New" />
        <CalcButton onClick={calculate} />
      </div>
      {result !== null && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${
              result.direction === "increase"
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-rose-400/15 text-rose-300"
            }`}
          >
            {result.direction === "increase" ? "↑" : "↓"}
          </div>
          <div>
            <div className="text-xs text-muted">
              {result.direction === "increase" ? "Increase" : "Decrease"} from {from} to {to}
            </div>
            <div
              className={`font-display text-xl font-bold ${
                result.direction === "increase" ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {result.value} {result.direction}
            </div>
          </div>
        </div>
      )}
    </CalcCard>
  );
}

/* ──────────── Section 5: Percentage Increase ─────── */

function PercentageIncrease() {
  const [value, setValue] = useState("");
  const [pct, setPct] = useState("");
  const [result, setResult] = useState<{ increased: string; amount: string } | null>(null);

  const calculate = useCallback(() => {
    const v = parseFloat(value);
    const p = parseFloat(pct);
    if (Number.isNaN(v) || Number.isNaN(p)) return;
    const amount = (p / 100) * v;
    setResult({ increased: fmt(v + amount), amount: fmt(amount) });
  }, [value, pct]);

  return (
    <CalcCard
      title="Percentage Increase Calculator"
      subtitle="Increase a value by a given percentage"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Increase</span>
        <NumInput value={value} onChange={setValue} placeholder="Value" />
        <span className="text-muted">by</span>
        <NumInput value={pct} onChange={setPct} placeholder="%" />
        <span className="text-muted">%</span>
        <CalcButton onClick={calculate} />
      </div>
      {result !== null && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/15 text-lg text-emerald-300">
            ↑
          </div>
          <div>
            <div className="text-xs text-muted">
              {value} + {pct}% (= {result.amount})
            </div>
            <div className="font-display text-xl font-bold text-emerald-300">
              {result.increased}
            </div>
          </div>
        </div>
      )}
    </CalcCard>
  );
}

/* ──────────── Section 6: Percentage Decrease ─────── */

function PercentageDecrease() {
  const [value, setValue] = useState("");
  const [pct, setPct] = useState("");
  const [result, setResult] = useState<{ decreased: string; amount: string } | null>(null);

  const calculate = useCallback(() => {
    const v = parseFloat(value);
    const p = parseFloat(pct);
    if (Number.isNaN(v) || Number.isNaN(p)) return;
    const amount = (p / 100) * v;
    setResult({ decreased: fmt(v - amount), amount: fmt(amount) });
  }, [value, pct]);

  return (
    <CalcCard
      title="Percentage Decrease Calculator"
      subtitle="Decrease a value by a given percentage"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Decrease</span>
        <NumInput value={value} onChange={setValue} placeholder="Value" />
        <span className="text-muted">by</span>
        <NumInput value={pct} onChange={setPct} placeholder="%" />
        <span className="text-muted">%</span>
        <CalcButton onClick={calculate} />
      </div>
      {result !== null && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-400/15 text-lg text-rose-300">
            ↓
          </div>
          <div>
            <div className="text-xs text-muted">
              {value} − {pct}% (= {result.amount})
            </div>
            <div className="font-display text-xl font-bold text-rose-300">
              {result.decreased}
            </div>
          </div>
        </div>
      )}
    </CalcCard>
  );
}

/* ──────────── Section 7: Reverse Percentage ─────── */

function ReversePercentage() {
  const [finalVal, setFinalVal] = useState("");
  const [pct, setPct] = useState("");
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [result, setResult] = useState<string | null>(null);

  const calculate = useCallback(() => {
    const f = parseFloat(finalVal);
    const p = parseFloat(pct);
    if (Number.isNaN(f) || Number.isNaN(p)) return;
    const multiplier = direction === "increase" ? 1 + p / 100 : 1 - p / 100;
    if (multiplier === 0) return;
    setResult(fmt(f / multiplier));
  }, [finalVal, pct, direction]);

  return (
    <CalcCard
      title="Reverse Percentage Calculator"
      subtitle="Find the original value before a percentage was applied"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Final value is</span>
        <NumInput value={finalVal} onChange={setFinalVal} placeholder="Final" />
        <span className="text-muted">after a</span>
        <NumInput value={pct} onChange={setPct} placeholder="%" />
        <span className="text-muted">%</span>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as "increase" | "decrease")}
          className="rounded-lg border border-border-strong bg-surface-2 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60"
        >
          <option value="increase">increase</option>
          <option value="decrease">decrease</option>
        </select>
        <CalcButton onClick={calculate} />
      </div>
      {result !== null && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/15 text-lg text-amber-300">
            ↩
          </div>
          <div>
            <div className="text-xs text-muted">
              Original value before {pct}% {direction}
            </div>
            <div className="font-display text-xl font-bold text-amber-300">
              {result}
            </div>
          </div>
        </div>
      )}
    </CalcCard>
  );
}

/* ──────────────── shared sub-components ────────────── */

function CalcCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
      <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />
      <div className="border-b border-border px-5 py-3">
        <h2 className="font-display text-sm font-bold tracking-tight text-white">{title}</h2>
        <p className="mt-0.5 text-[11px] text-muted">{subtitle}</p>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function NumInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-28 rounded-lg border border-border-strong bg-surface-2 px-3 py-2 text-center text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-muted-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
  );
}

function CalcButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-[#6c63ff] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#5b53ee] active:scale-95"
    >
      Calculate
    </button>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6c63ff]/15 text-lg text-[#a39cff]">
        =
      </div>
      <div>
        <div className="text-xs text-muted">{label}</div>
        <div className="font-display text-xl font-bold text-[#6c63ff]">{value}</div>
      </div>
    </div>
  );
}

/* ──────────────── main export ──────────────────────── */

export default function PercentageCalculatorTool() {
  return (
    <div className="space-y-6">
      <BasicPercentage />
      <CommonPhrases />
      <PercentageIncrease />
      <PercentageDecrease />
      <PercentageDifference />
      <PercentageChange />
      <ReversePercentage />

      {/* ── Formula reference ── */}
      <div className="rounded-2xl border border-border bg-surface px-5 py-4">
        <h3 className="font-display text-sm font-bold text-white">Percentage Formulas</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 text-xs text-muted sm:grid-cols-2">
          <FormulaItem
            label="X% of Y"
            formula="(X ÷ 100) × Y"
            example="25% of 200 = 50"
          />
          <FormulaItem
            label="X is what % of Y"
            formula="(X ÷ Y) × 100"
            example="50 is 25% of 200"
          />
          <FormulaItem
            label="Percentage increase"
            formula="Value × (1 + X ÷ 100)"
            example="200 + 15% = 230"
          />
          <FormulaItem
            label="Percentage decrease"
            formula="Value × (1 − X ÷ 100)"
            example="200 − 15% = 170"
          />
          <FormulaItem
            label="Percentage difference"
            formula="|V1 − V2| ÷ ((|V1| + |V2|) ÷ 2) × 100"
            example="Diff between 10 & 6 = 50%"
          />
          <FormulaItem
            label="Percentage change"
            formula="(New − Old) ÷ |Old| × 100"
            example="From 50 to 75 = 50% increase"
          />
          <FormulaItem
            label="Reverse percentage"
            formula="Final ÷ (1 ± X ÷ 100)"
            example="$120 after 20% increase → $100"
          />
        </div>
      </div>
    </div>
  );
}

function FormulaItem({ label, formula, example }: { label: string; formula: string; example: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5">
      <div className="text-xs font-semibold text-white">{label}</div>
      <div className="mt-1 font-mono text-[11px] text-[#6c63ff]">{formula}</div>
      <div className="mt-1 text-[10px] text-muted-2">e.g. {example}</div>
    </div>
  );
}
