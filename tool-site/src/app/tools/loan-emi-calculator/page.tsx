import type { Metadata } from "next";
import Link from "next/link";
import RelatedTools from "@/components/related-tools";
import LoanEmiCalculatorTool from "@/components/loan-emi-calculator-tool";

export const metadata: Metadata = {
  title: "Loan EMI Calculator Online Free - EMI, Interest, Amortization & Currency",
  description:
    "Use ToolMint's free loan EMI calculator to estimate monthly EMI, total interest, total repayment, amortization schedule, payment breakdown, and multi-currency loan results.",
  keywords: [
    "loan emi calculator",
    "emi calculator online free",
    "monthly emi calculator",
    "home loan emi calculator",
    "car loan emi calculator",
    "amortization schedule calculator",
    "loan interest calculator",
    "monthly payment calculator",
  ],
  alternates: { canonical: "/tools/loan-emi-calculator" },
  openGraph: {
    title: "Loan EMI Calculator Online Free | ToolMint",
    description:
      "Calculate monthly EMI, total interest, total repayment, amortization schedules, and payment breakdowns for any loan.",
    url: "/tools/loan-emi-calculator",
  },
};

const includedTools = [
  { title: "Monthly EMI Calculator", desc: "Calculate the fixed monthly payment for home, car, education, or personal loans." },
  { title: "Interest & Total Repayment", desc: "See total interest payable and the full repayment amount over the loan term." },
  { title: "Amortization Schedule", desc: "Review a month-by-month breakdown of principal and interest payments." },
  { title: "Payment Breakdown & Currency", desc: "Visualize the principal-interest split and work with multiple currency options." },
];

const steps = [
  { title: "Enter loan amount", desc: "Provide the principal amount you want to borrow." },
  { title: "Add interest and tenure", desc: "Enter the annual interest rate and loan duration in months or years." },
  { title: "Calculate EMI", desc: "The tool instantly shows your monthly EMI, total interest, and total repayment." },
  { title: "Review breakdowns", desc: "Use the amortization schedule and payment breakdown to see how each EMI is split." },
];

const faqs = [
  {
    q: "What is EMI?",
    a: "EMI stands for Equated Monthly Installment, the fixed monthly amount you pay toward repaying a loan over its full tenure.",
  },
  {
    q: "Can I use this for home, car, and personal loans?",
    a: "Yes. The calculator works for most standard installment loans as long as you know the amount, rate, and tenure.",
  },
  {
    q: "Does the tool show total interest payable?",
    a: "Yes. It shows monthly EMI, total interest paid over the full loan term, and total repayment amount.",
  },
  {
    q: "Does it include an amortization schedule?",
    a: "Yes. You can view a payment-by-payment amortization schedule showing how each EMI goes toward principal and interest.",
  },
  {
    q: "Is this EMI calculator free?",
    a: "Yes. It is free to use online with no signup required.",
  },
];

export default function LoanEmiCalculatorPage() {
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
          Loan EMI Calculator Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Estimate monthly loan payments accurately with ToolMint&apos;s EMI calculator. Enter your amount,
          interest rate, and tenure to see monthly EMI, total interest cost, total repayment, a detailed
          amortization schedule, and payment breakdown before you borrow.
        </p>

        <div className="mt-8">
          <LoanEmiCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Loan Tools
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
            How to Calculate Loan EMI Online
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

        <RelatedTools slug="loan-emi-calculator" />
      </main>
    </>
  );
}
