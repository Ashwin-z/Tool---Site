import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import LoanEmiCalculatorTool from "@/components/loan-emi-calculator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Loan EMI Calculator – Monthly Payment, Total Interest & Amortization",
  description:
    "Calculate loan EMI online for any home, car, or personal loan. See monthly payment, total interest, full repayment amount, and a complete amortization schedule. Free, instant.",
  keywords: [
    "loan emi calculator with amortization schedule",
    "home loan emi calculator india",
    "car loan emi calculator",
    "emi calculator monthly payment",
    "personal loan emi calculator online",
    "loan interest calculator total repayment",
    "how much emi on 20 lakh loan",
    "emi on home loan india",
  ],
  alternates: { canonical: "/tools/loan-emi-calculator" },
  openGraph: {
    title: "Loan EMI Calculator – Monthly Payment, Interest & Amortization | ToolMint",
    description:
      "Calculate monthly EMI, total interest, and amortization schedule for any home, car, or personal loan instantly.",
    url: "/tools/loan-emi-calculator",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Before taking a home loan",
    desc: "Calculate your monthly EMI and total interest before signing a home loan to understand the full repayment burden over the tenure.",
  },
  {
    title: "Comparing loan offers",
    desc: "Run the calculator for each offer with different interest rates and tenures to find which combination keeps total interest lowest.",
  },
  {
    title: "Planning prepayment",
    desc: "Use the amortization schedule to see how much principal remains at any point, helping you decide when prepayment reduces interest most.",
  },
];

const steps = [
  { title: "Enter loan amount", desc: "Provide the principal amount you want to borrow." },
  { title: "Add interest and tenure", desc: "Enter the annual interest rate and loan duration in months or years." },
  { title: "Calculate EMI", desc: "See your monthly EMI, total interest, and total repayment instantly." },
  { title: "Review amortization", desc: "Check the month-by-month schedule to see how principal and interest split over time." },
];

const faqs = [
  {
    q: "How is EMI calculated?",
    a: "EMI is calculated using the formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P is the principal, r is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the number of monthly installments.",
  },
  {
    q: "Does the EMI stay the same throughout the loan?",
    a: "Yes, for fixed-rate loans the EMI amount stays constant. What changes each month is the proportion going toward principal vs. interest — early EMIs are mostly interest; later EMIs are mostly principal.",
  },
  {
    q: "What is the total interest on a 20-lakh home loan at 8.5% for 20 years?",
    a: "At 8.5% for 240 months on ₹20 lakh, the monthly EMI is approximately ₹17,356, and total interest paid over 20 years is around ₹21.65 lakh — more than the original principal.",
  },
  {
    q: "Does prepayment reduce the EMI or the tenure?",
    a: "Most Indian banks apply prepayment to reduce tenure while keeping EMI constant, which reduces total interest significantly. Some lenders offer the choice — check your loan agreement.",
  },
  {
    q: "Can I use this for personal and car loans?",
    a: "Yes. Enter any loan amount, rate, and tenure regardless of loan type. The formula applies to all standard installment-based loans.",
  },
];

export default function LoanEmiCalculatorPage() {
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
      <WebAppSchema slug="loan-emi-calculator" />
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
            { name: "Loan EMI Calculator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Loan EMI Calculator – Monthly Payment, Total Interest & Amortization Schedule
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Estimate your monthly loan payment accurately before you borrow. Enter the loan
          amount, annual interest rate, and tenure to see EMI, total interest payable, total
          repayment amount, and a complete month-by-month amortization schedule.
        </p>

        <div className="mt-8">
          <LoanEmiCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Use an EMI Calculator
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
            How to Calculate Loan EMI
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
              How Interest Rate and Tenure Affect Your EMI
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Two variables have the largest impact on your monthly EMI: the interest rate and
              the loan tenure. A higher interest rate directly increases both the EMI and the
              total interest paid. For a ₹30 lakh home loan at 7% for 20 years, the EMI is
              approximately ₹23,259 and total interest is ₹25.8 lakh. At 9%, the EMI jumps to
              ₹26,992 and total interest reaches ₹34.8 lakh — ₹9 lakh more for a 2-percentage-
              point difference. Tenure has the opposite trade-off: a longer tenure reduces the
              monthly EMI but dramatically increases total interest. Extending the same ₹30 lakh
              loan from 15 to 25 years at 8% drops the monthly EMI by about ₹4,000 but adds
              nearly ₹15 lakh in total interest. Use the calculator to run both scenarios
              before deciding on tenure.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Reading the Amortization Schedule
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The amortization schedule shows how each monthly EMI is split between principal
              repayment and interest payment throughout the loan tenure. In the early months,
              a large portion of each EMI goes toward interest and a small portion reduces the
              principal. As the loan matures, this flips — more of each payment reduces the
              outstanding principal and less goes to interest. This is called front-loading of
              interest, and it is why prepaying a loan in the first few years saves significantly
              more interest than prepaying in the last few years. The schedule here lets you
              scroll to any month to see the exact breakdown, helping you identify the best
              window for a lump-sum prepayment if you receive a bonus, inheritance, or other
              windfall.
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

        <RelatedTools slug="loan-emi-calculator" />
      </main>
    </>
  );
}
