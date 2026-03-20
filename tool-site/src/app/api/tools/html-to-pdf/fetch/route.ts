import { lookup } from "node:dns/promises";
import net from "node:net";

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_HTML_BYTES = 2_500_000;
const MAX_STYLESHEET_COUNT = 10;
const MAX_STYLESHEET_BYTES = 500_000;

function isPrivateIp(address: string): boolean {
  if (net.isIPv4(address)) {
    const [first = 0, second = 0] = address.split(".").map((value) => Number(value));
    if (first === 10) return true;
    if (first === 127) return true;
    if (first === 0) return true;
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

function makeAbsoluteUrl(rawUrl: string, baseUrl: string): string {
  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) return trimmedUrl;

  if (
    trimmedUrl.startsWith("#") ||
    /^(data:|blob:|mailto:|tel:|javascript:|about:)/i.test(trimmedUrl)
  ) {
    return trimmedUrl;
  }

  try {
    return new URL(trimmedUrl, baseUrl).toString();
  } catch {
    return trimmedUrl;
  }
}

function replaceUnsupportedColorFunctions(value: string): string {
  return value.replace(
    /(?:lab|lch|oklch|oklab|color-mix|light-dark|color)\s*\([^)]*(?:\([^)]*\)[^)]*)*\)/gi,
    "#888",
  );
}

function rewriteCssUrls(css: string, stylesheetUrl: string): string {
  return css.replace(
    /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi,
    (_match, quote: string, urlValue: string) => {
      const trimmedUrl = urlValue.trim();
      if (
        !trimmedUrl ||
        trimmedUrl.startsWith("#") ||
        /^(data:|blob:|mailto:|tel:|javascript:|about:)/i.test(trimmedUrl)
      ) {
        return `url(${quote}${trimmedUrl}${quote})`;
      }

      return `url(${quote}${makeAbsoluteUrl(trimmedUrl, stylesheetUrl)}${quote})`;
    },
  );
}

function getAttribute(tag: string, attributeName: string): string | null {
  const pattern = new RegExp(
    `${attributeName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i",
  );
  const match = tag.match(pattern);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1]?.trim() ?? null;
}

function extractStylesheetUrls(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const seen = new Set<string>();
  const linkTagPattern = /<link\b[^>]*>/gi;

  for (const match of html.matchAll(linkTagPattern)) {
    const tag = match[0];
    const rel = (getAttribute(tag, "rel") ?? "").toLowerCase();
    if (!rel.includes("stylesheet")) continue;

    const href = getAttribute(tag, "href");
    if (!href) continue;

    const absoluteHref = makeAbsoluteUrl(href, baseUrl);
    if (!absoluteHref || seen.has(absoluteHref)) continue;

    seen.add(absoluteHref);
    links.push(absoluteHref);
  }

  return links;
}

async function assertPublicHttpUrl(inputUrl: string): Promise<URL> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(inputUrl);
  } catch {
    throw new Error("Please enter a valid webpage URL.");
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

    throw new Error("Unable to resolve that URL.");
  }

  return parsedUrl;
}

async function fetchTextWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "ToolCraft HTML to PDF",
      },
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchStylesheets(html: string, pageUrl: string): Promise<{ href: string; css: string }[]> {
  const stylesheetUrls = extractStylesheetUrls(html, pageUrl).slice(0, MAX_STYLESHEET_COUNT);
  const stylesheets: { href: string; css: string }[] = [];

  for (const stylesheetUrl of stylesheetUrls) {
    try {
      const response = await fetchTextWithTimeout(stylesheetUrl, REQUEST_TIMEOUT_MS);
      if (!response.ok) continue;

      const finalStylesheetUrl = response.url || stylesheetUrl;
      const finalStylesheetHost = new URL(finalStylesheetUrl).hostname;
      if (net.isIP(finalStylesheetHost) && isPrivateIp(finalStylesheetHost)) {
        continue;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!/css|text\/plain|application\/octet-stream/i.test(contentType)) continue;

      let css = await response.text();
      if (css.length > MAX_STYLESHEET_BYTES) {
        css = css.slice(0, MAX_STYLESHEET_BYTES);
      }

      css = rewriteCssUrls(css, finalStylesheetUrl);
      css = replaceUnsupportedColorFunctions(css).replace(/@import\s+[^;]+;?/gi, "");
      stylesheets.push({ href: finalStylesheetUrl, css });
    } catch {
      // Skip stylesheets that fail to load or sanitize.
    }
  }

  return stylesheets;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const targetUrl = requestUrl.searchParams.get("url") ?? "";

  if (!targetUrl.trim()) {
    return NextResponse.json({ error: "Please enter a webpage URL." }, { status: 400 });
  }

  let parsedUrl: URL;

  try {
    parsedUrl = await assertPublicHttpUrl(targetUrl);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webpage URL." },
      { status: 400 },
    );
  }

  try {
    const response = await fetchTextWithTimeout(parsedUrl.toString(), REQUEST_TIMEOUT_MS);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Unable to load the page (${response.status} ${response.statusText}).` },
        { status: 400 },
      );
    }

    const finalPageUrl = response.url || parsedUrl.toString();
    const finalPageHost = new URL(finalPageUrl).hostname;
    if (net.isIP(finalPageHost) && isPrivateIp(finalPageHost)) {
      return NextResponse.json(
        { error: "That webpage redirected to a private network address, which is not allowed." },
        { status: 400 },
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!/html|xhtml/i.test(contentType)) {
      return NextResponse.json(
        { error: "That URL did not return HTML content." },
        { status: 400 },
      );
    }

    const html = await response.text();
    if (html.length > MAX_HTML_BYTES) {
      return NextResponse.json(
        { error: "That page is too large to convert safely. Try a smaller webpage." },
        { status: 413 },
      );
    }

    const title = extractTitle(html);
    const stylesheets = await fetchStylesheets(html, finalPageUrl);

    return NextResponse.json({
      html,
      finalUrl: finalPageUrl,
      title,
      stylesheets,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Timed out while loading the webpage. Try a faster or simpler page."
        : error instanceof Error
          ? error.message
          : "Failed to load the webpage.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
