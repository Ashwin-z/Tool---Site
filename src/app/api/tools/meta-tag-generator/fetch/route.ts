import { lookup } from "node:dns/promises";
import net from "node:net";

import { NextResponse } from "next/server";

import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUEST_TIMEOUT_MS = 12_000;
const MAX_HTML_BYTES = 1_000_000;

type ImportedMeta = {
  sourceUrl: string;
  title: string;
  description: string;
  url: string;
  siteName: string;
  imageUrl: string;
  type: string;
  twitterCard: string;
  twitterSite: string;
  locale: string;
};

function isPrivateIp(address: string): boolean {
  if (net.isIPv4(address)) {
    const [first = 0, second = 0] = address.split(".").map((part) => Number(part));
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
  let parsed: URL;
  try {
    parsed = new URL(inputUrl);
  } catch {
    throw new Error("Please enter a valid webpage URL.");
  }

  if (!/^https?:$/.test(parsed.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }

  const hostname = parsed.hostname.toLowerCase();
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
    throw new Error("Unable to resolve that URL.");
  }

  return parsed;
}

async function fetchTextWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "ToolMint Meta Tag Importer",
      },
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

function makeAbsoluteUrl(rawUrl: string, baseUrl: string): string {
  try {
    return new URL(rawUrl, baseUrl).toString();
  } catch {
    return rawUrl;
  }
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return decodeEntities(match?.[1] ?? "");
}

function extractLangAsLocale(html: string): string {
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? "";
  const lang = htmlTag.match(/\blang\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const raw = (lang?.[1] ?? lang?.[2] ?? lang?.[3] ?? "").trim();
  if (!raw) return "";
  return raw.replace("-", "_");
}

function extractCanonical(html: string, baseUrl: string): string {
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const link of links) {
    const relMatch = link.match(/\brel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const rel = (relMatch?.[1] ?? relMatch?.[2] ?? relMatch?.[3] ?? "").toLowerCase();
    if (!rel.includes("canonical")) continue;

    const hrefMatch = link.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = (hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "").trim();
    if (!href) continue;
    return makeAbsoluteUrl(href, baseUrl);
  }
  return "";
}

function extractMetaContent(html: string, key: string, attr: "name" | "property"): string {
  const metas = html.match(/<meta\b[^>]*>/gi) ?? [];
  const normalizedKey = key.toLowerCase();

  for (const meta of metas) {
    const attrMatch = meta.match(new RegExp(`\\b${attr}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
    const attrValue = (attrMatch?.[1] ?? attrMatch?.[2] ?? attrMatch?.[3] ?? "").toLowerCase().trim();
    if (attrValue !== normalizedKey) continue;

    const contentMatch = meta.match(/\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const content = (contentMatch?.[1] ?? contentMatch?.[2] ?? contentMatch?.[3] ?? "").trim();
    if (content) return decodeEntities(content);
  }

  return "";
}

function importMetaFromHtml(html: string, finalUrl: string): ImportedMeta {
  const title =
    extractMetaContent(html, "og:title", "property") ||
    extractMetaContent(html, "twitter:title", "name") ||
    extractTitle(html);

  const description =
    extractMetaContent(html, "og:description", "property") ||
    extractMetaContent(html, "twitter:description", "name") ||
    extractMetaContent(html, "description", "name");

  const rawUrl =
    extractMetaContent(html, "og:url", "property") ||
    extractCanonical(html, finalUrl) ||
    finalUrl;

  const rawImage =
    extractMetaContent(html, "og:image", "property") ||
    extractMetaContent(html, "twitter:image", "name");

  const locale =
    extractMetaContent(html, "og:locale", "property") ||
    extractLangAsLocale(html) ||
    "en_US";

  return {
    sourceUrl: finalUrl,
    title,
    description,
    url: makeAbsoluteUrl(rawUrl, finalUrl),
    siteName: extractMetaContent(html, "og:site_name", "property"),
    imageUrl: rawImage ? makeAbsoluteUrl(rawImage, finalUrl) : "",
    type: extractMetaContent(html, "og:type", "property") || "website",
    twitterCard: extractMetaContent(html, "twitter:card", "name") || "summary_large_image",
    twitterSite: extractMetaContent(html, "twitter:site", "name"),
    locale,
  };
}

export async function POST(request: Request) {
  const rl = checkRateLimit(`meta-tag-fetch:${getClientIp(request)}`, { maxRequests: 15, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let inputUrl = "";
  try {
    const body = (await request.json()) as { url?: string };
    inputUrl = body.url?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  if (!inputUrl) {
    return NextResponse.json({ error: "Please provide a URL to import." }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = await assertPublicHttpUrl(inputUrl);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid URL." },
      { status: 400 }
    );
  }

  try {
    const response = await fetchTextWithTimeout(parsedUrl.toString());
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch page (HTTP ${response.status}).` }, { status: 400 });
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!/html|xhtml/i.test(contentType)) {
      return NextResponse.json({ error: "The URL did not return an HTML page." }, { status: 400 });
    }

    let html = await response.text();
    if (html.length > MAX_HTML_BYTES) {
      html = html.slice(0, MAX_HTML_BYTES);
    }

    const imported = importMetaFromHtml(html, response.url || parsedUrl.toString());
    return NextResponse.json({ imported });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Request timed out while fetching the page." }, { status: 408 });
    }
    return NextResponse.json({ error: "Could not import metadata from that URL." }, { status: 500 });
  }
}
