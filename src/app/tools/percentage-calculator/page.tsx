import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import PercentageCalculatorTool from "@/components/percentage-calculator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Percentage Calculator – Find X% of Y, Increase, Decrease & Reverse",
  description:
    "Calculate any percentage online for free. Find X% of Y, percentage increase or decrease, percentage difference, what percent one number is of another, and reverse percentage. Instant.",
  keywords: [
    "percentage calculator online free",
    "percent increase decrease calculator",
    "what percent of a number calculator",
    "percentage change calculator",
    "reverse percentage calculator",
    "percentage difference between two numbers",
    "how to calculate percentage of marks",
    "x percent of y calculator",
  ],
  alternates: { canonical: "/tools/percentage-calculator" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Percentage Calculator – X% of Y, Increase, Decrease & Reverse | ToolMint",
    description:
      "Find any percentage, calculate increase or decrease, work out reverse percentages, and compare differences. Free, instant.",
    url: "/tools/percentage-calculator",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Calculating marks percentage",
    desc: "Divide your total marks by the maximum marks and multiply by 100. Or use the 'X is what % of Y' mode to get the result directly.",
  },
  {
    title: "Discount and sale prices",
    desc: "Find the exact price after a 20%, 30%, or custom discount by entering the original price and the percentage off.",
  },
  {
    title: "Tracking percentage change",
    desc: "Calculate revenue growth, score improvement, or price changes by entering the old and new values in the percentage change mode.",
  },
];

const steps = [
  { title: "Choose calculation type", desc: "Select from: X% of Y, percent increase/decrease, what percent is X of Y, or reverse percentage." },
  { title: "Enter values", desc: "Provide the numbers for your chosen calculation type." },
  { title: "Get result instantly", desc: "The result updates as you type with no button needed." },
  { title: "Copy or use", desc: "Copy the result or read the working shown below the answer." },
];

const faqs = [
  {
    q: "How do I calculate the percentage of marks?",
    a: "Divide your obtained marks by the total marks and multiply by 100. Example: 450 out of 600 = (450 ÷ 600) × 100 = 75%. Use the 'What percent is X of Y' mode here and enter obtained marks and total marks.",
  },
  {
    q: "How do I calculate a percentage increase?",
    a: "Percentage increase = ((New Value − Old Value) ÷ Old Value) × 100. Example: price increased from ₹500 to ₹650 = ((650−500) ÷ 500) × 100 = 30% increase.",
  },
  {
    q: "What is reverse percentage?",
    a: "Reverse percentage finds the original value before a percentage was applied. If a price after 20% increase is ₹1,200, the original is ₹1,200 ÷ 1.20 = ₹1,000. Useful for finding pre-tax or pre-discount amounts.",
  },
  {
    q: "How do I find what percent one number is of another?",
    a: "Divide the part by the whole and multiply by 100. Example: 45 is what percent of 180? (45 ÷ 180) × 100 = 25%.",
  },
  {
    q: "What is the difference between percentage change and percentage difference?",
    a: "Percentage change compares a new value to a specific old value (directional). Percentage difference compares two values without a direction — it is the absolute difference divided by the average of the two values, multiplied by 100.",
  },
];

export default function PercentageCalculatorPage() {
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
      <WebAppSchema slug="percentage-calculator" />
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
            { name: "Percentage Calculator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Percentage Calculator – Find X% of Y, Increase, Decrease & Reverse
        </h1>

        <ProcessingBadge slug="percentage-calculator" />
        <ToolAnalytics slug="percentage-calculator" category="calculators" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Solve any percentage problem instantly. Find what X% of Y is, calculate percentage
          increase or decrease between two numbers, work out what percentage one number is of
          another, find the reverse percentage, or compare two values by their percentage
          difference. All modes in one calculator, free and instant.
        </p>

        <div className="mt-8">
          <PercentageCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Common Percentage Calculations
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
            How to Use the Percentage Calculator
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
              Understanding Percentage Increase vs. Decrease
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Percentage increase and decrease are both forms of percentage change — the
              direction depends on whether the new value is higher or lower than the original.
              The formula is the same: ((New − Old) ÷ Old) × 100. If the result is positive,
              it is an increase; if negative, it is a decrease. Common uses include calculating
              salary hikes (base salary increased from ₹40,000 to ₹46,000 = 15% increase),
              tracking price changes (petrol price rose from ₹95 to ₹102 = 7.37% increase),
              and measuring score improvement (marks improved from 68% to 78% = 14.7%
              increase). Note that a 50% decrease followed by a 50% increase does not return
              to the original — a value of 100 halved to 50 and then increased by 50% becomes
              75, not 100. This asymmetry matters in financial and investment contexts.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How to Calculate Percentage of Marks for Exams
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              To calculate your exam percentage, divide total marks obtained by the maximum
              possible marks, then multiply by 100. If you scored 418 out of 500, your
              percentage is (418 ÷ 500) × 100 = 83.6%. For competitive exams with multiple
              subjects, calculate the aggregate by summing all obtained marks and dividing by
              the total maximum marks across subjects. Some exams use normalized scoring or
              percentile ranks instead of raw percentages — those are different concepts. This
              calculator handles the standard marks-to-percentage conversion. Use the
              &ldquo;What percent is X of Y&rdquo; mode and enter your marks as X and maximum marks as Y
              to get the result in one step.
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

        <RelatedTools slug="percentage-calculator" />
      </main>
    </>
  );
}
