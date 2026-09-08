"use client";

import { useState, useMemo } from "react";

interface UnitDef {
  label: string;
  short: string;
  bytes: number;
}

const BINARY_UNITS: UnitDef[] = [
  { label: "Bytes", short: "B", bytes: 1 },
  { label: "Kibibytes", short: "KiB", bytes: 1024 },
  { label: "Mebibytes", short: "MiB", bytes: 1024 ** 2 },
  { label: "Gibibytes", short: "GiB", bytes: 1024 ** 3 },
  { label: "Tebibytes", short: "TiB", bytes: 1024 ** 4 },
  { label: "Pebibytes", short: "PiB", bytes: 1024 ** 5 },
];

const DECIMAL_UNITS: UnitDef[] = [
  { label: "Bytes", short: "B", bytes: 1 },
  { label: "Kilobytes", short: "KB", bytes: 1000 },
  { label: "Megabytes", short: "MB", bytes: 1000 ** 2 },
  { label: "Gigabytes", short: "GB", bytes: 1000 ** 3 },
  { label: "Terabytes", short: "TB", bytes: 1000 ** 4 },
  { label: "Petabytes", short: "PB", bytes: 1000 ** 5 },
];

const ALL_UNITS: UnitDef[] = [
  { label: "Bits", short: "b", bytes: 1 / 8 },
  { label: "Bytes", short: "B", bytes: 1 },
  { label: "Kilobytes", short: "KB", bytes: 1000 },
  { label: "Kibibytes", short: "KiB", bytes: 1024 },
  { label: "Megabytes", short: "MB", bytes: 1000 ** 2 },
  { label: "Mebibytes", short: "MiB", bytes: 1024 ** 2 },
  { label: "Gigabytes", short: "GB", bytes: 1000 ** 3 },
  { label: "Gibibytes", short: "GiB", bytes: 1024 ** 3 },
  { label: "Terabytes", short: "TB", bytes: 1000 ** 4 },
  { label: "Tebibytes", short: "TiB", bytes: 1024 ** 4 },
  { label: "Petabytes", short: "PB", bytes: 1000 ** 5 },
  { label: "Pebibytes", short: "PiB", bytes: 1024 ** 5 },
];

function smartFormat(n: number): string {
  if (n === 0) return "0";
  if (n >= 1e15 || (n > 0 && n < 0.0001)) return n.toExponential(4);
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

export default function FileSizeConverterTool() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("MB");

  const bytes = useMemo(() => {
    const num = parseFloat(value);
    if (!value || isNaN(num) || num < 0) return null;
    const unit = ALL_UNITS.find((u) => u.short === fromUnit);
    return unit ? num * unit.bytes : null;
  }, [value, fromUnit]);

  const conversions = useMemo(() => {
    if (bytes === null) return null;
    return {
      decimal: DECIMAL_UNITS.map((u) => ({ ...u, value: bytes / u.bytes })),
      binary: BINARY_UNITS.map((u) => ({ ...u, value: bytes / u.bytes })),
    };
  }, [bytes]);

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Enter File Size</h2>
        </div>

        <div className="flex flex-wrap items-end gap-4 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Value</label>
            <input
              type="number"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 500"
              className="w-44 rounded-lg border border-border-strong bg-surface-2 px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-muted-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Unit</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="rounded-lg border border-border-strong bg-surface-2 px-4 py-2.5 text-sm font-semibold text-white outline-none"
            >
              {ALL_UNITS.map((u) => (
                <option key={u.short} value={u.short}>
                  {u.label} ({u.short})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick conversions */}
      {bytes !== null && conversions && (
        <>
          {/* Decimal (SI) */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-[#6c63ff]" />
                Decimal (SI) Units
                <span className="text-[10px] font-normal text-muted-2">1 KB = 1,000 bytes</span>
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {conversions.decimal.map((u) => (
                <div key={u.short} className="flex items-center justify-between px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-xs font-bold text-[#6c63ff]">{u.short}</span>
                    <span className="text-sm text-muted">{u.label}</span>
                  </div>
                  <span className="font-mono text-sm font-semibold text-white">{smartFormat(u.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Binary (IEC) */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
                Binary (IEC) Units
                <span className="text-[10px] font-normal text-muted-2">1 KiB = 1,024 bytes</span>
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {conversions.binary.map((u) => (
                <div key={u.short} className="flex items-center justify-between px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-xs font-bold text-[#38d9a9]">{u.short}</span>
                    <span className="text-sm text-muted">{u.label}</span>
                  </div>
                  <span className="font-mono text-sm font-semibold text-white">{smartFormat(u.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick reference */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">Quick Reference</h3>
            </div>
            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
              <InfoCard emoji="💾" label="Floppy Disk" value="1.44 MB" />
              <InfoCard emoji="💿" label="CD-ROM" value="700 MB" />
              <InfoCard emoji="📀" label="DVD" value="4.7 GB" />
              <InfoCard emoji="💽" label="Blu-ray" value="25 GB" />
              <InfoCard emoji="🔌" label="USB Drive" value="16–256 GB" />
              <InfoCard emoji="💻" label="SSD / HDD" value="256 GB – 4 TB" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InfoCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3">
      <span className="text-lg">{emoji}</span>
      <div>
        <div className="text-xs font-semibold text-muted">{label}</div>
        <div className="text-sm font-bold text-white">{value}</div>
      </div>
    </div>
  );
}
