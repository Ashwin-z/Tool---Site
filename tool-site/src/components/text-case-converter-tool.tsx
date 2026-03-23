"use client";

import { useMemo, useState } from "react";

type CaseMode = "none" | "sentence" | "title" | "upper" | "lower" | "camel" | "snake" | "kebab";

const toSentenceCase = (value: string) => {
  const normalized = value.toLowerCase();
  return normalized.replace(/(^\s*[a-z])|([.!?]\s*[a-z])/g, (match) => match.toUpperCase());
};

const toTitleCase = (value: string) =>
  value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

const toCamelCase = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_m, char: string) => char.toUpperCase());

const toSnakeCase = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s\-]+/g, "_")
    .toLowerCase();

const toKebabCase = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

const applyCaseTransform = (value: string, mode: CaseMode) => {
  switch (mode) {
    case "sentence":
      return toSentenceCase(value);
    case "title":
      return toTitleCase(value);
    case "upper":
      return value.toUpperCase();
    case "lower":
      return value.toLowerCase();
    case "camel":
      return toCamelCase(value);
    case "snake":
      return toSnakeCase(value);
    case "kebab":
      return toKebabCase(value);
    default:
      return value;
  }
};

const caseModes: { value: CaseMode; label: string; example: string }[] = [
  { value: "sentence", label: "Sentence case", example: "Hello world" },
  { value: "title", label: "Title Case", example: "Hello World" },
  { value: "upper", label: "UPPERCASE", example: "HELLO WORLD" },
  { value: "lower", label: "lowercase", example: "hello world" },
  { value: "camel", label: "camelCase", example: "helloWorld" },
  { value: "snake", label: "snake_case", example: "hello_world" },
  { value: "kebab", label: "kebab-case", example: "hello-world" },
];

export default function TextCaseConverterTool() {
  const [text, setText] = useState("");
  const [caseMode, setCaseMode] = useState<CaseMode>("none");
  const [convertedText, setConvertedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [convertedCopied, setConvertedCopied] = useState(false);

  /* ── live stats (same as word counter) ── */
  const stats = useMemo(() => {
    const src = convertedText || text;
    const words = src.trim() ? src.trim().split(/\s+/).length : 0;
    const chars = src.length;
    const sentences = !src.trim() ? 0 : (src.match(/[.!?]+/g) || []).length || 1;
    const readingSeconds = Math.ceil(words / 3.3);
    const readTime =
      words === 0 ? "—" : readingSeconds < 60 ? `${readingSeconds}s` : `${Math.ceil(readingSeconds / 60)} min`;
    return { words, chars, sentences, readTime };
  }, [text, convertedText]);

  const convertText = () => {
    if (!text || caseMode === "none") return;
    setConvertedText(applyCaseTransform(text, caseMode));
  };

  const selectMode = (mode: CaseMode) => {
    setCaseMode(mode);
    if (text && mode !== "none") {
      setConvertedText(applyCaseTransform(text, mode));
    }
  };

  const clearAll = () => {
    setText("");
    setConvertedText("");
    setCaseMode("none");
  };

  const copyOriginal = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* */ }
  };

  const copyConverted = async () => {
    if (!convertedText) return;
    try {
      await navigator.clipboard.writeText(convertedText);
      setConvertedCopied(true);
      setTimeout(() => setConvertedCopied(false), 1800);
    } catch { /* */ }
  };

  return (
    <div className="space-y-4">
      {/* ── Input card ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#6c63ff]" />
            <h2 className="font-display text-sm font-bold tracking-tight">Text Case Converter</h2>
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
              if (caseMode !== "none" && e.target.value) {
                setConvertedText(applyCaseTransform(e.target.value, caseMode));
              } else {
                setConvertedText("");
              }
            }}
            placeholder="Paste or type your text here…\n\nSelect a case style below to convert instantly."
            className="min-h-[300px] w-full resize-none border-r border-border bg-transparent px-5 py-4 text-sm leading-8 text-white outline-none placeholder:text-muted-3"
          />

          {/* Stats sidebar */}
          <div className="space-y-2 p-3">
            <StatBox label="Words" value={stats.words.toLocaleString()} color="text-[#6c63ff]" />
            <StatBox label="Characters" value={stats.chars.toLocaleString()} color="text-[#ff6584]" />
            <StatBox label="Sentences" value={stats.sentences.toLocaleString()} color="text-[#38d9a9]" />
            <StatBox label="Read time" value={stats.readTime} color="text-[#ffa640]" />
          </div>
        </div>
      </div>

      {/* ── Case mode buttons ── */}
      <div className="flex flex-wrap gap-2">
        {caseModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => selectMode(mode.value)}
            className={`group relative rounded-lg border px-4 py-2.5 text-xs font-semibold transition ${
              caseMode === mode.value
                ? "border-[#6c63ff]/50 bg-[#6c63ff]/15 text-[#c2bdff]"
                : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground"
            }`}
          >
            {mode.label}
            <span className="ml-1.5 text-[10px] opacity-50">({mode.example})</span>
          </button>
        ))}


      </div>

      {/* ── Converted output ── */}
      {convertedText && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_40px_rgba(0,0,0,.45)]">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
              <h3 className="font-display text-sm font-bold tracking-tight text-white">
                Converted — {caseModes.find((m) => m.value === caseMode)?.label}
              </h3>
            </div>
            <button
              onClick={copyConverted}
              className="rounded-md border border-border-strong px-3 py-1.5 text-xs text-muted transition hover:text-foreground"
            >
              {convertedCopied ? "Copied!" : "Copy Converted"}
            </button>
          </div>
          <textarea
            value={convertedText}
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
