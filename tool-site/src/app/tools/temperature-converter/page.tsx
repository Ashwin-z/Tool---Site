import type { Metadata } from "next";
import Link from "next/link";
import TemperatureConverterTool from "@/components/temperature-converter-tool";

export const metadata: Metadata = {
  title: "Temperature Converter — °C, °F, Kelvin, Rankine, Delisle & More | ToolMint",
  description:
    "Convert between 8 temperature scales — Celsius, Fahrenheit, Kelvin, Rankine, Delisle, Newton, Réaumur, and Rømer. Includes reference points table and context-aware facts. Free.",
  keywords: [
    "temperature converter",
    "celsius to fahrenheit",
    "fahrenheit to celsius",
    "celsius to kelvin",
    "kelvin to celsius",
    "temperature conversion online",
    "rankine converter",
    "delisle converter",
    "temperature scale converter",
    "c to f converter",
    "f to c converter",
    "kelvin to fahrenheit",
  ],
  alternates: { canonical: "/tools/temperature-converter" },
  openGraph: {
    title: "Temperature Converter — °C, °F, Kelvin, Rankine, Delisle & More | ToolMint",
    description:
      "Convert between 8 temperature scales including Delisle, Newton, and Rømer. Includes reference points and context-aware fun facts.",
    url: "/tools/temperature-converter",
  },
};

const includedTools = [
  { title: "Temperature Scale Converter", desc: "Convert between any two of 8 scales — Celsius, Fahrenheit, Kelvin, Rankine, Delisle, Newton, Réaumur, Rømer — with a swap button and instant result." },
  { title: "All-Scales Comparison Table", desc: "See your value expressed across all 8 temperature scales simultaneously for a full cross-scale comparison." },
  { title: "Reference Points Table", desc: "A built-in quick reference showing Absolute Zero, Water Freezing, Body Temperature, and Water Boiling in °C, °F, and Kelvin." },
  { title: "Context-Aware Fun Facts", desc: "Each conversion shows an auto-generated fact based on the temperature — from absolute zero to hotter than the surface of the Sun." },
];

const steps = [
  { title: "Enter a temperature", desc: "Type your temperature value into the input field." },
  { title: "Choose scales", desc: "Select your source scale (From) and target scale (To) from the dropdowns." },
  { title: "Read the result", desc: "The converted temperature appears instantly with a context-aware fun fact below." },
  { title: "Check all scales", desc: "The All Conversions table shows your value in all 8 scales, and the Reference Points table provides common benchmarks." },
];

const faqs = [
  {
    q: "How do I convert Celsius to Fahrenheit?",
    a: "The formula is °F = (°C × 9/5) + 32. For example, 100°C = 212°F. Select Celsius in From, enter your value, and choose Fahrenheit in To for an instant result.",
  },
  {
    q: "What is Kelvin and why is it used?",
    a: "Kelvin is the SI base unit of temperature. Unlike Celsius or Fahrenheit, it has no negative values — it starts at absolute zero (0 K = −273.15°C). It is used in physics, astronomy, and scientific calculations.",
  },
  {
    q: "What are Delisle, Newton, Réaumur, and Rømer?",
    a: "These are historical temperature scales rarely used today. Delisle, Newton, Réaumur, and Rømer were each defined independently in the 18th century before Celsius and Fahrenheit became standard. ToolMint supports all 8 for completeness.",
  },
  {
    q: "What is absolute zero?",
    a: "Absolute zero is the lowest theoretically possible temperature: 0 K = −273.15°C = −459.67°F. At this point all classical molecular motion stops.",
  },
  {
    q: "What is normal human body temperature in Fahrenheit and Kelvin?",
    a: "Normal body temperature is approximately 37°C = 98.6°F = 310.15 K. This is one of the reference points shown in the built-in Reference Points table.",
  },
];

export default function TemperatureConverterPage() {
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
          Temperature Converter — 8 Scales incl. Kelvin, Rankine &amp; Delisle
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert between 8 temperature scales — Celsius, Fahrenheit, Kelvin, Rankine, Delisle, Newton,
          Réaumur, and Rømer. Includes an all-scales comparison table, a built-in reference points section
          (absolute zero, body temperature, boiling point), and context-aware facts for your temperature value.
        </p>

        <div className="mt-8">
          <TemperatureConverterTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Temperature Converter Tools
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
            How to Convert Temperature
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
