import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ScientificCalculatorTool from "@/components/scientific-calculator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Scientific Calculator – Sin, Cos, Tan, Log & More Online Free",
  description:
    "Free online scientific calculator with trigonometric functions (sin, cos, tan), logarithms, exponents, square roots, and more. Works in degrees and radians. No download required.",
  keywords: [
    "scientific calculator online free",
    "sin cos tan calculator in degrees",
    "log calculator online",
    "scientific calculator with trig functions",
    "online calculator with square root",
    "radians to degrees calculator",
    "exponent calculator online",
    "trigonometry calculator online free",
  ],
  alternates: { canonical: "/tools/scientific-calculator" },
  openGraph: {
    title: "Scientific Calculator – Trig, Log, Exponents & More | ToolMint",
    description:
      "Full scientific calculator online with sin, cos, tan, log, ln, square root, and exponents. Works in degrees and radians.",
    url: "/tools/scientific-calculator",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Trigonometry homework",
    desc: "Calculate sin, cos, and tan values for any angle in degrees or radians without switching between apps or looking up tables.",
  },
  {
    title: "Engineering and physics problems",
    desc: "Compute logarithms, exponentials, roots, and combinations for technical calculations that go beyond a basic four-function calculator.",
  },
  {
    title: "Exam preparation",
    desc: "Practice calculations using the same functions available on physical scientific calculators like the Casio fx-82 used in board exams.",
  },
];

const steps = [
  { title: "Enter your expression", desc: "Type numbers and select functions like sin, cos, log, or sqrt from the function panel." },
  { title: "Select degree or radian mode", desc: "Toggle between DEG and RAD for trigonometric calculations." },
  { title: "Press equals", desc: "Calculate the result instantly." },
  { title: "Chain calculations", desc: "Use the Ans key to chain results into the next calculation." },
];

const faqs = [
  {
    q: "How do I calculate sin, cos, or tan of an angle?",
    a: "Make sure the calculator is in the correct mode (DEG for degrees, RAD for radians). Enter the angle value, then press the sin, cos, or tan button. For example, sin(30) in DEG mode returns 0.5.",
  },
  {
    q: "What is the difference between log and ln?",
    a: "log (common logarithm) uses base 10: log(100) = 2. ln (natural logarithm) uses base e ≈ 2.718: ln(e) = 1. In science and engineering, ln is more common. In everyday calculations like decibels or pH, log base 10 is used.",
  },
  {
    q: "How do I enter negative exponents?",
    a: "Use the (+/-) sign button to make the exponent negative, or enter the reciprocal. For example, 10^(-3) = 0.001. Some calculators use the EE or EXP button for scientific notation: 1 EE -3 = 1 × 10⁻³ = 0.001.",
  },
  {
    q: "How do I calculate the square root of a number?",
    a: "Press the √ button followed by the number, or enter the number and then press √. For example, √144 = 12.",
  },
  {
    q: "What is the difference between DEG and RAD mode?",
    a: "DEG (degrees) measures angles from 0 to 360 in a full circle. RAD (radians) measures from 0 to 2π. Most everyday problems use degrees. Radians are standard in calculus, physics, and programming math libraries. To convert: radians = degrees × π/180.",
  },
];

export default function ScientificCalculatorPage() {
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
      <WebAppSchema slug="scientific-calculator" />
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
            { name: "Scientific Calculator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Scientific Calculator – Sin, Cos, Tan, Log & Exponents Online Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          A full-featured scientific calculator in your browser. Compute trigonometric
          functions (sin, cos, tan, arcsin, arccos, arctan), logarithms, square roots,
          exponents, and factorials. Supports both degree and radian mode — no app
          download needed.
        </p>

        <div className="mt-8">
          <ScientificCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Use a Scientific Calculator
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
            How to Use the Scientific Calculator
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
              Trigonometric Functions: Sin, Cos, Tan Explained
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Trigonometric functions relate the angles of a right triangle to the ratios
              of its sides. Sin (sine) = opposite ÷ hypotenuse. Cos (cosine) = adjacent ÷
              hypotenuse. Tan (tangent) = opposite ÷ adjacent, or equivalently sin ÷ cos.
              The most commonly used values: sin(0°) = 0, sin(30°) = 0.5, sin(45°) ≈ 0.707,
              sin(60°) ≈ 0.866, sin(90°) = 1. Cosine values are the reverse: cos(90°) = 0,
              cos(0°) = 1. The inverse functions — arcsin, arccos, arctan — take a ratio and
              return the angle. For example, arcsin(0.5) = 30°. In physics and engineering,
              these functions appear in wave analysis, force resolution, and circuit
              calculations. In board exams (JEE, NEET, CBSE), trigonometric values are tested
              from 0° to 360° including identities like sin²θ + cos²θ = 1. Use this
              calculator to verify calculations, not as a substitute for understanding the
              underlying concepts.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Logarithms: When to Use Log vs. Ln
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              A logarithm answers the question: "what power must the base be raised to in
              order to get this number?" log₁₀(1000) = 3 because 10³ = 1000. ln(e²) = 2
              because e² = e². Log base 10 is used in real-world scales: pH = −log[H⁺],
              decibels = 10 × log(power ratio), Richter scale = log of amplitude. Natural log
              (ln) appears in continuous growth and decay formulas, finance (continuously
              compounded interest), and calculus derivatives. The change of base formula lets
              you calculate any base: log_b(x) = ln(x) ÷ ln(b) or log(x) ÷ log(b). For
              example, log₂(8) = ln(8) ÷ ln(2) ≈ 2.079 ÷ 0.693 = 3. The antilog of a
              common log is 10^x; the antilog of a natural log is e^x. On this calculator,
              10^x and e^x perform these inverse operations.
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

        <RelatedTools slug="scientific-calculator" />
      </main>
    </>
  );
}
