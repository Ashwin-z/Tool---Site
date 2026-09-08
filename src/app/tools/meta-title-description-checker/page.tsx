import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import MetaTitleDescriptionCheckerTool from "@/components/meta-title-description-checker-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Meta Title & Description Checker – SERP Snippet Preview & Length Check",
  description:
    "Check meta title and description character count, pixel width, and keyword presence. Get a live Google SERP snippet preview instantly. Free SEO title length checker, no signup.",
  keywords: [
    "meta title length checker",
    "meta description length checker",
    "google title tag character limit",
    "serp snippet preview tool",
    "seo title checker free",
    "how long should meta description be",
    "meta title pixel width checker",
    "google search snippet preview",
  ],
  alternates: { canonical: "/tools/meta-title-description-checker" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Meta Title & Description Checker – SERP Preview & Character Count | ToolMint",
    description:
      "Check title and description length, pixel width, and keyword presence. See a live Google SERP snippet preview instantly.",
    url: "/tools/meta-title-description-checker",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "Meta Title Analyzer", desc: "Character count, word count, estimated pixel width, and keyword presence check — with Too Short / Good / Too Long badge." },
  { title: "Meta Description Analyzer", desc: "Same 4-metric analysis for your meta description: chars, words, pixel width, and keyword detection." },
  { title: "Google SERP Preview", desc: "Live Google-style snippet showing exactly how your title and description will appear in search results, with truncation." },
  { title: "SEO Recommendations", desc: "Auto-generated tips list highlighting any issues with length, keyword placement, or pixel overflow." },
];

const steps = [
  { title: "Enter your title tag", desc: "Type or paste your page title. Character count, word count, and pixel width update instantly." },
  { title: "Enter your meta description", desc: "Add your description and see the same 4 metrics — including whether it falls in the 70–160 char sweet spot." },
  { title: "Add a target keyword", desc: "Enter your primary keyword to check whether it appears in both title and description." },
  { title: "Review the SERP preview", desc: "The live Google-style snippet shows exactly how your title and description look in search results, including truncation." },
];

const faqs = [
  {
    q: "What is the ideal meta title length for SEO?",
    a: "Google typically displays titles up to about 580px wide, which is roughly 50–60 characters for average text. Titles shorter than 30 characters may leave valuable keyword space unused. ToolMint shows both character count and estimated pixel width so you can optimize for both.",
  },
  {
    q: "What is the ideal meta description length?",
    a: "Google shows up to approximately 920px of meta description, which is roughly 70–160 characters. Descriptions shorter than 70 characters are often too thin; longer ones get truncated with an ellipsis in search results.",
  },
  {
    q: "Why does pixel width matter more than character count?",
    a: "Google's SERP truncates based on rendered pixel width, not character count. A title with many wide characters (W, M, @) can overflow at 50 characters, while a title using narrow characters (i, l, 1) may fit at 65. ToolMint estimates pixel width per character for an accurate reading.",
  },
  {
    q: "Does keyword presence in a title affect search rankings?",
    a: "Yes. Having your target keyword in both the title tag and meta description is a strong on-page SEO signal. The keyword check in this tool highlights whether your keyword appears in each field.",
  },
  {
    q: "Is the Google SERP preview accurate?",
    a: "The preview is a close simulation based on Google's known truncation behavior. Google may vary the snippet based on the search query, so treat this as a strong approximation rather than a guaranteed output.",
  },
];

export default function MetaTitleDescriptionCheckerPage() {
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
      <WebAppSchema slug="meta-title-description-checker" />
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
            { name: "Meta Title & Description Checker" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Meta Title & Description Checker – SERP Snippet Preview
        </h1>

        <ProcessingBadge slug="meta-title-description-checker" />
        <ToolAnalytics slug="meta-title-description-checker" category="seo" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Analyze your meta title and description for character count, pixel width, and keyword
          presence. Get a live Google-style SERP snippet preview in real time — know instantly
          whether your snippet is too short, too long, or landing in the ideal range before you
          publish.
        </p>

        <div className="mt-8">
          <MetaTitleDescriptionCheckerTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What This Checker Analyzes
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
            How to Check Your Meta Tags
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
              Why Google Truncates Titles at Pixel Width, Not Character Count
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Google renders title tags using a proportional font — meaning different characters
              take different widths. The letter &quot;W&quot; is about twice as wide as &quot;i&quot;. A title of
              55 characters made up of wide letters may overflow the SERP display area, while a
              60-character title with many narrow letters fits perfectly. Google&apos;s truncation
              limit is approximately 580px of rendered width. This is why character count alone
              is an unreliable guide: &quot;WWW Marketing Management&quot; (22 chars) may take more space
              than &quot;slim minimal toolkit&quot; (20 chars). This checker estimates pixel width using
              character-width averages for the font Google uses, giving you a more accurate
              prediction of how your title will render in search results than any character-count
              limit alone.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How to Write Meta Titles and Descriptions That Get Clicked
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Meta title best practices: put your primary keyword near the start of the title, keep
              it under 580px (roughly 55 chars), include a benefit or differentiator, and avoid
              writing the same title as your H1 — they can differ. Brand name at the end after a
              dash is the standard format: &quot;Primary Keyword – Specific Benefit | BrandName&quot;.
              Meta description best practices: write for humans, not for keyword density. The
              description does not affect rankings — it affects whether a real person clicks.
              Include the primary keyword naturally (Google bolds it when it matches the search
              query), add a clear action or benefit, and stay within 160 characters. Avoid
              generic filler like &quot;Welcome to our page&quot; — tell the searcher exactly what they
              will find and why it is worth clicking. Pages with compelling descriptions
              consistently outperform those with generic or missing descriptions on click-through
              rate, which is a secondary signal Google may use to evaluate quality.
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

        <RelatedTools slug="meta-title-description-checker" />
      </main>
    </>
  );
}
