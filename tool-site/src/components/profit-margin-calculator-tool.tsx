"use client";

import { useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   PROFIT MARGIN CALCULATOR
   – Margin from Cost & Revenue
   – Markup %
   – Gross / Net Margin
   – Revenue from Cost & desired Margin
   ═══════════════════════════════════════════════════════ */

const fmt = (n: number) => {
  if (Number.isNaN(n) || !Number.isFinite(n)) return "—";
  return parseFloat(n.toFixed(4)).toLocaleString(undefined, { maximumFractionDigits: 4 });
};

/* ── Section 1: Margin from Revenue & Cost ── */
function MarginFromRevenue() {
  const [revenue, setRevenue] = useState("");
  const [cost, setCost] = useState("");
  const [result, setResult] = useState<{
    profit: string;
    margin: string;
    markup: string;
  } | null>(null);

  const calculate = useCallback(() => {
    const r = parseFloat(revenue);
    const c = parseFloat(cost);
    if (Number.isNaN(r) || Number.isNaN(c)) return;
    const profit = r - c;
    const margin = r !== 0 ? (profit / r) * 100 : 0;
    const markup = c !== 0 ? (profit / c) * 100 : 0;
    setResult({ profit: fmt(profit), margin: fmt(margin), markup: fmt(markup) });
  }, [revenue, cost]);

  return (
    <CalcCard title="Profit Margin Calculator" subtitle="Calculate margin & markup from revenue and cost">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Revenue</span>
        <NumInput value={revenue} onChange={setRevenue} placeholder="Revenue" />
        <span className="text-muted">Cost</span>
        <NumInput value={cost} onChange={setCost} placeholder="Cost" />
        <CalcButton onClick={calculate} />
      </div>
      {result && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MiniResult label="Profit" value={result.profit} color="#38d9a9" />
          <MiniResult label="Profit Margin" value={`${result.margin}%`} color="#6c63ff" />
          <MiniResult label="Markup" value={`${result.markup}%`} color="#ff6584" />
        </div>
      )}
    </CalcCard>
  );
}

/* ── Section 2: Revenue from Cost & Desired Margin ── */
function RevenueFromMargin() {
  const [cost, setCost] = useState("");
  const [margin, setMargin] = useState("");
  const [result, setResult] = useState<{ revenue: string; profit: string } | null>(null);

  const calculate = useCallback(() => {
    const c = parseFloat(cost);
    const m = parseFloat(margin);
    if (Number.isNaN(c) || Number.isNaN(m) || m >= 100) return;
    const rev = c / (1 - m / 100);
    setResult({ revenue: fmt(rev), profit: fmt(rev - c) });
  }, [cost, margin]);

  return (
    <CalcCard title="Revenue from Desired Margin" subtitle="How much should you charge to hit a target margin?">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Cost</span>
        <NumInput value={cost} onChange={setCost} placeholder="Cost" />
        <span className="text-muted">Desired Margin</span>
        <NumInput value={margin} onChange={setMargin} placeholder="%" />
        <span className="text-muted">%</span>
        <CalcButton onClick={calculate} />
      </div>
      {result && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MiniResult label="Required Revenue" value={result.revenue} color="#6c63ff" />
          <MiniResult label="Profit" value={result.profit} color="#38d9a9" />
        </div>
      )}
    </CalcCard>
  );
}

/* ── Section 3: Selling Price from Cost & Markup ── */
function PriceFromMarkup() {
  const [cost, setCost] = useState("");
  const [markup, setMarkup] = useState("");
  const [result, setResult] = useState<{ price: string; profit: string; margin: string } | null>(null);

  const calculate = useCallback(() => {
    const c = parseFloat(cost);
    const m = parseFloat(markup);
    if (Number.isNaN(c) || Number.isNaN(m)) return;
    const price = c * (1 + m / 100);
    const profit = price - c;
    const marginPct = price !== 0 ? (profit / price) * 100 : 0;
    setResult({ price: fmt(price), profit: fmt(profit), margin: fmt(marginPct) });
  }, [cost, markup]);

  return (
    <CalcCard title="Price from Markup %" subtitle="Calculate selling price based on cost and markup percentage">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Cost</span>
        <NumInput value={cost} onChange={setCost} placeholder="Cost" />
        <span className="text-muted">Markup</span>
        <NumInput value={markup} onChange={setMarkup} placeholder="%" />
        <span className="text-muted">%</span>
        <CalcButton onClick={calculate} />
      </div>
      {result && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MiniResult label="Selling Price" value={result.price} color="#6c63ff" />
          <MiniResult label="Profit" value={result.profit} color="#38d9a9" />
          <MiniResult label="Equivalent Margin" value={`${result.margin}%`} color="#ff6584" />
        </div>
      )}
    </CalcCard>
  );
}

