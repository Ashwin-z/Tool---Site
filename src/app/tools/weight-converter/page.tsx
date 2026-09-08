import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import WeightConverterTool from "@/components/weight-converter-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Weight Converter – kg to lbs, Pounds to kg, Stone to kg Free",
  description:
    "Convert between 11 weight units instantly — kg, pounds, ounces, grams, stone, metric ton, carats, and more. All-units comparison table. Free, no signup.",
  keywords: [
    "kg to lbs converter online free",
    "pounds to kg converter",
    "stone to kg converter",
    "grams to ounces converter",
    "weight unit converter free",
    "kg to pounds calculator",
    "ounces to grams converter",
    "weight conversion online",
  ],
  alternates: { canonical: "/tools/weight-converter" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Weight Converter – kg to lbs, Pounds to kg, Stone to kg | ToolMint",
    description:
      "Convert between 11 weight units including carats and both US/Imperial tons. Instant results with an all-units comparison table.",
    url: "/tools/weight-converter",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "Single Unit Converter", desc: "Pick any two of 11 weight units — from micrograms to imperial tons — get an instant result with a one-click swap button." },
  { title: "All-Units Comparison Table", desc: "See your value expressed in all 11 weight units at once, including carats (ct), US short tons, and imperial long tons." },
];

const useCases = [
  { title: "Fitness & Body Weight", desc: "Convert your body weight between kg and lbs, or check how your weight in stone compares — used widely in the UK and Ireland for body weight." },
  { title: "Cooking & Recipes", desc: "Switch between grams and ounces when following international recipes, or convert between pounds and kilograms for baking at scale." },
  { title: "Shipping & Logistics", desc: "Convert cargo weight between metric tons and US tons, or calculate package weight in the unit required by your shipping carrier." },
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
      <WebAppSchema slug="weight-converter" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Converters", href: "/tools/converters" },
            { name: "Weight Converter" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Weight Converter – kg to lbs, Pounds to kg & More
        </h1>

        <ProcessingBadge slug="weight-converter" />
        <ToolAnalytics slug="weight-converter" category="converters" />
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
            Who Uses a Weight Converter
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {useCases.map((u) => (
              <div key={u.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{u.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{u.desc}</p>
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Understanding kg, lbs, and Stone – The Three Common Body Weight Units
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Body weight is reported in three different units depending on which country you are in, and
              the confusion between them is one of the most frequent reasons people search for weight
              converters. In most of the world, kilograms (kg) are standard — 1 kg = 2.20462 pounds exactly.
              In the United States, pounds (lbs) are used exclusively. In the UK and Ireland, stone is still
              widely used for body weight even though the metric system is official: 1 stone = 14 pounds =
              6.35029 kg. A person who weighs 75 kg is 165.35 lbs or 11 stone 11.3 lbs — three completely
              different numbers for the same weight. For gym tracking and health apps this conversion is
              needed constantly. The formula from kg to lbs is simple: multiply by 2.20462. From lbs to kg:
              divide by 2.20462. Stone is slightly more involved: divide the total pounds by 14 to get stone
              (integer part) and the remainder gives the pounds component.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Metric Tons, US Tons, Imperial Tons, and Carats – Industrial and Specialty Units
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              When dealing with heavy industrial goods or precious stones, three less obvious weight units
              become important. The metric ton (tonne, MT) equals exactly 1,000 kg and is used globally in
              shipping, agriculture, and commodity trading. The US short ton equals 2,000 lbs (≈ 907.185 kg)
              and is the default &quot;ton&quot; in US commerce. The imperial long ton equals 2,240 lbs (≈ 1,016 kg)
              and is used in UK shipping contexts — the difference between a US ton and an Imperial ton is
              240 lbs, which matters significantly in bulk cargo pricing. For gemstones and precious metals,
              the carat (ct) is the standard: 1 ct = 0.2 grams = 200 milligrams. A 1-carat diamond weighs
              0.0002 kg — a tiny fraction that the converter handles precisely. Note that carat (ct) for
              weight is distinct from karat (kt), which measures gold purity on a 0–24 scale and has nothing
              to do with mass.
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

        <RelatedTools slug="weight-converter" />
      </main>
    </>
  );
}
