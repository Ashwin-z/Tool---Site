"use client";

import { useMemo, useState } from "react";

interface KeywordEntry {
  word: string;
  count: number;
  density: number;
}

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by",
  "from","as","is","was","are","were","been","be","have","has","had","do","does",
  "did","will","would","shall","should","may","might","can","could","not","no",
  "so","if","then","than","that","this","these","those","it","its","i","me","my",
  "we","our","you","your","he","his","she","her","they","them","their","what",
  "which","who","whom","when","where","how","all","each","every","both","few",
  "more","most","other","some","such","only","own","same","just","also","very",
  "about","up","out","into","over","after","before","between","under","again",
  "am","being","here","there","above","below","during","through","while",
]);

function analyzeText(text: string, includeStopWords: boolean, ngramSize: number) {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return { keywords: [], totalWords: 0, uniqueWords: 0, charCount: text.length, sentenceCount: 0 };

  const words = cleaned.split(" ").filter(Boolean);
  const totalWords = words.length;

  // Count sentences
  const sentenceCount = (text.match(/[.!?]+/g) || []).length || (text.trim() ? 1 : 0);

  // Build n-grams
  const freq = new Map<string, number>();

  if (ngramSize === 1) {
    for (const w of words) {
      if (!includeStopWords && STOP_WORDS.has(w)) continue;
      if (w.length < 2) continue;
      freq.set(w, (freq.get(w) || 0) + 1);
    }
  } else {
    for (let i = 0; i <= words.length - ngramSize; i++) {
      const ngram = words.slice(i, i + ngramSize).join(" ");
      // Skip if all words are stop words
      if (!includeStopWords) {
        const parts = ngram.split(" ");
        if (parts.every((p) => STOP_WORDS.has(p))) continue;
      }
      freq.set(ngram, (freq.get(ngram) || 0) + 1);
    }
  }

  const keywords: KeywordEntry[] = Array.from(freq.entries())
    .map(([word, count]) => ({
      word,
      count,
      density: totalWords > 0 ? (count / totalWords) * 100 : 0,
    }))
    .filter((k) => k.count >= 1)
    .sort((a, b) => b.count - a.count);

  const uniqueWords = new Set(words).size;

  return { keywords, totalWords, uniqueWords, charCount: text.length, sentenceCount };
}

export default function KeywordDensityTool() {
  const [text, setText] = useState("");
  const [ngramSize, setNgramSize] = useState(1);
  const [includeStopWords, setIncludeStopWords] = useState(false);
  const [showCount, setShowCount] = useState(30);

  const analysis = useMemo(
    () => analyzeText(text, includeStopWords, ngramSize),
    [text, includeStopWords, ngramSize],
  );

  const maxDensity = analysis.keywords[0]?.density || 1;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Keyword Density Analyzer</h2>
          <p className="mt-1 text-xs text-muted">Paste your content and analyze keyword frequency & density.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 px-5 py-5 lg:grid-cols-2">
          {/* Input */}
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              placeholder="Paste your article, blog post, or any text here..."
              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-[#6c63ff]/50"
            />

            {/* Stats bar */}
            <div className="flex flex-wrap gap-3">
              <Stat label="Words" value={analysis.totalWords} />
              <Stat label="Unique" value={analysis.uniqueWords} />
              <Stat label="Characters" value={analysis.charCount} />
              <Stat label="Sentences" value={analysis.sentenceCount} />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">N-gram</span>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNgramSize(n)}
                    className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                      ngramSize === n
                        ? "bg-[#6c63ff] text-white"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs">
                <input
                  type="checkbox"
                  checked={includeStopWords}
                  onChange={(e) => setIncludeStopWords(e.target.checked)}
                  className="accent-[#6c63ff]"
                />
                <span className="text-muted">Include stop words</span>
              </label>
            </div>
          </div>

          {/* Results */}
          <div>
            {analysis.keywords.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-2">
                {text ? "No keywords found" : "Keywords will appear here"}
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto rounded-lg border border-border bg-[#0d0d14]">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#0d0d14]">
                    <tr className="border-b border-border text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                      <th className="px-4 py-2.5">#</th>
                      <th className="px-4 py-2.5">Keyword</th>
                      <th className="px-4 py-2.5 text-right">Count</th>
                      <th className="px-4 py-2.5 text-right">Density</th>
                      <th className="px-4 py-2.5 w-32"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.keywords.slice(0, showCount).map((kw, i) => (
                      <tr key={kw.word} className="border-b border-border">
                        <td className="px-4 py-2 text-muted-2">{i + 1}</td>
                        <td className="px-4 py-2 font-mono font-semibold text-white">{kw.word}</td>
                        <td className="px-4 py-2 text-right text-muted">{kw.count}</td>
                        <td className="px-4 py-2 text-right font-mono text-muted">{kw.density.toFixed(2)}%</td>
                        <td className="px-4 py-2">
                          <div className="h-1.5 w-full rounded-full bg-surface-3/50">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] to-[#ff6584]"
                              style={{ width: `${(kw.density / maxDensity) * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {analysis.keywords.length > showCount && (
                  <button
                    onClick={() => setShowCount((c) => c + 30)}
                    className="w-full border-t border-border px-4 py-2.5 text-xs font-semibold text-[#6c63ff] transition hover:bg-white/[0.02]"
                  >
                    Show more ({analysis.keywords.length - showCount} remaining)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="📊" title="Density Analysis" desc="See keyword frequency and percentage density at a glance." />
        <InfoCard icon="🔤" title="N-gram Support" desc="Analyze single words, 2-word, or 3-word phrases." />
        <InfoCard icon="🔒" title="Private" desc="All analysis runs in your browser. Nothing is sent anywhere." />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className="font-mono text-sm font-bold text-white">{value.toLocaleString()}</div>
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
