import { readdir } from "node:fs/promises";
import path from "node:path";

import type { MetadataRoute } from "next";
import { unavailableToolSlugs } from "@/lib/tool-availability";
import { blogPosts } from "@/lib/blog-posts";

const BASE_URL = "https://toolmint.tools";

const STATIC_ROUTES = [
  "",
  "/tools",
  "/privacy",
  "/terms",
  "/cookie-policy",
  "/contact",
  "/about",
  "/site-map",
  "/disclaimer",
];

/**
 * Slugs whose page.tsx is only a `redirect()` stub. They 307 rather than 200,
 * so listing them tells Google to crawl URLs that immediately bounce.
 * `jpg-to-pdf` was in the sitemap and redirecting to `image-to-pdf`.
 */
const REDIRECT_STUBS = new Set<string>(["jpg-to-pdf"]);

const EXCLUDE_TOOLS = new Set<string>([...unavailableToolSlugs, ...REDIRECT_STUBS]);

const CATEGORY_PAGES = new Set([
  "pdf-tools",
  "image-tools",
  "text-tools",
  "calculators",
  "developer-tools",
  "seo-tools",
  "converters",
]);

async function getToolRoutes(): Promise<string[]> {
  const toolsDir = path.join(process.cwd(), "src", "app", "tools");
  const entries = await readdir(toolsDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith("[") && !name.startsWith("("))
    .filter((name) => !EXCLUDE_TOOLS.has(name))
    .map((name) => `/tools/${name}`)
    .sort((a, b) => a.localeCompare(b));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [...new Set([...STATIC_ROUTES, ...(await getToolRoutes())])];

  // Build time, not a hardcoded date. Every URL previously claimed
  // 2026-05-15 forever, which tells Google nothing ever changes.
  const lastModified = new Date();

  const toolEntries: MetadataRoute.Sitemap = routes.map((route) => {
    const isHome = route === "";
    const isToolsIndex = route === "/tools";
    const isCategory = CATEGORY_PAGES.has(route.replace("/tools/", ""));

    return {
      url: `${BASE_URL}${route}`,
      lastModified,
      changeFrequency: (isHome || isToolsIndex
        ? "weekly"
        : "monthly") as MetadataRoute.Sitemap[number]["changeFrequency"],
      // Category hubs outrank individual tools: they are the crawl entry
      // points for a whole section. Previously they were 0.85 vs 0.9.
      priority: isHome ? 1 : isToolsIndex ? 0.9 : isCategory ? 0.9 : 0.7,
    };
  });

  const blogIndexEntry: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const blogPostEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...toolEntries, ...blogIndexEntry, ...blogPostEntries];
}