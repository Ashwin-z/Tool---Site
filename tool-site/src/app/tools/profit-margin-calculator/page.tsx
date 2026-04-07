import type { Metadata } from "next";
import Link from "next/link";
import ProfitMarginCalculatorTool from "@/components/profit-margin-calculator-tool";

export const metadata: Metadata = {
  title: "Profit Margin Calculator Online Free - Margin, Markup, Revenue & Net Profit",
  description:
    "Use ToolMint's free profit margin calculator to calculate profit margin, revenue from desired margin, price from markup percentage, and gross or net margin in one tool.",
  keywords: [
    "profit margin calculator",
    "profit margin calculator online free",
    "revenue from desired margin",
    "price from markup calculator",
    "markup calculator",
    "gross and net margin calculator",
    "net profit calculator",
    "selling price calculator",
    "margin vs markup calculator",
    "free profit calculator",
  ],
  alternates: { canonical: "/tools/profit-margin-calculator" },
  openGraph: {
    title: "Profit Margin Calculator Online Free | ToolMint",
    description:
      "Calculate margin, revenue from target margin, selling price from markup, and gross or net margin in one browser-based tool.",
    url: "/tools/profit-margin-calculator",
  },
};

const includedTools = [
  {
    title: "Profit Margin Calculator",
    desc: "Calculate profit, margin, and markup from revenue and cost.",
  },
  {
    title: "Revenue from Desired Margin",
    desc: "Work backward from cost and target margin to find the revenue you need.",
  },
  {
    title: "Price from Markup %",
    desc: "Convert a markup percentage into the correct selling price and implied margin.",
  },
  {
    title: "Gross & Net Margin",
    desc: "Compare gross profit and net profit after COGS and operating expenses.",
  },
];

const steps = [
  { title: "Choose a calculator", desc: "Pick profit margin, revenue from desired margin, price from markup, or gross and net margin." },
  { title: "Enter the required values", desc: "Add cost, revenue, markup, or expenses depending on the calculator you selected." },
  { title: "Calculate instantly", desc: "The tool shows profit, selling price, margin, markup, and other relevant values immediately." },
  { title: "Compare scenarios", desc: "Adjust pricing, margin targets, or expenses to test different profitability outcomes." },
];

const faqs = [
  {
    q: "What calculators are included in this tool?",
    a: "This page includes four calculators: Profit Margin Calculator, Revenue from Desired Margin, Price from Markup %, and Gross & Net Margin.",
  },
  {
    q: "What is the difference between margin and markup?",
    a: "Margin is profit as a percentage of selling price, while markup is profit as a percentage of cost price.",
  },
  {
    q: "Can I calculate revenue from a target margin?",
    a: "Yes. Use the Revenue from Desired Margin calculator to work backward from cost and a target margin percentage.",
  },
  {
    q: "Can I calculate price from markup percentage?",
    a: "Yes. The Price from Markup % calculator converts markup into a selling price and also shows the equivalent margin.",
  },
  {
    q: "Does this tool support gross and net margin?",
    a: "Yes. The Gross & Net Margin calculator compares revenue, COGS, and operating expenses to show both gross and net profitability.",
  },
  {
    q: "Is the profit margin calculator free?",
    a: "Yes. You can use it free online without signup.",
  },
];

export default function ProfitMarginCalculatorPage() {
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
          Profit Margin Calculator Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Price products and services more confidently with ToolMint&apos;s profit margin calculator suite. This page includes
          calculators for profit margin, revenue from desired margin, price from markup percentage, and gross or net margin,
          so you can move between pricing strategy, markup planning, and profitability analysis in one place.
        </p>

        <div className="mt-8">
          <ProfitMarginCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Profit Calculators
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
            How to Calculate Profit Margin Online
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
