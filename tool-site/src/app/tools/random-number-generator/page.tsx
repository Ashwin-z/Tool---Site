import type { Metadata } from "next";
import Link from "next/link";
import RandomNumberGeneratorTool from "@/components/random-number-generator-tool";

export const metadata: Metadata = {
  title: "Random Number Generator — Integers, Dice, Coin Flip & List Picker | ToolMint",
  description:
    "Generate cryptographically secure random numbers in 5 modes — integers, decimals, dice roller (SVG faces), coin flip simulator, and pick from a custom list. Uses crypto.getRandomValues(). Free.",
  keywords: [
    "random number generator",
    "dice roller online",
    "coin flip simulator",
    "random list picker",
    "crypto random generator",
    "secure random number",
    "random integer generator",
    "random decimal generator",
    "random dice roll",
    "fisher yates shuffle",
    "random name picker",
    "cryptographically secure random",
  ],
  alternates: { canonical: "/tools/random-number-generator" },
  openGraph: {
    title: "Random Number Generator — Integers, Dice, Coin Flip & List Picker | ToolMint",
    description:
      "5 random generation modes: integers, decimals, dice roller with SVG faces, animated coin flip, and pick from list with Fisher-Yates shuffle.",
    url: "/tools/random-number-generator",
  },
};

const includedTools = [
  { title: "Integer Generator", desc: "Set a min, max, and count (up to 100) to generate a batch of cryptographically secure random integers. Includes sum and average statistics." },
  { title: "Decimal Generator", desc: "Generate random decimal numbers with a configurable range and precision (1–10 decimal places). Useful for simulations and statistical sampling." },
  { title: "Dice Roller", desc: "Roll up to 30 dice with 2–20 sides each. Each die face renders an SVG dot-pattern with a 3D CSS roll animation. Shows sum, average, min, and max." },
  { title: "Coin Flip", desc: "Flip up to 30 coins simultaneously with a CSS flip animation and visual gold/purple coin faces. Displays heads/tails counts and percentages." },
  { title: "Pick from List", desc: "Paste any list of items (one per line) and pick a random sample. Supports allow-duplicates mode and uses a Fisher-Yates shuffle for fairness." },
];

const steps = [
  { title: "Choose a mode", desc: "Select Integer, Decimal, Dice, Coin Flip, or Pick from List from the tab bar at the top." },
  { title: "Configure options", desc: "Set the range, count, number of dice/sides, or paste your custom list depending on the mode." },
  { title: "Click Generate", desc: "Hit the Generate button to get instant cryptographically secure results using your browser's crypto.getRandomValues() API." },
  { title: "Use the results", desc: "Read the results, check the statistics (sum, average, etc.), or re-roll for a fresh set." },
];

const faqs = [
  {
    q: "Is this random number generator truly random?",
    a: "It uses the Web Crypto API (crypto.getRandomValues()) which is a cryptographically secure pseudo-random number generator (CSPRNG) — the same standard used for cryptographic key generation. All generation is done client-side in your browser.",
  },
  {
    q: "How many modes does the random number generator have?",
    a: "ToolMint's Random Number Generator has 5 modes: Integer Generator, Decimal Generator, Dice Roller (up to 30 dice, 2–20 sides), Coin Flip (up to 30 coins with animation), and Pick from List (Fisher-Yates shuffle).",
  },
  {
    q: "How does the Dice Roller work?",
    a: "Choose the number of dice (1–30) and the number of sides per die (2–20). Each die renders with an SVG dot pattern like a physical die and plays a 3D CSS roll animation. Sum, average, min, and max are displayed after every roll.",
  },
  {
    q: "What is Pick from List and how is it shuffled?",
    a: "Paste a list of items (one per line) — names, options, or any text. Set how many to pick and whether duplicates are allowed. The picker uses the Fisher-Yates (Knuth) shuffle algorithm with crypto.getRandomValues() for an unbiased selection.",
  },
  {
    q: "Can I generate random decimals with high precision?",
    a: "Yes. In Decimal mode, set the number of decimal places from 1 to 10. You can also generate a batch of up to 100 decimal values at once.",
  },
];

export default function RandomNumberGeneratorPage() {
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
          Random Number Generator — 5 Modes incl. Dice &amp; Coin Flip
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Generate cryptographically secure random results in 5 modes — integers, decimals, dice roller
          with animated SVG faces, coin flip simulator, and pick-from-list with Fisher-Yates shuffle.
          Powered by the Web Crypto API. 100% client-side, no data leaves your browser.
        </p>

        <div className="mt-8">
          <RandomNumberGeneratorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Random Generator Tools
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            How to Use the Random Generator
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
      </main>
    </>
  );
}
