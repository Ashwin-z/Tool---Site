"use client";

import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════
   COMPOUND INTEREST CALCULATOR
   A = P(1 + r/n)^(nt)
   ═══════════════════════════════════════════════════════ */

type Frequency = 1 | 2 | 4 | 12 | 365;

const FREQ_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 1, label: "Annually" },
  { value: 2, label: "Semi-Annually" },
  { value: 4, label: "Quarterly" },
  { value: 12, label: "Monthly" },
  { value: 365, label: "Daily" },
];

interface CiResult {
  amount: number;
  interest: number;
  schedule: YearRow[];
}

interface YearRow {
  year: number;
  openBal: number;
  interestEarned: number;
  closeBal: number;
}

function calcCi(P: number, r: number, t: number, n: Frequency): CiResult | null {
  if (P <= 0 || r < 0 || t <= 0) return null;
  const rate = r / 100;
  const amount = P * Math.pow(1 + rate / n, n * t);
  const interest = amount - P;

  // year-by-year schedule
  const schedule: YearRow[] = [];
  for (let y = 1; y <= t; y++) {
    const openBal = P * Math.pow(1 + rate / n, n * (y - 1));
    const closeBal = P * Math.pow(1 + rate / n, n * y);
    schedule.push({ year: y, openBal, interestEarned: closeBal - openBal, closeBal });
  }

  return { amount, interest, schedule };
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

export default function CompoundInterestCalculatorTool() {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("12");
  const [time, setTime] = useState("5");
  const [frequency, setFrequency] = useState<Frequency>(12);
  const [showFull, setShowFull] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);

  const result = useMemo(() => {
    const P = parseFloat(principal.replace(/,/g, "")) || 0;
    const r = parseFloat(rate) || 0;
    const t = parseFloat(time) || 0;
    return calcCi(P, r, Math.round(t), frequency);
  }, [principal, rate, time, frequency]);

  const P_num = parseFloat(principal.replace(/,/g, "")) || 0;
  const principalPct = result && result.amount > 0 ? (P_num / result.amount) * 100 : 0;
  const interestPct = result ? 100 - principalPct : 0;

  // Simple interest for comparison
  const simpleInterest = useMemo(() => {
    const P = parseFloat(principal.replace(/,/g, "")) || 0;
    const r = parseFloat(rate) || 0;
    const t = parseFloat(time) || 0;
    return P * (r / 100) * t;
  }, [principal, rate, time]);

  const visibleSchedule = result ? (showFull ? result.schedule : result.schedule.slice(0, 10)) : [];

  // Growth bars max for visual scaling
  const maxClose = result ? Math.max(...result.schedule.map((r) => r.closeBal)) : 0;

  return (
    <div className="space-y-4">
      {/* ── Inputs ── */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Investment Details</h2>
          <select
            value={currency.code}
            onChange={(e) => setCurrency(CURRENCIES.find((c) => c.code === e.target.value) || CURRENCIES[0])}
            className="rounded-lg border border-white/10 bg-[#17171f] px-3 py-1.5 text-xs font-semibold text-white outline-none transition focus:border-[#6c63ff]/60"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4 px-5 py-5">
          {/* Principal */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#57576f]">
              Principal Amount ({currency.symbol})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="100000"
              className="w-full max-w-xs rounded-lg border border-white/15 bg-[#17171f] px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-[#515168]"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Rate */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#57576f]">
                Annual Rate (%)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="12"
                className="w-32 rounded-lg border border-white/15 bg-[#17171f] px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-[#515168] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            {/* Time */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#57576f]">
                Time Period (years)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="5"
                className="w-28 rounded-lg border border-white/15 bg-[#17171f] px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-[#515168] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            {/* Frequency */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#57576f]">
                Compounding Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value) as Frequency)}
                className="rounded-lg border border-white/15 bg-[#17171f] px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60"
              >
                {FREQ_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <>
          {/* ── Result cards ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ResultCard label="Total Value" value={`${currency.symbol}${fmt(result.amount)}`} accent="#38d9a9" />
            <ResultCard label="Total Interest" value={`${currency.symbol}${fmt(result.interest)}`} accent="#6c63ff" />
            <ResultCard
              label="Interest Earned vs Simple"
              value={`+${currency.symbol}${fmt(result.interest - simpleInterest)}`}
              accent="#ff6584"
              sub={`SI = ${currency.symbol}${fmt(simpleInterest)}`}
            />
          </div>

          {/* ── Breakdown bar ── */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
            <div className="border-b border-white/10 px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">Value Breakdown</h3>
            </div>
            <div className="px-5 py-5">
              <div className="flex h-6 w-full overflow-hidden rounded-full">
                <div
                  className="flex items-center justify-center text-[10px] font-bold text-white transition-all"
                  style={{ width: `${principalPct}%`, backgroundColor: "#6c63ff" }}
                >
                  {principalPct > 15 ? `${principalPct.toFixed(0)}%` : ""}
                </div>
                <div
                  className="flex items-center justify-center text-[10px] font-bold text-white transition-all"
                  style={{ width: `${interestPct}%`, backgroundColor: "#38d9a9" }}
                >
                  {interestPct > 15 ? `${interestPct.toFixed(0)}%` : ""}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-5 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#6c63ff]" />
                  <span className="text-[#9b9bb3]">Principal:</span>
                  <span className="font-semibold text-white">{currency.symbol}{fmt(P_num)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#38d9a9]" />
                  <span className="text-[#9b9bb3]">Interest:</span>
                  <span className="font-semibold text-white">{currency.symbol}{fmt(result.interest)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Growth visual ── */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
            <div className="border-b border-white/10 px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">Year-by-Year Growth</h3>
            </div>
            <div className="space-y-2 px-5 py-5">
              {result.schedule.map((row) => {
                const pctPrincipal = maxClose > 0 ? (P_num / maxClose) * 100 : 0;
                const pctInterest = maxClose > 0 ? ((row.closeBal - P_num) / maxClose) * 100 : 0;
                return (
                  <div key={row.year} className="flex items-center gap-3 text-xs">
                    <span className="w-10 text-right text-[#57576f]">Y{row.year}</span>
                    <div className="flex h-4 flex-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full transition-all"
                        style={{ width: `${pctPrincipal}%`, backgroundColor: "#6c63ff" }}
                      />
                      <div
                        className="h-full transition-all"
                        style={{ width: `${pctInterest}%`, backgroundColor: "#38d9a9" }}
                      />
                    </div>
                    <span className="w-28 text-right font-semibold text-[#d0d0e0]">{currency.symbol}{fmt(row.closeBal)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Yearly Schedule Table ── */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">Yearly Schedule</h3>
              <span className="text-[10px] text-[#57576f]">{result.schedule.length} years</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-semibold uppercase tracking-wider text-[#57576f]">
                    <th className="px-5 py-2.5">Year</th>
                    <th className="px-5 py-2.5">Opening Balance</th>
                    <th className="px-5 py-2.5">Interest Earned</th>
                    <th className="px-5 py-2.5">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visibleSchedule.map((r) => (
                    <tr key={r.year} className="text-[#d0d0e0]">
                      <td className="px-5 py-2 text-[#57576f]">{r.year}</td>
                      <td className="px-5 py-2">{currency.symbol}{fmt(r.openBal)}</td>
                      <td className="px-5 py-2 text-[#38d9a9]">{currency.symbol}{fmt(r.interestEarned)}</td>
                      <td className="px-5 py-2 font-semibold">{currency.symbol}{fmt(r.closeBal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.schedule.length > 10 && (
              <div className="border-t border-white/10 px-5 py-3 text-center">
                <button
                  onClick={() => setShowFull((f) => !f)}
                  className="text-xs font-semibold text-[#6c63ff] hover:text-[#8b84ff] transition"
                >
                  {showFull ? "Show Less ▲" : `Show All ${result.schedule.length} Years ▼`}
                </button>
              </div>
            )}
          </div>

          {/* ── Formula ── */}
          <div className="rounded-2xl border border-white/10 bg-[#111118] px-5 py-4">
            <h4 className="mb-2 font-display text-xs font-bold uppercase tracking-wider text-[#57576f]">Compound Interest Formula</h4>
            <div className="font-mono text-sm text-[#9b9bb3]">
              A = P × (1 + r/n)<sup>n×t</sup>
            </div>
            <div className="mt-2 space-y-0.5 text-[10px] text-[#57576f]">
              <div>P = Principal · r = Annual Rate (decimal) · n = Compounding Frequency · t = Time (years)</div>
              <div>CI = A − P</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ResultCard({ label, value, accent, sub }: { label: string; value: string; accent: string; sub?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118]">
      <div className="h-[2px]" style={{ backgroundColor: accent }} />
      <div className="px-5 py-4 text-center">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#57576f]">{label}</div>
        <div className="font-display text-2xl font-bold text-white">{value}</div>
        {sub && <div className="mt-0.5 text-[10px] text-[#9b9bb3]">{sub}</div>}
      </div>
    </div>
  );
}
