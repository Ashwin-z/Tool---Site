import { lookup } from "node:dns/promises";
import net from "node:net";

import { NextResponse } from "next/server";

import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_HTML_BYTES = 1_500_000;
const DEFAULT_MAX_PAGES = 50;
const ABSOLUTE_MAX_PAGES = 200;
const ASSET_EXTENSION_RE = /\.(?:avif|bmp|css|csv|doc|docx|gif|ico|jpeg|jpg|js|json|map|mp3|mp4|pdf|png|ppt|pptx|rar|svg|txt|webm|webp|woff2?|xls|xlsx|xml|zip)$/i;
const CHANGE_FREQUENCIES = new Set(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]);

type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: ChangeFrequency;
  priority?: string;
};

function isPrivateIp(address: string): boolean {
  if (net.isIPv4(address)) {
    const [first = 0, second = 0] = address.split(".").map(Number);
    if (first === 10 || first === 127 || first === 0) return true;
    if (first === 169 && second === 254) return true;
    if (first === 172 && second >= 16 && second <= 31) return true;
    if (first === 192 && second === 168) return true;
    return false;
  }

  if (net.isIPv6(address)) {
    const normalized = address.toLowerCase();
    return normalized === "::1" || normalized.startsWith("fe80:") || normalized.startsWith("fc") || normalized.startsWith("fd");
  }

  return true;
}

async function assertPublicHttpUrl(inputUrl: string): Promise<URL> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(/^https?:\/\//i.test(inputUrl) ? inputUrl : `https://${inputUrl}`);
  } catch {
    throw new Error("Please enter a valid website URL.");
  }

  if (!/^https?:$/.test(parsedUrl.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Localhost URLs are not allowed.");
  }

  if (net.isIP(hostname) && isPrivateIp(hostname)) {
    throw new Error("Private network URLs are not allowed.");
  }

  try {
    const addresses = await lookup(hostname, { all: true });
    if (addresses.some((entry) => isPrivateIp(entry.address))) {
      throw new Error("That URL resolves to a private network address, which is not allowed.");
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("private network")) {
      throw error;
    }
    throw new Error("Unable to resolve that website URL.");
  }

  parsedUrl.hash = "";
  return parsedUrl;
}

function sanitizePriority(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return undefined;
  const clamped = Math.min(1, Math.max(0, numeric));
  return clamped.toFixed(1);
}

function sanitizeLastmod(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : undefined;
}

function normalizeUrl(url: URL): string {
  url.hash = "";
  url.username = "";
  url.password = "";
  url.search = "";
  if (url.pathname !== "/") {
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  }
  return url.toString();
}

function shouldSkipHref(href: string): boolean {
  return !href || href.startsWith("#") || /^(data:|blob:|mailto:|tel:|javascript:|about:)/i.test(href);
}

function shouldSkipUrl(url: URL, baseOrigin: string): boolean {
  if (url.origin !== baseOrigin) return true;
  if (ASSET_EXTENSION_RE.test(url.pathname)) return true;
  return false;
}

function extractAnchorHrefs(html: string): string[] {
  const results: string[] = [];
  const anchorRe = /<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

  for (const match of html.matchAll(anchorRe)) {
    const href = match[1] ?? match[2] ?? match[3] ?? "";
    if (href) results.push(href);
  }

  return results;
}

async function fetchHtml(url: string): Promise<{ finalUrl: string; html: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "User-Agent": "ToolMint Sitemap Generator",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to crawl ${url} (${response.status}).`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      throw new Error(`Skipped non-HTML page: ${url}`);
    }

    let html = await response.text();
    if (html.length > MAX_HTML_BYTES) {
      html = html.slice(0, MAX_HTML_BYTES);
    }

    return { finalUrl: response.url || url, html };
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildSitemapXml(entries: SitemapEntry[]) {
  const body = entries
    .map((entry) => {
      const parts = [`  <url>`, `    <loc>${entry.loc.replace(/&/g, "&amp;")}</loc>`];
      if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      if (entry.priority) parts.push(`    <priority>${entry.priority}</priority>`);
      parts.push(`  </url>`);
      return parts.join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

async function crawlWebsite(
  startUrl: URL,
  maxPages: number,
  defaults: { lastmod?: string; changefreq?: ChangeFrequency; priority?: string },
) {
  const queue: string[] = [normalizeUrl(new URL(startUrl.toString()))];
  const visited = new Set<string>();
  const entries: SitemapEntry[] = [];
  const skipped: string[] = [];

  while (queue.length > 0 && entries.length < maxPages) {
    const current = queue.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);

    try {
      const { finalUrl, html } = await fetchHtml(current);
      const normalizedFinal = normalizeUrl(new URL(finalUrl));
      if (visited.has(normalizedFinal) && normalizedFinal !== current) continue;

      entries.push({
        loc: normalizedFinal,
        lastmod: defaults.lastmod,
        changefreq: defaults.changefreq,
        priority: entries.length === 0 ? "1.0" : defaults.priority,
      });

      const hrefs = extractAnchorHrefs(html);
      for (const href of hrefs) {
        if (shouldSkipHref(href)) continue;
        try {
          const nextUrl = new URL(href, normalizedFinal);
          const normalizedNext = normalizeUrl(nextUrl);
          if (shouldSkipUrl(new URL(normalizedNext), startUrl.origin)) continue;
          if (!visited.has(normalizedNext) && !queue.includes(normalizedNext)) {
            queue.push(normalizedNext);
          }
        } catch {
          // skip malformed URLs
        }
      }
    } catch (error) {
      skipped.push(error instanceof Error ? error.message : `Skipped ${current}`);
    }
  }

  return { entries, skipped, xml: buildSitemapXml(entries) };
}

export async function POST(request: Request) {
  const rl = checkRateLimit(`sitemap-gen:${getClientIp(request)}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: {
    url?: string;
    lastmod?: string;
    changefreq?: ChangeFrequency;
    priority?: string;
    maxPages?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const rawUrl = body.url?.trim() ?? "";
  if (!rawUrl) {
    return NextResponse.json({ error: "Please enter a website URL." }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = await assertPublicHttpUrl(rawUrl);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid website URL." },
      { status: 400 },
    );
  }

  const maxPages = Math.min(
    ABSOLUTE_MAX_PAGES,
    Math.max(1, Number.isFinite(body.maxPages) ? Number(body.maxPages) : DEFAULT_MAX_PAGES),
  );
  const lastmod = sanitizeLastmod(body.lastmod);
  const changefreq = CHANGE_FREQUENCIES.has(body.changefreq ?? "") ? body.changefreq : "weekly";
  const priority = sanitizePriority(body.priority);

  try {
    const result = await crawlWebsite(parsedUrl, maxPages, { lastmod, changefreq, priority });

    if (result.entries.length === 0) {
      return NextResponse.json(
        {
          error: "No crawlable HTML pages were found for that website.",
          skipped: result.skipped.slice(0, 10),
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      normalizedBase: parsedUrl.origin,
      entries: result.entries,
      skipped: result.skipped.slice(0, 20),
      xml: result.xml,
      reachedLimit: result.entries.length >= maxPages,
      maxPages,
    });
  } catch (error) {
    console.error("[sitemap-generator]", error);
    return NextResponse.json(
      { error: "Failed to generate sitemap." },
      { status: 500 },
    );
  }
}
