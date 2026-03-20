import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://toolcraft.site";

  const urls = [
    "",
    "/tools",
    "/tools/pdf-compressor",
    "/tools/pdf-merger",
    "/tools/pdf-splitter",
    "/tools/rotate-pdf",
    "/tools/edit-pdf",
    "/tools/add-page-numbers",
    "/tools/add-watermark",
    "/tools/crop-pdf",
    "/tools/image-to-pdf",
    "/tools/word-to-pdf",
    "/tools/powerpoint-to-pdf",
    "/tools/excel-to-pdf",
    "/tools/html-to-pdf",
    "/tools/pdf-to-jpg",
    "/tools/pdf-to-word",
    "/tools/pdf-to-powerpoint",
    "/tools/pdf-to-excel",
    "/tools/pdf-to-pdfa",
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
