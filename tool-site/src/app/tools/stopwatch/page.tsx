import type { Metadata } from "next";
import Link from "next/link";
import StopwatchTool from "@/components/stopwatch-tool";

export const metadata: Metadata = {
  title: "Stopwatch & Countdown Timer — Lap Splits, Centiseconds | ToolMint",
  description:
    "Use ToolMint's free Stopwatch and Countdown Timer with lap splits, centisecond precision, and browser-based timing powered by performance.now(). Fast and accurate.",
  keywords: [
    "stopwatch",
    "online stopwatch",
    "lap timer",
    "countdown timer",
    "centisecond stopwatch",
    "browser stopwatch",
    "performance now stopwatch",
    "lap split timer",
    "online timer with laps",
    "stopwatch and countdown",
    "toolmint stopwatch",
    "accurate stopwatch online",
  ],
  alternates: { canonical: "/tools/stopwatch" },
  openGraph: {
    title: "Stopwatch & Countdown Timer — Lap Splits, Centiseconds | ToolMint",
    description:
      "Run a stopwatch with lap tracking or switch to countdown mode for a quick timer. Centisecond precision and browser-based timing.",
    url: "/tools/stopwatch",
  },
};

const includedTools = [
  {
    title: "Stopwatch Mode",
    desc: "Run an accurate stopwatch with live elapsed time, pause and resume support, and clean centisecond formatting for workouts or events.",
  },
  {
    title: "Countdown Timer Mode",
    desc: "Switch to countdown mode, enter minutes and seconds, and let the timer run down with a clear completion state when time is up.",
  },
  {
    title: "Lap Splits",
    desc: "Record lap times instantly while the stopwatch is running, including split order and a readable history of each recorded lap.",
  },
  {
    title: "High-Precision Timing Engine",
    desc: "Uses performance.now() and requestAnimationFrame for smooth updates and accurate centisecond timing directly in your browser.",
  },
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
    a: "Yes. Everything runs directly in your browser with no install, no signup, and no data sent to a server. It works as a quick browser-based stopwatch and timer.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Stopwatch &amp; Countdown Timer with Lap Splits
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Use a clean online stopwatch with lap splits, or switch to countdown mode for a quick timer.
          ToolMint's timer runs entirely in the browser with centisecond precision and smooth updates powered
          by performance.now() and requestAnimationFrame.
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
