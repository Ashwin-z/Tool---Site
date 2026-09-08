import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import OgTagGeneratorTool from "@/components/og-tag-generator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "OG Tag Generator – Open Graph & Twitter Card Tags with Live Preview",
  description:
    "Generate Open Graph and Twitter Card meta tags with a live social media preview. See how your link looks on Facebook, LinkedIn, and Twitter before publishing. Free, instant.",
  keywords: [
    "og tag generator free",
    "open graph tag generator online",
    "twitter card generator free",
    "how to add open graph tags to website",
    "facebook link preview image size",
    "social media meta tags generator",
    "og image size for social sharing",
    "open graph preview tool",
  ],
  alternates: { canonical: "/tools/og-tag-generator" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "OG Tag Generator – Open Graph & Twitter Card Tags with Live Preview | ToolMint",
    description:
      "Generate Open Graph and Twitter Card meta tags instantly. Live social preview card, 6 OG types, 4 Twitter card types. Copy-ready HTML output.",
    url: "/tools/og-tag-generator",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "Open Graph Tag Generator", desc: "Generates og:title, og:description, og:url, og:image, og:type, og:locale, and og:site_name with 6 content type options." },
  { title: "Twitter Card Generator", desc: "Generates twitter:card, twitter:title, twitter:description, twitter:image, and twitter:site with 4 card type options." },
  { title: "Live Social Preview", desc: "Real-time Facebook/LinkedIn-style card preview showing your OG image at 1.91:1 ratio, hostname, title, and description." },
  { title: "Standard Meta Description", desc: "Also outputs a standard <meta name='description'> tag alongside OG and Twitter tags in one copy-ready block." },
];

const steps = [
  { title: "Enter page details", desc: "Fill in page title, description, URL, image URL, and site name. Fields update the live preview and generated tags in real time." },
  { title: "Choose OG type & Twitter card", desc: "Select the right OG type (website, article, product…) and Twitter card style (summary, summary_large_image…) for your content." },
  { title: "Check the social preview", desc: "The live preview card shows how your link will look on Facebook, LinkedIn, and similar platforms before you publish." },
  { title: "Copy the generated tags", desc: "Click Copy to grab all generated meta tags as HTML-ready code and paste them into your page's <head> section." },
];

const faqs = [
  {
    q: "What are Open Graph tags?",
    a: "Open Graph (OG) tags are meta tags placed in your page's <head> that control how your content appears when shared on social platforms like Facebook, LinkedIn, Slack, and WhatsApp — defining the title, description, image, and type shown in the preview card.",
  },
  {
    q: "What OG image size should I use?",
    a: "The recommended OG image size is 1200 × 630 pixels (1.91:1 aspect ratio). This gives the best display quality across Facebook, LinkedIn, and Twitter large-image cards. Minimum is 600 × 315px.",
  },
  {
    q: "What is the difference between Twitter card types?",
    a: "summary shows a small thumbnail beside your title and description. summary_large_image shows a large banner image above the text. app is for mobile app promotion. player embeds a media player. For most articles and pages, summary_large_image delivers the best visual impact.",
  },
  {
    q: "Do I need both OG tags and Twitter Card tags?",
    a: "Yes. Twitter has its own tag set (twitter:*) and will not fall back to OG tags for all fields. This generator outputs both sets plus the standard meta description in a single code block.",
  },
  {
    q: "Will these tags work on Facebook, LinkedIn, and Slack?",
    a: "Yes. Facebook, LinkedIn, Slack, Discord, WhatsApp, and most other platforms read og:* tags to generate link previews. Twitter reads twitter:* tags first and falls back to og:* where its own tags are absent.",
  },
];

export default function OgTagGeneratorPage() {
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
      <WebAppSchema slug="og-tag-generator" />
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
            { name: "OG Tag Generator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          OG Tag Generator – Open Graph & Twitter Card Tags with Live Preview
        </h1>

        <ProcessingBadge slug="og-tag-generator" />
        <ToolAnalytics slug="og-tag-generator" category="seo" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Generate Open Graph and Twitter Card meta tags with a live social media preview — see
          exactly how your link will appear on Facebook, LinkedIn, Slack, and Twitter before you
          publish. Supports 6 OG content types, 4 Twitter card styles, og:locale, og:site_name,
          and outputs copy-ready HTML in one block.
        </p>

        <div className="mt-8">
          <OgTagGeneratorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What This OG Tag Generator Creates
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
            How to Generate Open Graph Tags
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
              Why OG Image Is the Most Important Social Tag
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              When your link is shared on Facebook, LinkedIn, or Slack, the OG image is the single
              largest visual element in the preview card. Links with a compelling, correctly sized
              OG image consistently receive higher engagement than links with missing or poorly
              sized images — because the image is what catches the eye before the title is read.
              The recommended size is 1200×630px (1.91:1 ratio). Images smaller than 600×315px
              may be shown as a small thumbnail beside the text rather than a large card.
              Square images work better for Twitter&apos;s summary card format. If your CMS generates
              OG images automatically (like WordPress with Yoast or Next.js with next/og), verify
              that the generated image URL is actually accessible and that the image dimensions are
              correct — a common issue is the og:image URL pointing to a path that returns a 404
              or a redirect. You can test your OG tags using Facebook&apos;s Sharing Debugger or
              LinkedIn&apos;s Post Inspector after publishing.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Where to Place Meta Tags in Your Page (and Common Mistakes)
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              All meta tags — including OG tags and Twitter Card tags — must be placed inside the
              <code className="rounded bg-white/10 px-1 text-xs">&lt;head&gt;</code> element of your HTML page, before the
              closing <code className="rounded bg-white/10 px-1 text-xs">&lt;/head&gt;</code> tag. In Next.js, use the
              built-in <code className="rounded bg-white/10 px-1 text-xs">Metadata</code> API (or the legacy
              <code className="rounded bg-white/10 px-1 text-xs">Head</code> component) to inject tags server-side so
              crawlers and social scrapers see them. In WordPress, use a plugin like Yoast SEO or
              Rank Math that outputs OG tags automatically per post. The most common mistakes:
              placing OG tags in the <code className="rounded bg-white/10 px-1 text-xs">&lt;body&gt;</code> (not read by social
              crawlers), using a relative URL for og:image instead of a full absolute URL with
              https://, forgetting twitter:card (without it Twitter ignores all other twitter:*
              tags), and setting og:type incorrectly — most pages should be &quot;website&quot; unless
              they are articles, products, or profiles. Copy the complete output from this
              generator and paste it directly inside your page&apos;s
              <code className="rounded bg-white/10 px-1 text-xs">&lt;head&gt;</code> — no manual rewriting needed.
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

        <RelatedTools slug="og-tag-generator" />
      </main>
    </>
  );
}
