import type { Metadata } from "next";
import Link from "next/link";
import DateDifferenceTool from "@/components/date-difference-tool";

export const metadata: Metadata = {
  title: "Date Difference Calculator — Days, Hours & Weeks Between Dates | ToolMint",
  description:
    "Calculate the exact difference between two dates in days, hours, minutes, and weeks. ToolMint's free Date Difference Calculator handles local dates cleanly and avoids DST drift.",
  keywords: [
    "date difference calculator",
    "days between dates",
    "weeks between dates",
    "hours between dates",
    "minutes between dates",
    "date duration calculator",
    "how many days between two dates",
    "date calculator online",
    "date gap calculator",
    "calendar day difference",
    "toolmint date difference",
    "date difference in weeks and days",
  ],
  alternates: { canonical: "/tools/date-difference" },
  openGraph: {
    title: "Date Difference Calculator — Days, Hours & Weeks Between Dates | ToolMint",
    description:
      "Find the exact gap between two dates in days, hours, minutes, and a weeks-plus-days breakdown. Fast and browser-based.",
    url: "/tools/date-difference",
  },
};

const includedTools = [
  {
    title: "Total Days Calculator",
    desc: "Find the full number of calendar days between a start date and an end date instantly.",
  },
  {
    title: "Hours & Minutes Breakdown",
    desc: "See the same date difference translated into total hours and total minutes for planning or reporting purposes.",
  },
  {
    title: "Weeks + Days Breakdown",
    desc: "Get a practical split of complete weeks and remaining days instead of only one large total day count.",
  },
  {
    title: "Local Midnight Date Handling",
    desc: "The calculator normalizes local dates to avoid DST-related drift that can otherwise produce off-by-one day issues.",
  },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Date Difference Calculator — Days, Hours, Minutes &amp; Weeks
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Pick a start date and end date to calculate the exact difference in days, hours, and minutes.
          ToolMint also shows the result as complete weeks plus remaining days, with local date handling
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
      </main>
    </>
  );
}
