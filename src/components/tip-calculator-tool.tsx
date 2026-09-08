"use client";

import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════
   TIP CALCULATOR — Split bills with custom tip %
   ═══════════════════════════════════════════════════════ */

const QUICK_TIPS = [10, 15, 18, 20, 25];

export default function TipCalculatorTool() {
  const [billAmount, setBillAmount] = useState("");
  const [tipPercent, setTipPercent] = useState("15");
  const [numPeople, setNumPeople] = useState("1");

  const result = useMemo(() => {
    const bill = parseFloat(billAmount);
    const tip = parseFloat(tipPercent);
    const people = parseInt(numPeople, 10);
    if (!bill || bill <= 0 || isNaN(tip) || tip < 0 || !people || people < 1) return null;

    const tipAmount = bill * (tip / 100);
    const totalAmount = bill + tipAmount;
    const tipPerPerson = tipAmount / people;
    const totalPerPerson = totalAmount / people;

    return { tipAmount, totalAmount, tipPerPerson, totalPerPerson, bill, tip, people };
  }, [billAmount, tipPercent, numPeople]);

  return (
    <div className="space-y-4">
      {/* ── Input card ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Enter Bill Details</h2>
          <p className="mt-1 text-xs text-muted">
            Enter your bill amount, select a tip percentage, and split between people.
          </p>
        </div>

        <div className="space-y-5 px-5 py-5">
          {/* Bill amount */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
              Bill Amount ($)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              placeholder="0.00"
              min={0}
              className="w-full rounded-lg border border-border-strong bg-surface-2 px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-muted-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          {/* Quick tip buttons */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
              Tip Percentage
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_TIPS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTipPercent(String(t))}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    tipPercent === String(t)
                      ? "bg-[#6c63ff] text-white"
                      : "border border-border bg-surface-2 text-muted hover:text-foreground"
                  }`}
                >
                  {t}%
                </button>
              ))}
              <input
                type="number"
                inputMode="decimal"
                value={tipPercent}
                onChange={(e) => setTipPercent(e.target.value)}
                placeholder="Custom"
                min={0}
                className="w-24 rounded-lg border border-border-strong bg-surface-2 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-muted-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Number of people */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
              Number of People
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNumPeople(String(Math.max(1, (parseInt(numPeople, 10) || 1) - 1)))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-2 text-lg font-bold text-white transition hover:bg-surface-3"
              >
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
                min={1}
                className="w-20 rounded-lg border border-border-strong bg-surface-2 px-4 py-2.5 text-center text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                onClick={() => setNumPeople(String((parseInt(numPeople, 10) || 1) + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-2 text-lg font-bold text-white transition hover:bg-surface-3"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      {result && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ResultCard
              label="Tip Amount"
              value={`$${result.tipAmount.toFixed(2)}`}
              sub={`${result.tip}% of $${result.bill.toFixed(2)}`}
              accent="bg-[#6c63ff]"
            />
            <ResultCard
              label="Total Amount"
              value={`$${result.totalAmount.toFixed(2)}`}
              sub="Bill + Tip"
              accent="bg-[#38d9a9]"
            />
          </div>

          {result.people > 1 && (
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                <span className="h-2 w-2 rounded-full bg-[#ff6584]" />
                <h3 className="font-display text-sm font-bold tracking-tight text-white">
                  Split Between {result.people} People
                </h3>
              </div>
              <div className="grid grid-cols-1 divide-y divide-white/5 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="px-5 py-4">
                  <div className="text-xs font-semibold text-muted">Tip Per Person</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-[#6c63ff]">
                    ${result.tipPerPerson.toFixed(2)}
                  </div>
                </div>
                <div className="px-5 py-4">
                  <div className="text-xs font-semibold text-muted">Total Per Person</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-[#38d9a9]">
                    ${result.totalPerPerson.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tip comparison table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">Tip Comparison</h3>
            </div>
            <div className="divide-y divide-white/5">
              {QUICK_TIPS.map((t) => {
                const tipAmt = result.bill * (t / 100);
                const total = result.bill + tipAmt;
                const isActive = t === result.tip;
                return (
                  <div
                    key={t}
                    className={`flex items-center justify-between px-5 py-2.5 text-sm ${
                      isActive ? "bg-surface-3/50" : ""
                    }`}
                  >
                    <span className={isActive ? "font-semibold text-white" : "text-muted"}>{t}%</span>
                    <span className="text-xs text-muted-2">${tipAmt.toFixed(2)} tip</span>
                    <span className={`font-mono text-sm ${isActive ? "font-semibold text-white" : "text-muted"}`}>
                      ${total.toFixed(2)}
                    </span>
                    {isActive && <span className="text-xs text-[#6c63ff]">← Selected</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_40px_rgba(0,0,0,.45)]">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className={`h-2 w-2 rounded-full ${accent}`} />
        <h3 className="font-display text-sm font-bold tracking-tight text-white">{label}</h3>
      </div>
      <div className="px-5 py-6">
        <div className="font-mono text-4xl font-extrabold tracking-tight text-white">{value}</div>
        <div className="mt-1 text-xs text-muted">{sub}</div>
      </div>
    </div>
  );
}
