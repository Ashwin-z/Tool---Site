import type { Metadata } from "next";
import Link from "next/link";
import KeywordDensityTool from "@/components/keyword-density-tool";

export const metadata: Metadata = {
  title: "Keyword Density Checker — Unigrams, Bigrams & Trigrams | ToolMint",
  description:
    "Analyze keyword frequency and density percentages for any text. Check single keywords, 2-word phrases (bigrams), and 3-word phrases (trigrams). Stop word filter included. Free, browser-side.",
  keywords: [
    "keyword density checker",
    "keyword frequency analyzer",
    "keyword density tool",
    "keyword density seo",
    "check keyword density",
    "keyword density calculator",
    "n-gram analyzer",
    "bigram frequency",
    "trigram analysis",
    "stop word filter",
    "keyword density online free",
    "content seo analyzer",
  ],
  alternates: { canonical: "/tools/keyword-density" },
  openGraph: {
    title: "Keyword Density Checker — Unigrams, Bigrams & Trigrams | ToolMint",
    description:
      "Check keyword frequency and density % for any text. Analyze single words, bigrams, and trigrams with stop word filter. Free, 100% browser-side.",
    url: "/tools/keyword-density",
  },
};

const includedTools = [
  { title: "Keyword Frequency Analyzer", desc: "See every keyword ranked by count and density % with a relative bar chart for instant visual comparison." },
  { title: "N-gram Mode Selector", desc: "Switch between single keywords (unigrams), 2-word phrases (bigrams), and 3-word phrases (trigrams) with one click." },
  { title: "Stop Word Filter", desc: "Toggle a built-in 100+ English stop word list to hide filler words and focus on meaningful content keywords." },
  { title: "Text Statistics", desc: "Instant totals for word count, unique word count, character count, and sentence count alongside the keyword table." },
];

const steps = [
  { title: "Paste your content", desc: "Drop your article, blog post, or any text into the input area. Word, character, and sentence counts update immediately." },
  { title: "Choose N-gram mode", desc: "Select 1 for single keywords, 2 for two-word phrases, or 3 for three-word phrases depending on what you want to analyze." },
  { title: "Filter stop words", desc: "Toggle 'Include stop words' off to remove common filler words and focus on your content's meaningful keywords." },
  { title: "Review density results", desc: "Read the ranked keyword table showing count and density %. Aim for a natural spread — over-stuffing a term above 3–4% can flag thin content." },
];

const faqs = [
  {
    q: "What is keyword density and why does it matter for SEO?",
    a: "Keyword density is the percentage of times a keyword appears relative to the total word count. While Google no longer uses a strict density formula, analyzing density helps you spot over-optimized (keyword-stuffed) content and ensure your primary topic is reflected naturally throughout the text.",
  },
  {
    q: "What is the ideal keyword density?",
    a: "There is no fixed ideal, but a natural-sounding article typically keeps any single keyword below 2–3% density. If a term appears at 5%+ it may feel repetitive to readers and could be flagged as over-optimization by search engines.",
  },
  {
    q: "What are bigrams and trigrams?",
    a: "A bigram is a two-word phrase (e.g. 'keyword density'), and a trigram is a three-word phrase (e.g. 'keyword density checker'). Analyzing these reveals which multi-word topics dominate your content — important for long-tail SEO.",
  },
  {
    q: "What are stop words?",
    a: "Stop words are common English words like 'the', 'is', 'and', 'of' that carry little semantic meaning. Filtering them out reveals the substantive keywords in your text. Toggle the stop word filter off if you want to see them included.",
  },
  {
    q: "Is my content sent to a server?",
    a: "No. All keyword analysis runs in your browser. Your text never leaves your device.",
  },
];

export default function KeywordDensityPage() {
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
          Keyword Density Checker — Unigrams, Bigrams &amp; Trigrams
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Paste any text and instantly analyze keyword frequency and density percentages — for single keywords,
          two-word bigrams, or three-word trigrams. Toggle a built-in stop word filter to focus on meaningful content
          keywords. All processing is 100% client-side.
        </p>

        <div className="mt-8">
          <KeywordDensityTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Keyword Analysis Tools
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
            How to Check Keyword Density
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
