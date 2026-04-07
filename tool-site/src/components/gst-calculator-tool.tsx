"use client";

import { useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   GST / SALES TAX CALCULATOR
   – Add tax to price (exclusive → inclusive)
   – Remove tax from price (inclusive → exclusive)
   – Multi-item invoice with tax breakdown
   – Reverse tax: find pre-tax price from total
   ═══════════════════════════════════════════════════════ */

const fmt = (n: number) => {
  if (Number.isNaN(n) || !Number.isFinite(n)) return "—";
  return parseFloat(n.toFixed(2)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const PRESETS: { label: string; rate: string }[] = [
  { label: "5%", rate: "5" },
  { label: "8%", rate: "8" },
  { label: "10%", rate: "10" },
  { label: "12%", rate: "12" },
  { label: "18%", rate: "18" },
  { label: "20%", rate: "20" },
  { label: "28%", rate: "28" },
];

/* ── Section 1: Add Tax (Exclusive → Inclusive) ── */
function AddTax() {
  const [price, setPrice] = useState("");
  const [taxRate, setTaxRate] = useState("18");
  const [result, setResult] = useState<{
    taxAmount: string;
    totalPrice: string;
    effectiveRate: string;
  } | null>(null);

  const calculate = useCallback(() => {
    const p = parseFloat(price);
    const r = parseFloat(taxRate);
    if (Number.isNaN(p) || Number.isNaN(r) || p < 0 || r < 0) return;
    const tax = p * (r / 100);
    const total = p + tax;
    setResult({
      taxAmount: fmt(tax),
      totalPrice: fmt(total),
      effectiveRate: fmt(r),
    });
  }, [price, taxRate]);

  return (
    <CalcCard
      title="Add GST / Sales Tax"
      subtitle="Calculate tax-inclusive price from a pre-tax amount"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Price (excl. tax)</span>
        <NumInput value={price} onChange={setPrice} placeholder="Amount" />
        <span className="text-muted">Tax Rate</span>
        <NumInput value={taxRate} onChange={setTaxRate} placeholder="%" />
        <span className="text-muted-2">%</span>
        <CalcButton onClick={calculate} />
      </div>
      <PresetRow
        current={taxRate}
        onSelect={(r) => setTaxRate(r)}
      />
      {result && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MiniResult label="Tax Amount" value={result.taxAmount} color="#ff6584" />
          <MiniResult label="Total (incl. tax)" value={result.totalPrice} color="#6c63ff" />
          <MiniResult label="Tax Rate" value={`${result.effectiveRate}%`} color="#38d9a9" />
        </div>
      )}
    </CalcCard>
  );
}

/* ── Section 2: Remove Tax (Inclusive → Exclusive) ── */
function RemoveTax() {
  const [total, setTotal] = useState("");
  const [taxRate, setTaxRate] = useState("18");
  const [result, setResult] = useState<{
    originalPrice: string;
    taxAmount: string;
  } | null>(null);

  const calculate = useCallback(() => {
    const t = parseFloat(total);
    const r = parseFloat(taxRate);
    if (Number.isNaN(t) || Number.isNaN(r) || t < 0 || r < 0) return;
    const original = t / (1 + r / 100);
    const tax = t - original;
    setResult({
      originalPrice: fmt(original),
      taxAmount: fmt(tax),
    });
  }, [total, taxRate]);

  return (
    <CalcCard
      title="Remove GST / Sales Tax"
      subtitle="Find the pre-tax price from a tax-inclusive amount"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Total (incl. tax)</span>
        <NumInput value={total} onChange={setTotal} placeholder="Total" />
        <span className="text-muted">Tax Rate</span>
        <NumInput value={taxRate} onChange={setTaxRate} placeholder="%" />
        <span className="text-muted-2">%</span>
        <CalcButton onClick={calculate} />
      </div>
      <PresetRow current={taxRate} onSelect={(r) => setTaxRate(r)} />
      {result && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MiniResult label="Pre-Tax Price" value={result.originalPrice} color="#6c63ff" />
          <MiniResult label="Tax Amount" value={result.taxAmount} color="#ff6584" />
        </div>
      )}
    </CalcCard>
  );
}

/* ── Section 3: Multi-item Invoice ── */
interface InvoiceItem {
  id: number;
  description: string;
  amount: string;
  taxRate: string;
}

function InvoiceCalculator() {
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, description: "Item 1", amount: "", taxRate: "18" },
  ]);

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), description: `Item ${prev.length + 1}`, amount: "", taxRate: "18" },
    ]);
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  }, []);

  const updateItem = useCallback(
    (id: number, field: keyof InvoiceItem, value: string) => {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
      );
    },
    []
  );

  const totals = items.reduce(
    (acc, item) => {
      const amt = parseFloat(item.amount) || 0;
      const rate = parseFloat(item.taxRate) || 0;
      const tax = amt * (rate / 100);
      acc.subtotal += amt;
      acc.totalTax += tax;
      acc.grandTotal += amt + tax;
      return acc;
    },
    { subtotal: 0, totalTax: 0, grandTotal: 0 }
  );

  return (
    <CalcCard
      title="Multi-Item Tax Invoice"
      subtitle="Add multiple items with different tax rates to see the full breakdown"
    >
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5"
          >
            <span className="w-5 text-center text-xs font-bold text-muted-2">
              {idx + 1}
            </span>
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateItem(item.id, "description", e.target.value)}
              placeholder="Description"
              className="w-28 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-white outline-none placeholder:text-muted-3 focus:border-[#6c63ff]/60"
            />
            <NumInput
              value={item.amount}
              onChange={(v) => updateItem(item.id, "amount", v)}
              placeholder="Amount"
            />
            <NumInput
              value={item.taxRate}
              onChange={(v) => updateItem(item.id, "taxRate", v)}
              placeholder="%"
            />
            <span className="text-[10px] text-muted-2">%</span>
            <span className="ml-auto text-xs font-semibold text-white">
              {fmt(
                (parseFloat(item.amount) || 0) *
                  (1 + (parseFloat(item.taxRate) || 0) / 100)
              )}
            </span>
            {items.length > 1 && (
              <button
                onClick={() => removeItem(item.id)}
                className="ml-1 text-xs text-muted-2 transition hover:text-rose-400"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="mt-3 rounded-lg border border-dashed border-border px-4 py-2 text-xs font-semibold text-muted transition hover:border-[#6c63ff]/40 hover:text-foreground"
      >
        + Add Item
      </button>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MiniResult label="Subtotal" value={fmt(totals.subtotal)} color="#9b9bb3" />
        <MiniResult label="Total Tax" value={fmt(totals.totalTax)} color="#ff6584" />
        <MiniResult label="Grand Total" value={fmt(totals.grandTotal)} color="#6c63ff" />
      </div>
    </CalcCard>
  );
}

