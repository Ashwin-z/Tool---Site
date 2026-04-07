import type { Metadata } from "next";
import Link from "next/link";
import CompoundInterestCalculatorTool from "@/components/compound-interest-calculator-tool";

export const metadata: Metadata = {
  title: "Compound Interest Calculator Online Free - Growth, Schedule & Simple Interest Compare",
  description:
    "Use ToolMint's free compound interest calculator to project investment growth, compare simple vs compound interest, choose compounding frequency, and view yearly schedules.",
  keywords: [
    "compound interest calculator",
    "compound interest calculator online free",
    "investment growth calculator",
    "ci calculator",
    "compounding interest calculator",
    "future value calculator",
    "simple vs compound interest",
    "free investment calculator",
  ],
  alternates: { canonical: "/tools/compound-interest-calculator" },
  openGraph: {
    title: "Compound Interest Calculator Online Free | ToolMint",
    description:
      "Project investment growth with flexible compounding frequencies, compare simple vs compound interest, and view yearly schedules.",
    url: "/tools/compound-interest-calculator",
  },
};

const includedTools = [
  { title: "Compound Growth Calculator", desc: "Project final value and total interest earned over time." },
  { title: "Simple vs Compound Comparison", desc: "Compare how compound returns outperform simple interest over the same period." },
  { title: "Compounding Frequency Modes", desc: "Switch between annual, semi-annual, quarterly, monthly, and daily compounding." },
  { title: "Yearly Growth Schedule", desc: "Review a year-by-year breakdown of balance growth and interest accumulation." },
];

const steps = [
  { title: "Enter principal", desc: "Start with the initial amount you want to invest or save." },
  { title: "Add rate and time", desc: "Enter the annual interest rate and investment duration." },
  { title: "Choose compounding", desc: "Select monthly, quarterly, half-yearly, yearly, or daily compounding." },
  { title: "Review growth", desc: "See final value, total interest earned, and year-by-year growth projections." },
];

const faqs = [
  {
    q: "What is compound interest?",
    a: "Compound interest means you earn interest on both your original principal and the interest that has already accumulated over time.",
  },
  {
    q: "Can I compare simple and compound interest?",
    a: "Yes. The calculator helps you see how compound growth differs from simple interest over the same time period.",
  },
  {
    q: "Which compounding frequencies are supported?",
    a: "It supports daily, monthly, quarterly, semi-annual, and annual compounding frequencies.",
  },
  {
    q: "Does it include a yearly schedule?",
    a: "Yes. You can view year-by-year growth projections to understand how your balance and interest build over time.",
  },
  {
    q: "Is this compound interest calculator free?",
    a: "Yes. It is free to use in your browser with no signup required.",
  },
];

export default function CompoundInterestCalculatorPage() {
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
          Compound Interest Calculator Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Project the future value of your savings and investments with ToolMint&apos;s compound interest calculator.
          Choose your compounding frequency, compare simple versus compound growth, and review yearly schedules to understand how returns build over time.
        </p>

        <div className="mt-8">
          <CompoundInterestCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Investment Calculators
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
            How to Calculate Compound Interest Online
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
