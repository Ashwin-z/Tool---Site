import type { Metadata } from "next";
import Link from "next/link";
import RelatedTools from "@/components/related-tools";
import WordCounterTool from "@/components/word-counter-tool";

export const metadata: Metadata = {
  title: "Word Counter Online Free — Count Words, Characters & Reading Time",
  description:
    "Count words, characters, sentences, and reading time online for free with ToolMint. Real-time stats as you type or paste. No signup, fully browser-based.",
  keywords: [
    "word counter",
    "word counter online",
    "character counter",
    "count words online",
    "sentence counter",
    "reading time calculator",
    "word count tool",
    "free word counter",
  ],
  alternates: { canonical: "/tools/word-counter" },
  openGraph: {
    title: "Word Counter Online Free | ToolMint",
    description:
      "Count words, characters, sentences, and estimate reading time in real time. No signup, browser-based.",
    url: "/tools/word-counter",
  },
};

const steps = [
  { title: "Type or paste text", desc: "Enter your text directly or paste it from any source." },
  { title: "View live stats", desc: "Word, character, sentence, and paragraph counts update in real time." },
  { title: "Check reading time", desc: "See the estimated reading and speaking time for your text." },
  { title: "Copy or clear", desc: "Copy the stats or clear the text to start a new count." },
];

const faqs = [
  {
    q: "How is reading time calculated?",
    a: "Reading time is based on an average of 200–250 words per minute for silent reading. Speaking time uses roughly 130 words per minute.",
  },
  {
    q: "Does it count spaces as characters?",
    a: "Both counts are shown: characters with spaces and characters without spaces, so you have the metric you need.",
  },
  {
    q: "Can I use this for essays and assignments?",
    a: "Yes. Many writers use ToolMint to meet word-count limits for essays, blog posts, social-media captions, and more.",
  },
  {
    q: "Does it work with non-English text?",
    a: "Yes. The counter works with any language and any Unicode characters, including CJK scripts, Cyrillic, Arabic, and more.",
  },
  {
    q: "Is my text stored or sent anywhere?",
    a: "No. All counting runs locally in your browser. Your text is never transmitted to any server.",
  },
];

export default function WordCounterPage() {
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
      <main className="text-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Word Counter Online — Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Count words, characters, sentences, paragraphs, and estimated reading time in real
          time with ToolMint. Type directly or paste text from any source — stats update
          instantly. Runs entirely in your browser.
        </p>

        <div className="mt-8">
          <WordCounterTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Count Words Online
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

        <RelatedTools slug="word-counter" />
      </main>
    </>
  );
}