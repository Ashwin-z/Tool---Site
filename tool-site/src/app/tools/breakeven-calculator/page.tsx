import type { Metadata } from "next";
import Link from "next/link";
import BreakevenCalculatorTool from "@/components/breakeven-calculator-tool";

export const metadata: Metadata = {
  title: "Break-even Calculator Online Free - Units, Revenue & Contribution Margin",
  description:
    "Use ToolMint's free break-even calculator to find break-even units, break-even revenue, contribution margin ratio, and profit or loss at different sales volumes.",
  keywords: [
    "break even calculator",
    "breakeven calculator online free",
    "break even point calculator",
    "contribution margin calculator",
    "break even revenue calculator",
    "fixed cost calculator",
    "profit loss projection calculator",
    "free business calculator",
  ],
  alternates: { canonical: "/tools/breakeven-calculator" },
  openGraph: {
    title: "Break-even Calculator Online Free | ToolMint",
    description:
      "Calculate break-even units, break-even revenue, contribution margin, and profit-loss scenarios for better pricing and sales planning.",
    url: "/tools/breakeven-calculator",
  },
};

const includedTools = [
  { title: "Break-even Units", desc: "Find how many units you need to sell before profit begins." },
  { title: "Break-even Revenue", desc: "Calculate the sales revenue needed to cover all fixed and variable costs." },
  { title: "Contribution Margin", desc: "Measure unit contribution and contribution ratio for pricing decisions." },
  { title: "Profit / Loss Scenarios", desc: "Review profitability at different sales volumes above and below break-even." },
];

const steps = [
  { title: "Enter fixed costs", desc: "Add rent, salaries, software, and other costs that stay constant." },
  { title: "Add variable cost and price", desc: "Enter your cost per unit and selling price per unit." },
  { title: "Calculate break-even point", desc: "The tool shows how many units and how much revenue you need to break even." },
  { title: "Test scenarios", desc: "Adjust costs or pricing to see how changes affect profitability and contribution margin." },
];

const faqs = [
  {
    q: "What is a break-even point?",
    a: "The break-even point is the sales level where total revenue equals total costs, meaning profit is zero and losses are fully covered.",
  },
  {
    q: "What inputs do I need?",
    a: "You typically need fixed costs, variable cost per unit, and selling price per unit to calculate break-even units and revenue.",
  },
  {
    q: "What is contribution margin?",
    a: "Contribution margin is the amount left from each sale after variable costs are subtracted, which helps cover fixed costs and profit.",
  },
  {
    q: "Does this tool show profit-loss scenarios?",
    a: "Yes. The calculator helps you review how profitability changes at different sales volumes above and below the break-even point.",
  },
  {
    q: "Is this break-even calculator free?",
    a: "Yes. It is free to use online without signup.",
  },
];

export default function BreakevenCalculatorPage() {
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
          Break-even Calculator Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Understand exactly when a business offer becomes profitable with ToolMint&apos;s break-even calculator.
          Estimate units, revenue, contribution margin, and profit-loss scenarios so you can plan pricing, sales targets, and cost changes more clearly.
        </p>

        <div className="mt-8">
          <BreakevenCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Break-even Tools
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
            How to Calculate Break-even Point Online
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
