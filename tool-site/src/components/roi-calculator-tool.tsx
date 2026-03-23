"use client";

import { useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   ROI CALCULATOR
   – Simple ROI
   – Annualized ROI
   – Total Return (with recurring contributions)
   – Break-even Calculator
   ═══════════════════════════════════════════════════════ */

const fmt = (n: number) => {
  if (Number.isNaN(n) || !Number.isFinite(n)) return "—";
  return parseFloat(n.toFixed(4)).toLocaleString(undefined, { maximumFractionDigits: 4 });
};

const fmtMoney = (n: number) => {
  if (Number.isNaN(n) || !Number.isFinite(n)) return "—";
  return parseFloat(n.toFixed(2)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/* ── Section 1: Simple ROI ── */
function SimpleROI() {
  const [invested, setInvested] = useState("");
  const [returned, setReturned] = useState("");
  const [result, setResult] = useState<{ roi: string; gain: string; direction: "gain" | "loss" } | null>(null);

  const calculate = useCallback(() => {
    const inv = parseFloat(invested);
    const ret = parseFloat(returned);
    if (Number.isNaN(inv) || Number.isNaN(ret) || inv === 0) return;
    const gain = ret - inv;
    const roi = (gain / inv) * 100;
    setResult({ roi: fmt(Math.abs(roi)), gain: fmtMoney(gain), direction: gain >= 0 ? "gain" : "loss" });
  }, [invested, returned]);

  return (
    <CalcCard title="Simple ROI Calculator" subtitle="Return on Investment = (Gain − Cost) ÷ Cost × 100">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Amount Invested</span>
        <NumInput value={invested} onChange={setInvested} placeholder="Invested" />
        <span className="text-muted">Amount Returned</span>
        <NumInput value={returned} onChange={setReturned} placeholder="Returned" />
        <CalcButton onClick={calculate} />
      </div>
      {result && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${
              result.direction === "gain" ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"
            }`}
          >
            {result.direction === "gain" ? "↑" : "↓"}
          </div>
          <div>
            <div className="text-xs text-muted">
              {result.direction === "gain" ? "Gain" : "Loss"}: {result.gain}
            </div>
            <div
              className={`font-display text-xl font-bold ${
                result.direction === "gain" ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {result.roi}% ROI
            </div>
          </div>
        </div>
      )}
    </CalcCard>
  );
}

/* ── Section 2: Annualized ROI ── */
function AnnualizedROI() {
  const [invested, setInvested] = useState("");
  const [returned, setReturned] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<{ annualROI: string; totalROI: string; gain: string } | null>(null);

  const calculate = useCallback(() => {
    const inv = parseFloat(invested);
    const ret = parseFloat(returned);
    const y = parseFloat(years);
    if (Number.isNaN(inv) || Number.isNaN(ret) || Number.isNaN(y) || inv <= 0 || y <= 0) return;
    const totalROI = ((ret - inv) / inv) * 100;
    const annualized = (Math.pow(ret / inv, 1 / y) - 1) * 100;
    setResult({
      annualROI: fmt(annualized),
      totalROI: fmt(totalROI),
      gain: fmtMoney(ret - inv),
    });
  }, [invested, returned, years]);

  return (
    <CalcCard title="Annualized ROI" subtitle="CAGR — Compound Annual Growth Rate of your investment">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Invested</span>
        <NumInput value={invested} onChange={setInvested} placeholder="Invested" />
        <span className="text-muted">Returned</span>
        <NumInput value={returned} onChange={setReturned} placeholder="Returned" />
        <span className="text-muted">Years</span>
        <NumInput value={years} onChange={setYears} placeholder="Years" />
        <CalcButton onClick={calculate} />
      </div>
      {result && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MiniResult label="Annualized ROI (CAGR)" value={`${result.annualROI}%`} color="#6c63ff" />
          <MiniResult label="Total ROI" value={`${result.totalROI}%`} color="#38d9a9" />
          <MiniResult label="Total Gain / Loss" value={result.gain} color="#ff6584" />
        </div>
      )}
    </CalcCard>
  );
}

/* ── Section 3: Investment Return with Contributions ── */
function InvestmentReturn() {
  const [initial, setInitial] = useState("");
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<{
    finalValue: string;
    totalContributed: string;
    totalGain: string;
    roi: string;
  } | null>(null);

  const calculate = useCallback(() => {
    const P = parseFloat(initial) || 0;
    const C = parseFloat(monthly) || 0;
    const r = parseFloat(rate);
    const y = parseFloat(years);
    if (Number.isNaN(r) || Number.isNaN(y) || y <= 0) return;
    const monthlyRate = r / 100 / 12;
    const months = Math.round(y * 12);

    let balance = P;
    for (let m = 0; m < months; m++) {
      balance = balance * (1 + monthlyRate) + C;
    }
    const totalContributed = P + C * months;
    const gain = balance - totalContributed;
    const roi = totalContributed !== 0 ? (gain / totalContributed) * 100 : 0;

    setResult({
      finalValue: fmtMoney(balance),
      totalContributed: fmtMoney(totalContributed),
      totalGain: fmtMoney(gain),
      roi: fmt(roi),
    });
  }, [initial, monthly, rate, years]);

  return (
    <CalcCard title="Investment Growth Calculator" subtitle="Project future value with monthly contributions and compound growth">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Initial</span>
        <NumInput value={initial} onChange={setInitial} placeholder="Initial" />
        <span className="text-muted">Monthly</span>
        <NumInput value={monthly} onChange={setMonthly} placeholder="Monthly" />
        <span className="text-muted">Rate %/yr</span>
        <NumInput value={rate} onChange={setRate} placeholder="Rate" />
        <span className="text-muted">Years</span>
        <NumInput value={years} onChange={setYears} placeholder="Years" />
        <CalcButton onClick={calculate} />
      </div>
      {result && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniResult label="Final Value" value={result.finalValue} color="#38d9a9" />
          <MiniResult label="Total Contributed" value={result.totalContributed} color="#9b9bb3" />
          <MiniResult label="Total Gain" value={result.totalGain} color="#6c63ff" />
          <MiniResult label="ROI" value={`${result.roi}%`} color="#ff6584" />
        </div>
      )}
    </CalcCard>
  );
}

/* ── Section 4: Break-Even Calculator ── */
function BreakEven() {
  const [fixedCosts, setFixedCosts] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [result, setResult] = useState<{ units: string; revenue: string } | null>(null);

  const calculate = useCallback(() => {
    const fc = parseFloat(fixedCosts);
    const p = parseFloat(pricePerUnit);
    const c = parseFloat(costPerUnit);
    if (Number.isNaN(fc) || Number.isNaN(p) || Number.isNaN(c) || p <= c) return;
    const units = fc / (p - c);
    setResult({ units: fmt(Math.ceil(units)), revenue: fmtMoney(Math.ceil(units) * p) });
  }, [fixedCosts, pricePerUnit, costPerUnit]);

  return (
    <CalcCard title="Break-Even Calculator" subtitle="How many units do you need to sell to cover your costs?">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Fixed Costs</span>
        <NumInput value={fixedCosts} onChange={setFixedCosts} placeholder="Fixed" />
        <span className="text-muted">Price/Unit</span>
        <NumInput value={pricePerUnit} onChange={setPricePerUnit} placeholder="Price" />
        <span className="text-muted">Cost/Unit</span>
        <NumInput value={costPerUnit} onChange={setCostPerUnit} placeholder="Cost" />
        <CalcButton onClick={calculate} />
      </div>
      {result && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MiniResult label="Break-Even Units" value={result.units} color="#6c63ff" />
          <MiniResult label="Break-Even Revenue" value={result.revenue} color="#38d9a9" />
        </div>
      )}
    </CalcCard>
  );
}

