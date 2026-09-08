import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import SitemapGeneratorTool from "@/components/sitemap-generator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "XML Sitemap Generator – Create & Submit a Sitemap for Any Website Free",
  description:
    "Generate a valid XML sitemap for any website. Auto-crawl up to 1000 pages, or paste URLs manually. Set changefreq, priority, and lastmod — download sitemap.xml in seconds. Free, no signup.",
  keywords: [
    "xml sitemap generator free",
    "how to create xml sitemap for website",
    "sitemap generator for static website",
    "sitemap.xml generator online",
    "how to submit sitemap to google",
    "website sitemap creator free",
    "generate sitemap without plugin",
    "sitemap generator html website",
  ],
  alternates: { canonical: "/tools/sitemap-generator" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "XML Sitemap Generator – Auto-Crawl & Download sitemap.xml | ToolMint",
    description:
      "Auto-crawl websites up to 1000 pages or paste URLs manually. Set changefreq, priority, lastmod — download sitemap.xml instantly.",
    url: "/tools/sitemap-generator",
  },
  twitter: { card: "summary_large_image" },
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
      <WebAppSchema slug="sitemap-generator" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="seo-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "SEO Tools", href: "/tools/seo-tools" },
            { name: "Sitemap Generator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          XML Sitemap Generator – Auto Crawl or Manual URL Entry
        </h1>

        <ProcessingBadge slug="sitemap-generator" />
        <ToolAnalytics slug="sitemap-generator" category="seo" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Generate a valid XML sitemap for any website in seconds. Auto-crawl up to 1000 pages to
          discover all internal URLs automatically, or paste your own list and configure
          changefreq, priority, and lastmod. Download a submission-ready sitemap.xml file — no
          account needed.
        </p>

        <div className="mt-8">
          <SitemapGeneratorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What This Sitemap Generator Creates
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
            How to Generate and Submit an XML Sitemap
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Why New Websites Need a Sitemap More Than Established Ones
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Google discovers pages primarily through links — both internal links within your site
              and external backlinks from other sites. For an established site with strong link
              profiles, Googlebot finds most pages naturally during crawls. For a new site with
              few or no backlinks, many pages may never be discovered this way. A sitemap solves
              this directly: it is a direct instruction to Google listing every URL you want
              indexed. After submitting your sitemap to Google Search Console, you can see in the
              Coverage report exactly which pages were indexed, which were excluded, and why.
              This feedback loop is especially important for a new site where ranking depends on
              getting every page into the index first. Without a sitemap, deep pages — those more
              than 2–3 clicks from the homepage — may take months to be crawled or never appear
              at all.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              What to Put in a Sitemap (and What to Leave Out)
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              A sitemap should list pages you want indexed and that provide value to users.
              Include: all content pages (articles, tool pages, product pages, category pages),
              the homepage, and important landing pages. Do not include: pages blocked by
              robots.txt (a conflict that confuses crawlers), noindex pages (by definition not
              wanted in the index), duplicate content pages, URL parameters that create
              duplicate versions of the same content (e.g. ?sort=price), and pagination pages
              beyond the first few (use rel=&quot;canonical&quot; on those instead). The most common
              mistake is including every URL the site generates, including admin URLs, filtered
              views, and search result pages — this wastes crawl budget and can dilute indexing
              priority for important content. Keep your sitemap lean: only the pages you
              genuinely want Google to find and rank.
            </p>
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

        <RelatedTools slug="sitemap-generator" />
      </main>
    </>
  );
}
