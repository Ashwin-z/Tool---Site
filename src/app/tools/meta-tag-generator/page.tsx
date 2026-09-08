import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import OgTagGeneratorTool from "@/components/og-tag-generator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Meta Tag Generator – Create SEO, Open Graph & Twitter Card Tags Free",
  description:
    "Generate meta title, description, Open Graph, and Twitter Card tags in one place. Import existing tags from any URL, preview your SERP snippet, and copy ready-to-paste HTML. Free, no signup.",
  keywords: [
    "meta tag generator free",
    "how to add meta tags to website",
    "open graph meta tag generator",
    "twitter card meta tag generator",
    "meta description generator online",
    "seo meta tags generator",
    "import meta tags from url",
    "generate html meta tags",
  ],
  alternates: { canonical: "/tools/meta-tag-generator" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Meta Tag Generator – SEO, Open Graph & Twitter Card Tags | ToolMint",
    description:
      "Generate or import meta tags for SEO and social sharing. Create Open Graph, Twitter Card, title, and description tags with live preview.",
    url: "/tools/meta-tag-generator",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "New page or blog post",
    desc: "Generate the complete meta tag block for a new page — title, description, Open Graph, and Twitter Card — in one place before publishing.",
  },
  {
    title: "Auditing an existing page",
    desc: "Import meta tags from any public URL to see what is currently set, then edit and regenerate clean tags to fix missing or incorrect values.",
  },
  {
    title: "Social sharing optimization",
    desc: "Preview how your page link will look on Facebook, LinkedIn, and Twitter before publishing — and fix OG image, title, or description issues.",
  },
];

const steps = [
  { title: "Enter page details", desc: "Fill in title, description, URL, image URL, and site name." },
  { title: "Choose content type", desc: "Select OG type (website, article, product) and Twitter card style." },
  { title: "Preview the social card", desc: "Check the live preview to see how your link looks on social platforms." },
  { title: "Copy the HTML", desc: "Click Copy to get all meta tags as ready-to-paste HTML for your page's <head>." },
];

const faqs = [
  {
    q: "What meta tags does this generator create?",
    a: "The generator creates the standard meta title tag, meta description, Open Graph tags (og:title, og:description, og:url, og:image, og:type, og:locale, og:site_name), and Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image, twitter:site) — all in one copy-ready HTML block.",
  },
  {
    q: "Do meta keywords still matter for SEO?",
    a: "No. Google stopped using meta keywords as a ranking signal in 2009, and Bing followed. The tags that matter for search visibility are meta title (the most important on-page SEO element) and meta description (affects click-through rate in search results, not rankings directly).",
  },
  {
    q: "What is the ideal meta title length?",
    a: "Google typically shows titles up to about 580px wide — roughly 50–60 characters for average text. Titles under 30 characters miss keyword opportunity; titles over 60 characters get truncated with an ellipsis in search results.",
  },
  {
    q: "What is the ideal meta description length?",
    a: "Google shows approximately 70–160 characters of meta description. Shorter descriptions are too thin; longer ones get cut off. Aim for 130–155 characters and include your primary keyword naturally.",
  },
  {
    q: "Can I import meta tags from an existing page?",
    a: "Yes. Enter any public URL and the tool fetches and parses the existing meta tags from that page, populating the form fields so you can review, edit, and regenerate them.",
  },
];

export default function MetaTagGeneratorPage() {
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
      <WebAppSchema slug="meta-tag-generator" />
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
            { name: "Meta Tag Generator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Meta Tag Generator – Create SEO, Open Graph & Twitter Card Tags
        </h1>

        <ProcessingBadge slug="meta-tag-generator" />
        <ToolAnalytics slug="meta-tag-generator" category="seo" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Generate the complete meta tag block for any page — SEO title, meta description, Open Graph,
          and Twitter Card tags — in one place. Import existing tags from any URL to audit and fix
          them, or build from scratch and copy ready-to-paste HTML.
        </p>

        <div className="mt-8">
          <OgTagGeneratorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Use a Meta Tag Generator
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (
              <article key={item.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Generate Meta Tags
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
              Meta Title and Description: The Two Tags That Actually Affect Rankings
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Of all the meta tags available, only two have a direct and well-documented effect on
              search performance. The meta title (the <code className="rounded bg-white/10 px-1 text-xs">&lt;title&gt;</code> tag,
              not og:title) is the single most important on-page SEO element. Google uses it as a
              primary signal for understanding what a page is about and displays it as the blue
              clickable link in search results. Including your target keyword in the title tag —
              ideally near the front — remains one of the most reliable on-page ranking tactics.
              The meta description does not directly affect rankings but strongly affects
              click-through rate: a well-written description that previews the page&apos;s value and
              matches search intent will earn more clicks than a generic or empty one. Google
              sometimes rewrites descriptions, but it uses your tag as the default. Write for the
              human reading the snippet, not for the crawler.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Open Graph Tags: Why Social Sharing Requires Separate Tags
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Open Graph (OG) tags are a separate layer from SEO meta tags. They control what
              appears when someone shares your link on Facebook, LinkedIn, Slack, WhatsApp, or
              Discord. Without OG tags, social platforms guess at your title, description, and image
              — often with poor results. The most impactful OG tag is <code className="rounded bg-white/10 px-1 text-xs">og:image</code>:
              a page with a 1200×630px OG image generates significantly higher engagement on social
              shares than one with a small or missing image. The recommended image ratio is 1.91:1.
              Twitter uses its own <code className="rounded bg-white/10 px-1 text-xs">twitter:*</code> tags
              and does not fully fall back to OG tags for all fields — which is why both sets are
              needed. This generator outputs the complete set in one block so you can paste all of
              them at once without having to manually write each tag.
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

        <RelatedTools slug="meta-tag-generator" />
      </main>
    </>
  );
}
