import type { Metadata } from "next";
import Link from "next/link";
import SitemapGeneratorTool from "@/components/sitemap-generator-tool";

export const metadata: Metadata = {
  title: "Sitemap Generator — Free XML Sitemap Builder",
  description:
    "Free Sitemap Generator tool. Create a valid XML sitemap from your website URLs, set lastmod, changefreq, and priority, then copy or download sitemap.xml instantly.",
};

export default function SitemapGeneratorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Sitemap Generator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Generate a clean XML sitemap for your website in seconds. Paste page URLs or relative paths,
        apply default SEO settings like last modified date, change frequency, and priority,
        then copy or download a ready-to-submit sitemap.xml file.
      </p>

      <div className="mt-8">
        <SitemapGeneratorTool />
      </div>
    </main>
  );
}
