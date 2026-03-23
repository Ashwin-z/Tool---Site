import { NextResponse } from "next/server";

type GenerateRequest = {
  url?: string;
};

type DetectionResult = {
  normalizedBase: string;
  host: string;
  platform: "wordpress" | "shopify" | "opencart" | "generic";
  sitemapUrl: string;
  robotsTxt: string;
  detectedPaths: string[];
  notes: string[];
  existingRobotsFound: boolean;
};

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Website URL is required.");

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  const url = new URL(withProtocol);
  return url.origin;
}

function ensureLeadingSlash(value: string) {
  if (!value) return value;
  if (value === "/") return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("?")) return `/${value}`;
  return value.startsWith("/") ? value : `/${value}`;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function extractAnchors(html: string) {
  const links = new Set<string>();
  const anchorRegex =
    /<a\b[^>]*?href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1] ?? match[2] ?? match[3] ?? "";
    if (href) links.add(href.trim());
  }

  return Array.from(links);
}

function extractSitemapsFromRobots(robotsText: string) {
  return robotsText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^sitemap:/i.test(line))
    .map((line) => line.replace(/^sitemap:\s*/i, "").trim())
    .filter(Boolean);
}

async function safeFetchText(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 ToolCraft Robots Generator",
        accept: "text/html,application/xml,text/plain,*/*",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, status: response.status, text: "" };
    }

    const text = await response.text();
    return { ok: true, status: response.status, text };
  } catch {
    return { ok: false, status: 0, text: "" };
  }
}

function detectPlatformFromHtml(html: string, baseUrl: string) {
  const lower = html.toLowerCase();
  const urlLower = baseUrl.toLowerCase();

  if (
    lower.includes("/wp-content/") ||
    lower.includes("/wp-includes/") ||
    lower.includes("wordpress")
  ) {
    return "wordpress" as const;
  }

  if (
    lower.includes("cdn.shopify.com") ||
    lower.includes("shopify.theme") ||
    lower.includes("shopify")
  ) {
    return "shopify" as const;
  }

  if (
    lower.includes("index.php?route=") ||
    lower.includes("opencart") ||
    lower.includes("catalog/view/theme")
  ) {
    return "opencart" as const;
  }

  if (urlLower.includes("myshopify.com")) {
    return "shopify" as const;
  }

  return "generic" as const;
}

function collectDetectedPaths(links: string[], origin: string) {
  const useful = new Set<string>();

  const commonKeywords = [
    "admin",
    "login",
    "dashboard",
    "account",
    "checkout",
    "cart",
    "search",
    "private",
    "member",
    "members",
    "signin",
    "signup",
  ];

  for (const href of links) {
    try {
      const url = new URL(href, origin);
      if (url.origin !== origin) continue;

      const path = `${url.pathname}${url.search || ""}`;
      const pathLower = path.toLowerCase();

      if (commonKeywords.some((keyword) => pathLower.includes(keyword))) {
        useful.add(ensureLeadingSlash(path));
      }
    } catch {}
  }

  return Array.from(useful);
}

function buildRobotsTxt({
  platform,
  sitemapUrl,
  host,
  detectedPaths,
}: {
  platform: "wordpress" | "shopify" | "opencart" | "generic";
  sitemapUrl: string;
  host: string;
  detectedPaths: string[];
}) {
  const allow: string[] = ["/"];
  const disallow: string[] = [];

  if (platform === "wordpress") {
    allow.push("/wp-admin/admin-ajax.php");
    disallow.push("/wp-admin/", "/wp-includes/", "/cgi-bin/", "/?s=");
  }

  if (platform === "shopify") {
    disallow.push("/cart", "/checkout", "/account", "/search");
  }

  if (platform === "opencart") {
    disallow.push("/cart", "/checkout", "/account", "/search", "/admin/");
  }

  if (platform === "generic") {
    disallow.push("/admin/", "/login/", "/dashboard/", "/private/");
  }

  disallow.push(...detectedPaths);

  const finalAllow = unique(allow.map(ensureLeadingSlash));
  const finalDisallow = unique(disallow.map(ensureLeadingSlash));

  const lines: string[] = [];
  lines.push("User-agent: *");

  finalAllow.forEach((item) => lines.push(`Allow: ${item}`));
  finalDisallow.forEach((item) => lines.push(`Disallow: ${item}`));

  if (host) {
    lines.push("");
    lines.push(`Host: ${host}`);
  }

  if (sitemapUrl) {
    lines.push("");
    lines.push(`Sitemap: ${sitemapUrl}`);
  }

  return lines.join("\n").trim();
}

async function generateRobots(url: string): Promise<DetectionResult> {
  const normalizedBase = normalizeBaseUrl(url);
  const base = new URL(normalizedBase);

  const homepage = await safeFetchText(normalizedBase);
  if (!homepage.ok) {
    throw new Error("Could not fetch the website homepage.");
  }

  const robotsResponse = await safeFetchText(`${normalizedBase}/robots.txt`);
  const existingRobotsFound = robotsResponse.ok;

  let sitemapUrl = "";
  const notes: string[] = [];

  if (robotsResponse.ok) {
    const robotsSitemaps = extractSitemapsFromRobots(robotsResponse.text);
    if (robotsSitemaps.length > 0) {
      sitemapUrl = robotsSitemaps[0];
      notes.push("Existing robots.txt was found and sitemap reference was imported.");
    } else {
      notes.push("Existing robots.txt was found, but no sitemap was declared there.");
    }
  } else {
    notes.push("No existing robots.txt was found, so a fresh one was generated.");
  }

  if (!sitemapUrl) {
    const commonSitemaps = [
      `${normalizedBase}/sitemap.xml`,
      `${normalizedBase}/sitemap_index.xml`,
    ];

    for (const candidate of commonSitemaps) {
      const check = await safeFetchText(candidate);
      if (check.ok && check.text.trim().startsWith("<")) {
        sitemapUrl = candidate;
        notes.push("A sitemap was detected automatically from a common sitemap location.");
        break;
      }
    }
  }

  if (!sitemapUrl) {
    sitemapUrl = `${normalizedBase}/sitemap.xml`;
    notes.push("No sitemap was detected, so a default sitemap URL was suggested.");
  }

  const platform = detectPlatformFromHtml(homepage.text, normalizedBase);
  notes.push(`Detected website type: ${platform}.`);

  const links = extractAnchors(homepage.text);
  const detectedPaths = collectDetectedPaths(links, normalizedBase);

  if (detectedPaths.length > 0) {
    notes.push("Some potentially private or utility paths were detected from internal links.");
  } else {
    notes.push("No sensitive paths were confidently detected from the homepage, so standard rules were used.");
  }

  const robotsTxt = buildRobotsTxt({
    platform,
    sitemapUrl,
    host: base.host,
    detectedPaths,
  });

  return {
    normalizedBase,
    host: base.host,
    platform,
    sitemapUrl,
    robotsTxt,
    detectedPaths,
    notes,
    existingRobotsFound,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;

    if (!body?.url?.trim()) {
      return NextResponse.json(
        { error: "Website URL is required." },
        { status: 400 }
      );
    }

    const result = await generateRobots(body.url);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate robots.txt automatically.",
      },
      { status: 500 }
    );
  }
}