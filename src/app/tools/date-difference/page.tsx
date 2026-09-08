import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import DateDifferenceTool from "@/components/date-difference-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Date Difference Calculator – Days Between Two Dates Free",
  description:
    "Calculate the exact number of days, hours, minutes, and weeks between any two dates. Free online date difference calculator — no signup, instant results.",
  keywords: [
    "date difference calculator online free",
    "days between two dates calculator",
    "how many days between dates",
    "date calculator days free",
    "weeks between two dates",
    "days until date calculator",
    "date duration calculator",
    "days between dates online",
  ],
  alternates: { canonical: "/tools/date-difference" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Date Difference Calculator – Days Between Two Dates | ToolMint",
    description:
      "Find the exact gap between two dates in days, hours, minutes, and a weeks-plus-days breakdown. Fast and browser-based.",
    url: "/tools/date-difference",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "Total Days Calculator", desc: "Find the full number of calendar days between a start date and an end date instantly." },
  { title: "Hours & Minutes Breakdown", desc: "See the same date difference translated into total hours and total minutes for planning or reporting purposes." },
  { title: "Weeks + Days Breakdown", desc: "Get a practical split of complete weeks and remaining days instead of only one large total day count." },
  { title: "Local Midnight Date Handling", desc: "The calculator normalizes local dates to avoid DST-related drift that can otherwise produce off-by-one day issues." },
];

const useCases = [
  { title: "Project & Deadline Tracking", desc: "Find how many days remain until a project due date, contract expiry, or exam date — see the full breakdown in days, weeks, and hours." },
  { title: "Travel Planning", desc: "Calculate how long until a trip, how long you stayed in a country for visa purposes, or days since your last visit." },
  { title: "Finance & Legal", desc: "Determine notice periods, invoice due dates, loan term lengths, or days elapsed since a contract signing." },
];

const steps = [
  { title: "Choose a start date", desc: "Select the first date using the browser date picker." },
  { title: "Choose an end date", desc: "Pick the second date you want to compare against. The tool warns if the end date is earlier than the start date." },
  { title: "Read the totals", desc: "View the exact difference in total days, total hours, and total minutes as soon as both dates are valid." },
  { title: "Check the breakdown", desc: "Use the weeks-plus-days result for a more human-friendly summary of the date gap." },
];

const faqs = [
  {
    q: "What does this date difference calculator show?",
    a: "ToolMint's Date Difference Calculator shows 4 useful outputs for the same date range: total days, total hours, total minutes, and a weeks-plus-days breakdown.",
  },
  {
    q: "Does the calculator count exact calendar days?",
    a: "Yes. The tool is built around local date handling so it computes the difference using normalized local dates rather than raw timestamps alone, which helps avoid off-by-one problems around daylight saving changes.",
  },
  {
    q: "Can I calculate weeks between two dates?",
    a: "Yes. In addition to total days, the tool breaks the result into complete weeks and remaining days. That makes it useful for schedules, project timelines, and event planning.",
  },
  {
    q: "What happens if the end date is before the start date?",
    a: "The calculator validates the range and shows a warning if the end date is earlier than the start date. You need to pick a valid range before results are shown.",
  },
  {
    q: "Can I use this for deadlines and project planning?",
    a: "Yes. The total days, hours, minutes, and weeks-plus-days views make it useful for planning deadlines, vacations, school terms, subscriptions, and countdown-style date checks.",
  },
];

export default function DateDifferencePage() {
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
      <WebAppSchema slug="date-difference" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Date Difference Calculator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Date Difference Calculator — Days, Hours, Minutes &amp; Weeks
        </h1>

        <ProcessingBadge slug="date-difference" />
        <ToolAnalytics slug="date-difference" category="more" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Pick a start date and end date to calculate the exact difference in days, hours, and minutes.
          Also shows the result as complete weeks plus remaining days, with local date handling
          designed to avoid DST drift and off-by-one calendar errors.
        </p>

        <div className="mt-8">
          <DateDifferenceTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Date Difference Tools
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
            When to Use a Date Difference Calculator
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {useCases.map((u) => (
              <div key={u.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{u.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{u.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Use the Date Difference Calculator
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{index + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Why Date Difference Calculations Can Be Tricky – DST and Calendar Math
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Calculating days between two dates seems simple — subtract the earlier date from the later
              one. But naive timestamp subtraction produces incorrect results near daylight saving time (DST)
              transitions. When clocks move forward by one hour in spring, a day that crosses the transition
              is only 23 hours long; when they move back in autumn, one day is 25 hours long. A calculation
              based on raw milliseconds and dividing by 86,400,000 (ms/day) will report the wrong number for
              any range that crosses a DST boundary in the user&apos;s timezone — typically 1 day off. This
              calculator normalizes both dates to local midnight before computing the difference, which removes
              the DST problem by ensuring each &quot;day&quot; in the calculation is a calendar day regardless of clock
              changes. The same approach is used in spreadsheet applications like Excel and Google Sheets when
              doing DATEDIF calculations. For exact hours and minutes, the tool uses the raw timestamp
              difference since those measurements genuinely depend on clock time, not just calendar days.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Practical Uses: Deadlines, Visa Days, EMI Periods, and Age Checks
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The most common use cases for a date difference calculator fall into four categories. Project
              management: teams calculating sprint lengths, time remaining until a deadline, or days elapsed
              since a milestone was completed. Travel and immigration: calculating how many days you have
              spent in a country for visa compliance (Schengen 90/180 rule, for example, requires tracking
              the exact number of days in a rolling 180-day window). Finance and legal: counting the exact
              number of days in a notice period, between invoice date and due date, between loan disbursement
              and first EMI date, or between signing a contract and its expiry. Education: counting days until
              an exam, school term length, or days since enrollment. The weeks-plus-days breakdown is
              particularly useful for human-friendly communication — &quot;the deadline is 3 weeks and 4 days
              away&quot; is more actionable than &quot;the deadline is 25 days away&quot; when you are planning week by week.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <dt className="font-semibold text-foreground">{faq.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <RelatedTools slug="date-difference" />
      </main>
    </>
  );
}
