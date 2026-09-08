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

const EXCLUDE_TOOLS = new Set<string>(unavailableToolSlugs);

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

  const toolEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date("2026-05-15"),
    changeFrequency: (route === "" || route === "/tools" ? "weekly" : "monthly") as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: route === "" ? 1 : route === "/tools" ? 0.9 : CATEGORY_PAGES.has(route.replace("/tools/", "")) ? 0.85 : 0.9,
  }));

  const blogIndexEntry: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date("2026-05-15"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const blogPostEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...toolEntries, ...blogIndexEntry, ...blogPostEntries];
}