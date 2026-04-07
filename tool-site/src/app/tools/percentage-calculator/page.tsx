import type { Metadata } from "next";
import Link from "next/link";
import PercentageCalculatorTool from "@/components/percentage-calculator-tool";

export const metadata: Metadata = {
  title: "Percentage Calculator Online Free - X% of Y, Change, Difference & Reverse %",
  description:
    "Use ToolMint's free percentage calculator to find X% of Y, percentage increase, decrease, change, difference, reverse percentage, and what percent one number is of another.",
  keywords: [
    "percentage calculator",
    "percentage calculator online free",
    "x percent of y",
    "percent increase calculator",
    "percent decrease calculator",
    "reverse percentage calculator",
    "percentage difference calculator",
    "what percent of calculator",
  ],
  alternates: { canonical: "/tools/percentage-calculator" },
  openGraph: {
    title: "Percentage Calculator Online Free | ToolMint",
    description:
      "Calculate X% of Y, percentage increase, decrease, change, difference, and reverse percentage in one place.",
    url: "/tools/percentage-calculator",
  },
};

const includedTools = [
  { title: "X% of Y", desc: "Find any percentage of a number instantly." },
  { title: "Increase, Decrease & Change", desc: "Measure percentage growth, reduction, or change between two values." },
  { title: "Percentage Difference", desc: "Compare two numbers and calculate the percent difference between them." },
  { title: "Reverse & What Percent", desc: "Work backward from a final number or find what percent one value is of another." },
];

const steps = [
  { title: "Pick a calculation type", desc: "Choose X% of Y, percentage change, increase, decrease, reverse percentage, or what percent one number is of another." },
  { title: "Enter your values", desc: "Type the base numbers into the calculator fields." },
  { title: "Calculate instantly", desc: "The result updates immediately with the correct percentage answer." },
  { title: "Use the answer", desc: "Copy the result for discounts, markups, exam scores, taxes, or business calculations." },
];

const faqs = [
  {
    q: "What can this percentage calculator solve?",
    a: "It can calculate X percent of Y, percentage increase, percentage decrease, percentage change, percentage difference, and reverse percentage.",
  },
  {
    q: "Can I calculate discounts and markups?",
    a: "Yes. Use the percentage decrease and increase modes for sale discounts, price changes, and markups.",
  },
  {
    q: "What is reverse percentage?",
    a: "Reverse percentage helps you work backward from a final value to find the original number before a percentage increase or decrease.",
  },
  {
    q: "Is this calculator free to use?",
    a: "Yes. It is completely free and works directly in your browser without signup.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. The calculator is responsive and works on phones, tablets, and desktops.",
  },
];

export default function PercentageCalculatorPage() {
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
          Percentage Calculator Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Solve percentage problems fast with ToolMint. Find X% of Y, calculate percentage increases
          and decreases, compare changes between values, calculate percentage difference, and work backward
          with reverse percentage formulas in one simple calculator suite.
        </p>

        <div className="mt-8">
          <PercentageCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Percentage Calculators
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
            How to Calculate Percentages Online
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
