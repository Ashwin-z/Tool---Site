"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ── character pools ── */
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:',.<>?/`~";
const AMBIGUOUS = /[0OIl1|`'"]/g;

interface Options {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  customExclude: string;
}

const DEFAULT_OPTIONS: Options = {
  length: 20,
  uppercase: true,
  lowercase: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
  customExclude: "",
};

function buildPool(opts: Options): string {
  let pool = "";
  if (opts.lowercase) pool += LOWER;
  if (opts.uppercase) pool += UPPER;
  if (opts.digits) pool += DIGITS;
  if (opts.symbols) pool += SYMBOLS;
  if (opts.excludeAmbiguous) pool = pool.replace(AMBIGUOUS, "");
  if (opts.customExclude) {
    const ex = new Set([...opts.customExclude]);
    pool = [...pool].filter((c) => !ex.has(c)).join("");
  }
  return pool;
}

function generatePassword(opts: Options): string {
  const pool = buildPool(opts);
  if (!pool) return "";
  const arr = new Uint32Array(opts.length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => pool[v % pool.length]).join("");
}

function generatePassphrase(wordCount: number, separator: string): string {
  /* simple EFF-style word list using crypto RNG — we use a compact built-in list */
  const words = WORDLIST;
  const arr = new Uint32Array(wordCount);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => words[v % words.length]).join(separator);
}

/* ── strength meter ── */
function calcEntropy(password: string, poolSize: number): number {
  if (!password || poolSize <= 1) return 0;
  return password.length * Math.log2(poolSize);
}

type Strength = "very-weak" | "weak" | "fair" | "strong" | "very-strong";

function getStrength(entropy: number): { level: Strength; label: string; color: string; pct: number } {
  if (entropy < 28) return { level: "very-weak", label: "Very Weak", color: "#ff4444", pct: 10 };
  if (entropy < 36) return { level: "weak", label: "Weak", color: "#ff8844", pct: 25 };
  if (entropy < 60) return { level: "fair", label: "Fair", color: "#ffcc00", pct: 50 };
  if (entropy < 100) return { level: "strong", label: "Strong", color: "#38d9a9", pct: 75 };
  return { level: "very-strong", label: "Very Strong", color: "#6c63ff", pct: 100 };
}

/* ── compact word list (200 common words for passphrases) ── */
const WORDLIST = [
  "abandon","ability","above","absent","absorb","abstract","absurd","abuse","access","accident",
  "account","accuse","achieve","acid","acoustic","acquire","across","action","actor","actress",
  "actual","adapt","address","adjust","admit","adult","advance","advice","aerobic","affair",
  "afford","afraid","again","agent","agree","ahead","album","alert","alien","allow",
  "almost","alone","alpha","already","alter","always","amateur","amazing","among","amount",
  "amused","anchor","ancient","anger","angle","animal","annual","another","answer","anxiety",
  "apart","apology","appear","apple","approve","april","arctic","arena","argue","armed",
  "armor","army","arrest","arrive","arrow","artist","artwork","aspect","attack","attend",
  "attract","auction","audit","august","aunt","author","autumn","average","avocado","avoid",
  "awake","aware","awesome","awful","awkward","axis","baby","bachelor","bacon","badge",
  "balance","balcony","banana","banner","barely","bargain","barrel","basket","battle","beach",
  "beauty","become","before","begin","behave","behind","believe","benefit","between","beyond",
  "bicycle","bitter","blanket","blaze","bless","blind","blood","blossom","board","bonus",
  "border","bounce","brain","brave","bread","breeze","bridge","bright","bring","broken",
  "brother","brown","brush","bubble","budget","buffalo","build","bullet","bundle","burger",
  "burst","butter","cabin","cable","cactus","camera","campus","candle","canyon","captain",
  "carbon","carpet","carry","castle","catalog","caught","ceiling","celery","census","ceramic",
  "chair","champion","change","chapter","cherry","chicken","choice","circle","citizen","claim",
  "classic","clever","climate","clinic","clock","closet","cloud","cluster","coach","coconut",
  "coffee","collect","column","combine","comfort","comic","common","company","concert","conduct",
];

type TabMode = "password" | "passphrase";

export default function PasswordGeneratorTool() {
  const [tab, setTab] = useState<TabMode>("password");
  const [options, setOptions] = useState<Options>(DEFAULT_OPTIONS);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [count, setCount] = useState(5);
  const [phraseWords, setPhraseWords] = useState(5);
  const [phraseSep, setPhraseSep] = useState("-");
  const [passphrases, setPassphrases] = useState<string[]>([]);
  const [phraseCopiedIdx, setPhraseCopiedIdx] = useState<number | null>(null);
  const mounted = useRef(false);

  /* ── generate on mount + when options change ── */
  const regeneratePasswords = useCallback(() => {
    setPasswords(Array.from({ length: count }, () => generatePassword(options)));
    setCopiedIdx(null);
  }, [options, count]);

  const regeneratePassphrases = useCallback(() => {
    setPassphrases(Array.from({ length: count }, () => generatePassphrase(phraseWords, phraseSep)));
    setPhraseCopiedIdx(null);
  }, [phraseWords, phraseSep, count]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      regeneratePasswords();
      regeneratePassphrases();
      return;
    }
    if (tab === "password") regeneratePasswords();
    else regeneratePassphrases();
  }, [tab, regeneratePasswords, regeneratePassphrases]);

  /* ── stats for current first password ── */
  const strength = useMemo(() => {
    if (tab === "passphrase") {
      const pp = passphrases[0] ?? "";
      /* passphrase entropy ≈ wordCount × log2(wordListSize) */
      const ent = phraseWords * Math.log2(WORDLIST.length);
      return { ...getStrength(ent), entropy: Math.round(ent), len: pp.length };
    }
    const pw = passwords[0] ?? "";
    const poolSize = buildPool(options).length;
    const ent = calcEntropy(pw, poolSize);
    return { ...getStrength(ent), entropy: Math.round(ent), len: pw.length };
  }, [passwords, passphrases, options, tab, phraseWords]);

  /* ── clipboard ── */
  const copy = async (text: string, idx: number, isPhrase: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isPhrase) {
        setPhraseCopiedIdx(idx);
        setTimeout(() => setPhraseCopiedIdx(null), 1800);
      } else {
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1800);
      }
    } catch { /* */ }
  };

  const copyAll = async () => {
    const list = tab === "password" ? passwords : passphrases;
    try {
      await navigator.clipboard.writeText(list.join("\n"));
    } catch { /* */ }
  };

  const setOpt = <K extends keyof Options>(key: K, val: Options[K]) =>
    setOptions((prev) => ({ ...prev, [key]: val }));

  /* make sure at least one charset is on */
  const toggleCharset = (key: "uppercase" | "lowercase" | "digits" | "symbols") => {
    const next = { ...options, [key]: !options[key] };
    const anyOn = next.uppercase || next.lowercase || next.digits || next.symbols;
    if (!anyOn) return; /* prevent all-off */
    setOptions(next);
  };

  return (
    <div className="space-y-4">
      {/* ── Tab toggle ── */}
      <div className="flex flex-wrap items-center gap-2">
        {(["password", "passphrase"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setTab(m)}
            className={`rounded-lg border px-5 py-2.5 text-sm font-semibold transition ${
              tab === m
                ? "border-[#6c63ff]/50 bg-[#6c63ff]/15 text-[#a5a0ff]"
                : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground"
            }`}
          >
            {m === "password" ? "🔑 Password" : "📝 Passphrase"}
          </button>
        ))}

        <button
          onClick={tab === "password" ? regeneratePasswords : regeneratePassphrases}
          className="ml-auto rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-muted transition hover:border-border-strong hover:text-foreground"
        >
          ↻ Regenerate
        </button>
      </div>

      {/* ── Strength meter ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />
        <div className="px-5 py-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Strength: <span className="font-semibold" style={{ color: strength.color }}>{strength.label}</span></span>
            <span>{strength.entropy} bits of entropy · {strength.len} chars</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-3/50">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${strength.pct}%`, backgroundColor: strength.color }}
            />
          </div>
        </div>
      </div>

      {/* ── Options card ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#6c63ff]" />
          <h2 className="font-display text-sm font-bold tracking-tight">Options</h2>
        </div>

        <div className="space-y-4 px-5 py-4">
          {tab === "password" ? (
            <>
              {/* Length slider */}
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-muted">
                  <span>Length</span>
                  <span className="font-mono font-bold text-white">{options.length}</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={128}
                  value={options.length}
                  onChange={(e) => setOpt("length", Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-3 accent-[#6c63ff]"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-2">
                  <span>4</span>
                  <span>128</span>
                </div>
              </div>

              {/* Charset toggles */}
              <div className="flex flex-wrap gap-2">
                {([
                  ["uppercase", "A-Z", options.uppercase],
                  ["lowercase", "a-z", options.lowercase],
                  ["digits", "0-9", options.digits],
                  ["symbols", "!@#$", options.symbols],
                ] as const).map(([key, label, active]) => (
                  <button
                    key={key}
                    onClick={() => toggleCharset(key as "uppercase" | "lowercase" | "digits" | "symbols")}
                    className={`rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                      active
                        ? "border-[#38d9a9]/50 bg-[#38d9a9]/15 text-[#7eeaca]"
                        : "border-border text-muted-2 hover:text-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Extra options */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <label className="flex cursor-pointer items-center gap-2 text-muted">
                  <input
                    type="checkbox"
                    checked={options.excludeAmbiguous}
                    onChange={(e) => setOpt("excludeAmbiguous", e.target.checked)}
                    className="accent-[#6c63ff]"
                  />
                  Exclude ambiguous (0 O I l 1 |)
                </label>
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted">Exclude custom characters</label>
                <input
                  type="text"
                  value={options.customExclude}
                  onChange={(e) => setOpt("customExclude", e.target.value)}
                  placeholder="e.g. {}[]"
                  className="w-full max-w-xs rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-white outline-none placeholder:text-muted-3 focus:border-[#6c63ff]/50"
                />
              </div>
            </>
          ) : (
            <>
              {/* Word count slider */}
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-muted">
                  <span>Words</span>
                  <span className="font-mono font-bold text-white">{phraseWords}</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={12}
                  value={phraseWords}
                  onChange={(e) => setPhraseWords(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-3 accent-[#6c63ff]"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-2">
                  <span>3</span>
                  <span>12</span>
                </div>
              </div>

              {/* Separator */}
              <div>
                <label className="mb-1 block text-xs text-muted">Separator</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["-", "Dash"],
                    [".", "Dot"],
                    ["_", "Underscore"],
                    [" ", "Space"],
                    ["", "None"],
                  ].map(([sep, label]) => (
                    <button
                      key={label}
                      onClick={() => setPhraseSep(sep)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        phraseSep === sep
                          ? "border-[#38d9a9]/50 bg-[#38d9a9]/15 text-[#7eeaca]"
                          : "border-border text-muted-2 hover:text-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Count */}
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-muted">
              <span>Generate count</span>
              <span className="font-mono font-bold text-white">{count}</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-3 accent-[#6c63ff]"
            />
          </div>
        </div>
      </div>

      {/* ── Generated passwords list ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
            <h3 className="font-display text-sm font-bold tracking-tight text-white">
              Generated {tab === "password" ? "Passwords" : "Passphrases"}
            </h3>
          </div>
          <button
            onClick={copyAll}
            className="rounded-md border border-border-strong px-3 py-1.5 text-xs text-muted transition hover:text-foreground"
          >
            Copy All
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {(tab === "password" ? passwords : passphrases).map((pw, i) => {
            const isCopied = tab === "password" ? copiedIdx === i : phraseCopiedIdx === i;
            return (
              <div key={i} className="group flex items-center gap-3 px-5 py-3 transition hover:bg-white/[0.02]">
                <span className="w-6 shrink-0 text-xs text-muted-2">{i + 1}</span>
                <span className="min-w-0 flex-1 select-all break-all font-mono text-sm text-white/90">
                  {tab === "password" ? colorizePassword(pw) : pw}
                </span>
                <button
                  onClick={() => copy(pw, i, tab === "passphrase")}
                  className="shrink-0 rounded-md border border-border px-3 py-1 text-xs text-muted opacity-0 transition group-hover:opacity-100 hover:text-foreground"
                >
                  {isCopied ? "✓" : "Copy"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard
          icon="🔐"
          title="Cryptographically Secure"
          desc="Uses the Web Crypto API (crypto.getRandomValues) for true randomness."
        />
        <InfoCard
          icon="🚀"
          title="Instant & Offline"
          desc="Everything runs locally in your browser. No passwords are ever sent to a server."
        />
        <InfoCard
          icon="⚙️"
          title="Fully Customizable"
          desc="Adjust length, character sets, exclusions, and generate passwords or passphrases."
        />
      </div>
    </div>
  );
}

/* ── Colorize password chars for readability ── */
function colorizePassword(pw: string) {
  return (
    <>
      {[...pw].map((ch, i) => {
        let color = "text-white/90";
        if (/[A-Z]/.test(ch)) color = "text-[#6c63ff]";
        else if (/[a-z]/.test(ch)) color = "text-white/80";
        else if (/[0-9]/.test(ch)) color = "text-[#38d9a9]";
        else color = "text-[#ff6584]";
        return (
          <span key={i} className={color}>
            {ch}
          </span>
        );
      })}
    </>
  );
}

/* ── Sub-components ── */
function InfoCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <span className="text-xl">{icon}</span>
      <h4 className="mt-2 text-sm font-semibold text-white">{title}</h4>
      <p className="mt-1 text-xs leading-5 text-muted">{desc}</p>
    </div>
  );
}
