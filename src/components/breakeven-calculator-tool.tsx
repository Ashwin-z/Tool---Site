"use client";

import { useState, useMemo } from "react";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "MXN", symbol: "Mex$", name: "Mexican Peso" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
];

export default function BreakevenCalculatorTool() {
  const [fixedCosts, setFixedCosts] = useState("");
  const [variableCost, setVariableCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [currency, setCurrency] = useState("USD");

  const result = useMemo(() => {
    const fc = parseFloat(fixedCosts) || 0;
    const vc = parseFloat(variableCost) || 0;
    const sp = parseFloat(sellingPrice) || 0;

    if (fc <= 0 || sp <= 0 || sp <= vc) return null;

    const contributionMargin = sp - vc;
    const contributionRatio = contributionMargin / sp;
    const breakEvenUnits = Math.ceil(fc / contributionMargin);
    const breakEvenRevenue = breakEvenUnits * sp;

    // Profit table
    const table = [];
    const steps = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
    for (const mult of steps) {
      const units = Math.round(breakEvenUnits * mult);
      const revenue = units * sp;
      const totalCost = fc + units * vc;
      const profit = revenue - totalCost;
      table.push({ units, revenue, totalCost, profit });
    }

    return { breakEvenUnits, breakEvenRevenue, contributionMargin, contributionRatio, table };
  }, [fixedCosts, variableCost, sellingPrice]);

  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || "$";

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Enter Cost Details</h2>
        </div>

        <div className="flex flex-wrap items-end gap-4 px-5 py-5">
          <InputField label={`Fixed Costs (${currencySymbol})`} value={fixedCosts} onChange={setFixedCosts} placeholder="10000" />
          <InputField label={`Variable Cost per Unit (${currencySymbol})`} value={variableCost} onChange={setVariableCost} placeholder="25" />
          <InputField label={`Selling Price per Unit (${currencySymbol})`} value={sellingPrice} onChange={setSellingPrice} placeholder="50" />
          <CurrencySelector value={currency} onChange={setCurrency} />
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard
              label="Break-even Units"
              value={result.breakEvenUnits.toLocaleString()}
              color="text-[#6c63ff]"
            />
            <MetricCard
              label="Break-even Revenue"
              value={`${currencySymbol}${result.breakEvenRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              color="text-[#38d9a9]"
            />
            <MetricCard
              label="Contribution Margin"
              value={`${currencySymbol}${result.contributionMargin.toFixed(2)}`}
              color="text-[#ff6584]"
            />
            <MetricCard
              label="Contribution Ratio"
              value={`${(result.contributionRatio * 100).toFixed(1)}%`}
              color="text-[#ffa640]"
            />
          </div>

          {/* Visual bar */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-[#6c63ff]" />
                Break-even Point
              </h3>
            </div>
            <div className="px-5 py-5">
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-surface-2">
                <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#ff6584] to-[#6c63ff]" style={{ width: "50%" }} />
                <div className="absolute inset-y-0 left-[50%] w-0.5 bg-white shadow-[0_0_6px_rgba(255,255,255,.6)]" />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-2">
                <span>0 units</span>
                <span className="font-semibold text-white">{result.breakEvenUnits.toLocaleString()} units</span>
                <span>{(result.breakEvenUnits * 2).toLocaleString()} units</span>
              </div>
              <div className="mt-1 flex justify-between text-[10px]">
                <span className="text-[#ff6584]">← Loss zone</span>
                <span className="text-[#38d9a9]">Profit zone →</span>
              </div>
            </div>
          </div>

          {/* Profit/Loss table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">Profit / Loss at Different Volumes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                    <th className="px-5 py-3 text-left">Units</th>
                    <th className="px-5 py-3 text-right">Revenue</th>
                    <th className="px-5 py-3 text-right">Total Cost</th>
                    <th className="px-5 py-3 text-right">Profit / Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.table.map((row, i) => (
                    <tr
                      key={i}
                      className={row.units === result.breakEvenUnits ? "bg-[#6c63ff]/10" : ""}
                    >
                      <td className="px-5 py-2.5 font-semibold text-white">
                        {row.units.toLocaleString()}
                        {row.units === result.breakEvenUnits && (
                          <span className="ml-2 text-[10px] text-[#6c63ff]">BREAK-EVEN</span>
                        )}
                      </td>
                      <td className="px-5 py-2.5 text-right text-muted">
                        {currencySymbol}{row.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-2.5 text-right text-muted">
                        {currencySymbol}{row.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`px-5 py-2.5 text-right font-semibold ${row.profit >= 0 ? "text-[#38d9a9]" : "text-[#ff6584]"}`}>
                        {row.profit >= 0 ? "+" : ""}{currencySymbol}{row.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {parseFloat(sellingPrice) > 0 && parseFloat(variableCost) >= parseFloat(sellingPrice) && (
        <div className="rounded-2xl border border-[#ff6584]/30 bg-[#ff6584]/5 px-5 py-4 text-center text-sm text-[#ff6584]">
          Selling price must be greater than variable cost per unit to break even.
        </div>
      )}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-44 rounded-lg border border-border-strong bg-surface-2 px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-muted-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}

function CurrencySelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Currency</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-44 rounded-lg border border-border-strong bg-surface-2 px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60"
      >
        {CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className={`font-display mt-1 text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
