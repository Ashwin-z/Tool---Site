"use client";

import { useEffect, useMemo, useState } from "react";

const CHANGE_FREQUENCIES = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
] as const;

type ChangeFrequency = (typeof CHANGE_FREQUENCIES)[number];

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: ChangeFrequency | string;
  priority?: string;
};

type GeneratedSitemapState = {
  normalizedBase: string;
  entries: SitemapEntry[];
  invalidEntries: string[];
  xml: string;
  crawledCount?: number;
  discoveredCount?: number;
  skippedLinks?: string[];
  notes?: string[];
  errors?: string[];
  source?: "manual" | "auto";
};

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return url.origin;
  } catch {
    return "";
  }
}

function resolveUrl(baseUrl: string, rawValue: string) {
  const value = rawValue.trim();
  if (!value) return "";

  try {
    if (/^https?:\/\//i.test(value)) {
      return new URL(value).toString();
    }

    if (!baseUrl) return value.startsWith("/") ? value : `/${value}`;

    return new URL(
      value.startsWith("/") ? value : `/${value}`,
      baseUrl
    ).toString();
  } catch {
    return "";
  }
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function dedupeEntries(entries: SitemapEntry[]) {
  const seen = new Set<string>();

  return entries.filter((entry) => {
    if (seen.has(entry.loc)) return false;
    seen.add(entry.loc);
    return true;
  });
}

function buildSitemapXml(entries: SitemapEntry[]) {
  const body = entries
    .map((entry) => {
      const parts = [
        "  <url>",
        `    <loc>${escapeXml(entry.loc)}</loc>`,
      ];

      if (entry.lastmod) {
        parts.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      }

      if (entry.changefreq) {
        parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      }

      if (entry.priority) {
        parts.push(`    <priority>${entry.priority}</priority>`);
      }

      parts.push("  </url>");
      return parts.join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

export default function SitemapGeneratorTool() {
  const [baseUrl, setBaseUrl] = useState("https://toolcraft.site");
  const [urlsInput, setUrlsInput] = useState(
    "/\n/tools\n/tools/meta-title-description-checker\n/tools/sitemap-generator\n/contact"
  );
  const [includeHomePage, setIncludeHomePage] = useState(true);
  const [lastmod, setLastmod] = useState(new Date().toISOString().slice(0, 10));
  const [changefreq, setChangefreq] = useState<ChangeFrequency>("weekly");
  const [priority, setPriority] = useState("0.7");
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState<GeneratedSitemapState | null>(null);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlError, setCrawlError] = useState("");
  const [maxPages, setMaxPages] = useState("250");

  const [crawlPhase, setCrawlPhase] = useState<
    "idle" | "starting" | "fetching" | "parsing" | "building"
  >("idle");
  const [visualProgress, setVisualProgress] = useState(0);

  useEffect(() => {
    if (!isCrawling) {
      setVisualProgress(0);
      return;
    }

    const interval = window.setInterval(() => {
      setVisualProgress((prev) => {
        if (prev >= 92) return prev;

        if (prev < 25) return prev + 7;
        if (prev < 50) return prev + 4;
        if (prev < 75) return prev + 2;
        return prev + 1;
      });
    }, 400);

    return () => window.clearInterval(interval);
  }, [isCrawling]);

  const analysis = useMemo(() => {
    const normalizedBase = normalizeBaseUrl(baseUrl);

    const lines = urlsInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const parsed = lines.map((line) => ({
      raw: line,
      loc: resolveUrl(normalizedBase, line),
    }));

    const invalidEntries = parsed
      .filter((item) => !item.loc)
      .map((item) => item.raw);

    const entries = dedupeEntries([
      ...(includeHomePage && normalizedBase
        ? [
            {
              loc: normalizedBase,
              lastmod: lastmod || undefined,
              changefreq,
              priority: "1.0",
            },
          ]
        : []),
      ...parsed
        .filter((item) => item.loc)
        .map((item) => ({
          loc: item.loc,
          lastmod: lastmod || undefined,
          changefreq,
          priority: priority || undefined,
        })),
    ]);

    return {
      normalizedBase,
      entries,
      invalidEntries,
      xml: buildSitemapXml(entries),
      source: "manual" as const,
    };
  }, [baseUrl, urlsInput, includeHomePage, lastmod, changefreq, priority]);

  const activeSitemap = generated ?? analysis;

  function generateSitemap() {
    setGenerated({
      ...analysis,
      source: "manual",
    });
    setCopied(false);
    setCrawlError("");
  }

  async function autoDiscoverUrls() {
    const normalizedBase = normalizeBaseUrl(baseUrl);

    if (!normalizedBase) {
      setCrawlError("Please enter a valid website URL first.");
      return;
    }

    setIsCrawling(true);
    setCrawlError("");
    setCopied(false);
    setGenerated(null);
    setCrawlPhase("starting");
    setVisualProgress(5);

    try {
      setCrawlPhase("fetching");

      const response = await fetch("/api/tools/sitemap-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: normalizedBase,
          includeHomePage,
          lastmod,
          changefreq,
          priority,
          maxPages: Number(maxPages) || 250,
        }),
      });

      setCrawlPhase("parsing");

      const rawText = await response.text();

      let payload: any = null;
      try {
        payload = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Server returned non-JSON response: ${rawText.slice(0, 180)}`
        );
      }

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to crawl website.");
      }

      setCrawlPhase("building");
      setVisualProgress(96);

      const entries = Array.isArray(payload.entries) ? payload.entries : [];

      const discoveredPaths = entries
        .map((entry: SitemapEntry) => {
          try {
            const url = new URL(entry.loc);
            return `${url.pathname || "/"}${url.search || ""}`;
          } catch {
            return entry.loc;
          }
        })
        .join("\n");

      setBaseUrl(payload.normalizedBase || normalizedBase);
      setUrlsInput(discoveredPaths);

      setGenerated({
        normalizedBase: payload.normalizedBase || normalizedBase,
        entries,
        invalidEntries: payload.invalidEntries || [],
        xml: payload.xml || buildSitemapXml(entries),
        crawledCount: payload.crawledCount,
        discoveredCount: payload.discoveredCount,
        skippedLinks: payload.skippedLinks || [],
        notes: payload.notes || [],
        errors: payload.errors || [],
        source: "auto",
      });

      setVisualProgress(100);
    } catch (error) {
      setCrawlError(
        error instanceof Error ? error.message : "Failed to crawl website."
      );
    } finally {
      setTimeout(() => {
        setIsCrawling(false);
        setCrawlPhase("idle");
      }, 300);
    }
  }

  async function copyXml() {
    await navigator.clipboard.writeText(activeSitemap.xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function downloadXml() {
    const blob = new Blob([activeSitemap.xml], {
      type: "application/xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sitemap.xml";
    link.click();
    URL.revokeObjectURL(url);
  }

  function loadSample() {
    setBaseUrl("https://example.com");
    setUrlsInput("/\n/about\n/services\n/blog\n/blog/seo-tips\n/contact");
    setIncludeHomePage(true);
    setLastmod(new Date().toISOString().slice(0, 10));
    setChangefreq("weekly");
    setPriority("0.7");
    setMaxPages("250");
    setGenerated(null);
    setCrawlError("");
  }

  function clearAll() {
    setBaseUrl("");
    setUrlsInput("");
    setIncludeHomePage(false);
    setLastmod("");
    setChangefreq("weekly");
    setPriority("0.7");
    setMaxPages("250");
    setGenerated(null);
    setCrawlError("");
  }

  function getCrawlStatusText() {
    if (!isCrawling) return "";

    if (crawlPhase === "starting") return "Starting crawl...";
    if (crawlPhase === "fetching") return "Crawling website and collecting internal URLs...";
    if (crawlPhase === "parsing") return "Processing crawl response...";
    if (crawlPhase === "building") return "Building sitemap.xml...";
    return "Crawling website...";
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">
            Generate XML Sitemap
          </h2>
          <p className="mt-0.5 text-[11px] text-muted">
            Enter a website URL to auto-discover internal pages and generate the sitemap automatically.
          </p>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Website URL"
              value={baseUrl}
              onChange={setBaseUrl}
              placeholder="https://example.com"
            />

            <InputField
              label="Last Modified"
              value={lastmod}
              onChange={setLastmod}
              placeholder="2026-03-22"
              type="date"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <SelectField
              label="Change Frequency"
              value={changefreq}
              onChange={(value) => setChangefreq(value as ChangeFrequency)}
            >
              {CHANGE_FREQUENCIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>

            <InputField
              label="Default Priority"
              value={priority}
              onChange={setPriority}
              placeholder="0.7"
              type="number"
              min="0"
              max="1"
              step="0.1"
            />

            <InputField
              label="Max Pages to Crawl"
              value={maxPages}
              onChange={setMaxPages}
              placeholder="250"
              type="number"
              min="10"
              max="1000"
              step="10"
            />

            <label className="flex items-end gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-white">
              <input
                type="checkbox"
                checked={includeHomePage}
                onChange={(event) => setIncludeHomePage(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-surface"
              />
              <span>
                <span className="block font-semibold">Include homepage</span>
                <span className="text-xs text-muted">
                  Adds the base URL as the first sitemap entry
                </span>
              </span>
            </label>
          </div>

          <div className="rounded-xl border border-[#6c63ff]/20 bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">
                  Auto crawl website
                </div>
                <p className="mt-1 text-xs text-muted">
                  The tool will crawl internal links on the same domain and generate the XML sitemap for you.
                </p>
              </div>

              <button
                onClick={autoDiscoverUrls}
                disabled={isCrawling}
                className="rounded-lg bg-[#6c63ff] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5b53ee] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCrawling ? "Crawling website..." : "Auto Generate from URL"}
              </button>
            </div>

            {isCrawling && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-foreground/85">
                    {getCrawlStatusText()}
                  </span>
                  <span className="text-xs text-muted">
                    {visualProgress}%
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] via-[#8b7bff] to-[#38d9a9] transition-all duration-300"
                    style={{ width: `${visualProgress}%` }}
                  />
                </div>

                <div className="mt-2 text-[11px] text-[#8f90ab]">
                  Max crawl limit: {maxPages} pages
                </div>
              </div>
            )}

            {crawlError && (
              <p className="mt-3 text-sm text-rose-300">{crawlError}</p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                URLs or Paths
              </label>

              <div className="flex gap-2">
                <button
                  onClick={loadSample}
                  className="rounded-lg border border-border bg-surface-2 px-3 py-1 text-[11px] font-semibold text-muted transition hover:text-foreground"
                >
                  Load sample
                </button>

                <button
                  onClick={clearAll}
                  className="rounded-lg border border-border bg-surface-2 px-3 py-1 text-[11px] font-semibold text-muted transition hover:text-foreground"
                >
                  Clear
                </button>
              </div>
            </div>

            <textarea
              value={urlsInput}
              readOnly
              rows={10}
              placeholder="Crawled URLs will appear here automatically after entering a website URL above."
              className="w-full cursor-not-allowed rounded-xl border border-border-strong bg-surface px-4 py-3 text-sm text-white outline-none opacity-95 placeholder:text-muted-3"
            />

            <p className="mt-2 text-xs text-muted">
              This field is auto-filled from the website crawl. Enter only the website URL above.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={generateSitemap}
                disabled={isCrawling || !urlsInput.trim()}
                className="rounded-lg border border-border bg-surface-2 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                Generate from crawled URLs
              </button>

              <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-muted">
                {analysis.entries.length} resolved URL
                {analysis.entries.length !== 1 ? "s" : ""} ready
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Valid URLs"
          value={activeSitemap.entries.length.toString()}
          accent="#6c63ff"
        />
        <StatCard
          label="Invalid lines"
          value={activeSitemap.invalidEntries.length.toString()}
          accent="#ff6584"
        />
        <StatCard
          label="Base URL"
          value={activeSitemap.normalizedBase ? "Ready" : "Missing"}
          accent="#38d9a9"
        />
        <StatCard
          label="Source"
          value={activeSitemap.source === "auto" ? "Auto" : "Manual"}
          accent="#ffa640"
        />
      </div>

      {(activeSitemap.crawledCount || activeSitemap.discoveredCount) ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            label="Pages Crawled"
            value={String(activeSitemap.crawledCount ?? 0)}
            accent="#6c63ff"
          />
          <StatCard
            label="Pages Found"
            value={String(
              activeSitemap.discoveredCount ?? activeSitemap.entries.length
            )}
            accent="#38d9a9"
          />
          <StatCard
            label="Remaining"
            value={String(
              Math.max(
                0,
                Number(maxPages || 0) - (activeSitemap.crawledCount ?? 0)
              )
            )}
            accent="#ff6584"
          />
        </div>
      ) : null}

      {activeSitemap.notes && activeSitemap.notes.length > 0 && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-4">
          <h3 className="font-display text-sm font-bold text-emerald-300">
            Crawler notes
          </h3>

          <div className="mt-2 space-y-2 text-sm text-emerald-100">
            {activeSitemap.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </div>
      )}

      {activeSitemap.errors && activeSitemap.errors.length > 0 && (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/5 px-5 py-4">
          <h3 className="font-display text-sm font-bold text-rose-300">
            Crawl warnings
          </h3>

          <div className="mt-2 space-y-2 text-sm text-rose-100">
            {activeSitemap.errors.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      )}

      {activeSitemap.invalidEntries.length > 0 && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 px-5 py-4">
          <h3 className="font-display text-sm font-bold text-amber-300">
            Skipped invalid lines
          </h3>

          <div className="mt-2 flex flex-wrap gap-2 text-xs text-amber-200">
            {activeSitemap.invalidEntries.map((item) => (
              <span
                key={item}
                className="rounded-full border border-amber-400/20 px-2.5 py-1"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {activeSitemap.skippedLinks && activeSitemap.skippedLinks.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-3">
            <h3 className="font-display text-sm font-bold text-white">
              Skipped non-page links
            </h3>
          </div>

          <div className="max-h-[220px] space-y-2 overflow-auto px-5 py-5">
            {activeSitemap.skippedLinks.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="break-all rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground/85"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-3">
          <h3 className="font-display text-sm font-bold text-white">
            URLs included in sitemap
          </h3>
        </div>

        <div className="px-5 py-5">
          {activeSitemap.entries.length > 0 ? (
            <div className="max-h-[320px] space-y-2 overflow-auto">
              {activeSitemap.entries.map((entry, index) => (
                <div
                  key={`${entry.loc}-${index}`}
                  className="rounded-xl border border-border bg-surface-2 px-4 py-3"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                    URL {index + 1}
                  </div>
                  <div className="mt-1 break-all text-sm text-white">
                    {entry.loc}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">
              Enter a website URL and click Auto Generate from URL.
            </p>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="font-display text-sm font-bold text-white">
            Generated sitemap.xml
          </h3>

          <div className="flex gap-2">
            <button
              onClick={copyXml}
              className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-foreground"
            >
              {copied ? "Copied" : "Copy XML"}
            </button>

            <button
              onClick={downloadXml}
              className="rounded-lg bg-[#6c63ff] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#5b53ee]"
            >
              Download XML
            </button>
          </div>
        </div>

        <div className="px-5 py-5">
          <pre className="max-h-[560px] overflow-auto rounded-xl border border-border bg-surface-2 p-4 text-xs leading-6 text-foreground/85">
            {generated || activeSitemap.entries.length > 0
              ? activeSitemap.xml
              : "Generate a sitemap to see the XML output here."}
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard
          icon="🕷️"
          title="Auto crawl support"
          desc="Enter a domain and let the tool discover internal pages automatically."
        />
        <InfoCard
          icon="⚡"
          title="Guided workflow"
          desc="Enter only the website URL and let the tool handle the discovered paths for you."
        />
        <InfoCard
          icon="🗂️"
          title="XML export ready"
          desc="Copy or download the generated sitemap.xml file instantly."
        />
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-xl border border-border-strong bg-surface-2 px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted-3 focus:border-[#6c63ff]/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-border-strong bg-surface-2 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6c63ff]/60"
      >
        {children}
      </select>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="h-[2px]" style={{ backgroundColor: accent }} />
      <div className="px-4 py-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">
          {label}
        </div>
        <div className="mt-1 break-words font-display text-2xl font-bold text-white">
          {value}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <span className="text-xl">{icon}</span>
      <h4 className="mt-2 text-sm font-semibold text-white">{title}</h4>
      <p className="mt-1 text-xs leading-5 text-muted">{desc}</p>
    </div>
  );
}