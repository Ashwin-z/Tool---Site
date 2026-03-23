"use client";

import { useState, useMemo, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   LOAN EMI CALCULATOR — Monthly EMI, Total Interest,
   Amortization Schedule, Pie Chart
   ═══════════════════════════════════════════════════════ */

interface EmiResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  schedule: MonthRow[];
}

interface MonthRow {
  month: number;
  principal: number;
  interest: number;
  balance: number;
}

function calcEmi(P: number, annualRate: number, tenureMonths: number): EmiResult | null {
  if (P <= 0 || annualRate < 0 || tenureMonths <= 0) return null;
  if (annualRate === 0) {
    const emi = P / tenureMonths;
    const schedule: MonthRow[] = [];
    let bal = P;
    for (let m = 1; m <= tenureMonths; m++) {
      bal -= emi;
      schedule.push({ month: m, principal: emi, interest: 0, balance: Math.max(0, bal) });
    }
    return { emi, totalInterest: 0, totalPayment: P, schedule };
  }
  const R = annualRate / 12 / 100;
  const N = tenureMonths;
  const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
  const schedule: MonthRow[] = [];
  let bal = P;
  let totalInterest = 0;
  for (let m = 1; m <= N; m++) {
    const intPart = bal * R;
    const prinPart = emi - intPart;
    bal -= prinPart;
    totalInterest += intPart;
    schedule.push({ month: m, principal: prinPart, interest: intPart, balance: Math.max(0, bal) });
  }
  return { emi, totalInterest, totalPayment: emi * N, schedule };
}

const CURRENCIES = [
  { symbol: "Rs", code: "PKR", label: "Rs PKR" },
  { symbol: "₹", code: "INR", label: "₹ INR" },
  { symbol: "$", code: "USD", label: "$ USD" },
  { symbol: "€", code: "EUR", label: "€ EUR" },
  { symbol: "£", code: "GBP", label: "£ GBP" },
  { symbol: "¥", code: "JPY", label: "¥ JPY" },
  { symbol: "A$", code: "AUD", label: "A$ AUD" },
  { symbol: "C$", code: "CAD", label: "C$ CAD" },
] as const;