/* ── Section 4: Reverse Tax (find what rate was applied) ── */
function ReverseTax() {
  const [preTax, setPreTax] = useState("");
  const [postTax, setPostTax] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    taxAmount: string;
    taxRate: string;
  } | null>(null);

  const calculate = useCallback(() => {
    const pre = parseFloat(preTax);
    const post = parseFloat(postTax);

    setResult(null);
    setError(null);

    if (Number.isNaN(pre) || Number.isNaN(post)) {
      setError("Enter both the pre-tax and post-tax amounts.");
      return;
    }

    if (pre <= 0) {
      setError("Pre-tax price must be greater than 0.");
      return;
    }

    if (post < pre) {
      setError("Post-tax price must be equal to or greater than the pre-tax price.");
      return;
    }

    const tax = post - pre;
    const rate = (tax / pre) * 100;

    setResult({
      taxAmount: fmt(tax),
      taxRate: fmt(rate),
    });
  }, [preTax, postTax]);

  return (
    <CalcCard
      title="Reverse Tax Rate Finder"
      subtitle="Find the tax rate that was applied by comparing pre-tax and post-tax amounts"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">Pre-Tax Price</span>
        <NumInput value={preTax} onChange={setPreTax} placeholder="Before tax" />
        <span className="text-muted">Post-Tax Price</span>
        <NumInput value={postTax} onChange={setPostTax} placeholder="After tax" />
        <CalcButton onClick={calculate} />
      </div>
      <p className="mt-3 text-xs text-muted-2">
        Example: if the price changed from 100 to 118 after tax, the applied tax rate is 18%.
      </p>
      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MiniResult label="Tax Amount" value={result.taxAmount} color="#ff6584" />
          <MiniResult label="Tax Rate Applied" value={`${result.taxRate}%`} color="#6c63ff" />
        </div>
      )}
    </CalcCard>
  );
}

