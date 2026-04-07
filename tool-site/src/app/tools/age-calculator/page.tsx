import type { Metadata } from "next";
import Link from "next/link";
import AgeCalculatorTool from "@/components/age-calculator-tool";

export const metadata: Metadata = {
  title: "Age Calculator Online Free - Exact Age, Birthday Countdown & Milestones",
  description:
    "Use ToolMint's free age calculator to find exact age from date of birth, next birthday countdown, zodiac sign, generation, leap year details, and age milestones.",
  keywords: [
    "age calculator",
    "age calculator online free",
    "exact age calculator",
    "date of birth age calculator",
    "dob calculator",
    "birthday countdown calculator",
    "age milestones calculator",
    "zodiac sign calculator",
  ],
  alternates: { canonical: "/tools/age-calculator" },
  openGraph: {
    title: "Age Calculator Online Free | ToolMint",
    description:
      "Find exact age from date of birth in years, months, days, hours, and more with instant birthday insights.",
    url: "/tools/age-calculator",
  },
};

const includedTools = [
  { title: "Exact Age From DOB", desc: "Calculate age in years, months, days, hours, minutes, and seconds." },
  { title: "Birthday Countdown", desc: "See how long remains until the next birthday and upcoming age milestone." },
  { title: "Zodiac & Generation", desc: "Get zodiac sign, generation classification, birthstone, and day-of-week insights." },
  { title: "Milestones & Totals", desc: "Track major age milestones like 1,000 days, 10,000 days, and other life counters." },
];

const steps = [
  { title: "Enter date of birth", desc: "Choose the birth date you want to calculate from." },
  { title: "Set comparison date", desc: "Use today or enter another date to calculate age at a specific point in time." },
  { title: "View exact age", desc: "See age in years, months, days, and other detailed time units instantly." },
  { title: "Check extra insights", desc: "Review next birthday countdown, milestones, zodiac, generation, and other fun details." },
];

const faqs = [
  {
    q: "How does the age calculator work?",
    a: "It compares a birth date with the current date or a custom reference date and returns the exact difference in years, months, days, and smaller time units.",
  },
  {
    q: "Can I calculate age on a past or future date?",
    a: "Yes. You can use a custom comparison date to find someone's age on any past or future date.",
  },
  {
    q: "Does it account for leap years?",
    a: "Yes. The calculation accounts for leap years and varying month lengths for accurate results.",
  },
  {
    q: "Can I see more than just years and months?",
    a: "Yes. The tool can show age in years, months, days, hours, minutes, and seconds along with milestone information.",
  },
  {
    q: "Is this age calculator free?",
    a: "Yes. It is free to use with no signup required.",
  },
];

export default function AgeCalculatorPage() {
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
          Age Calculator Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Find your exact age from a date of birth with ToolMint&apos;s free age calculator. Get a precise
          result in years, months, and days, plus birthday countdowns, milestone tracking, zodiac insights,
          generation details, and other useful age-based information in one place.
        </p>

        <div className="mt-8">
          <AgeCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Age Tools
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
            How to Calculate Exact Age Online
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
