"use client";

import { useMemo, useState } from "react";

type ReverseMode = "none" | "text" | "wording" | "flip" | "lettering";

const flipMap: Record<string, string> = {
  a: "\u0250", b: "q", c: "\u0254", d: "p", e: "\u01DD", f: "\u025F", g: "\u0183", h: "\u0265", i: "\u1D09",
  j: "\u027E", k: "\u029E", l: "l", m: "\u026F", n: "u", o: "o", p: "d", q: "b", r: "\u0279",
  s: "s", t: "\u0287", u: "n", v: "\u028C", w: "\u028D", x: "x", y: "\u028E", z: "z",
  A: "\u2200", B: "\u15FA", C: "\u0186", D: "\u25D6", E: "\u018E", F: "\u2132", G: "\u2141", H: "H", I: "I",
  J: "\u017F", K: "\u22CA", L: "\u02E5", M: "W", N: "N", O: "O", P: "\u0500", Q: "Q", R: "\u1D1A",
  S: "S", T: "\u22A5", U: "\u2229", V: "\u039B", W: "M", X: "X", Y: "\u2144", Z: "Z",
  "1": "\u0196", "2": "\u1105", "3": "\u0190", "4": "\u3123", "5": "\u03DB", "6": "9", "7": "\u2C62",
  "8": "8", "9": "6", "0": "0", ".": "\u02D9", ",": "\u02BB", "?": "\u00BF", "!": "\u00A1",
  "'": ",", "\"": ",,", "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{",
  "<": ">", ">": "<", "&": "\u214B", "_": "\u203E",
};

const flipText = (value: string) =>
  [...value]
    .map((ch) => flipMap[ch] ?? ch)
    .reverse()
    .join("");

const reverseModes: { value: ReverseMode; label: string; desc: string; example: string }[] = [
  { value: "text", label: "Reverse Text", desc: "Reverse all characters in the text", example: "dlrow olleH" },
  { value: "wording", label: "Reverse Wording", desc: "Reverse the order of words", example: "world Hello" },
  { value: "flip", label: "Flip Text", desc: "Flip text upside down", example: "plɹoʍ ollǝH" },
  { value: "lettering", label: "Reverse Word's Lettering", desc: "Reverse letters within each word", example: "olleH dlrow" },
];

const applyReverse = (value: string, mode: ReverseMode) => {
  switch (mode) {
    case "text":
      return [...value].reverse().join("");
    case "wording":
      return value.split(/\n/).map((line) => line.split(/\s+/).reverse().join(" ")).join("\n");
    case "flip":
      return value.split(/\n/).map((line) => flipText(line)).join("\n");
    case "lettering":
      return value
        .split(/\n/)
        .map((line) =>
          line
            .split(/(\s+)/)
            .map((part) => (/\s/.test(part) ? part : [...part].reverse().join("")))
            .join(""),
        )
        .join("\n");
    default:
      return value;
  }
};

export default function TextReverserTool() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<ReverseMode>("none");
  const [reversedText, setReversedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [reversedCopied, setReversedCopied] = useState(false);

  /* ── live stats ── */
  const stats = useMemo(() => {
    const src = reversedText || text;
    const words = src.trim() ? src.trim().split(/\s+/).length : 0;
    const chars = src.length;
    const sentences = !src.trim() ? 0 : (src.match(/[.!?]+/g) || []).length || 1;
    const readingSeconds = Math.ceil(words / 3.3);
    const readTime =
      words === 0 ? "—" : readingSeconds < 60 ? `${readingSeconds}s` : `${Math.ceil(readingSeconds / 60)} min`;
    return { words, chars, sentences, readTime };
  }, [text, reversedText]);

  const selectMode = (m: ReverseMode) => {
    setMode(m);
    if (text && m !== "none") {
      setReversedText(applyReverse(text, m));
    }
  };

  const clearAll = () => {
    setText("");
    setReversedText("");
    setMode("none");
  };

  const copyOriginal = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* */ }
  };

  const copyReversed = async () => {
    if (!reversedText) return;
    try {
      await navigator.clipboard.writeText(reversedText);
      setReversedCopied(true);
      setTimeout(() => setReversedCopied(false), 1800);
    } catch { /* */ }
  };

  return (
    <div className="space-y-4">
      {/* ── Input card ── */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff6584]" />
            <h2 className="font-display text-sm font-bold tracking-tight">Text Reverser</h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={clearAll}
              className="rounded-md border border-white/15 px-3 py-1.5 text-[#9b9bb3] transition hover:text-white"
            >
              Clear
            </button>
            <button
              onClick={copyOriginal}
              className="rounded-md border border-white/15 px-3 py-1.5 text-[#9b9bb3] transition hover:text-white"
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
              if (mode !== "none" && e.target.value) {
                setReversedText(applyReverse(e.target.value, mode));
              } else {
                setReversedText("");
              }
            }}
            placeholder="Paste or type your text here…\n\nSelect a reverse mode below to flip it instantly."
            className="min-h-[300px] w-full resize-none border-r border-white/10 bg-transparent px-5 py-4 text-sm leading-8 text-white outline-none placeholder:text-[#515168]"
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

      {/* ── Reverse mode buttons ── */}
      <div className="flex flex-wrap gap-2">
        {reverseModes.map((m) => (
          <button
            key={m.value}
            onClick={() => selectMode(m.value)}
            className={`rounded-lg border px-4 py-2.5 text-left transition ${
              mode === m.value
                ? "border-[#ff6584]/50 bg-[#ff6584]/15 text-[#ffb3c4]"
                : "border-white/10 bg-[#111118] text-[#9b9bb3] hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="text-xs font-semibold">{m.label}</div>
            <div className="mt-0.5 text-[10px] opacity-60">{m.desc}</div>
            <div className="mt-1 font-mono text-[10px] opacity-40">{m.example}</div>
          </button>
        ))}
      </div>

      {/* ── Reversed output ── */}
      {reversedText && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-[0_20px_40px_rgba(0,0,0,.45)]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
              <h3 className="font-display text-sm font-bold tracking-tight text-white">
                Reversed — {reverseModes.find((m) => m.value === mode)?.label}
              </h3>
            </div>
            <button
              onClick={copyReversed}
              className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-[#9b9bb3] transition hover:text-white"
            >
              {reversedCopied ? "Copied!" : "Copy Reversed"}
            </button>
          </div>
          <textarea
            value={reversedText}
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
    <div className="rounded-lg border border-white/10 bg-[#17171f] px-3 py-2.5">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#57576f]">{label}</div>
      <div className={`font-display text-2xl font-bold leading-none ${color}`}>{value}</div>
    </div>
  );
}