/* ── shared sub-components ── */
function CalcCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
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

function NumInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
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
    <button onClick={onClick} className="rounded-lg bg-[#6c63ff] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#5b53ee] active:scale-95">
      Calculate
    </button>
  );
}

function MiniResult({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className="font-display mt-1 text-xl font-bold" style={{ color }}>{value}</div>
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

/* ── main export ── */
export default function ROICalculatorTool() {
  return (
    <div className="space-y-6">
      <SimpleROI />
      <AnnualizedROI />
      <InvestmentReturn />
      <BreakEven />

      {/* Formula reference */}
      <div className="rounded-2xl border border-border bg-surface px-5 py-4">
        <h3 className="font-display text-sm font-bold text-white">ROI Formulas</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 text-xs text-muted sm:grid-cols-2">
          <FormulaItem label="Simple ROI" formula="(Return − Investment) ÷ Investment × 100" example="($1,500 − $1,000) ÷ $1,000 = 50%" />
          <FormulaItem label="Annualized ROI (CAGR)" formula="(Final ÷ Initial)^(1/years) − 1" example="$2,000 from $1,000 in 3yr = 26%" />
          <FormulaItem label="Break-Even Units" formula="Fixed Costs ÷ (Price − Variable Cost)" example="$10,000 ÷ ($50 − $30) = 500 units" />
          <FormulaItem label="Future Value" formula="PV(1+r)ⁿ + C × [(1+r)ⁿ − 1] ÷ r" example="$10k + $500/mo at 8% for 10yr" />
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="📈" title="Simple & Annualized" desc="Calculate basic ROI or annualized CAGR to compare investments over different time periods." />
        <InfoCard icon="💰" title="Growth Projections" desc="Project future investment value with monthly contributions and compound interest." />
        <InfoCard icon="🔒" title="100% Private" desc="All calculations run in your browser. No financial data is sent anywhere." />
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
