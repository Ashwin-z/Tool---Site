import type { Metadata } from "next";
import Link from "next/link";
import TextCaseConverterTool from "@/components/text-case-converter-tool";

export const metadata: Metadata = {
  title: "Text Case Converter Online Free — UPPER, lower, Title Case & More",
  description:
    "Convert text case online for free with ToolMint. Switch between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case instantly.",
  keywords: [
    "text case converter",
    "uppercase converter",
    "lowercase converter",
    "title case converter",
    "change text case online",
    "camelcase converter",
    "sentence case converter",
    "text capitalization tool",
  ],
  alternates: { canonical: "/tools/text-case-converter" },
  openGraph: {
    title: "Text Case Converter Online Free | ToolMint",
    description:
      "Convert text to UPPERCASE, lowercase, Title Case, camelCase, snake_case, and more. Instant, browser-based.",
    url: "/tools/text-case-converter",
  },
};

const steps = [
  { title: "Paste your text", desc: "Type or paste the text you want to convert." },
  { title: "Pick a case", desc: "Click UPPER, lower, Title, Sentence, camelCase, snake_case, or kebab-case." },
  { title: "Preview output", desc: "See the converted text update instantly in real time." },
  { title: "Copy", desc: "Copy the result to your clipboard with one click." },
];

const faqs = [
  {
    q: "What text cases are supported?",
    a: "UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case are all supported.",
  },
  {
    q: "What is the difference between Title Case and Sentence case?",
    a: "Title Case capitalizes the first letter of every major word. Sentence case capitalizes only the first letter of each sentence.",
  },
  {
    q: "Can I convert long documents?",
    a: "Yes. There is no character limit. Paste any length of text and the conversion happens instantly in your browser.",
  },
  {
    q: "Does it include a word counter?",
    a: "Yes. A live word, character, and sentence counter is displayed alongside the text as you type or paste.",
  },
  {
    q: "Is my text sent to a server?",
    a: "No. All conversion happens locally in your browser. Your text stays private.",
  },
];

export default function TextCaseConverterPage() {
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
          Text Case Converter — Free Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase,
          snake_case, and kebab-case with ToolMint. Paste your text, click the case you want,
          and copy the result. Live word, character, and sentence counter included.
        </p>

        <div className="mt-8">
          <TextCaseConverterTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Change Text Case
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
