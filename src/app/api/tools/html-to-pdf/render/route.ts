import { lookup } from "node:dns/promises";
import { access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import net from "node:net";
import path from "node:path";

import { NextResponse } from "next/server";
import puppeteer, { type Browser } from "puppeteer-core";

import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Timing                                                             */
/* ------------------------------------------------------------------ */

/** Max time (ms) to wait for the page to reach an acceptable state.  */
const PAGE_TIMEOUT_MS = 10_000;

/** After DOMContentLoaded we wait this long for rendering to settle. */
const SETTLE_MS = 1_500;

/** Resource types we allow through – everything else is blocked.      */
const ALLOWED_RESOURCE_TYPES = new Set([
  "document",
  "stylesheet",
  "script",
  "font",
  "image",
  "xhr",
  "fetch",
]);

/* ------------------------------------------------------------------ */
/*  SSRF protection                                                    */
/* ------------------------------------------------------------------ */

function isPrivateIp(address: string): boolean {
  if (net.isIPv4(address)) {
    const [first = 0, second = 0] = address.split(".").map(Number);
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
    return (
      normalized === "::1" ||
      normalized.startsWith("fe80:") ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd")
    );
  }
  return true;
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
    if (error instanceof Error && error.message.includes("private network")) throw error;
    throw new Error("Unable to resolve that URL.");
  }

  return parsedUrl;
}

/* ------------------------------------------------------------------ */
/*  Browser resolution (cached)                                        */
/* ------------------------------------------------------------------ */

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

let cachedBrowserPath: string | null | undefined;

async function resolveBrowserPath(): Promise<string | null> {
  if (cachedBrowserPath !== undefined) return cachedBrowserPath;

  const candidates = [
    process.env.CHROME_PATH,
    process.env.CHROMIUM_PATH,
    process.env.EDGE_PATH,
    path.join(process.env.PROGRAMFILES ?? "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env["PROGRAMFILES(X86)"] ?? "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env.PROGRAMFILES ?? "", "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(process.env["PROGRAMFILES(X86)"] ?? "", "Microsoft", "Edge", "Application", "msedge.exe"),
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      cachedBrowserPath = candidate;
      return candidate;
    }
  }

  cachedBrowserPath = null;
  return null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function makeDownloadFileName(inputUrl: string): string {
  try {
    const url = new URL(inputUrl);
    const pathPart =
      url.pathname
        .replace(/\/+$/, "")
        .split("/")
        .filter(Boolean)
        .pop() ?? "page";
    return `${sanitizeFileName(`${url.hostname}-${pathPart}`) || "webpage"}.pdf`;
  } catch {
    return "webpage.pdf";
  }
}

/* ------------------------------------------------------------------ */
/*  PDF generation via puppeteer‑core                                  */
/* ------------------------------------------------------------------ */

async function renderPdf(browserPath: string, targetUrl: string): Promise<Buffer> {
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      executablePath: browserPath,
      headless: true,
      args: [
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-sync",
        "--disable-translate",
        "--disable-component-update",
        "--disable-domain-reliability",
        "--disable-client-side-phishing-detection",
        "--disable-hang-monitor",
        "--disable-popup-blocking",
        "--disable-prompt-on-repost",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-ipc-flooding-protection",
        "--disable-features=TranslateUI,InterestFeedContentSuggestions,OptimizationHints,MediaRouter,DialMediaRouteProvider,CalculateNativeWinOcclusion",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    /* ---- Block unwanted resource types (media, websocket, etc.) --- */
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (ALLOWED_RESOURCE_TYPES.has(req.resourceType())) {
        req.continue();
      } else {
        req.abort();
      }
    });

    /* Navigate and ONLY wait for DOMContentLoaded.
       "domcontentloaded" fires once the HTML is fully parsed and
       deferred scripts have executed — no waiting for images, fonts,
       iframes, tracking pixels, or ad networks to finish.  This is
       the single biggest speed-up for heavy pages. */
    await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: PAGE_TIMEOUT_MS,
    });

    /* Give the renderer a fixed settle window for CSS paints,
       JS-driven layout changes, and web-font swaps. */
    await new Promise((r) => setTimeout(r, SETTLE_MS));

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Route handler                                                      */
/* ------------------------------------------------------------------ */

export async function GET(request: Request) {
  const rl = checkRateLimit(`html-to-pdf-render:${getClientIp(request)}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: rateLimitHeaders(rl) });
  }

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

  const browserPath = await resolveBrowserPath();
  if (!browserPath) {
    return NextResponse.json(
      { error: "PDF rendering is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  try {
    const pdfBytes = await renderPdf(browserPath, parsedUrl.toString());

    if (pdfBytes.byteLength < 1000) {
      return NextResponse.json(
        {
          error:
            "The page rendered too little content to produce a useful PDF. It may require login or block automated rendering.",
        },
        { status: 422 },
      );
    }

    const fileName = makeDownloadFileName(parsedUrl.toString());

    return new NextResponse(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
        "X-File-Name": encodeURIComponent(fileName),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to render the webpage.";
    const isTimeout =
      message.toLowerCase().includes("timeout") || message.includes("Navigation timeout");
    return NextResponse.json(
      { error: isTimeout ? "The page took too long to load. Try a simpler URL." : message },
      { status: isTimeout ? 504 : 500 },
    );
  }
}
