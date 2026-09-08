import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import WorkHoursCalculatorTool from "@/components/work-hours-calculator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Work Hours Calculator – Track Hours, Overtime & Pay Online Free",
  description:
    "Calculate work hours and total pay online for free. Track daily hours, add lunch breaks, compute overtime, and estimate weekly earnings. Timesheet calculator included.",
  keywords: [
    "work hours calculator with lunch break",
    "timesheet calculator online free",
    "overtime hours calculator",
    "weekly work hours calculator",
    "hours worked calculator online",
    "calculate pay from hours worked",
    "shift hours calculator",
    "total work hours per week calculator",
  ],
  alternates: { canonical: "/tools/work-hours-calculator" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Work Hours Calculator – Timesheet, Overtime & Pay | ToolMint",
    description:
      "Calculate work hours per day or week, deduct lunch breaks, compute overtime, and estimate total pay. Free timesheet calculator.",
    url: "/tools/work-hours-calculator",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Freelancers and contractors",
    desc: "Track hours per project or client to generate accurate invoices and ensure you are billing for all time worked.",
  },
  {
    title: "Shift workers and hourly employees",
    desc: "Calculate total hours across multiple shifts, deduct break times, and find total weekly hours before submitting a timesheet.",
  },
  {
    title: "Payroll verification",
    desc: "Cross-check employer payslips by entering your hours worked and hourly rate to verify total pay and overtime calculation.",
  },
];

const steps = [
  { title: "Enter start and end times", desc: "Provide clock-in and clock-out times for each shift or workday." },
  { title: "Add break time", desc: "Enter lunch break or total break duration in minutes." },
  { title: "Set hourly rate (optional)", desc: "Add your pay rate to calculate total earnings alongside hours." },
  { title: "View total hours and pay", desc: "See daily hours, weekly total, overtime, and estimated earnings." },
];

const faqs = [
  {
    q: "How do I calculate work hours with a lunch break?",
    a: "Subtract the break duration from the total time between start and end. For example, 9:00 AM to 5:30 PM is 8.5 hours. Minus 30 minutes lunch = 8 hours worked.",
  },
  {
    q: "How is overtime calculated?",
    a: "In India, most employment laws consider hours beyond 9 hours per day or 48 hours per week as overtime, payable at double the ordinary rate. Check your specific employment contract or industry rules for the applicable threshold.",
  },
  {
    q: "Can I calculate pay for multiple shifts?",
    a: "Yes. Add multiple shifts per day or across the week and the calculator totals all hours and pay, applying overtime rules where applicable.",
  },
  {
    q: "How do I convert hours and minutes to decimal?",
    a: "Divide minutes by 60. For example, 7 hours 45 minutes = 7 + (45 ÷ 60) = 7.75 hours. This calculator handles the conversion automatically.",
  },
  {
    q: "Is this calculator suitable for night shift work?",
    a: "Yes. Enter the start time (e.g., 10 PM) and end time on the next day (e.g., 6 AM) and the calculator handles the midnight rollover correctly.",
  },
];

export default function WorkHoursCalculatorPage() {
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
      <WebAppSchema slug="work-hours-calculator" />
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
            { name: "Work Hours Calculator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Work Hours Calculator – Track Hours, Overtime & Pay
        </h1>

        <ProcessingBadge slug="work-hours-calculator" />
        <ToolAnalytics slug="work-hours-calculator" category="calculators" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Calculate total work hours across shifts, deduct break times, compute overtime, and
          estimate total pay. Works for daily, weekly, and multi-shift schedules. Useful for
          freelancers, shift workers, and anyone verifying a timesheet.
        </p>

        <div className="mt-8">
          <WorkHoursCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Who Uses a Work Hours Calculator
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
            How to Calculate Work Hours
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
              Overtime Rules in India: What You Need to Know
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Overtime regulations in India vary by sector and state. Under the Factories
              Act, 1948, workers cannot work more than 9 hours per day or 48 hours per week
              without overtime pay. Overtime is mandated at twice the ordinary wage rate.
              For shops and establishments, the respective state Shops and Establishments
              Act applies — most states cap regular hours at 8–9 hours per day and 48–54
              hours per week. The Minimum Wages Act ensures a baseline rate on which
              overtime is calculated. IT and software employees in most states are exempt
              from the Factories Act but covered by state IT/ITES-specific rules or their
              employment contracts. Contractual overtime terms may differ from statutory
              minimums — check your appointment letter for the applicable threshold and rate.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Freelancer Billing: How to Track Billable Hours Accurately
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Accurate time tracking is the foundation of freelancer invoicing. The most
              common billing errors are: rounding down small increments (losing 15–30 min
              per task adds up to hours per week), forgetting communication time (emails,
              calls, and review meetings are billable), and not tracking revision rounds.
              Use a work hours calculator to log start and end time for each session,
              subtract non-work time, and sum the week before generating an invoice. For
              fixed-price projects, tracking hours still helps estimate profitability: divide
              the project fee by total hours to find your effective hourly rate and compare
              it to your target rate. If the effective rate is consistently below target,
              either scope is expanding or estimation needs adjusting.
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

        <RelatedTools slug="work-hours-calculator" />
      </main>
    </>
  );
}
