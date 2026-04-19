import type { Metadata } from "next";
import ToolCategoryHub from "@/components/tool-category-hub";

export const metadata: Metadata = {
  title: "Free Online SEO Tools â€” Meta Tags, Sitemap, Robots.txt & Keyword Analysis",
  description:
    "6 free online SEO tools on ToolMint. Generate meta tags and OG tags, check title and description length, create XML sitemaps and robots.txt files, analyse keyword density. No signup required.",
  keywords: [
    "seo tools online",
    "meta tag generator",
    "sitemap generator",
    "robots txt generator",
    "keyword density checker",
    "og tag generator",
    "meta description checker",
  ],
  alternates: { canonical: "/tools/seo-tools" },
  openGraph: {
    title: "Free Online SEO Tools â€” Meta Tags, Sitemaps & More | ToolMint",
    description:
      "6 free browser-based SEO tools. Generate meta tags, create sitemaps, check keyword density and more.",
    url: "/tools/seo-tools",
  },
};

export default function SeoToolsPage() {
  return <ToolCategoryHub categoryId="seo" />;
}