/* ── shared sub-components ── */
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
        <h2 className="font-display text-sm font-bold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-0.5 text-[11px] text-muted">{subtitle}</p>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function PresetRow({
  current,
  onSelect,
}: {
  current: string;
  onSelect: (rate: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {PRESETS.map((p) => (
        <button
          key={p.rate}
          onClick={() => onSelect(p.rate)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
            current === p.rate
              ? "bg-[#6c63ff] text-white"
              : "border border-border bg-surface-2 text-muted hover:text-foreground"
          }`}
        >
          {p.label}
        </button>
      ))}
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

function MiniResult({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">
        {label}
      </div>
      <div className="font-display mt-1 text-xl font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function FormulaItem({
  label,
  formula,
  example,
}: {
  label: string;
  formula: string;
  example: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5">
      <div className="text-xs font-semibold text-white">{label}</div>
      <div className="mt-1 font-mono text-[11px] text-[#6c63ff]">{formula}</div>
      <div className="mt-1 text-[10px] text-muted-2">e.g. {example}</div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <span className="text-xl">{icon}</span>
      <h4 className="mt-2 text-sm font-semibold text-white">{title}</h4>
      <p className="mt-1 text-xs leading-5 text-muted">{desc}</p>
    </div>
  );
}

/* ── main export ── */
export default function GSTCalculatorTool() {
  return (
    <div className="space-y-6">
      <AddTax />
      <RemoveTax />
      <InvoiceCalculator />
      <ReverseTax />

      {/* Formula reference */}
      <div className="rounded-2xl border border-border bg-surface px-5 py-4">
        <h3 className="font-display text-sm font-bold text-white">
          GST / Sales Tax Formulas
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 text-xs text-muted sm:grid-cols-2">
          <FormulaItem
            label="Add Tax"
            formula="Total = Price × (1 + Rate ÷ 100)"
            example="$100 at 18% → $100 × 1.18 = $118"
          />
          <FormulaItem
            label="Remove Tax"
            formula="Pre-Tax = Total ÷ (1 + Rate ÷ 100)"
            example="$118 at 18% → $118 ÷ 1.18 = $100"
          />
          <FormulaItem
            label="Tax Amount"
            formula="Tax = Price × Rate ÷ 100"
            example="$100 at 18% → $18"
          />
          <FormulaItem
            label="Reverse Tax Rate"
            formula="Rate = (Total − Price) ÷ Price × 100"
            example="$100 → $118 → (18 ÷ 100) = 18%"
          />
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard
          icon="🧾"
          title="Add or Remove Tax"
          desc="Quickly add GST/sales tax to a price, or reverse-calculate the pre-tax price from an inclusive amount."
        />
        <InfoCard
          icon="📋"
          title="Multi-Item Invoice"
          desc="Add multiple line items with different tax rates and get an instant subtotal, tax, and grand total breakdown."
        />
        <InfoCard
          icon="🔒"
          title="100% Private"
          desc="All calculations run in your browser. No financial data is sent to any server."
        />
      </div>
    </div>
  );
}
