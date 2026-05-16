import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import NumberToWordsTool from "@/components/number-to-words-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Number to Words Converter – Spell Out Any Number in English Free",
  description:
    "Convert any number to English words online for free. Western and Indian numbering, ordinal form, and currency formats (USD, EUR, GBP, INR, JPY). Instant, no signup required.",
  keywords: [
    "number to words converter online free",
    "spell out number in words",
    "convert number to english words",
    "number to words for cheque",
    "write number in words online",
    "number spelling tool",
    "number to currency words",
    "convert numbers to ordinal",
    "indian numbering lakh crore",
    "number to words for legal documents",
  ],
  alternates: { canonical: "/tools/number-to-words" },
  openGraph: {
    title: "Number to Words Converter – Spell Out Any Number in English | ToolMint",
    description:
      "Convert numbers to English words. Western and Indian numbering, ordinal, and currency formats. Free, instant, browser-based.",
    url: "/tools/number-to-words",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Cheques and legal documents",
    desc: "Many financial and legal documents require numbers written out in words to prevent fraud. Convert the amount once and paste it directly.",
  },
  {
    title: "Academic and formal writing",
    desc: "Style guides like APA, Chicago, and MLA require numbers below ten to be spelled out in prose. Convert quickly without looking up the rule each time.",
  },
  {
    title: "Indian numbering (lakh/crore)",
    desc: "Switch to Indian numbering format to express amounts in lakhs and crores — the standard for business communication in India and South Asia.",
  },
];

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
    a: "Yes. Switch to ordinal mode to get outputs like 'first,' 'second,' 'twenty-third,' and so on.",
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
      <WebAppSchema slug="number-to-words" />
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
            { name: "Number to Words" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Number to Words Converter – Spell Out Any Number in English
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert any number to its English word form with ToolMint. Supports Western and
          Indian numbering systems, ordinal numbers, and currency formatting for USD, EUR,
          GBP, INR, and JPY. Instant results, nothing uploaded, completely free.
        </p>

        <div className="mt-8">
          <NumberToWordsTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Spell Out Numbers in Words
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Western vs. Indian Numbering: What Is the Difference?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The Western numbering system groups digits by thousands: one thousand, one million,
              one billion, one trillion. Each new named unit is one thousand times the previous.
              This system is standard in the United States, Europe, and most international finance.
              The Indian numbering system uses different grouping conventions after the first
              thousand: 100,000 is called one lakh, and 10,000,000 is called one crore. Higher
              values follow the same pattern — ten crore, one hundred crore, and so on. The
              system is used in India, Pakistan, Bangladesh, Nepal, and Sri Lanka for business
              communication, financial reporting, and everyday amounts. This tool supports both
              systems natively — switch the format selector to convert the same number under
              either convention without manual calculation.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Writing Numbers on Cheques and in Legal Documents
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Financial and legal documents require amounts to be written in both numeric and word
              form for fraud prevention. If the numeric amount is altered after signing, the written
              words serve as the authoritative version. On a bank cheque, the written form must be
              precise — including dollars and cents, pounds and pence, or rupees and paise depending
              on the currency. Legal contracts, deeds, and agreements often follow the same pattern.
              The currency modes here output the full formal phrase — for example, USD mode converts
              1,250.75 to &ldquo;one thousand two hundred fifty dollars and seventy-five cents&rdquo; — ready to
              paste directly into the document. For INR, the tool uses the Indian numbering convention
              (lakh, crore) with rupees and paise. Select the appropriate currency in the format
              dropdown before copying the result.
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

        <RelatedTools slug="number-to-words" />
      </main>
    </>
  );
}
