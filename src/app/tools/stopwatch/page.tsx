import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import StopwatchTool from "@/components/stopwatch-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Online Stopwatch – Countdown Timer with Lap Splits Free",
  description:
    "Free online stopwatch and countdown timer with lap splits and centisecond precision. Runs entirely in your browser — no install, no signup.",
  keywords: [
    "online stopwatch free",
    "stopwatch with lap timer",
    "countdown timer online free",
    "stopwatch online no download",
    "browser stopwatch timer",
    "lap timer online free",
    "online timer with laps",
    "centisecond stopwatch online",
  ],
  alternates: { canonical: "/tools/stopwatch" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Online Stopwatch – Countdown Timer with Lap Splits | ToolMint",
    description:
      "Run a stopwatch with lap tracking or switch to countdown mode. Centisecond precision, browser-based timing.",
    url: "/tools/stopwatch",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "Stopwatch Mode", desc: "Run an accurate stopwatch with live elapsed time, pause and resume support, and clean centisecond formatting for workouts or events." },
  { title: "Countdown Timer Mode", desc: "Switch to countdown mode, enter minutes and seconds, and let the timer run down with a clear completion state when time is up." },
  { title: "Lap Splits", desc: "Record lap times instantly while the stopwatch is running, including split order and a readable history of each recorded lap." },
  { title: "High-Precision Timing Engine", desc: "Uses performance.now() and requestAnimationFrame for smooth updates and accurate centisecond timing directly in your browser." },
];

const useCases = [
  { title: "Fitness & Sports", desc: "Time running intervals, gym sets, or swimming laps. Lap splits let you compare splits across your session without pausing the overall clock." },
  { title: "Cooking & Tasks", desc: "Use countdown mode for pasta timers, baking, or any fixed-duration task. The clear completion state tells you the moment time is up." },
  { title: "Presentations & Events", desc: "Time speeches, presentations, or game show rounds where centisecond accuracy keeps the event on schedule." },
];

const steps = [
  { title: "Choose a mode", desc: "Select Stopwatch mode for elapsed timing or Countdown mode if you need a timer that counts down to zero." },
  { title: "Start timing", desc: "Press Start to begin measuring time. In countdown mode, set your minutes and seconds before starting." },
  { title: "Pause or record laps", desc: "Pause and resume whenever needed, or record lap splits while the stopwatch continues running in the background." },
  { title: "Reset when finished", desc: "Use Reset to clear the timer and, if applicable, remove lap history or the completed countdown state." },
];

const faqs = [
  {
    q: "Does this tool include both a stopwatch and a countdown timer?",
    a: "Yes. ToolMint's Stopwatch page includes 2 modes: a stopwatch with lap tracking and a countdown timer with configurable minutes and seconds. Switching modes resets the previous state so timing stays clean.",
  },
  {
    q: "How accurate is the stopwatch?",
    a: "The stopwatch uses performance.now() together with requestAnimationFrame for high-resolution browser timing. It displays time to centiseconds in MM:SS.CS format, which is accurate enough for general timing, training, and everyday use.",
  },
  {
    q: "Can I record lap times?",
    a: "Yes. In stopwatch mode you can record lap splits while the timer continues to run. Each lap is stored in a running history so you can compare intervals after the session.",
  },
  {
    q: "What happens when the countdown reaches zero?",
    a: "The countdown stops automatically and shows a clear completion state so you know time is up. You can then reset the timer or enter a new time and run it again.",
  },
  {
    q: "Does the stopwatch work without installing an app?",
    a: "Yes. Everything runs directly in your browser with no install, no signup, and no data sent to a server.",
  },
];

export default function StopwatchPage() {
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
      <WebAppSchema slug="stopwatch" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Stopwatch" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Online Stopwatch &amp; Countdown Timer with Lap Splits
        </h1>

        <ProcessingBadge slug="stopwatch" />
        <ToolAnalytics slug="stopwatch" category="more" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Use a clean online stopwatch with lap splits, or switch to countdown mode for a quick timer.
          Runs entirely in the browser with centisecond precision and smooth updates powered
          by performance.now() and requestAnimationFrame. No install, no signup.
        </p>

        <div className="mt-8">
          <StopwatchTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Stopwatch Tools
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
            Who Uses an Online Stopwatch
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
            How to Use the Stopwatch
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
              Why Browser-Based Stopwatches Are More Accurate Than You Think
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Early browser timers had a reputation for inaccuracy because they were built on
              <code className="rounded bg-white/10 px-1 text-xs">setTimeout</code> and
              <code className="rounded bg-white/10 px-1 text-xs">setInterval</code> — both of which can drift significantly
              when the tab is throttled, the CPU is under load, or the browser deprioritizes background
              timers. Modern browsers solve this with <code className="rounded bg-white/10 px-1 text-xs">performance.now()</code>, a
              high-resolution monotonic timer that provides sub-millisecond precision relative to the page load
              time. Unlike <code className="rounded bg-white/10 px-1 text-xs">Date.now()</code> which can jump backward during system
              clock adjustments (NTP sync), <code className="rounded bg-white/10 px-1 text-xs">performance.now()</code> always moves
              forward at a consistent rate. This stopwatch pairs <code className="rounded bg-white/10 px-1 text-xs">performance.now()</code>
              with <code className="rounded bg-white/10 px-1 text-xs">requestAnimationFrame</code> for rendering — the display updates
              roughly every 16ms (60fps) but the underlying elapsed time measurement is always read fresh from
              the high-res timer, so display lag never accumulates into timing error. The result is centisecond
              accuracy that is reliable enough for sports timing, interval training, and event management.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Stopwatch vs Countdown Timer – When to Use Each
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              A stopwatch measures elapsed time from zero upward — it is the right tool when you want to
              know how long something takes. Use it for timing a 5K run, measuring how long a build script
              takes, recording the duration of a meeting, or tracking gym rest intervals with lap splits.
              The lap split feature is particularly useful for interval training: you record a lap at each
              interval boundary while the total elapsed time keeps running, so you end up with a complete
              picture of each split alongside the total duration. A countdown timer works in reverse — it
              starts at a target duration and counts down to zero. It is the right tool for cooking, baking,
              presentations, game show rounds, pomodoro work sessions, or any scenario where you need
              to be alerted when a fixed time has expired rather than track how long something took.
              Both modes share the same underlying timing engine so precision is identical in either direction.
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

        <RelatedTools slug="stopwatch" />
      </main>
    </>
  );
}
