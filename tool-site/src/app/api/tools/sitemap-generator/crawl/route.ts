import { NextResponse } from "next/server";

type CrawlRequest = {
  url?: string;
  includeHomePage?: boolean;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  maxPages?: number;
};

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
};

const SKIPPED_PROTOCOLS = ["mailto:", "tel:", "javascript:", "data:", "#"];
const SKIPPED_EXTENSIONS = [
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico", ".bmp", ".tiff",
  ".pdf", ".zip", ".rar", ".7z", ".gz", ".mp4", ".mp3", ".wav", ".avi", ".mov",
  ".wmv", ".webm", ".css", ".js", ".json", ".xml", ".txt", ".woff", ".woff2", ".ttf",
  ".eot", ".otf", ".csv", ".xlsx", ".doc", ".docx", ".ppt", ".pptx",
];

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
  return url.origin;
}

function normalizePageUrl(rawUrl: string, origin: string) {
  try {
    const url = new URL(rawUrl, origin);

    if (!/^https?:$/i.test(url.protocol)) return null;
    if (url.origin !== origin) return null;
    if (SKIPPED_PROTOCOLS.some((prefix) => rawUrl.startsWith(prefix))) return null;

    url.hash = "";
    const isHomepage = url.pathname === "/";
    url.pathname = isHomepage ? "/" : url.pathname.replace(/\/+$/, "");

    const pathnameLower = url.pathname.toLowerCase();
    if (SKIPPED_EXTENSIONS.some((ext) => pathnameLower.endsWith(ext))) return null;
    if (pathnameLower.includes("/wp-json/") || pathnameLower.startsWith("/cdn-cgi/")) return null;

    return url.toString();
  } catch {
    return null;
  }
}

function extractLinks(html: string) {
  const links = new Set<string>();
  const anchorRegex = /<a\b[^>]*?href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1] ?? match[2] ?? match[3] ?? "";
    if (href) links.add(href.trim());
  }

  return Array.from(links);
}

function extractXmlLocs(xml: string) {
  const urls = new Set<string>();
  const locRegex = /<loc>(.*?)<\/loc>/gi;
  let match: RegExpExecArray | null;

  while ((match = locRegex.exec(xml)) !== null) {
    const value = match[1]?.trim();
    if (value) urls.add(value);
  }

  return Array.from(urls);
}

function extractSitemapsFromRobots(robotsText: string) {
  return robotsText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^sitemap:/i.test(line))
    .map((line) => line.replace(/^sitemap:\s*/i, "").trim())
    .filter(Boolean);
}

function buildSitemapXml(entries: SitemapEntry[]) {
  const escapeXml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const body = entries
    .map((entry) => {
      const parts = ["  <url>", `    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod) parts.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      if (entry.priority) parts.push(`    <priority>${entry.priority}</priority>`);
      parts.push("  </url>");
      return parts.join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 Sitemap Generator Bot",
      accept: "text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8",
    },
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }

  const text = await response.text();
  return { text, response };
}

async function tryDiscoverSeedUrls(origin: string) {
  const discovered = new Set<string>();
  const candidates = new Set<string>([
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/post-sitemap.xml`,
    `${origin}/page-sitemap.xml`,
  ]);

  try {
    const robots = await fetchText(`${origin}/robots.txt`);
    for (const sitemapUrl of extractSitemapsFromRobots(robots.text)) {
      candidates.add(sitemapUrl);
    }
  } catch {}

  for (const sitemapUrl of candidates) {
    try {
      const { text } = await fetchText(sitemapUrl);
      const xmlUrls = extractXmlLocs(text);
      for (const url of xmlUrls) {
        const normalized = normalizePageUrl(url, origin);
        if (normalized) discovered.add(normalized);
      }
    } catch {}
  }

  return Array.from(discovered);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CrawlRequest;
    if (!body?.url) {
      return NextResponse.json({ error: "Website URL is required." }, { status: 400 });
    }

    const origin = normalizeBaseUrl(body.url);
    const includeHomePage = body.includeHomePage ?? true;
    const maxPages = Math.min(Math.max(body.maxPages ?? 250, 10), 1000);

    const queue: string[] = [];
    const visited = new Set<string>();
    const discovered = new Set<string>();
    const skipped = new Set<string>();
    const errors: string[] = [];

    if (includeHomePage) {
      queue.push(origin);
      discovered.add(origin);
    }

    const seedUrls = await tryDiscoverSeedUrls(origin);
    for (const seed of seedUrls) {
      if (!discovered.has(seed)) {
        queue.push(seed);
        discovered.add(seed);
      }
    }

    if (queue.length === 0) {
      queue.push(origin);
      discovered.add(origin);
    }

    while (queue.length > 0 && visited.size < maxPages) {
      const currentUrl = queue.shift();
      if (!currentUrl || visited.has(currentUrl)) continue;

      visited.add(currentUrl);

      try {
        const { text, response } = await fetchText(currentUrl);
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
          continue;
        }

        for (const href of extractLinks(text)) {
          const normalized = normalizePageUrl(href, origin);
          if (!normalized) {
            skipped.add(href);
            continue;
          }

          if (!discovered.has(normalized) && discovered.size < maxPages) {
            discovered.add(normalized);
            queue.push(normalized);
          }
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : `Failed to crawl ${currentUrl}`);
      }
    }

    const lastmod = body.lastmod?.trim() || undefined;
    const changefreq = body.changefreq?.trim() || undefined;
    const priority = body.priority?.trim() || undefined;

    const entries: SitemapEntry[] = Array.from(discovered)
      .slice(0, maxPages)
      .sort((a, b) => a.localeCompare(b))
      .map((loc, index) => ({
        loc,
        lastmod,
        changefreq,
        priority: index === 0 && loc === origin ? "1.0" : priority,
      }));

    return NextResponse.json({
      normalizedBase: origin,
      entries,
      invalidEntries: [],
      skippedLinks: Array.from(skipped).slice(0, 50),
      crawledCount: visited.size,
      discoveredCount: discovered.size,
      xml: buildSitemapXml(entries),
      notes: [
        `Crawled up to ${visited.size} page${visited.size === 1 ? "" : "s"} on the same domain.`,
        seedUrls.length > 0 ? `Also imported ${seedUrls.length} URL${seedUrls.length === 1 ? "" : "s"} from existing sitemap references.` : "Started crawling from the homepage.",
      ],
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate sitemap." },
      { status: 500 },
    );
  }
}