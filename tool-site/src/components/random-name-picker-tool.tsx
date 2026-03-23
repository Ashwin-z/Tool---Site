"use client";

import { useState, useCallback } from "react";

export default function RandomNamePickerTool() {
  const [input, setInput] = useState("");
  const [count, setCount] = useState("1");
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState<string[][]>([]);

  const names = input
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);

  const pick = useCallback(() => {
    if (names.length === 0) return;
    const numPick = Math.min(parseInt(count) || 1, allowDuplicates ? 100 : names.length);

    setIsSpinning(true);
    setTimeout(() => {
      let result: string[];
      if (allowDuplicates) {
        result = Array.from({ length: numPick }, () => names[Math.floor(Math.random() * names.length)]);
      } else {
        const shuffled = [...names].sort(() => Math.random() - 0.5);
        result = shuffled.slice(0, numPick);
      }
      setPicked(result);
      setHistory((prev) => [result, ...prev].slice(0, 20));
      setIsSpinning(false);
    }, 600);
  }, [names, count, allowDuplicates]);

  const clearAll = () => {
    setInput("");
    setPicked([]);
    setHistory([]);
  };

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#6c63ff]" />
            <h2 className="font-display text-sm font-bold tracking-tight text-white">Enter Names</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-semibold">{names.length}</span> names loaded
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"Enter names, one per line…\n\nAlice\nBob\nCharlie\nDiana\nEthan"}
          className="min-h-[220px] w-full resize-none bg-transparent px-5 py-4 text-sm leading-7 text-white outline-none placeholder:text-muted-3"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">Pick</label>
          <input
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-16 rounded-lg border border-border-strong bg-surface-2 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:border-[#6c63ff]/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-xs text-muted-2">name(s)</span>
        </div>

        <label className="flex items-center gap-1.5 text-xs text-muted">
          <input
            type="checkbox"
            checked={allowDuplicates}
            onChange={(e) => setAllowDuplicates(e.target.checked)}
            className="accent-[#6c63ff]"
          />
          Allow duplicates
        </label>

        <div className="ml-auto flex gap-2">
          <button
            onClick={clearAll}
            className="rounded-lg border border-border-strong px-4 py-2 text-xs font-semibold text-muted transition hover:text-foreground"
          >
            Clear
          </button>
          <button
            onClick={pick}
            disabled={names.length === 0 || isSpinning}
            className="rounded-lg bg-[#6c63ff] px-6 py-2 text-xs font-bold text-white transition hover:bg-[#5b53ee] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSpinning ? "Picking…" : "🎲 Pick Random"}
          </button>
        </div>
      </div>

      {/* Result */}
      {picked.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[#6c63ff]/30 bg-[#6c63ff]/5">
          <div className="border-b border-[#6c63ff]/20 px-5 py-3">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold text-white">
              <span className="h-2 w-2 rounded-full bg-[#6c63ff]" />
              {picked.length === 1 ? "Winner!" : `${picked.length} Picked`}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 px-5 py-4">
            {picked.map((name, i) => (
              <div
                key={i}
                className="rounded-lg border border-[#6c63ff]/30 bg-[#6c63ff]/15 px-4 py-2 text-sm font-bold text-white"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-3">
            <h3 className="font-display text-sm font-bold text-white">Pick History</h3>
          </div>
          <div className="max-h-[200px] divide-y divide-white/5 overflow-auto">
            {history.map((round, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                <span className="text-xs text-muted-2">#{history.length - i}</span>
                <span className="text-muted">{round.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
