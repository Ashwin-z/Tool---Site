import type { Metadata } from "next";
import Link from "next/link";
import WeightConverterTool from "@/components/weight-converter-tool";

export const metadata: Metadata = {
  title: "Weight Converter — kg, lb, oz, Stone, Tons, Carats & more | ToolMint",
  description:
    "Convert between 11 weight units — kilograms, pounds, ounces, stones, metric tons, US tons, imperial tons, carats, and more. Instant results with all-units comparison table. Free.",
  keywords: [
    "weight converter",
    "weight unit converter",
    "kg to lbs",
    "lbs to kg",
    "pounds to kilograms",
    "ounces to grams",
    "stone to kg",
    "metric ton to pounds",
    "carat converter",
    "mass converter",
    "weight conversion online",
    "grams to ounces",
  ],
  alternates: { canonical: "/tools/weight-converter" },
  openGraph: {
    title: "Weight Converter — kg, lb, oz, Stone, Tons & Carats | ToolMint",
    description:
      "Convert between 11 weight units including carats and both US/Imperial tons. Instant results with an all-units comparison table.",
    url: "/tools/weight-converter",
  },
};

const includedTools = [
  { title: "Single Unit Converter", desc: "Pick any two of 11 weight units — from micrograms to imperial tons — get an instant result with a one-click swap button." },
  { title: "All-Units Comparison Table", desc: "See your value expressed in all 11 weight units at once, including carats (ct), US short tons, and imperial long tons." },
];

const steps = [
  { title: "Enter a value", desc: "Type the weight you want to convert into the input field." },
  { title: "Choose units", desc: "Select your source unit (From) and target unit (To) from the dropdowns." },
  { title: "Read the result", desc: "The converted value appears instantly. Click it to copy to clipboard." },
  { title: "See all units", desc: "Check the All Conversions table below to see your weight in every supported unit simultaneously." },
];

const faqs = [
  {
    q: "How many weight units does this converter support?",
    a: "ToolMint's Weight Converter supports 11 units: Kilogram, Gram, Milligram, Microgram, Metric Ton, Pound, Ounce, Stone, US Ton (short ton), Imperial Ton (long ton), and Carat.",
  },
  {
    q: "How do I convert kg to lbs?",
    a: "Select Kilogram in the From dropdown, enter your value, and select Pound in To. The result appears instantly. 1 kg = 2.20462 lbs.",
  },
  {
    q: "What is the difference between a US ton and an Imperial ton?",
    a: "A US ton (short ton) equals 2,000 pounds (907.185 kg). An Imperial ton (long ton) equals 2,240 pounds (1,016.047 kg). A metric ton equals 1,000 kg (2,204.62 lbs).",
  },
  {
    q: "What is a carat in weight?",
    a: "A carat (ct) is the unit used for gemstones and precious metals. 1 carat = 0.2 grams = 200 milligrams. It should not be confused with karat (purity of gold).",
  },
  {
    q: "How do I convert stone to kilograms?",
    a: "Select Stone in the From dropdown and Kilogram in To. 1 stone = 6.35029 kg = 14 pounds. This unit is commonly used for body weight in the UK and Ireland.",
  },
];

export default function WeightConverterPage() {
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
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Weight Converter — 11 Units incl. Carats &amp; Both Tons
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert between 11 weight and mass units — kilograms, pounds, ounces, stones, grams, milligrams,
          micrograms, metric tons, US short tons, imperial long tons, and carats. Instant results with
          an all-units comparison table.
        </p>

        <div className="mt-8">
          <WeightConverterTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Weight Converter Tools
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
            How to Convert Weight Units
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
