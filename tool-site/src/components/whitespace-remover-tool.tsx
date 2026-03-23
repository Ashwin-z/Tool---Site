"use client";

import { useMemo, useState } from "react";

type CleanMode = "trim" | "extra" | "all" | "lines" | "tabs";

const cleanModes: { value: CleanMode; label: string; desc: string }[] = [
  { value: "trim", label: "Trim Whitespace", desc: "Remove leading & trailing spaces from each line" },
  { value: "extra", label: "Remove Extra Spaces", desc: "Collapse multiple spaces into one" },
  { value: "all", label: "Remove All Spaces", desc: "Strip every space and tab character" },
  { value: "lines", label: "Remove Blank Lines", desc: "Delete empty or whitespace-only lines" },
  { value: "tabs", label: "Tabs → Spaces", desc: "Convert all tab characters to spaces" },
];

const applyClean = (value: string, modes: Set<CleanMode>) => {
  let result = value;

  if (modes.has("tabs")) {
    result = result.replace(/\t/g, "    ");
  }
  if (modes.has("trim")) {
    result = result
      .split("\n")
      .map((line) => line.trimStart().trimEnd())
      .join("\n");
  }
  if (modes.has("extra")) {
    result = result.replace(/[^\S\n]{2,}/g, " ");
  }
  if (modes.has("lines")) {
    result = result
      .split("\n")
      .filter((line) => line.trim() !== "")
      .join("\n");
  }
  if (modes.has("all")) {
    result = result.replace(/[ \t]/g, "");
  }

  return result;
};

const countSentences = (text: string) => {
  if (!text.trim()) return 0;
  const withPunctuation = text.match(/[.!?]+/g);
  return withPunctuation ? withPunctuation.length : (text.trim() ? 1 : 0);
};

export default function WhitespaceRemoverTool() {
  const [text, setText] = useState("");
  const [activeModes, setActiveModes] = useState<Set<CleanMode>>(new Set());
  const [cleanedText, setCleanedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [cleanedCopied, setCleanedCopied] = useState(false);

  const stats = useMemo(() => {
    const src = cleanedText || text;
    const words = src.trim() ? src.trim().split(/\s+/).length : 0;
    const chars = src.length;
    const sentences = countSentences(src);
    const spaces = (src.match(/[ \t]/g) || []).length;
    const blankLines = src.split("\n").filter((l) => l.trim() === "").length;
    return { words, chars, sentences, spaces, blankLines };
  }, [text, cleanedText]);

  const toggleMode = (mode: CleanMode) => {
    const next = new Set(activeModes);
    if (next.has(mode)) next.delete(mode);
    else next.add(mode);
    setActiveModes(next);

    if (text && next.size > 0) {
      setCleanedText(applyClean(text, next));
    } else {
      setCleanedText("");
    }
  };

  const clearAll = () => {
    setText("");
    setCleanedText("");
    setActiveModes(new Set());
  };

  const copyOriginal = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* */ }
  };

  const copyCleaned = async () => {
    if (!cleanedText) return;
    try {
      await navigator.clipboard.writeText(cleanedText);
      setCleanedCopied(true);
      setTimeout(() => setCleanedCopied(false), 1800);
    } catch { /* */ }
  };

  return (
    <div className="space-y-4">
      {/* ── Input card ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#38d9a9]" />
            <h2 className="font-display text-sm font-bold tracking-tight">Whitespace Remover</h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={clearAll}
              className="rounded-md border border-border-strong px-3 py-1.5 text-muted transition hover:text-foreground"
            >
              Clear
            </button>
            <button
              onClick={copyOriginal}
              className="rounded-md border border-border-strong px-3 py-1.5 text-muted transition hover:text-foreground"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_210px]">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (activeModes.size > 0 && e.target.value) {
                setCleanedText(applyClean(e.target.value, activeModes));
              } else {
                setCleanedText("");
              }
            }}
            placeholder="Paste or type your text here…\n\nSelect cleanup options below to remove unwanted whitespace."
            className="min-h-[300px] w-full resize-none border-r border-border bg-transparent px-5 py-4 text-sm leading-8 text-white outline-none placeholder:text-muted-3"
          />

          {/* Stats sidebar */}
          <div className="space-y-2 p-3">
            <StatBox label="Words" value={stats.words.toLocaleString()} color="text-[#6c63ff]" />
            <StatBox label="Characters" value={stats.chars.toLocaleString()} color="text-[#ff6584]" />
            <StatBox label="Sentences" value={stats.sentences.toLocaleString()} color="text-[#38d9a9]" />
            <StatBox label="Spaces" value={stats.spaces.toLocaleString()} color="text-[#ffa640]" />
            <StatBox label="Blank lines" value={stats.blankLines.toLocaleString()} color="text-[#c084fc]" />
          </div>
        </div>
      </div>

      {/* ── Cleanup mode toggles ── */}
      <div className="flex flex-wrap gap-2">
        {cleanModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => toggleMode(mode.value)}
            className={`rounded-lg border px-4 py-2.5 text-left transition ${
              activeModes.has(mode.value)
                ? "border-[#38d9a9]/50 bg-[#38d9a9]/15 text-[#6ee7b7]"
                : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground"
            }`}
          >
            <div className="text-xs font-semibold">{mode.label}</div>
            <div className="mt-0.5 text-[10px] opacity-60">{mode.desc}</div>
          </button>
        ))}
      </div>

      {/* ── Cleaned output ── */}
      {cleanedText && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_40px_rgba(0,0,0,.45)]">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
              <h3 className="font-display text-sm font-bold tracking-tight text-white">
                Cleaned Text
              </h3>
              {text !== cleanedText && (
                <span className="rounded bg-[#38d9a9]/15 px-2 py-0.5 text-[10px] font-semibold text-[#6ee7b7]">
                  {text.length - cleanedText.length} chars removed
                </span>
              )}
            </div>
            <button
              onClick={copyCleaned}
              className="rounded-md border border-border-strong px-3 py-1.5 text-xs text-muted transition hover:text-foreground"
            >
              {cleanedCopied ? "Copied!" : "Copy Cleaned"}
            </button>
          </div>
          <textarea
            value={cleanedText}
            readOnly
            className="min-h-[200px] w-full resize-none bg-transparent px-5 py-4 text-sm leading-8 text-white outline-none"
          />
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className={`font-display text-2xl font-bold leading-none ${color}`}>{value}</div>
    </div>
  );
}
