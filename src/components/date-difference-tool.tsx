"use client";

import { useMemo, useState } from "react";

function toDateAtMidnight(value: string) {
  // Avoid DST drift by anchoring to local midnight.
  const d = new Date(value + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function formatNumber(n: number) {
  return n.toLocaleString();
}

export default function DateDifferenceTool() {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState(today);

  const result = useMemo(() => {
    if (!from || !to) return null;
    const a = toDateAtMidnight(from);
    const b = toDateAtMidnight(to);
    if (!a || !b) return null;

    const diffMs = b.getTime() - a.getTime();
    if (diffMs < 0) return { error: "End date must be on or after start date." } as const;

    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    const weeks = Math.floor(totalDays / 7);
    const daysRemainder = totalDays % 7;

    return {
      totalDays,
      totalHours,
      totalMinutes,
      weeks,
      daysRemainder,
    };
  }, [from, to]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Select Dates</h2>
          <p className="mt-1 text-xs text-muted">Calculate days between two dates.</p>
        </div>

        <div className="flex flex-wrap items-end gap-4 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Start date</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              max={to}
              className="rounded-lg border border-border-strong bg-surface-2 px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">End date</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-border-strong bg-surface-2 px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 [color-scheme:dark]"
            />
          </div>
        </div>

        {result && "error" in result && (
          <div className="border-t border-border px-5 py-3">
            <p className="text-xs text-amber-300">{result.error}</p>
          </div>
        )}
      </div>

      {result && !("error" in result) && (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <ResultCard title="Days" value={formatNumber(result.totalDays)} accent="bg-[#6c63ff]" />
            <ResultCard title="Hours" value={formatNumber(result.totalHours)} accent="bg-[#ff6584]" />
            <ResultCard title="Minutes" value={formatNumber(result.totalMinutes)} accent="bg-[#38d9a9]" />
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
              <span className="h-2 w-2 rounded-full bg-[#ffa640]" />
              <h3 className="font-display text-sm font-bold tracking-tight text-white">Weeks + days</h3>
            </div>
            <div className="flex flex-wrap items-center gap-6 px-5 py-6">
              <Unit label="Weeks" value={result.weeks} color="text-[#ffa640]" />
              <Unit label="Days" value={result.daysRemainder} color="text-muted" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <InfoCard icon="📅" title="Local dates" desc="Uses local midnight to keep results stable." />
            <InfoCard icon="⚡" title="Instant" desc="Results update as you change dates." />
            <InfoCard icon="🧮" title="Simple" desc="No extra assumptions or calendar tricks." />
          </div>
        </>
      )}
    </div>
  );
}

function ResultCard({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_40px_rgba(0,0,0,.45)]">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className={`h-2 w-2 rounded-full ${accent}`} />
        <h3 className="font-display text-sm font-bold tracking-tight text-white">{title}</h3>
      </div>
      <div className="px-5 py-6">
        <div className="font-mono text-4xl font-extrabold tracking-tight text-white">{value}</div>
      </div>
    </div>
  );
}

function Unit({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className={`mt-1 font-mono text-3xl font-bold ${color}`}>{value}</div>
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
