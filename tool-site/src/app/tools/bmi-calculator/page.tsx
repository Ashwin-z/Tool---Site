import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import BmiCalculatorTool from "@/components/bmi-calculator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "BMI Calculator – Check Body Mass Index with Healthy Weight Range",
  description:
    "Calculate your BMI with metric or imperial units. See your BMI category, healthy weight range for your height, BMI Prime, and visual scale. Free, instant, no signup.",
  keywords: [
    "bmi calculator with healthy weight range",
    "body mass index calculator metric imperial",
    "bmi calculator for women by age",
    "check bmi online free",
    "healthy weight calculator for height",
    "bmi prime calculator",
    "bmi category underweight overweight",
    "calculate bmi in kg and cm",
  ],
  alternates: { canonical: "/tools/bmi-calculator" },
  openGraph: {
    title: "BMI Calculator – Healthy Weight Range, BMI Category & BMI Prime | ToolMint",
    description:
      "Enter height and weight in metric or imperial. Get BMI score, category, healthy weight range, and BMI Prime instantly.",
    url: "/tools/bmi-calculator",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Weight management check-in",
    desc: "Track your BMI periodically as a reference point alongside other health markers like waist circumference and energy levels.",
  },
  {
    title: "Healthy weight range by height",
    desc: "Use the healthy weight range output to understand what target weight corresponds to a normal BMI for your height.",
  },
  {
    title: "Medical and insurance forms",
    desc: "Many health screenings, insurance applications, and fitness assessments ask for BMI. Calculate it accurately before filling out forms.",
  },
];

const steps = [
  { title: "Choose unit system", desc: "Select metric (kg/cm) or imperial (lb/ft·in) based on your preferred units." },
  { title: "Enter height and weight", desc: "Provide your height and current weight in the selected units." },
  { title: "View BMI result", desc: "See your BMI score and which category it falls into instantly." },
  { title: "Review healthy range", desc: "Check the healthy weight range for your height and BMI Prime value." },
];

const faqs = [
  {
    q: "What is a healthy BMI range?",
    a: "For most adults, a BMI between 18.5 and 24.9 is classified as healthy weight. Below 18.5 is underweight, 25–29.9 is overweight, and 30 or above is classified as obese according to standard WHO categories.",
  },
  {
    q: "Is BMI accurate for everyone?",
    a: "BMI is a population-level screening tool, not a precise body fat measurement. It can overestimate fatness in athletes with high muscle mass, and underestimate it in older adults who have lost muscle. Use it as one data point alongside other health markers.",
  },
  {
    q: "What is BMI Prime?",
    a: "BMI Prime is your BMI divided by 25 (the upper limit of the healthy range). A BMI Prime of 1.0 means you are exactly at the upper edge of the healthy weight range. Below 1.0 is within normal or underweight; above 1.0 indicates overweight or obese.",
  },
  {
    q: "Does this BMI calculator support metric and imperial?",
    a: "Yes. Switch between kilograms/centimeters and pounds/feet-inches freely. Both produce the same BMI calculation.",
  },
  {
    q: "Does BMI differ for men and women?",
    a: "Standard BMI categories are the same for men and women. However, women naturally carry more body fat than men at the same BMI, and some health organizations use adjusted thresholds for certain risk assessments.",
  },
];

export default function BmiCalculatorPage() {
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
      <WebAppSchema slug="bmi-calculator" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Calculators", href: "/tools/calculators" },
            { name: "BMI Calculator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          BMI Calculator – Body Mass Index with Healthy Weight Range
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Enter your height and weight in metric or imperial units to instantly see your Body Mass
          Index, BMI category, the healthy weight range for your height, and your BMI Prime.
          All calculations run in your browser — nothing is stored.
        </p>

        <div className="mt-8">
          <BmiCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Check Your BMI
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
            How to Calculate Your BMI
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
              BMI Categories Explained
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The World Health Organization defines four main BMI categories for adults.
              Underweight is below 18.5 — this range is associated with nutritional deficiency,
              bone loss, and weakened immune response. Normal weight is 18.5 to 24.9 — the
              range associated with the lowest statistical risk for weight-related health
              conditions. Overweight is 25 to 29.9 — an increased risk range that does not
              automatically indicate a health problem, especially for muscular individuals.
              Obese is 30 and above — this range is divided into three severity classes (30–34.9,
              35–39.9, and 40+), each associated with progressively higher cardiovascular and
              metabolic risk. BMI categories are reference points, not diagnoses — a doctor
              uses BMI alongside blood pressure, blood glucose, lipid levels, and other markers
              to assess overall health.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Why the Healthy Weight Range Matters More Than the BMI Number
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Rather than focusing on hitting a specific BMI number, the healthy weight range
              gives you a goal in actual kilograms or pounds. For someone who is 170 cm tall,
              the healthy weight range is approximately 53–72 kg (117–159 lb). Any weight within
              that band produces a BMI between 18.5 and 24.9. This framing is more actionable
              than a single score — it tells you how many kilograms above or below the range
              you currently are. The calculator shows both the range and your current position
              relative to it so you can set a realistic, data-grounded target rather than
              optimizing for a number that feels arbitrary.
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

        <RelatedTools slug="bmi-calculator" />
      </main>
    </>
  );
}
