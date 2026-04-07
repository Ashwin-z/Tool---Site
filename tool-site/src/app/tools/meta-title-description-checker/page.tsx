import type { Metadata } from "next";
import Link from "next/link";
import MetaTitleDescriptionCheckerTool from "@/components/meta-title-description-checker-tool";

export const metadata: Metadata = {
  title: "Meta Title & Description Checker — SERP Snippet Length & Pixel Width | ToolMint",
  description:
    "Check meta title and description length for SEO. Get character counts, estimated pixel width, keyword presence check, and a live Google SERP preview. Free, instant, no signup.",
  keywords: [
    "meta title length checker",
    "meta description length checker",
    "serp snippet preview",
    "title tag checker",
    "meta description checker",
    "seo snippet tool",
    "google snippet preview",
    "pixel width title tag",
    "meta tag length tool",
    "seo title checker free",
    "meta description seo",
    "title tag seo checker",
  ],
  alternates: { canonical: "/tools/meta-title-description-checker" },
  openGraph: {
    title: "Meta Title & Description Checker — SERP Snippet Length & Pixel Width | ToolMint",
    description:
      "Check meta title and description character counts, pixel width, keyword presence, and get a live Google SERP preview. Free SEO snippet tool.",
    url: "/tools/meta-title-description-checker",
  },
};

const includedTools = [
  { title: "Meta Title Analyzer", desc: "Character count, word count, estimated pixel width, and keyword presence check — with Too Short / Good / Too Long badge." },
  { title: "Meta Description Analyzer", desc: "Same 4-metric analysis for your meta description: chars, words, pixel width, and keyword detection." },
  { title: "Google SERP Preview", desc: "Live Google-style snippet showing exactly how your title and description will appear in search results, with truncation." },
  { title: "SEO Recommendations", desc: "Auto-generated tips list highlighting any issues with length, keyword placement, or pixel overflow." },
];

const steps = [
  { title: "Enter your title tag", desc: "Type or paste your page title into the Meta Title field. The character count, word count, and pixel width update instantly." },
  { title: "Enter your meta description", desc: "Add your meta description and see the same 4 metrics — including whether it falls in the 70–160 char sweet spot." },
  { title: "Add a target keyword", desc: "Enter your primary keyword to check whether it appears in both the title and description, a key on-page SEO signal." },
  { title: "Review the SERP preview", desc: "The live Google-style snippet shows exactly how your title and description will look in search results, including truncation points." },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="seo-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Meta Title &amp; Description Checker — SERP Snippet Preview
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Analyze your meta title and description for character count, pixel width, keyword presence, and get a
          live Google-style SERP snippet preview — all in real time. Know instantly whether your snippet is too
          short, too long, or landing in the ideal range before publishing.
        </p>

        <div className="mt-8">
          <MetaTitleDescriptionCheckerTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included SEO Checker Tools
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
