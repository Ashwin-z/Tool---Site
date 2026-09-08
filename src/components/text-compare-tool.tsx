"use client";

import { useState, useMemo } from "react";

interface DiffLine {
  type: "same" | "added" | "removed";
  text: string;
  lineNum: number;
}

function computeDiff(a: string[], b: string[]): DiffLine[] {
  const n = a.length;
  const m = b.length;

  // LCS table
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack
  const result: DiffLine[] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.push({ type: "same", text: a[i - 1], lineNum: i });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: "added", text: b[j - 1], lineNum: j });
      j--;
    } else {
      result.push({ type: "removed", text: a[i - 1], lineNum: i });
      i--;
    }
  }
  return result.reverse();
}

export default function TextCompareTool() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(false);

  const diff = useMemo(() => {
    if (!textA && !textB) return null;

    let linesA = textA.split("\n");
    let linesB = textB.split("\n");

    if (trimWhitespace) {
      linesA = linesA.map((l) => l.trim());
      linesB = linesB.map((l) => l.trim());
    }
    if (ignoreCase) {
      linesA = linesA.map((l) => l.toLowerCase());
      linesB = linesB.map((l) => l.toLowerCase());
    }

    return computeDiff(linesA, linesB);
  }, [textA, textB, ignoreCase, trimWhitespace]);

  const stats = useMemo(() => {
    if (!diff) return { added: 0, removed: 0, same: 0 };
    return {
      added: diff.filter((d) => d.type === "added").length,
      removed: diff.filter((d) => d.type === "removed").length,
      same: diff.filter((d) => d.type === "same").length,
    };
  }, [diff]);

  const clearAll = () => {
    setTextA("");
    setTextB("");
  };

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Compare Texts</h2>
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 text-muted">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
                className="accent-[#6c63ff]"
              />
              Ignore case
            </label>
            <label className="flex items-center gap-1.5 text-muted">
              <input
                type="checkbox"
                checked={trimWhitespace}
                onChange={(e) => setTrimWhitespace(e.target.checked)}
                className="accent-[#6c63ff]"
              />
              Trim whitespace
            </label>
            <button
              onClick={clearAll}
              className="rounded-md border border-border-strong px-3 py-1.5 text-muted transition hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="border-b border-border md:border-b-0 md:border-r">
            <div className="border-b border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-2">
              Original Text
            </div>
            <textarea
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              placeholder="Paste original text here…"
              className="min-h-[280px] w-full resize-none bg-transparent px-5 py-4 text-sm leading-7 text-white outline-none placeholder:text-muted-3"
            />
          </div>
          <div>
            <div className="border-b border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-2">
              Modified Text
            </div>
            <textarea
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              placeholder="Paste modified text here…"
              className="min-h-[280px] w-full resize-none bg-transparent px-5 py-4 text-sm leading-7 text-white outline-none placeholder:text-muted-3"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      {diff && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Unchanged" value={stats.same} color="text-muted" />
          <StatCard label="Added" value={stats.added} color="text-[#38d9a9]" />
          <StatCard label="Removed" value={stats.removed} color="text-[#ff6584]" />
        </div>
      )}

      {/* Diff output */}
      {diff && diff.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-3">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold text-white">
              <span className="h-2 w-2 rounded-full bg-[#6c63ff]" />
              Differences
            </h3>
          </div>
          <div className="max-h-[500px] overflow-auto font-mono text-sm">
            {diff.map((line, idx) => (
              <div
                key={idx}
                className={`flex gap-3 border-b border-border px-4 py-1.5 ${
                  line.type === "added"
                    ? "bg-[#38d9a9]/8 text-[#38d9a9]"
                    : line.type === "removed"
                    ? "bg-[#ff6584]/8 text-[#ff6584]"
                    : "text-muted"
                }`}
              >
                <span className="w-5 shrink-0 text-right text-muted-2">{line.lineNum}</span>
                <span className="w-4 shrink-0 font-bold">
                  {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
                </span>
                <span className="whitespace-pre-wrap break-all">{line.text || "\u00A0"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {diff && stats.added === 0 && stats.removed === 0 && (
        <div className="rounded-2xl border border-[#38d9a9]/30 bg-[#38d9a9]/5 px-5 py-4 text-center text-sm font-semibold text-[#38d9a9]">
          ✅ Both texts are identical!
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className={`font-display mt-1 text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