/* ── Section 4: Gross vs Net Margin ── */
function GrossNetMargin() {
  const [revenue, setRevenue] = useState("");
  const [cogs, setCogs] = useState("");
  const [expenses, setExpenses] = useState("");
  const [result, setResult] = useState<{
    grossProfit: string;
    grossMargin: string;
    netProfit: string;
    netMargin: string;
  } | null>(null);

  const calculate = useCallback(() => {
    const r = parseFloat(revenue);
    const c = parseFloat(cogs);
    const e = parseFloat(expenses) || 0;
    if (Number.isNaN(r) || Number.isNaN(c)) return;
    const gross = r - c;
    const net = gross - e;
    setResult({
      grossProfit: fmt(gross),
      grossMargin: r !== 0 ? fmt((gross / r) * 100) : "0",
      netProfit: fmt(net),
      netMargin: r !== 0 ? fmt((net / r) * 100) : "0",
    });
  }, [revenue, cogs, expenses]);

  return (
    <CalcCard title="Gross & Net Margin" subtitle="Revenue minus COGS = gross; minus operating expenses = net">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Revenue</span>
        <NumInput value={revenue} onChange={setRevenue} placeholder="Revenue" />
        <span className="text-muted">COGS</span>
        <NumInput value={cogs} onChange={setCogs} placeholder="COGS" />
        <span className="text-muted">Operating Expenses</span>
        <NumInput value={expenses} onChange={setExpenses} placeholder="Expenses" />
        <CalcButton onClick={calculate} />
      </div>
      {result && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniResult label="Gross Profit" value={result.grossProfit} color="#38d9a9" />
          <MiniResult label="Gross Margin" value={`${result.grossMargin}%`} color="#6c63ff" />
          <MiniResult label="Net Profit" value={result.netProfit} color="#38d9a9" />
          <MiniResult label="Net Margin" value={`${result.netMargin}%`} color="#ff6584" />
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
export default function ProfitMarginCalculatorTool() {
  return (
    <div className="space-y-6">
      <MarginFromRevenue />
      <RevenueFromMargin />
      <PriceFromMarkup />
      <GrossNetMargin />

      {/* Formula reference */}
      <div className="rounded-2xl border border-border bg-surface px-5 py-4">
        <h3 className="font-display text-sm font-bold text-white">Profit Margin Formulas</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 text-xs text-muted sm:grid-cols-2">
          <FormulaItem label="Profit Margin" formula="(Revenue − Cost) ÷ Revenue × 100" example="($150 − $100) ÷ $150 = 33.3%" />
          <FormulaItem label="Markup" formula="(Revenue − Cost) ÷ Cost × 100" example="($150 − $100) ÷ $100 = 50%" />
          <FormulaItem label="Revenue from Margin" formula="Cost ÷ (1 − Margin ÷ 100)" example="$100 ÷ (1 − 0.30) = $142.86" />
          <FormulaItem label="Net Margin" formula="(Revenue − COGS − Expenses) ÷ Revenue × 100" example="($500 − $200 − $100) ÷ $500 = 40%" />
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="📊" title="Margin vs Markup" desc="Margin is profit as % of revenue. Markup is profit as % of cost. A 50% markup = 33.3% margin." />
        <InfoCard icon="💼" title="Business Ready" desc="Calculate gross and net margins with COGS and operating expenses to understand true profitability." />
        <InfoCard icon="🔒" title="100% Private" desc="All calculations run in your browser. No data is sent to any server." />
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
