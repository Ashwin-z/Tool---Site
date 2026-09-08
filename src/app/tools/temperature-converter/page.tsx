import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import TemperatureConverterTool from "@/components/temperature-converter-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Temperature Converter – Celsius to Fahrenheit, Kelvin & More Free",
  description:
    "Convert between 8 temperature scales — Celsius, Fahrenheit, Kelvin, Rankine, Delisle, Newton, Réaumur, and Rømer. Includes reference table and formulas. Free.",
  keywords: [
    "celsius to fahrenheit converter online free",
    "fahrenheit to celsius converter",
    "celsius to kelvin converter",
    "temperature converter online free",
    "how to convert celsius to fahrenheit formula",
    "kelvin to celsius converter",
    "temperature scale converter",
    "c to f converter online",
  ],
  alternates: { canonical: "/tools/temperature-converter" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Temperature Converter – Celsius to Fahrenheit, Kelvin & More | ToolMint",
    description:
      "Convert between 8 temperature scales including Delisle, Newton, and Rømer. Includes reference points and context-aware fun facts.",
    url: "/tools/temperature-converter",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "Temperature Scale Converter", desc: "Convert between any two of 8 scales — Celsius, Fahrenheit, Kelvin, Rankine, Delisle, Newton, Réaumur, Rømer — with a swap button and instant result." },
  { title: "All-Scales Comparison Table", desc: "See your value expressed across all 8 temperature scales simultaneously for a full cross-scale comparison." },
  { title: "Reference Points Table", desc: "A built-in quick reference showing Absolute Zero, Water Freezing, Body Temperature, and Water Boiling in °C, °F, and Kelvin." },
  { title: "Context-Aware Fun Facts", desc: "Each conversion shows an auto-generated fact based on the temperature — from absolute zero to hotter than the surface of the Sun." },
];

const useCases = [
  { title: "Cooking & Baking", desc: "Convert oven temperatures between Celsius and Fahrenheit when following international recipes — US recipes use °F, most others use °C." },
  { title: "Weather & Travel", desc: "Quickly convert weather forecasts when traveling between countries. 30°C summer heat = 86°F; a cold 0°C day = 32°F (freezing point)." },
  { title: "Science & Engineering", desc: "Convert between Celsius and Kelvin for thermodynamics, chemistry, or physics calculations where absolute temperature is required." },
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
      <WebAppSchema slug="temperature-converter" />
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
            { name: "Temperature Converter" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Temperature Converter – Celsius, Fahrenheit, Kelvin & 5 More Scales
        </h1>

        <ProcessingBadge slug="temperature-converter" />
        <ToolAnalytics slug="temperature-converter" category="converters" />
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
            Who Uses a Temperature Converter
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Celsius to Fahrenheit Formula – and Why the Two Scales Diverge
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The Celsius and Fahrenheit scales are both linear but start at different zero points and
              use different step sizes. Celsius is defined so that water freezes at 0°C and boils at
              100°C at sea level — 100 evenly divided degrees between two natural reference points.
              Fahrenheit was originally calibrated using brine (0°F) and human body temperature (96°F,
              later adjusted to 98.6°F), which is why its numbers feel less intuitive for everyday weather
              and cooking. The conversion formula is: °F = (°C × 1.8) + 32 — multiply by 1.8 to stretch
              the scale, then add 32 to shift the zero point. Going the other way: °C = (°F − 32) / 1.8.
              A useful mental shortcut: double the Celsius value and add 30 gives a rough Fahrenheit
              estimate (20°C → 70°F is close to 68°F actual). The one temperature where both scales agree
              is −40°: −40°C = −40°F exactly — the result of the two conversion constants canceling out.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Kelvin, Rankine, and the Absolute Temperature Scales
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Kelvin (K) and Rankine (°R) are called absolute temperature scales because they begin at
              absolute zero — the theoretical minimum temperature where all thermal motion ceases. Kelvin
              is the SI base unit and uses the same step size as Celsius: 1 K increase = 1°C increase, but
              0 K = −273.15°C. This means converting Celsius to Kelvin is simply adding 273.15. Kelvin is
              essential in thermodynamics, chemistry (ideal gas law: PV = nRT uses T in Kelvin), and
              astrophysics — stellar surface temperatures are reported in Kelvin (the Sun&apos;s surface is
              roughly 5,778 K). Rankine does the same thing for Fahrenheit: it starts at absolute zero but
              uses Fahrenheit-sized steps. 0°R = −459.67°F = 0 K. Rankine is used in some US engineering
              contexts. The four historical scales — Delisle, Newton, Réaumur, and Rømer — are rarely
              used outside historical research but are included here for completeness and curiosity.
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

        <RelatedTools slug="temperature-converter" />
      </main>
    </>
  );
}
