"use client";

import { useState, useMemo } from "react";

interface DayEntry {
  enabled: boolean;
  start: string;
  end: string;
  breakMin: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const defaultDay = (enabled: boolean): DayEntry => ({
  enabled,
  start: "09:00",
  end: "17:00",
  breakMin: "30",
});

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatHM(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export default function WorkHoursCalculatorTool() {
  const [days, setDays] = useState<DayEntry[]>(
    DAYS.map((_, i) => defaultDay(i < 5))
  );
  const [hourlyRate, setHourlyRate] = useState("");

  const update = (idx: number, patch: Partial<DayEntry>) => {
    setDays((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  };

  const results = useMemo(() => {
    let totalMin = 0;
    const perDay: number[] = [];

    for (const day of days) {
      if (!day.enabled) {
        perDay.push(0);
        continue;
      }
      const start = timeToMinutes(day.start);
      const end = timeToMinutes(day.end);
      const brk = parseInt(day.breakMin) || 0;
      const worked = Math.max(0, end - start - brk);
      perDay.push(worked);
      totalMin += worked;
    }

    const totalHours = totalMin / 60;
    const rate = parseFloat(hourlyRate) || 0;
    const weeklyPay = totalHours * rate;
    const monthlyPay = weeklyPay * 4.33;
    const daysWorked = perDay.filter((m) => m > 0).length;
    const avgPerDay = daysWorked > 0 ? totalMin / daysWorked : 0;

    return { totalMin, perDay, totalHours, weeklyPay, monthlyPay, daysWorked, avgPerDay };
  }, [days, hourlyRate]);

  return (
    <div className="space-y-4">
      {/* Schedule card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Weekly Schedule</h2>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">Hourly Rate ($)</label>
            <input
              type="number"
              inputMode="decimal"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="0"
              className="w-24 rounded-lg border border-border-strong bg-surface-2 px-3 py-1.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-muted-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {DAYS.map((name, i) => (
            <div key={name} className={`flex items-center gap-3 px-5 py-3 ${!days[i].enabled ? "opacity-40" : ""}`}>
              <button
                onClick={() => update(i, { enabled: !days[i].enabled })}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold transition ${
                  days[i].enabled
                    ? "border-[#6c63ff] bg-[#6c63ff] text-white"
                    : "border-white/20 text-transparent"
                }`}
              >
                ✓
              </button>
              <span className="w-24 text-sm font-semibold text-white">{name}</span>

              <input
                type="time"
                value={days[i].start}
                onChange={(e) => update(i, { start: e.target.value })}
                disabled={!days[i].enabled}
                className="rounded-lg border border-border-strong bg-surface-2 px-3 py-1.5 text-sm text-white outline-none transition focus:border-[#6c63ff]/60 disabled:cursor-not-allowed"
              />
              <span className="text-xs text-muted-2">to</span>
              <input
                type="time"
                value={days[i].end}
                onChange={(e) => update(i, { end: e.target.value })}
                disabled={!days[i].enabled}
                className="rounded-lg border border-border-strong bg-surface-2 px-3 py-1.5 text-sm text-white outline-none transition focus:border-[#6c63ff]/60 disabled:cursor-not-allowed"
              />
              <span className="text-xs text-muted-2">break</span>
              <input
                type="number"
                value={days[i].breakMin}
                onChange={(e) => update(i, { breakMin: e.target.value })}
                disabled={!days[i].enabled}
                placeholder="0"
                className="w-16 rounded-lg border border-border-strong bg-surface-2 px-3 py-1.5 text-sm text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-muted-3 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="text-xs text-muted-2">min</span>

              <span className="ml-auto text-sm font-semibold text-muted">
                {days[i].enabled ? formatHM(results.perDay[i]) : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Total Hours" value={formatHM(results.totalMin)} color="text-[#6c63ff]" />
        <SummaryCard label="Days Worked" value={String(results.daysWorked)} color="text-[#38d9a9]" />
        <SummaryCard label="Avg / Day" value={formatHM(Math.round(results.avgPerDay))} color="text-[#ff6584]" />
        <SummaryCard
          label="Decimal Hours"
          value={results.totalHours.toFixed(2)}
          color="text-[#ffa640]"
        />
      </div>

      {/* Pay */}
      {parseFloat(hourlyRate) > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-3/50 text-lg">💰</div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">Weekly Pay</div>
              <div className="font-display text-lg font-bold text-white">
                ${results.weeklyPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-3/50 text-lg">📅</div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">Est. Monthly Pay</div>
              <div className="font-display text-lg font-bold text-white">
                ${results.monthlyPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className={`font-display mt-1 text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
