import type { Metadata } from "next";
import Link from "next/link";
import ROICalculatorTool from "@/components/roi-calculator-tool";

export const metadata: Metadata = {
  title: "ROI Calculator Online Free - ROI, CAGR, Investment Growth & Break-even",
  description:
    "Use ToolMint's free ROI calculator to measure simple ROI, annualized ROI, CAGR, recurring investment growth, and break-even analysis in one tool.",
  keywords: [
    "roi calculator",
    "roi calculator online free",
    "return on investment calculator",
    "cagr calculator",
    "annualized roi calculator",
    "investment return calculator",
    "break even calculator",
    "free roi tool",
  ],
  alternates: { canonical: "/tools/roi-calculator" },
  openGraph: {
    title: "ROI Calculator Online Free | ToolMint",
    description:
      "Calculate ROI, CAGR, annualized return, investment growth, and break-even analysis with a fast browser-based calculator.",
    url: "/tools/roi-calculator",
  },
};

const includedTools = [
  { title: "Simple ROI", desc: "Calculate total return on investment from cost and final value." },
  { title: "Annualized ROI / CAGR", desc: "Measure yearly growth rate for investments held over multiple years." },
  { title: "Growth With Contributions", desc: "Project investment performance when regular monthly contributions are added." },
  { title: "Break-even Analysis", desc: "Estimate the break-even point for projects and unit-based investments." },
];

const steps = [
  { title: "Enter investment details", desc: "Add your starting investment, final value, and time period." },
  { title: "Choose the return view", desc: "Calculate simple ROI, annualized ROI, CAGR, contribution growth, or break-even analysis." },
  { title: "Review returns", desc: "See total gain, percentage return, and annualized performance instantly." },
  { title: "Compare scenarios", desc: "Adjust dates, contributions, or outcomes to evaluate different investments side by side." },
];

const faqs = [
  {
    q: "What is ROI?",
    a: "ROI stands for Return on Investment, a measure of how much profit or loss an investment produced relative to its cost.",
  },
  {
    q: "What is the difference between ROI and CAGR?",
    a: "ROI shows total return over the full period, while CAGR shows the average annual growth rate over multiple years.",
  },
  {
    q: "Does this tool support recurring contributions?",
    a: "Yes. The calculator can account for recurring additions to project more realistic investment growth.",
  },
  {
    q: "Does it include break-even analysis?",
    a: "Yes. This page also includes a break-even analysis mode for project and unit-based investment planning.",
  },
  {
    q: "Is this ROI calculator free?",
    a: "Yes. It is free to use online with no signup required.",
  },
];

export default function ROICalculatorPage() {
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
          ROI Calculator Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Measure investment performance clearly with ToolMint&apos;s ROI calculator. Calculate simple return on investment,
          annualized return, CAGR, growth with recurring contributions, and break-even analysis so you can compare opportunities more accurately.
        </p>

        <div className="mt-8">
          <ROICalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included ROI Calculators
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
            How to Calculate ROI Online
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
