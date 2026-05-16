import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import CompoundInterestCalculatorTool from "@/components/compound-interest-calculator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Compound Interest Calculator – See How Money Grows Over Time",
  description:
    "Calculate compound interest online for free. See how an investment grows with monthly or annual compounding. Compare simple vs compound interest. Year-by-year breakdown included.",
  keywords: [
    "compound interest calculator online free",
    "how much will my investment grow calculator",
    "simple vs compound interest calculator",
    "fd compound interest calculator india",
    "compound interest monthly quarterly annually",
    "investment growth calculator india",
    "ppf compound interest calculator",
    "rule of 72 calculator",
  ],
  alternates: { canonical: "/tools/compound-interest-calculator" },
  openGraph: {
    title: "Compound Interest Calculator – Investment Growth with Year-by-Year Breakdown | ToolMint",
    description:
      "See how money grows with compound interest. Compare simple vs compound. Monthly, quarterly, or annual compounding. Free.",
    url: "/tools/compound-interest-calculator",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Planning long-term savings",
    desc: "See how much a fixed deposit, PPF, or recurring investment grows when interest is compounded monthly, quarterly, or annually over time.",
  },
  {
    title: "Comparing investment options",
    desc: "Compare two investment options with different rates, tenures, and compounding frequencies to see which produces more final value.",
  },
  {
    title: "Understanding debt growth",
    desc: "Compound interest works against you on unpaid loans and credit card balances. See exactly how fast an outstanding balance grows if left unpaid.",
  },
];

const steps = [
  { title: "Enter principal", desc: "Provide the starting amount — your initial deposit or investment." },
  { title: "Set rate and tenure", desc: "Enter the annual interest rate and the investment period in years." },
  { title: "Choose compounding frequency", desc: "Select monthly, quarterly, half-yearly, or annually." },
  { title: "View growth result", desc: "See the final amount, total interest earned, and year-by-year growth." },
];

const faqs = [
  {
    q: "What is the compound interest formula?",
    a: "A = P × (1 + r/n)^(n×t), where A is the final amount, P is the principal, r is the annual rate (as a decimal), n is compounding frequency per year, and t is time in years. Compound interest earned = A − P.",
  },
  {
    q: "What is the difference between simple and compound interest?",
    a: "Simple interest is calculated only on the principal. Compound interest is calculated on the principal plus all previously earned interest — meaning interest earns interest. Over long periods, compound interest grows significantly faster.",
  },
  {
    q: "How does compounding frequency affect returns?",
    a: "More frequent compounding means slightly higher returns. Monthly compounding earns more than annual compounding at the same nominal rate. The difference is larger with higher rates and longer time periods.",
  },
  {
    q: "What is the Rule of 72?",
    a: "Divide 72 by the annual interest rate to estimate how many years it takes for money to double. At 8% annual compound interest, money doubles in about 72 ÷ 8 = 9 years.",
  },
  {
    q: "Can I use this for FD and PPF calculations?",
    a: "Yes. FD in India typically compounds quarterly. PPF compounds annually. Enter the respective rate and select the matching compounding frequency for an accurate estimate.",
  },
];

export default function CompoundInterestCalculatorPage() {
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
      <WebAppSchema slug="compound-interest-calculator" />
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
            { name: "Compound Interest Calculator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Compound Interest Calculator – See How Your Money Grows Over Time
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Calculate how an investment or savings account grows with compound interest. Enter
          principal, annual rate, tenure, and compounding frequency to see the final amount,
          total interest earned, and a year-by-year breakdown. Compare with simple interest.
        </p>

        <div className="mt-8">
          <CompoundInterestCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Use This Calculator
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
            How to Calculate Compound Interest
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
              Simple vs. Compound Interest: The Long-Term Difference
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              On a short deposit of 1–2 years, the difference between simple and compound
              interest is small. Over 10–20 years, it becomes dramatic. At 8% annual rate on
              ₹1 lakh: simple interest after 20 years gives ₹1,60,000 in interest (total
              ₹2,60,000). Compound interest (annual) gives approximately ₹3,66,096 in interest
              (total ₹4,66,096) — more than double the simple interest return on the same
              principal. This is why compound interest is called the &ldquo;eighth wonder of the
              world&rdquo; — starting earlier, even with a smaller principal, almost always produces
              more than starting later with a larger amount.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              FD vs. PPF: Which Compounding Frequency Gives Better Returns?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Indian investors commonly compare Fixed Deposits and PPF. FDs typically compound
              quarterly at rates around 6.5–7.5% depending on the bank and tenure. PPF compounds
              annually at a government-set rate (currently around 7.1%) with the added benefit of
              tax exemption under Section 80C and tax-free maturity. On ₹1 lakh at 7% for 15 years,
              quarterly compounding (FD) gives approximately ₹2,80,679 while annual compounding
              (PPF) gives ₹2,75,903 — a difference of about ₹4,776. The PPF tax advantage typically
              more than offsets this gap for taxpayers in the 20–30% bracket. Use this calculator
              to run both scenarios with your specific numbers.
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

        <RelatedTools slug="compound-interest-calculator" />
      </main>
    </>
  );
}
