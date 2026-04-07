import type { Metadata } from "next";
import Link from "next/link";
import TipCalculatorTool from "@/components/tip-calculator-tool";

export const metadata: Metadata = {
  title: "Tip Calculator Online Free - Split Bills, Custom Tip & Per Person Cost",
  description:
    "Use ToolMint's free tip calculator to quickly calculate tips, split bills between friends, compare tip percentages, and find the total cost per person.",
  keywords: [
    "tip calculator",
    "tip calculator online free",
    "bill split calculator",
    "restaurant tip calculator",
    "tip percentage calculator",
    "split bill calculator",
    "gratuity calculator",
    "how much to tip calculator",
  ],
  alternates: { canonical: "/tools/tip-calculator" },
  openGraph: {
    title: "Tip Calculator Online Free | ToolMint",
    description:
      "Calculate tips instantly, split bills between people, and compare tip percentages side-by-side.",
    url: "/tools/tip-calculator",
  },
};

const includedTools = [
  { title: "Custom Tip Percentage", desc: "Choose from quick presets or enter any custom tip percentage." },
  { title: "Bill Splitting", desc: "Divide the total evenly between any number of people." },
  { title: "Tip Comparison Table", desc: "Compare different tip percentages side-by-side to decide the best fit." },
  { title: "Per Person Breakdown", desc: "See tip and total amounts per person when splitting the bill." },
];

const steps = [
  { title: "Enter bill amount", desc: "Type in your total bill amount before tip." },
  { title: "Choose tip percentage", desc: "Select a quick preset like 15% or 20%, or enter a custom percentage." },
  { title: "Set number of people", desc: "Enter how many people are splitting the bill." },
  { title: "View the breakdown", desc: "See tip amount, total cost, per-person amounts, and a comparison table." },
];

const faqs = [
  {
    q: "How do I calculate tip on a bill?",
    a: "Enter your bill total and select a tip percentage. The calculator multiplies the bill by the tip rate and adds it to the total. For example, a 15% tip on $50 is $7.50, making the total $57.50.",
  },
  {
    q: "What is a good tip percentage?",
    a: "In the United States, 15-20% is standard for restaurant service. 18-25% is common for excellent service. Tipping customs vary by country.",
  },
  {
    q: "Can I split the bill between multiple people?",
    a: "Yes. Enter the number of people and the calculator divides both the tip and total evenly among everyone.",
  },
  {
    q: "Does this tip calculator work for any currency?",
    a: "Yes. The calculator works with any currency — just enter the bill amount in your local currency. The dollar sign is shown as a reference.",
  },
  {
    q: "Is this tip calculator free?",
    a: "Yes. It is completely free with no signup required and works instantly in your browser.",
  },
];

export default function TipCalculatorPage() {
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
          Tip Calculator Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Calculate tips in seconds with ToolMint&apos;s free tip calculator. Enter your bill amount,
          pick a tip percentage, split the bill between friends, and compare different tip rates all in one place.
        </p>

        <div className="mt-8">
          <TipCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Tip Tools
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
            How to Calculate Tips Online
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
