import type { Metadata } from "next";
import Link from "next/link";
import SitemapGeneratorTool from "@/components/sitemap-generator-tool";

export const metadata: Metadata = {
  title: "Sitemap Generator — Free XML Sitemap Builder with Auto Website Crawl | ToolMint",
  description:
    "Generate a valid XML sitemap for any website. Auto-crawl up to 1000 pages, or paste URLs manually. Set changefreq, priority, and lastmod — download sitemap.xml in seconds. Free, no signup.",
  keywords: [
    "xml sitemap generator",
    "sitemap generator free",
    "website sitemap generator",
    "generate sitemap online",
    "sitemap.xml generator",
    "xml sitemap builder",
    "sitemap creator",
    "auto crawl sitemap",
    "sitemap generator tool",
    "seo sitemap",
    "google sitemap generator",
    "sitemap xml online",
  ],
  alternates: { canonical: "/tools/sitemap-generator" },
  openGraph: {
    title: "Sitemap Generator — Free XML Sitemap Builder with Auto Crawl | ToolMint",
    description:
      "Auto-crawl websites up to 1000 pages or paste URLs manually. Set changefreq, priority, lastmod — download sitemap.xml instantly.",
    url: "/tools/sitemap-generator",
  },
};

const includedTools = [
  { title: "Auto Website Crawler", desc: "Enter your site URL and crawl up to 1000 pages automatically — the tool discovers and resolves internal links for you." },
  { title: "Manual URL Entry", desc: "Paste a list of URLs or relative paths and generate a sitemap from your own curated list." },
  { title: "XML Sitemap Configurator", desc: "Set default changefreq, priority, and lastmod date. Homepage is automatically assigned priority 1.0." },
  { title: "Sitemap Download", desc: "Copy the generated sitemap.xml to clipboard or download it as a ready-to-upload file." },
];

const steps = [
  { title: "Enter your website URL", desc: "Type your site's base URL and click Auto Generate — the crawler discovers all internal pages for you." },
  { title: "Or paste URLs manually", desc: "Prefer manual control? Paste your own URLs or relative paths into the text area and generate from the list." },
  { title: "Configure SEO settings", desc: "Choose changefreq (daily, weekly, monthly…), default priority, and last-modified date to suit your site's update schedule." },
  { title: "Download sitemap.xml", desc: "Copy the generated XML or download it as sitemap.xml, then upload it to your site root and submit it to Google Search Console." },
];

const faqs = [
  {
    q: "What is an XML sitemap?",
    a: "An XML sitemap is a file that lists all the important pages on your website. It helps search engines like Google discover and crawl your content more efficiently, especially for large or recently launched sites.",
  },
  {
    q: "How many pages can the auto-crawl discover?",
    a: "The crawler can be configured to crawl between 10 and 1000 pages. It follows internal links, deduplicates URLs, and filters out non-page assets like images and scripts.",
  },
  {
    q: "What does changefreq mean in a sitemap?",
    a: "changefreq hints to search engines how often a page's content changes — e.g. daily for a news site, monthly for a product page. It is advisory; search engines may crawl at their own frequency.",
  },
  {
    q: "How do I submit my sitemap to Google?",
    a: "Upload your sitemap.xml to your site root (e.g. https://example.com/sitemap.xml), then go to Google Search Console → Sitemaps and enter the sitemap URL to submit it.",
  },
  {
    q: "Is my website crawled by ToolMint's servers?",
    a: "Yes. The auto-crawl feature sends requests from ToolMint's server to discover your site's pages. Manual URL entry is fully client-side — no requests are made to your site.",
  },
];

export default function SitemapGeneratorPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="seo-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          XML Sitemap Generator — Auto Crawl or Manual URL Entry
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Generate a valid XML sitemap for any website in seconds. Auto-crawl up to 1000 pages to discover all
          internal URLs automatically, or paste your own list and configure changefreq, priority, and lastmod.
          Download a submission-ready sitemap.xml file — no account needed.
        </p>

        <div className="mt-8">
          <SitemapGeneratorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Sitemap Tools
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {includedTools.map((tool) => (
              <div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{tool.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Generate an XML Sitemap
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{i + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((f, i) => (
              <div key={i}>
                <dt className="font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </>
  );
}
