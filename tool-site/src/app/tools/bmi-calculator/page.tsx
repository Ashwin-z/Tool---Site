import type { Metadata } from "next";
import Link from "next/link";
import BmiCalculatorTool from "@/components/bmi-calculator-tool";

export const metadata: Metadata = {
  title: "BMI Calculator Online Free - Metric, Imperial, BMI Prime & Healthy Range",
  description:
    "Use ToolMint's free BMI calculator to compute body mass index with metric or imperial units and see BMI category, healthy weight range, BMI Prime, and visual BMI scale.",
  keywords: [
    "bmi calculator",
    "body mass index calculator",
    "bmi calculator online free",
    "metric bmi calculator",
    "imperial bmi calculator",
    "healthy weight calculator",
    "bmi prime calculator",
    "bmi category calculator",
  ],
  alternates: { canonical: "/tools/bmi-calculator" },
  openGraph: {
    title: "BMI Calculator Online Free | ToolMint",
    description:
      "Calculate BMI using metric or imperial units and instantly see your weight category and healthy range.",
    url: "/tools/bmi-calculator",
  },
};

const includedTools = [
  { title: "Metric & Imperial BMI", desc: "Calculate BMI with kilograms and centimeters or pounds and feet/inches." },
  { title: "BMI Category", desc: "See where your score falls across standard BMI health categories." },
  { title: "Healthy Weight Range", desc: "Review the weight range associated with a healthy BMI for your height." },
  { title: "BMI Prime & Visual Scale", desc: "Get BMI Prime and a visual indicator showing your position on the BMI spectrum." },
];

const steps = [
  { title: "Choose a unit system", desc: "Select metric or imperial based on how you want to enter height and weight." },
  { title: "Enter your values", desc: "Provide your weight and height in the selected units." },
  { title: "Calculate BMI", desc: "The tool instantly calculates your Body Mass Index and related scores." },
  { title: "Review the result", desc: "See your BMI category, healthy weight range, and BMI Prime value." },
];

const faqs = [
  {
    q: "What is BMI?",
    a: "BMI stands for Body Mass Index, a screening value calculated from your height and weight to estimate whether you are underweight, healthy, overweight, or obese.",
  },
  {
    q: "Does this BMI calculator support metric and imperial units?",
    a: "Yes. You can calculate BMI using kilograms and centimeters or pounds and feet/inches.",
  },
  {
    q: "Is BMI always accurate?",
    a: "BMI is a general screening tool, but it does not directly measure body fat, muscle mass, or overall health. It should be used with other health indicators.",
  },
  {
    q: "What BMI categories are shown?",
    a: "The calculator shows standard BMI categories such as underweight, normal weight, overweight, and obesity ranges.",
  },
  {
    q: "Can I use this BMI calculator for free?",
    a: "Yes. It is free and works instantly in your browser.",
  },
];

export default function BmiCalculatorPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
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
          BMI Calculator Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Calculate your Body Mass Index in seconds with ToolMint. Enter height and weight using metric or
          imperial units to see your BMI score, category, healthy weight range, BMI Prime, and visual guidance in one view.
        </p>

        <div className="mt-8">
          <BmiCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included BMI Tools
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
            How to Calculate BMI Online
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{index + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((faq, index) => (
              <div key={index}>
                <dt className="font-semibold text-foreground">{faq.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </>
  );
}
