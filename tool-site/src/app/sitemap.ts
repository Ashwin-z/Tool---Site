import { readdir } from "node:fs/promises";
import path from "node:path";

import type { MetadataRoute } from "next";

const BASE_URL = "https://toolmint.com";

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

async function getToolRoutes(): Promise<string[]> {
  const toolsDir = path.join(process.cwd(), "src", "app", "tools");
  const entries = await readdir(toolsDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith("[") && !name.startsWith("("))
    .map((name) => `/tools/${name}`)
    .sort((a, b) => a.localeCompare(b));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [...new Set([...STATIC_ROUTES, ...(await getToolRoutes())])];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : route === "/tools" ? 0.9 : 0.7,
  }));
}
