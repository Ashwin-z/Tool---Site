import { readdir } from "node:fs/promises";
import path from "node:path";

import type { MetadataRoute } from "next";

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

/** Tools that are placeholders / coming-soon — keep out of sitemap until live */
const EXCLUDE_TOOLS = new Set([
  "ai-content-detector",
  "cash-receipt-generator",
  "credit-note-generator",
  "delivery-note-generator",
  "estimate-generator",
  "invoice-generator",
  "plagiarism-checker",
  "proforma-invoice-generator",
  "purchase-order-generator",
  "quotation-generator",
  "receipt-generator",
  "sales-receipt-generator",
  "tax-invoice-generator",
]);

/** Category landing pages — higher sitemap priority */
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

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : route === "/tools" ? 0.9 : CATEGORY_PAGES.has(route.replace("/tools/", "")) ? 0.85 : 0.7,
  }));
}
