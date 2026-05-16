import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import WordCounterTool from "@/components/word-counter-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Free Online Word Counter – Count Words, Characters & Reading Time",
  description:
    "Count words, characters, sentences, paragraphs, and reading time online for free. Real-time stats as you type or paste. Works for essays, blog posts, and scripts. No signup required.",
  keywords: [
    "word counter online free",
    "word count for essays",
    "character counter online",
    "count words in text",
    "reading time calculator",
    "check word count online",
    "word counter for twitter",
    "sentence counter tool",
    "word count checker",
    "how many words in my text",
  ],
  alternates: { canonical: "/tools/word-counter" },
  openGraph: {
    title: "Free Online Word Counter – Count Words, Characters & Reading Time | ToolMint",
    description:
      "Real-time word, character, sentence, and reading time counts. Paste any text and see stats instantly. No signup.",
    url: "/tools/word-counter",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Essays and academic writing",
    desc: "Track assignment word limits, paragraph length, and reading time before submitting essays or research drafts.",
  },
  {
    title: "Blog posts and SEO content",
    desc: "Check article length when drafting outlines, meta descriptions, or long-form posts against target word counts.",
  },
  {
    title: "Scripts and presentations",
    desc: "Estimate speaking time for YouTube scripts, presentations, and speeches using the per-word speaking-pace calculation.",
  },
];

const steps = [
  { title: "Type or paste text", desc: "Enter your text directly or paste it from any source." },
  { title: "View live stats", desc: "Word, character, sentence, and paragraph counts update in real time." },
  { title: "Check reading time", desc: "See the estimated reading and speaking time for your text." },
  { title: "Copy or clear", desc: "Copy the stats or clear the text to start a new count." },
];

const faqs = [
  {
    q: "How is reading time calculated?",
    a: "Reading time is based on an average of about 200 to 250 words per minute for silent reading. Speaking time uses roughly 130 words per minute.",
  },
  {
    q: "Does it count spaces as characters?",
    a: "Both counts are shown: characters with spaces and characters without spaces, so you can use the metric that matches your task.",
  },
  {
    q: "Can I use this for essays and assignments?",
    a: "Yes. Paste or type your essay draft and see the live word count against your target. Works for school assignments, blog posts, social captions, and any other written work with a length requirement.",
  },
  {
    q: "Does it work with non-English text?",
    a: "Yes. The counter works with any language and Unicode characters, including Arabic, Cyrillic, and CJK scripts.",
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
      <WebAppSchema slug="word-counter" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="text-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Text Tools", href: "/tools/text-tools" },
            { name: "Word Counter" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Free Online Word Counter – Count Words, Characters & Reading Time
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Count words, characters, sentences, paragraphs, and estimated reading time in real
          time with ToolMint. Type directly or paste text from any source and the stats update
          instantly in your browser — no signup, no upload, completely free.
        </p>

        <div className="mt-8">
          <WordCounterTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Common Word Count Tasks
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Word Count Requirements by Writing Type
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Different writing tasks have different expected lengths, and knowing the range helps
              you hit the mark. Blog posts optimized for SEO typically land between 1,200 and 2,500
              words. Short essays for school are usually 500–800 words; longer academic papers range
              from 2,000 to 5,000 words. A standard 5-minute speech runs about 650–750 words at a
              normal speaking pace. Twitter posts cap at 280 characters, Instagram captions at around
              2,200 characters, and LinkedIn posts perform best under 1,300 characters. Meta
              descriptions should stay between 150 and 160 characters to avoid being truncated in
              search results. Paste your draft here and check your count against any of these targets.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Reading Time vs. Speaking Time: What Is the Difference?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Reading time and speaking time are both calculated from word count, but the rates differ.
              Silent reading averages 200–250 words per minute for most adults — the range depends on
              text complexity and the reader. Speaking time is slower: most presenters and podcasters
              average 120–150 words per minute when speaking clearly. A 1,000-word script takes roughly
              4–5 minutes to read silently but 7–8 minutes to deliver as a speech. If you are
              preparing slides, a video script, or a speech, use the speaking time estimate here to
              plan your pacing. For written content published online, the reading time figure is more
              useful — it tells readers upfront how long your article will take to finish.
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

        <RelatedTools slug="word-counter" />
      </main>
    </>
  );
}
