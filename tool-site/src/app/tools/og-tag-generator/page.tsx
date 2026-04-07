import type { Metadata } from "next";
import Link from "next/link";
import OgTagGeneratorTool from "@/components/og-tag-generator-tool";

export const metadata: Metadata = {
  title: "OG Tag Generator — Open Graph & Twitter Card Meta Tags with Live Preview | ToolMint",
  description:
    "Generate Open Graph and Twitter Card meta tags with a live social media preview. Supports 6 OG types, 4 Twitter card types, og:locale, og:site_name. Copy-ready HTML output. Free.",
  keywords: [
    "og tag generator",
    "open graph generator",
    "twitter card generator",
    "open graph meta tags",
    "og tags generator online",
    "facebook open graph",
    "social media meta tags",
    "og:image generator",
    "twitter card meta tags",
    "open graph preview",
    "meta tag generator seo",
    "social preview generator",
  ],
  alternates: { canonical: "/tools/og-tag-generator" },
  openGraph: {
    title: "OG Tag Generator — Open Graph & Twitter Card Tags with Live Preview | ToolMint",
    description:
      "Generate Open Graph and Twitter Card meta tags instantly. Live social preview card, 6 OG types, 4 Twitter card types. Copy-ready HTML output.",
    url: "/tools/og-tag-generator",
  },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="seo-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          OG Tag Generator — Open Graph &amp; Twitter Card Tags
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Generate Open Graph and Twitter Card meta tags with a live social media preview — see exactly how your
          link will appear on Facebook, LinkedIn, Slack, and Twitter before you publish. Supports 6 OG content types,
          4 Twitter card styles, og:locale, og:site_name, and outputs copy-ready HTML in one block.
        </p>

        <div className="mt-8">
          <OgTagGeneratorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included OG Tag Tools
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
