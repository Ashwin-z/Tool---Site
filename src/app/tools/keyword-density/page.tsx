import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import KeywordDensityTool from "@/components/keyword-density-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Keyword Density Checker – Analyze Keyword Frequency in Any Text Free",
  description:
    "Check keyword density and frequency in any text. Analyze single keywords, bigrams, and trigrams with stop word filter. Detect over-optimization and thin content before publishing. Free, browser-side.",
  keywords: [
    "keyword density checker free",
    "how to check keyword density in article",
    "keyword frequency analyzer online",
    "keyword density seo tool",
    "check keyword stuffing online",
    "bigram trigram frequency checker",
    "content keyword analysis tool",
    "keyword density calculator for seo",
  ],
  alternates: { canonical: "/tools/keyword-density" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Keyword Density Checker – Unigrams, Bigrams & Trigrams | ToolMint",
    description:
      "Check keyword frequency and density % for any text. Analyze single words, bigrams, and trigrams with stop word filter. Free, 100% browser-side.",
    url: "/tools/keyword-density",
  },
  twitter: { card: "summary_large_image" },
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
      <WebAppSchema slug="keyword-density" />
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
            { name: "Keyword Density Checker" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Keyword Density Checker – Unigrams, Bigrams & Trigrams
        </h1>

        <ProcessingBadge slug="keyword-density" />
        <ToolAnalytics slug="keyword-density" category="seo" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Paste any text and instantly analyze keyword frequency and density percentages — for
          single keywords, two-word bigrams, or three-word trigrams. Toggle a built-in stop word
          filter to focus on meaningful content keywords. All processing is 100% client-side.
        </p>

        <div className="mt-8">
          <KeywordDensityTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What This Keyword Checker Analyzes
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Keyword Stuffing vs. Natural Usage: What Google Actually Penalizes
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Google&apos;s documentation explicitly warns against &quot;stuffing a page with keywords&quot; as a
              form of spam. But the threshold for what counts as stuffing is intentionally
              not defined by a fixed percentage — it is evaluated in context. A 3% density for a
              primary keyword in a 500-word article about that exact topic may be completely
              natural. The same 3% in an article ostensibly about something else is obviously
              forced. The practical signal Google evaluates is whether keyword repetition adds
              value or degrades the reading experience. Run this checker after writing, not before
              — write for the reader first and then check the density to catch any accidental
              over-repetition. If you find a keyword appearing 5–6 times in a short article,
              replace some instances with synonyms, use pronouns, or restructure the sentence.
              Natural variation in language is itself a positive quality signal.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How Bigram and Trigram Analysis Helps Long-Tail SEO
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Single-keyword analysis shows word frequency, but most search queries are multi-word
              phrases. Analyzing bigrams (two-word pairs) and trigrams (three-word groups) reveals
              the actual topics your content covers — which maps directly to the long-tail queries
              it can rank for. For example, an article about home loans might rank for individual
              words like &quot;loan&quot; or &quot;interest&quot; at low density, but if the bigrams &quot;home loan&quot;,
              &quot;EMI calculation&quot;, and &quot;interest rate&quot; each appear 3–4 times naturally, the content
              is well-positioned for those specific search phrases. Switch the checker to bigram
              mode after finishing a draft to see whether your most important two-word target
              phrases appear with enough frequency. If a key phrase appears only once in a 1,000-word
              article, work it in naturally two or three more times in different sections. Trigram
              analysis is most useful for checking whether highly specific long-tail phrases
              (&quot;home loan interest rate 2025&quot;) are present in your content — these phrases often
              have very low competition and can be the primary ranking driver for a new site.
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

        <RelatedTools slug="keyword-density" />
      </main>
    </>
  );
}
