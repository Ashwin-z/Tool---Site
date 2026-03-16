import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://toolcraft.site";

  const urls = [
    "",
    "/tools",
    "/tools/word-counter",
    "/privacy",
    "/terms",
    "/contact",
    "/site-map",
  ];

  return urls.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
