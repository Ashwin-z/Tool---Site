"use client";

import { useMemo, useState } from "react";

type WordCounterToolProps = {
  compact?: boolean;
};

export default function WordCounterTool({ compact = false }: WordCounterToolProps) {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const sentences = !text.trim() ? 0 : (text.match(/[.!?]+/g) || []).length || 1;
    const readingSeconds = Math.ceil(words / 3.3);
    const readTime =
      words === 0 ? "—" : readingSeconds < 60 ? `${readingSeconds}s` : `${Math.ceil(readingSeconds / 60)} min`;

    const density = Math.min(100, Math.round(chars / 5));
    const hint =
      words > 0
        ? `Avg word length: ${(chars / words).toFixed(1)} chars · ${words.toLocaleString()} word${words === 1 ? "" : "s"} ✦`
        : "Start typing to see your stats ✦";

    return { words, chars, sentences, readTime, density, hint };
  }, [text]);

  const copyText = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const clearText = () => {
    setText("");
  };

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#38d9a9]" />
            <h2 className="font-display text-sm font-bold tracking-tight">Word Counter — Live</h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={clearText}
              className="rounded-md border border-border-strong px-3 py-1.5 text-muted transition hover:text-foreground"
            >
              Clear
            </button>
            <button
              onClick={copyText}
              className="rounded-md border border-border-strong px-3 py-1.5 text-muted transition hover:text-foreground"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_210px]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here…\n\n✦ Live words, characters, sentences & reading time\n✦ Nothing leaves your browser"
            className={`w-full resize-none border-r border-border bg-transparent px-5 py-4 text-sm leading-8 text-white outline-none placeholder:text-muted-3 ${
              compact ? "min-h-[320px]" : "min-h-[460px]"
            }`}
          />

          <div className="space-y-2 p-3">
            <Stat label="Words" value={stats.words.toLocaleString()} color="text-[#6c63ff]" />
            <Stat label="Characters" value={stats.chars.toLocaleString()} color="text-[#ff6584]" />
            <Stat label="Sentences" value={stats.sentences.toLocaleString()} color="text-[#38d9a9]" />
            <Stat label="Read time" value={stats.readTime} color="text-[#ffa640]" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-2.5">
          <p className="text-xs text-[#6f6f88]">{stats.hint}</p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6f6f88]">Density</span>
            <div className="h-1.5 w-24 overflow-hidden rounded bg-[#252530]">
              <div
                style={{ width: `${stats.density}%` }}
                className="h-full rounded bg-gradient-to-r from-[#6c63ff] to-[#ff6584] transition-all"
              />
            </div>
            <span className="min-w-8 text-right text-[11px] text-[#6f6f88]">{stats.density}%</span>
          </div>
        </div>
      </div>

      {/* ── Social media character limits ── */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
        <div className="border-b border-border px-5 py-3">
          <h3 className="font-display text-sm font-bold tracking-tight">📱 Social Media Limits</h3>
          <p className="mt-0.5 text-[11px] text-[#6f6f88]">See how your text fits each platform</p>
        </div>
        <div className="grid grid-cols-1 gap-px bg-surface-3/50 sm:grid-cols-2 lg:grid-cols-3">
          <SocialLimit icon="𝕏" name="Twitter / X" used={stats.chars} limit={280} color="#1d9bf0" />
          <SocialLimit icon="📸" name="Instagram Caption" used={stats.chars} limit={2200} color="#e1306c" />
          <SocialLimit icon="📘" name="Facebook Post" used={stats.chars} limit={63206} color="#1877f2" />
          <SocialLimit icon="💼" name="LinkedIn Post" used={stats.chars} limit={3000} color="#0a66c2" />
          <SocialLimit icon="🎵" name="TikTok Caption" used={stats.chars} limit={2200} color="#ff0050" />
          <SocialLimit icon="▶️" name="YouTube Title" used={stats.chars} limit={100} color="#ff0000" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className={`font-display text-2xl font-bold leading-none ${color}`}>{value}</div>
    </div>
  );
}

function SocialLimit({
  icon,
  name,
  used,
  limit,
  color,
}: {
  icon: string;
  name: string;
  used: number;
  limit: number;
  color: string;
}) {
  const remaining = limit - used;
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const over = used > limit;

  return (
    <div className="bg-surface px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-xs font-medium text-foreground/75">{name}</span>
        </div>
        <span
          className={`text-[11px] font-bold ${
            over ? "text-rose-400" : remaining < limit * 0.1 ? "text-amber-400" : "text-[#6f6f88]"
          }`}
        >
          {over ? `${Math.abs(remaining)} over` : `${remaining.toLocaleString()} left`}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#252530]">
          <div
            style={{ width: `${pct}%`, backgroundColor: over ? "#f43f5e" : color }}
            className="h-full rounded-full transition-all"
          />
        </div>
        <span className="min-w-12 text-right text-[10px] text-[#6f6f88]">
          {used.toLocaleString()}/{limit.toLocaleString()}
        </span>
      </div>
    </div>
  );
}