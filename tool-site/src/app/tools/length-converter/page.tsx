import type { Metadata } from "next";
import Link from "next/link";
import LengthConverterTool from "@/components/length-converter-tool";

export const metadata: Metadata = {
  title: "Length Converter — km, mi, ft, cm, Nautical Miles & Light Years | ToolMint",
  description:
    "Convert between 12 length units — kilometers, miles, feet, inches, centimeters, meters, yards, nautical miles, light years, and more. Instant results with all-units table. Free.",
  keywords: [
    "length converter",
    "length unit converter",
    "km to miles",
    "miles to km",
    "feet to meters",
    "cm to inches",
    "meters to feet",
    "inches to cm",
    "nautical miles converter",
    "metric to imperial converter",
    "distance unit converter",
    "length conversion online",
  ],
  alternates: { canonical: "/tools/length-converter" },
  openGraph: {
    title: "Length Converter — km, mi, ft, cm, Nautical Miles & Light Years | ToolMint",
    description:
      "Convert between 12 length units instantly. Metric, imperial, nautical miles, and light years with an all-units comparison table.",
    url: "/tools/length-converter",
  },
};

const includedTools = [
  { title: "Single Unit Converter", desc: "Pick any two of 12 length units — from nanometers to light years — and get the exact conversion instantly with a swap button." },
  { title: "All-Units Comparison Table", desc: "See your value converted to all 12 units simultaneously so you can compare metric, imperial, nautical, and astronomical scales side by side." },
];

const steps = [
  { title: "Enter a value", desc: "Type the length you want to convert into the input field." },
  { title: "Choose units", desc: "Select your source unit from the From dropdown and your target unit from the To dropdown." },
  { title: "Read the result", desc: "The converted value appears instantly. Click it to copy to clipboard." },
  { title: "See all units", desc: "Scroll to the All Conversions table to see your value expressed in every supported unit at once." },
];

const faqs = [
  {
    q: "How many length units does this converter support?",
    a: "ToolMint's Length Converter supports 12 units: Kilometer, Meter, Centimeter, Millimeter, Micrometer, Nanometer, Mile, Yard, Foot, Inch, Nautical Mile, and Light Year.",
  },
  {
    q: "How do I convert kilometers to miles?",
    a: "Select Kilometer in the From dropdown, enter your value, and select Mile in the To dropdown. The result appears instantly. 1 kilometer = 0.621371 miles.",
  },
  {
    q: "What is a nautical mile?",
    a: "A nautical mile equals exactly 1,852 meters (1.852 km). It is used in marine navigation and aviation and is based on the circumference of the Earth.",
  },
  {
    q: "How far is a light year in kilometers?",
    a: "One light year is approximately 9.461 × 10¹² kilometers (about 9.46 trillion km) — the distance light travels in one year through a vacuum.",
  },
  {
    q: "Can I convert between metric and imperial in one step?",
    a: "Yes. Choose a metric unit (km, m, cm) in From and an imperial unit (mi, yd, ft, in) in To — or vice versa. The converter handles the full cross-system math directly.",
  },
];

export default function LengthConverterPage() {
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
          Length Converter — 12 Units, Metric &amp; Imperial
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert between 12 length units — metric (km, m, cm, mm, μm, nm), imperial (mi, yd, ft, in),
          nautical miles, and light years. Get your result instantly and see all units compared at a glance.
        </p>

        <div className="mt-8">
          <LengthConverterTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Length Converter Tools
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
            How to Convert Length Units
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