function fmt(n: number): string {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function LoanEmiCalculatorTool() {
  const [principal, setPrincipal] = useState("1000000");
  const [rate, setRate] = useState("8.5");
  const [tenureYears, setTenureYears] = useState("20");
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years");
  const [showFull, setShowFull] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);

  const tenureMonths = useMemo(
    () => (tenureUnit === "years" ? (parseFloat(tenureYears) || 0) * 12 : parseFloat(tenureYears) || 0),
    [tenureYears, tenureUnit]
  );

  const result = useMemo(() => {
    const P = parseFloat(principal.replace(/,/g, "")) || 0;
    const R = parseFloat(rate) || 0;
    return calcEmi(P, R, Math.round(tenureMonths));
  }, [principal, rate, tenureMonths]);

  const handlePrincipal = useCallback((v: string) => setPrincipal(v.replace(/[^0-9.]/g, "")), []);

  // Pie chart percentages
  const principalPct = result ? (parseFloat(principal.replace(/,/g, "")) / result.totalPayment) * 100 : 0;
  const interestPct = result ? 100 - principalPct : 0;

  // visible schedule rows
  const visibleSchedule = result ? (showFull ? result.schedule : result.schedule.slice(0, 12)) : [];

  return (
    <div className="space-y-4">
      {/* ── Inputs ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Loan Details</h2>
          <select
            value={currency.code}
            onChange={(e) => setCurrency(CURRENCIES.find((c) => c.code === e.target.value) || CURRENCIES[0])}
            className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-white outline-none transition focus:border-[#6c63ff]/60"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4 px-5 py-5">
          {/* Principal */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
              Loan Amount ({currency.symbol})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={principal}
              onChange={(e) => handlePrincipal(e.target.value)}
              placeholder="1000000"
              className="w-full max-w-xs rounded-lg border border-border-strong bg-surface-2 px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-muted-3"
            />
          </div>

          {/* Rate + Tenure row */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="8.5"
                className="w-36 rounded-lg border border-border-strong bg-surface-2 px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-muted-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                Loan Tenure
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(e.target.value)}
                  placeholder="20"
                  className="w-24 rounded-lg border border-border-strong bg-surface-2 px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-muted-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <div className="flex rounded-lg border border-border bg-surface-2 p-0.5 text-xs">
                  <button
                    onClick={() => setTenureUnit("years")}
                    className={`rounded-md px-2.5 py-1.5 font-semibold transition ${tenureUnit === "years" ? "bg-[#6c63ff] text-white" : "text-muted hover:text-foreground"}`}
                  >
                    Yr
                  </button>
                  <button
                    onClick={() => setTenureUnit("months")}
                    className={`rounded-md px-2.5 py-1.5 font-semibold transition ${tenureUnit === "months" ? "bg-[#6c63ff] text-white" : "text-muted hover:text-foreground"}`}
                  >
                    Mo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <>
          {/* ── Result cards ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ResultCard label="Monthly EMI" value={`${currency.symbol}${fmt(result.emi)}`} accent="#6c63ff" />
            <ResultCard label="Total Interest" value={`${currency.symbol}${fmt(result.totalInterest)}`} accent="#ff6584" />
            <ResultCard label="Total Payment" value={`${currency.symbol}${fmt(result.totalPayment)}`} accent="#38d9a9" />
          </div>

          {/* ── Breakdown bar ── */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">Payment Breakdown</h3>
            </div>
            <div className="px-5 py-5">
              {/* Stacked bar */}
              <div className="flex h-6 w-full overflow-hidden rounded-full">
                <div
                  className="flex items-center justify-center text-[10px] font-bold text-white transition-all"
                  style={{ width: `${principalPct}%`, backgroundColor: "#6c63ff" }}
                >
                  {principalPct > 15 ? `${principalPct.toFixed(0)}%` : ""}
                </div>
                <div
                  className="flex items-center justify-center text-[10px] font-bold text-white transition-all"
                  style={{ width: `${interestPct}%`, backgroundColor: "#ff6584" }}
                >
                  {interestPct > 15 ? `${interestPct.toFixed(0)}%` : ""}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-5 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#6c63ff]" />
                  <span className="text-muted">Principal:</span>
                  <span className="font-semibold text-white">{currency.symbol}{fmt(parseFloat(principal.replace(/,/g, "")) || 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ff6584]" />
                  <span className="text-muted">Interest:</span>
                  <span className="font-semibold text-white">{currency.symbol}{fmt(result.totalInterest)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Amortization Schedule ── */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">Amortization Schedule</h3>
              <span className="text-[10px] text-muted-2">{result.schedule.length} months</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                    <th className="px-5 py-2.5">#</th>
                    <th className="px-5 py-2.5">Principal</th>
                    <th className="px-5 py-2.5">Interest</th>
                    <th className="px-5 py-2.5">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visibleSchedule.map((r) => (
                    <tr key={r.month} className="text-foreground/85">
                      <td className="px-5 py-2 text-muted-2">{r.month}</td>
                      <td className="px-5 py-2">{currency.symbol}{fmt(r.principal)}</td>
                      <td className="px-5 py-2">{currency.symbol}{fmt(r.interest)}</td>
                      <td className="px-5 py-2">{currency.symbol}{fmt(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.schedule.length > 12 && (
              <div className="border-t border-border px-5 py-3 text-center">
                <button
                  onClick={() => setShowFull((f) => !f)}
                  className="text-xs font-semibold text-[#6c63ff] hover:text-[#8b84ff] transition"
                >
                  {showFull ? "Show Less ▲" : `Show All ${result.schedule.length} Months ▼`}
                </button>
              </div>
            )}
          </div>

          {/* ── Formula ── */}
          <div className="rounded-2xl border border-border bg-surface px-5 py-4">
            <h4 className="mb-2 font-display text-xs font-bold uppercase tracking-wider text-muted-2">EMI Formula</h4>
            <div className="font-mono text-sm text-muted">
              EMI = P × R × (1 + R)<sup>N</sup> / ((1 + R)<sup>N</sup> − 1)
            </div>
            <div className="mt-2 text-[10px] text-muted-2">
              P = Principal · R = Monthly Rate (annual / 12 / 100) · N = Total Months
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ResultCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="h-[2px]" style={{ backgroundColor: accent }} />
      <div className="px-5 py-4 text-center">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
        <div className="font-display text-2xl font-bold text-white">{value}</div>
      </div>
    </div>
  );
}
