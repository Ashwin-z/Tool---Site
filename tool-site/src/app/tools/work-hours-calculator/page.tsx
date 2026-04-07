import type { Metadata } from "next";
import Link from "next/link";
import WorkHoursCalculatorTool from "@/components/work-hours-calculator-tool";

export const metadata: Metadata = {
  title: "Work Hours Calculator Online Free - Weekly Hours, Breaks, Overtime & Pay",
  description:
    "Use ToolMint's free work hours calculator to track weekly hours, break deductions, overtime, average daily time, and estimated pay from an hourly rate.",
  keywords: [
    "work hours calculator",
    "timesheet calculator",
    "weekly hours calculator",
    "work hours calculator online free",
    "pay calculator hourly",
    "overtime calculator",
    "shift hours calculator",
    "time tracker calculator",
  ],
  alternates: { canonical: "/tools/work-hours-calculator" },
  openGraph: {
    title: "Work Hours Calculator Online Free | ToolMint",
    description:
      "Track weekly hours, break deductions, overtime, and pay with an easy browser-based work hours calculator.",
    url: "/tools/work-hours-calculator",
  },
};

const includedTools = [
  { title: "Weekly Schedule Tracker", desc: "Add start times, end times, and active workdays across the week." },
  { title: "Break Deduction Calculator", desc: "Subtract unpaid breaks from shift totals automatically." },
  { title: "Hours & Overtime Summary", desc: "Review total weekly hours, average daily time, and overtime indicators." },
  { title: "Pay Estimator", desc: "Enter an hourly rate to estimate weekly and monthly earnings from worked hours." },
];

const steps = [
  { title: "Enter shift times", desc: "Add your daily start time, end time, and break duration." },
  { title: "Add hourly pay", desc: "Optional: enter your hourly rate to estimate earnings automatically." },
  { title: "Calculate totals", desc: "The tool sums weekly hours, average hours, and overtime if applicable." },
  { title: "Review pay summary", desc: "See estimated daily, weekly, or monthly pay based on the hours entered." },
];

const faqs = [
  {
    q: "What does the work hours calculator measure?",
    a: "It calculates worked hours based on start times, end times, and breaks, then summarizes totals and estimated pay.",
  },
  {
    q: "Can I subtract break time?",
    a: "Yes. You can enter break durations so unpaid time is removed from the total hours worked.",
  },
  {
    q: "Does it estimate pay?",
    a: "Yes. If you enter an hourly rate, the calculator can estimate earnings from the hours worked.",
  },
  {
    q: "Does this page help track overtime?",
    a: "Yes. It summarizes weekly hours and helps you monitor overtime alongside total worked time and pay estimates.",
  },
  {
    q: "Is this work hours calculator free?",
    a: "Yes. It is free to use online with no signup required.",
  },
];

export default function WorkHoursCalculatorPage() {
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
          Work Hours Calculator Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Track worked time and estimate earnings more accurately with ToolMint&apos;s work hours calculator.
          Add daily shifts, subtract breaks, total weekly hours, monitor overtime, and estimate pay from your hourly rate.
        </p>

        <div className="mt-8">
          <WorkHoursCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Work Time Tools
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
            How to Calculate Work Hours Online
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
