import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import LengthConverterTool from "@/components/length-converter-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Length Converter – km to Miles, Meters to Feet, cm to Inches Free",
  description:
    "Convert between 12 length units instantly — km, miles, meters, feet, inches, cm, mm, nautical miles, and light years. All-units comparison table. Free, no signup.",
  keywords: [
    "km to miles converter",
    "meters to feet converter online",
    "cm to inches converter free",
    "miles to kilometers calculator",
    "length unit converter online",
    "feet to meters conversion",
    "nautical miles to km converter",
    "metric to imperial length converter",
  ],
  alternates: { canonical: "/tools/length-converter" },
  openGraph: {
    title: "Length Converter – km to Miles, Meters to Feet, cm to Inches | ToolMint",
    description:
      "Convert between 12 length units instantly. Metric, imperial, nautical miles, and light years with an all-units comparison table.",
    url: "/tools/length-converter",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "Single Unit Converter", desc: "Pick any two of 12 length units — from nanometers to light years — and get the exact conversion instantly with a swap button." },
  { title: "All-Units Comparison Table", desc: "See your value converted to all 12 units simultaneously so you can compare metric, imperial, nautical, and astronomical scales side by side." },
];

const useCases = [
  { title: "Travel & Navigation", desc: "Convert km to miles for road trips in the US or UK, or switch between nautical miles and km when planning sea or air routes." },
  { title: "Construction & DIY", desc: "Convert between feet, inches, and centimeters when working with blueprints, room measurements, or imported materials with mixed unit labels." },
  { title: "Science & Education", desc: "Convert meters to nanometers for microscopy, or astronomical units to light years for physics homework — all scales in a single tool." },
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
    q: "How many meters are in a foot?",
    a: "1 foot = 0.3048 meters exactly. Conversely, 1 meter = 3.28084 feet. This is the exact international definition set in 1959.",
  },
  {
    q: "What is a nautical mile?",
    a: "A nautical mile equals exactly 1,852 meters (1.852 km). It is used in marine navigation and aviation and is based on the circumference of the Earth.",
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
      <WebAppSchema slug="length-converter" />
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
            { name: "Length Converter" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Length Converter – km to Miles, Meters to Feet & More
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
            Who Uses a Length Converter
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Metric vs Imperial Length Units – What You Need to Know
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The world uses two primary length measurement systems that rarely agree with each other.
              The metric system (SI) is based on powers of ten — 1 km = 1,000 m = 100,000 cm = 1,000,000 mm
              — making mental math and scientific notation straightforward. The imperial system (used in the
              US and partially in the UK) uses irregular multipliers: 1 mile = 1,760 yards = 5,280 feet =
              63,360 inches. Neither system is inherently more precise; they are simply different conventions.
              The key conversions most people need are: 1 km = 0.621371 miles (so a 5km run is roughly 3.1
              miles), 1 meter = 3.28084 feet, and 1 inch = 2.54 cm exactly (this is the internationally
              agreed definition since 1959). When converting between systems the only rounding that matters
              is how many decimal places you need — the converter shows full precision, but for practical
              use 3–4 decimal places are almost always sufficient.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Nautical Miles, Light Years, and Unusual Length Units
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Beyond everyday metric and imperial units, two length units frequently cause confusion: the
              nautical mile and the light year. A nautical mile (nmi) equals exactly 1,852 meters — it was
              originally defined as one arc-minute of latitude along the Earth&apos;s surface, which is why it
              appears in aviation and marine navigation where positions are given in degrees, minutes, and
              seconds. 1 nautical mile = 1.852 km = 1.15078 statute miles. Speed at sea and in the air is
              expressed in knots — one knot equals one nautical mile per hour. A light year, by contrast, is
              an astronomical distance unit: the distance light travels in one year in a vacuum, approximately
              9.461 × 10¹² km (about 9.46 trillion km). It is purely a distance unit, not a time unit —
              a common point of confusion. For students and developers working with both human-scale and
              astronomical distances, this converter handles the full range from nanometers (1 nm = 10⁻⁹ m,
              used in semiconductor specs) to light years without switching tools.
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

        <RelatedTools slug="length-converter" />
      </main>
    </>
  );
}
