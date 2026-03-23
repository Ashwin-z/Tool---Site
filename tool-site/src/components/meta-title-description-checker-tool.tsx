"use client";

import { useMemo, useState } from "react";

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const TITLE_PIXEL_MAX = 580;
const DESC_MIN = 70;
const DESC_MAX = 160;
const DESC_PIXEL_MAX = 920;

function estimatePixelWidth(value: string, mode: "title" | "description") {
  const narrowChars = /[fijtI1l\|]/g;
  const wideChars = /[A-ZMWQG@#%&]/g;
  const spaces = /\s/g;

  const basePerChar = mode === "title" ? 9.2 : 7.4;
  const narrowAdjust = mode === "title" ? 4.2 : 3.3;
  const wideAdjust = mode === "title" ? 3.6 : 2.8;
  const spaceAdjust = mode === "title" ? 4.5 : 3.8;

  const narrowCount = (value.match(narrowChars) ?? []).length;
  const wideCount = (value.match(wideChars) ?? []).length;
  const spaceCount = (value.match(spaces) ?? []).length;

  return Math.max(
    0,
    Math.round(value.length * basePerChar - narrowCount * narrowAdjust + wideCount * wideAdjust - spaceCount * spaceAdjust),
  );
}

function getLengthTone(value: number, min: number, max: number) {
  if (value === 0) return { label: "Empty", color: "text-muted", badge: "bg-surface-3/50 text-muted" };
  if (value < min) return { label: "Too short", color: "text-amber-300", badge: "bg-amber-400/10 text-amber-300" };
  if (value > max) return { label: "Too long", color: "text-rose-300", badge: "bg-rose-400/10 text-rose-300" };
  return { label: "Good", color: "text-emerald-300", badge: "bg-emerald-400/10 text-emerald-300" };
}

function truncateForPreview(value: string, maxPixels: number, mode: "title" | "description") {
  if (!value) return "";
  let result = value.trim();
  while (result && estimatePixelWidth(`${result}…`, mode) > maxPixels) {
    result = result.slice(0, -1).trimEnd();
  }
  return result === value.trim() ? result : `${result}…`;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export default function MetaTitleDescriptionCheckerTool() {
  const [title, setTitle] = useState("Free Meta Title & Description Length Checker for SEO");
  const [description, setDescription] = useState(
    "Check whether your SEO title tag and meta description are too short, too long, or just right for better search result visibility.",
  );
  const [url, setUrl] = useState("https://toolcraft.site/tools/meta-title-description-checker");
  const [keyword, setKeyword] = useState("meta title checker");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const analysis = useMemo(() => {
    const cleanTitle = normalizeWhitespace(title);
    const cleanDescription = normalizeWhitespace(description);
    const titleChars = cleanTitle.length;
    const descChars = cleanDescription.length;
    const titlePixels = estimatePixelWidth(cleanTitle, "title");
    const descPixels = estimatePixelWidth(cleanDescription, "description");
    const titleTone = getLengthTone(titleChars, TITLE_MIN, TITLE_MAX);
    const descTone = getLengthTone(descChars, DESC_MIN, DESC_MAX);
    const titlePixelTone = getLengthTone(titlePixels, 280, TITLE_PIXEL_MAX);
    const descPixelTone = getLengthTone(descPixels, 520, DESC_PIXEL_MAX);
    const normalizedKeyword = normalizeWhitespace(keyword).toLowerCase();
    const titleHasKeyword = normalizedKeyword ? cleanTitle.toLowerCase().includes(normalizedKeyword) : false;
    const descHasKeyword = normalizedKeyword ? cleanDescription.toLowerCase().includes(normalizedKeyword) : false;

    const tips: string[] = [];
    if (titleChars < TITLE_MIN) tips.push("Make the title a bit longer so more context appears in search results.");
    if (titleChars > TITLE_MAX) tips.push("Trim the title to reduce the chance of truncation in search results.");
    if (descChars < DESC_MIN) tips.push("Add a fuller meta description to improve click-through context.");
    if (descChars > DESC_MAX) tips.push("Shorten the description so Google is less likely to cut it off.");
    if (normalizedKeyword && !titleHasKeyword) tips.push("Include the target keyword naturally in the title if it matches the page intent.");
    if (normalizedKeyword && !descHasKeyword) tips.push("Mention the target keyword once in the description if it reads naturally.");
    if (tips.length === 0) tips.push("Your title and description are in a strong length range for most search results.");

    return {
      cleanTitle,
      cleanDescription,
      titleChars,
      descChars,
      titleWords: cleanTitle ? cleanTitle.split(/\s+/).length : 0,
      descWords: cleanDescription ? cleanDescription.split(/\s+/).length : 0,
      titlePixels,
      descPixels,
      titleTone,
      descTone,
      titlePixelTone,
      descPixelTone,
      titleHasKeyword,
      descHasKeyword,
      previewTitle: truncateForPreview(cleanTitle, TITLE_PIXEL_MAX, "title"),
      previewDescription: truncateForPreview(cleanDescription, DESC_PIXEL_MAX, "description"),
      tips,
    };
  }, [title, description, keyword]);

  async function copyValue(value: string, field: string) {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />
        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">SEO Meta Checker</h2>
          <p className="mt-0.5 text-[11px] text-muted">
            Paste your title tag and meta description to check character length, estimated pixel width, and SERP preview fit.
          </p>
        </div>

        <div className="space-y-4 px-5 py-5">
          <FieldBlock
            label="Meta Title"
            value={title}
            onChange={setTitle}
            rows={3}
            placeholder="Enter your SEO title"
            actionLabel={copiedField === "title" ? "Copied" : "Copy"}
            onAction={() => copyValue(title, "title")}
          />

          <FieldBlock
            label="Meta Description"
            value={description}
            onChange={setDescription}
            rows={5}
            placeholder="Enter your meta description"
            actionLabel={copiedField === "description" ? "Copied" : "Copy"}
            onAction={() => copyValue(description, "description")}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Preview URL"
              value={url}
              onChange={setUrl}
              placeholder="https://example.com/page"
            />
            <InputField
              label="Target Keyword"
              value={keyword}
              onChange={setKeyword}
              placeholder="primary keyword"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MetricCard
          title="Title Tag"
          accent="#6c63ff"
          stats={[
            { label: "Characters", value: `${analysis.titleChars}`, tone: analysis.titleTone.label, badgeClass: analysis.titleTone.badge },
            { label: "Words", value: `${analysis.titleWords}` },
            { label: "Pixels", value: `${analysis.titlePixels}px`, tone: analysis.titlePixelTone.label, badgeClass: analysis.titlePixelTone.badge },
            { label: "Keyword", value: keyword ? (analysis.titleHasKeyword ? "Included" : "Missing") : "Optional", badgeClass: keyword ? (analysis.titleHasKeyword ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300") : "bg-surface-3/50 text-muted" },
          ]}
        />
        <MetricCard
          title="Meta Description"
          accent="#ff6584"
          stats={[
            { label: "Characters", value: `${analysis.descChars}`, tone: analysis.descTone.label, badgeClass: analysis.descTone.badge },
            { label: "Words", value: `${analysis.descWords}` },
            { label: "Pixels", value: `${analysis.descPixels}px`, tone: analysis.descPixelTone.label, badgeClass: analysis.descPixelTone.badge },
            { label: "Keyword", value: keyword ? (analysis.descHasKeyword ? "Included" : "Missing") : "Optional", badgeClass: keyword ? (analysis.descHasKeyword ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300") : "bg-surface-3/50 text-muted" },
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-3">
          <h3 className="font-display text-sm font-bold text-white">Google Search Preview</h3>
        </div>
        <div className="px-5 py-5">
          <div className="rounded-2xl border border-border bg-surface-2 p-5">
            <div className="text-xs text-[#9aa0a6]">{normalizeWhitespace(url) || "https://example.com/page"}</div>
            <div className="mt-2 text-[26px] leading-8 text-[#8ab4f8]">{analysis.previewTitle || "Your SEO title appears here"}</div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#bdc1c6]">
              {analysis.previewDescription || "Your meta description preview appears here."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr,1fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-3">
            <h3 className="font-display text-sm font-bold text-white">Recommendations</h3>
          </div>
          <div className="space-y-3 px-5 py-5">
            {analysis.tips.map((tip) => (
              <div key={tip} className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm leading-6 text-foreground/85">
                {tip}
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-3">
            <h3 className="font-display text-sm font-bold text-white">Best Practice Targets</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 px-5 py-5 text-sm text-foreground/85">
            <TipCard label="Title length" value="30–60 characters" sub="Aim for ~580px or less" />
            <TipCard label="Description length" value="70–160 characters" sub="Aim for ~920px or less" />
            <TipCard label="Keyword usage" value="Natural inclusion" sub="Prioritize readability over repetition" />
            <TipCard label="Search intent" value="Match the page" sub="Promise exactly what the content delivers" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldBlock({
  label,
  value,
  onChange,
  placeholder,
  rows,
  actionLabel,
  onAction,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows: number;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</label>
        <button
          onClick={onAction}
          className="rounded-lg border border-border bg-surface-2 px-3 py-1 text-[11px] font-semibold text-muted transition hover:text-foreground"
        >
          {actionLabel}
        </button>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border-strong bg-surface-2 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-muted-3"
      />
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border-strong bg-surface-2 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6c63ff]/60 placeholder:text-muted-3"
      />
    </div>
  );
}

function MetricCard({
  title,
  accent,
  stats,
}: {
  title: string;
  accent: string;
  stats: Array<{ label: string; value: string; tone?: string; badgeClass?: string }>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="h-[2px]" style={{ backgroundColor: accent }} />
      <div className="border-b border-border px-5 py-3">
        <h3 className="font-display text-sm font-bold text-white">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-px bg-surface-3/50">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface px-4 py-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">{stat.label}</div>
            <div className="mt-1 font-display text-xl font-bold text-white">{stat.value}</div>
            {stat.tone && (
              <div className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${stat.badgeClass ?? "bg-surface-3/50 text-muted"}`}>
                {stat.tone}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TipCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-muted">{sub}</div>
    </div>
  );
}
