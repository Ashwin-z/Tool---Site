import type { Metadata } from "next";
import Link from "next/link";
import ScientificCalculatorTool from "@/components/scientific-calculator-tool";

export const metadata: Metadata = {
  title: "Scientific Calculator Online Free - Trig, Log, Powers, Memory & History",
  description:
    "Use ToolMint's free scientific calculator online for trigonometry, logarithms, powers, roots, percentages, memory functions, history, and DEG/RAD modes in one advanced calc.",
  keywords: [
    "scientific calculator",
    "scientific calculator online free",
    "advanced calculator",
    "trigonometry calculator",
    "log calculator",
    "calculator with history",
    "deg rad calculator",
    "calculator with memory",
  ],
  alternates: { canonical: "/tools/scientific-calculator" },
  openGraph: {
    title: "Scientific Calculator Online Free | ToolMint",
    description:
      "Calculate trig, logs, powers, roots, and more with a full scientific calculator in your browser.",
    url: "/tools/scientific-calculator",
  },
};

const includedTools = [
  { title: "Basic Arithmetic", desc: "Run addition, subtraction, multiplication, division, percentages, and bracketed expressions." },
  { title: "Trig & Angle Modes", desc: "Use sin, cos, tan, inverse trig functions, and switch between DEG and RAD modes." },
  { title: "Logs, Powers & Roots", desc: "Calculate logarithms, exponentials, squares, cubes, powers, square roots, and cube roots." },
  { title: "Memory & History", desc: "Store values in memory and review earlier calculations for multi-step work." },
];

const steps = [
  { title: "Enter an expression", desc: "Use the on-screen keypad or keyboard to type numbers, operators, and parentheses." },
  { title: "Choose advanced functions", desc: "Apply trig, log, exponential, factorial, root, power, or percentage functions as needed." },
  { title: "Set calculator mode", desc: "Switch angle units and use memory or history for longer scientific calculations." },
  { title: "Continue or copy the result", desc: "Use the output in the next step of your equation or copy the final answer." },
];

const faqs = [
  {
    q: "What can this scientific calculator do?",
    a: "It supports trigonometric functions, logarithms, powers, roots, factorials, exponentials, parentheses, memory operations, and calculation history.",
  },
  {
    q: "Can I switch between DEG and RAD?",
    a: "Yes. You can toggle between degree and radian modes before calculating trig functions.",
  },
  {
    q: "Does it work on mobile devices?",
    a: "Yes. The calculator is fully browser-based and works on phones, tablets, laptops, and desktop computers.",
  },
  {
    q: "Can I use my keyboard?",
    a: "Yes. You can enter numbers and operators directly from your keyboard for faster calculations.",
  },
  {
    q: "Is any data uploaded to a server?",
    a: "No. Your calculations run locally in the browser, so nothing is uploaded or stored remotely.",
  },
];

export default function ScientificCalculatorPage() {
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
          Scientific Calculator Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Solve advanced math in seconds with ToolMint&apos;s scientific calculator. Use trigonometric,
          logarithmic, exponential, factorial, root, and power functions with handy DEG/RAD switching,
          built-in percentage math, memory controls, and calculation history in one browser-based tool.
        </p>

        <div className="mt-8">
          <ScientificCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Calculator Modes
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
            How to Use the Scientific Calculator
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
