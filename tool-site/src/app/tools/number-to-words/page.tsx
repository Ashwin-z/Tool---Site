import type { Metadata } from "next";
import Link from "next/link";
import NumberToWordsTool from "@/components/number-to-words-tool";

export const metadata: Metadata = {
  title: "Number to Words Converter Online Free — Spell Out Any Number",
  description:
    "Convert numbers to words online for free with ToolMint. Spell out any number in English using Western or Indian numbering, ordinal form, or currency formats (USD, EUR, GBP, INR, JPY).",
  keywords: [
    "number to words",
    "number to words converter",
    "spell out number",
    "number spelling online",
    "convert number to text",
    "number to english words",
    "number to currency words",
    "number to ordinal",
  ],
  alternates: { canonical: "/tools/number-to-words" },
  openGraph: {
    title: "Number to Words Converter Online Free | ToolMint",
    description:
      "Spell out any number in English. Western and Indian numbering, ordinal, and currency formats supported.",
    url: "/tools/number-to-words",
  },
};

const steps = [
  { title: "Enter a number", desc: "Type any number — integers, decimals, or negatives." },
  { title: "Choose format", desc: "Select Western, Indian numbering, ordinal, or a currency like USD, EUR, INR." },
  { title: "View result", desc: "See the number spelled out in English words instantly." },
  { title: "Copy", desc: "Copy the result to your clipboard with one click." },
];

const faqs = [
  {
    q: "What numbering systems are supported?",
    a: "Western (thousand, million, billion) and Indian (lakh, crore) numbering systems are both supported.",
  },
  {
    q: "Can I convert to ordinal form?",
    a: "Yes. Switch to ordinal mode to get outputs like \u201cfirst,\u201d \u201csecond,\u201d \u201ctwenty-third,\u201d and so on.",
  },
  {
    q: "Which currencies are available?",
    a: "USD (dollars/cents), EUR (euros/cents), GBP (pounds/pence), INR (rupees/paise), and JPY (yen).",
  },
  {
    q: "How large a number can I convert?",
    a: "The tool handles very large numbers up to the quadrillions and beyond, limited only by JavaScript number precision.",
  },
  {
    q: "Is my data sent to a server?",
    a: "No. Conversion runs entirely in your browser. Nothing is transmitted.",
  },
];

export default function NumberToWordsPage() {
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
          Number to Words Converter — Free Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert any number to its English word form with ToolMint. Supports Western and
          Indian numbering systems, ordinal numbers, and currency formatting for USD, EUR,
          GBP, INR, and JPY.
        </p>

        <div className="mt-8">
          <NumberToWordsTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Convert a Number to Words
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
