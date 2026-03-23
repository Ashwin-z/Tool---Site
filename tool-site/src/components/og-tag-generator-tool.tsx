"use client";

import { useMemo, useState } from "react";

interface OgFields {
  title: string;
  description: string;
  url: string;
  siteName: string;
  imageUrl: string;
  type: string;
  twitterCard: string;
  twitterSite: string;
  locale: string;
}

const DEFAULTS: OgFields = {
  title: "",
  description: "",
  url: "",
  siteName: "",
  imageUrl: "",
  type: "website",
  twitterCard: "summary_large_image",
  twitterSite: "",
  locale: "en_US",
};

const OG_TYPES = ["website", "article", "product", "profile", "video.movie", "music.song"];
const TWITTER_CARDS = ["summary", "summary_large_image", "app", "player"];

function generateTags(fields: OgFields): string {
  const lines: string[] = [];

  if (fields.title) {
    lines.push(`<meta property="og:title" content="${esc(fields.title)}" />`);
    lines.push(`<meta name="twitter:title" content="${esc(fields.title)}" />`);
  }
  if (fields.description) {
    lines.push(`<meta property="og:description" content="${esc(fields.description)}" />`);
    lines.push(`<meta name="twitter:description" content="${esc(fields.description)}" />`);
    lines.push(`<meta name="description" content="${esc(fields.description)}" />`);
  }
  if (fields.url) {
    lines.push(`<meta property="og:url" content="${esc(fields.url)}" />`);
  }
  if (fields.siteName) {
    lines.push(`<meta property="og:site_name" content="${esc(fields.siteName)}" />`);
  }
  if (fields.imageUrl) {
    lines.push(`<meta property="og:image" content="${esc(fields.imageUrl)}" />`);
    lines.push(`<meta name="twitter:image" content="${esc(fields.imageUrl)}" />`);
  }
  if (fields.type) {
    lines.push(`<meta property="og:type" content="${esc(fields.type)}" />`);
  }
  if (fields.locale) {
    lines.push(`<meta property="og:locale" content="${esc(fields.locale)}" />`);
  }
  if (fields.twitterCard) {
    lines.push(`<meta name="twitter:card" content="${esc(fields.twitterCard)}" />`);
  }
  if (fields.twitterSite) {
    lines.push(`<meta name="twitter:site" content="${esc(fields.twitterSite)}" />`);
  }

  return lines.join("\n");
}

function esc(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function OgTagGeneratorTool() {
  const [fields, setFields] = useState<OgFields>(DEFAULTS);

  const update = (key: keyof OgFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const output = useMemo(() => generateTags(fields), [fields]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      /* */
    }
  };

  const titleLen = fields.title.length;
  const descLen = fields.description.length;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">OG Tag Generator</h2>
          <p className="mt-1 text-xs text-muted">Generate Open Graph & Twitter Card meta tags for your pages.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 px-5 py-5 lg:grid-cols-2">
          {/* Form */}
          <div className="space-y-3">
            <Field label="Page Title" hint={`${titleLen}/60 characters`} hintWarn={titleLen > 60}>
              <input
                value={fields.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="My Awesome Page"
                className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#6c63ff]/50"
              />
            </Field>

            <Field label="Description" hint={`${descLen}/160 characters`} hintWarn={descLen > 160}>
              <textarea
                value={fields.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                placeholder="A brief description of this page..."
                className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#6c63ff]/50"
              />
            </Field>

            <Field label="Page URL">
              <input
                value={fields.url}
                onChange={(e) => update("url", e.target.value)}
                placeholder="https://example.com/page"
                className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 font-mono text-sm text-white outline-none placeholder:text-white/20 focus:border-[#6c63ff]/50"
              />
            </Field>

            <Field label="Image URL">
              <input
                value={fields.imageUrl}
                onChange={(e) => update("imageUrl", e.target.value)}
                placeholder="https://example.com/og-image.jpg"
                className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 font-mono text-sm text-white outline-none placeholder:text-white/20 focus:border-[#6c63ff]/50"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Site Name">
                <input
                  value={fields.siteName}
                  onChange={(e) => update("siteName", e.target.value)}
                  placeholder="My Website"
                  className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#6c63ff]/50"
                />
              </Field>

              <Field label="Locale">
                <input
                  value={fields.locale}
                  onChange={(e) => update("locale", e.target.value)}
                  placeholder="en_US"
                  className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 font-mono text-sm text-white outline-none placeholder:text-white/20 focus:border-[#6c63ff]/50"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="OG Type">
                <select
                  value={fields.type}
                  onChange={(e) => update("type", e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-white outline-none focus:border-[#6c63ff]/50"
                >
                  {OG_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Twitter Card">
                <select
                  value={fields.twitterCard}
                  onChange={(e) => update("twitterCard", e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-white outline-none focus:border-[#6c63ff]/50"
                >
                  {TWITTER_CARDS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Twitter @username">
              <input
                value={fields.twitterSite}
                onChange={(e) => update("twitterSite", e.target.value)}
                placeholder="@yourhandle"
                className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 font-mono text-sm text-white outline-none placeholder:text-white/20 focus:border-[#6c63ff]/50"
              />
            </Field>
          </div>

          {/* Output + Preview */}
          <div className="space-y-4">
            {/* Social preview */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                Social Preview
              </label>
              <div className="overflow-hidden rounded-xl border border-border bg-surface-2">
                {fields.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={fields.imageUrl}
                    alt="OG preview"
                    className="aspect-[1.91/1] w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex aspect-[1.91/1] items-center justify-center bg-[#0d0d14] text-xs text-muted-2">
                    Image preview
                  </div>
                )}
                <div className="p-3">
                  <div className="text-[10px] uppercase text-muted-2">
                    {(() => { try { return new URL(fields.url).hostname; } catch { return "example.com"; } })()}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {fields.title || "Page Title"}
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-muted">
                    {fields.description || "Page description will appear here"}
                  </div>
                </div>
              </div>
            </div>

            {/* Generated code */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                  Generated Meta Tags
                </label>
                <button
                  onClick={copy}
                  disabled={!output}
                  className="rounded border border-border px-2.5 py-1 text-[10px] font-semibold text-white transition hover:border-border-strong disabled:opacity-40"
                >
                  Copy
                </button>
              </div>
              <pre className="max-h-[260px] overflow-auto rounded-lg border border-border bg-[#0d0d14] p-4 font-mono text-[11px] leading-5 text-muted">
                {output || "<!-- Fill in the fields to generate tags -->"}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="🌐" title="Open Graph" desc="Facebook, LinkedIn, and most platforms use OG tags." />
        <InfoCard icon="🐦" title="Twitter Cards" desc="Twitter-specific meta tags for rich link previews." />
        <InfoCard icon="👁️" title="Live Preview" desc="See how your page will look when shared on social media." />
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  hintWarn,
  children,
}: {
  label: string;
  hint?: string;
  hintWarn?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</label>
        {hint && (
          <span className={`text-[10px] ${hintWarn ? "text-amber-400" : "text-muted-2"}`}>{hint}</span>
        )}
      </div>
      {children}
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
