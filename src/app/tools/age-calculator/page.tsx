import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import AgeCalculatorTool from "@/components/age-calculator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Age Calculator – Find Your Exact Age in Years, Months & Days",
  description:
    "Calculate your exact age from your date of birth online for free. See age in years, months, days, hours, and minutes. Find days until next birthday. Instant, no signup.",
  keywords: [
    "age calculator from date of birth",
    "exact age calculator online",
    "how old am i calculator",
    "days until my birthday calculator",
    "age difference calculator",
    "age in days months years calculator",
    "date of birth age calculator",
    "how many days old am i",
  ],
  alternates: { canonical: "/tools/age-calculator" },
  openGraph: {
    title: "Age Calculator – Exact Age in Years, Months, Days & Hours | ToolMint",
    description:
      "Find your exact age from any date of birth — in years, months, days, and hours. Plus days until next birthday.",
    url: "/tools/age-calculator",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Forms and applications",
    desc: "Many government, insurance, and HR forms require exact age or confirm a specific age threshold. Get the precise number instantly.",
  },
  {
    title: "Age difference between two people",
    desc: "Find the exact difference in years, months, and days between two dates — useful for birthday comparisons, timelines, and eligibility checks.",
  },
  {
    title: "Countdown to next birthday",
    desc: "See how many days remain until your birthday, or calculate a specific date in the future.",
  },
];

const steps = [
  { title: "Enter date of birth", desc: "Provide the birth date using the date picker." },
  { title: "Set reference date", desc: "Use today's date or enter a custom date to calculate age as of that point." },
  { title: "View exact age", desc: "See your age in years, months, days, hours, and minutes." },
  { title: "Check birthday countdown", desc: "See the number of days remaining until the next birthday." },
];

const faqs = [
  {
    q: "How is exact age calculated?",
    a: "Exact age counts the number of complete years, then the remaining complete months, then the remaining days from the date of birth to the reference date. Leap years are accounted for correctly.",
  },
  {
    q: "Can I calculate age difference between two people?",
    a: "Yes. Enter one person's date of birth as the birth date and the other's as the reference date, or use the age difference mode to compare two birth dates directly.",
  },
  {
    q: "Why does my age in days change every day?",
    a: "Because your age in days is the total number of days elapsed since your birth date. It increases by 1 every day. This calculator shows the exact count as of today.",
  },
  {
    q: "Can I calculate age as of a past or future date?",
    a: "Yes. Change the reference date from today to any custom date to calculate age at a specific point in time — useful for historical records, event planning, and eligibility checks.",
  },
  {
    q: "What is the minimum age for government schemes?",
    a: "Many Indian government schemes and benefits have age eligibility criteria. Use this calculator to confirm whether a birth date meets a specific minimum or maximum age requirement as of a given date.",
  },
];

export default function AgeCalculatorPage() {
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
      <WebAppSchema slug="age-calculator" />
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
            { name: "Age Calculator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Age Calculator – Find Exact Age from Date of Birth
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Enter any date of birth to instantly find the exact age in years, months, days, hours,
          and minutes as of today or any custom reference date. Also shows days until the next
          birthday and total days lived.
        </p>

        <div className="mt-8">
          <AgeCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Use an Age Calculator
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
            How to Find Your Exact Age
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
              Why Exact Age Matters for Eligibility and Documents
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Many official contexts require precise age rather than a year count. Government
              job applications in India typically have upper age limits with specific cutoff
              dates — being one day over the limit disqualifies a candidate. UPSC, SSC, and
              state PSC exams all specify age eligibility as of a particular date, not just the
              year. Scholarship applications often require candidates to be below a specified
              age on the date of application. Insurance policies have age-banded premiums where
              a single birthday crossing can move someone to a higher bracket. Senior citizen
              benefits in India begin at age 60 — the exact date matters for accessing
              concessions on rail travel, tax exemptions, and bank interest rates. This
              calculator handles all of these by letting you set any reference date and get
              the precise age down to the day.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Age in Days: How Many Days Old Are You?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Your age in days is the total number of calendar days elapsed from your date of
              birth to today, including leap years. The average person lives approximately
              29,000 days. At 20 years old you have lived roughly 7,300 days. At 30, about
              10,958 days. At 60, around 21,915 days. The exact count varies because of
              leap years — February 29 adds an extra day every four years. This calculator
              accounts for all leap years between the birth date and the reference date for
              a precise count.
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

        <RelatedTools slug="age-calculator" />
      </main>
    </>
  );
}
