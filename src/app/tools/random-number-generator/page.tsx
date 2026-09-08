import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import RandomNumberGeneratorTool from "@/components/random-number-generator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Random Number Generator – Dice Roller, Coin Flip & List Picker Free",
  description:
    "Generate cryptographically secure random numbers in 5 modes — integers, decimals, dice roller, coin flip, and pick from a custom list. Uses crypto.getRandomValues(). Free.",
  keywords: [
    "random number generator online free",
    "dice roller online free",
    "coin flip simulator online",
    "random list picker online",
    "random number between 1 and 100",
    "secure random number generator",
    "random name picker online free",
    "random integer generator online",
  ],
  alternates: { canonical: "/tools/random-number-generator" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Random Number Generator – Dice Roller, Coin Flip & List Picker | ToolMint",
    description:
      "5 random generation modes: integers, decimals, dice roller with SVG faces, animated coin flip, and pick from list with Fisher-Yates shuffle.",
    url: "/tools/random-number-generator",
  },
  twitter: { card: "summary_large_image" },
};

const includedTools = [
  { title: "Integer Generator", desc: "Set a min, max, and count (up to 100) to generate a batch of cryptographically secure random integers. Includes sum and average statistics." },
  { title: "Decimal Generator", desc: "Generate random decimal numbers with a configurable range and precision (1–10 decimal places). Useful for simulations and statistical sampling." },
  { title: "Dice Roller", desc: "Roll up to 30 dice with 2–20 sides each. Each die face renders an SVG dot-pattern with a 3D CSS roll animation. Shows sum, average, min, and max." },
  { title: "Coin Flip", desc: "Flip up to 30 coins simultaneously with a CSS flip animation and visual gold/purple coin faces. Displays heads/tails counts and percentages." },
  { title: "Pick from List", desc: "Paste any list of items (one per line) and pick a random sample. Supports allow-duplicates mode and uses a Fisher-Yates shuffle for fairness." },
];

const useCases = [
  { title: "Games & Decisions", desc: "Roll dice for board games, flip a coin to settle a debate, or randomly pick a restaurant from a list when no one can decide." },
  { title: "Giveaways & Contests", desc: "Pick a random winner from a list of names — use the Pick from List mode with Fisher-Yates shuffle for provably fair selection." },
  { title: "Development & Testing", desc: "Generate random integers and decimals for test data, simulations, or seeding algorithms without writing code." },
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
      <WebAppSchema slug="random-number-generator" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Converters", href: "/tools/converters" },
            { name: "Random Number Generator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Random Number Generator – 5 Modes incl. Dice &amp; Coin Flip
        </h1>

        <ProcessingBadge slug="random-number-generator" />
        <ToolAnalytics slug="random-number-generator" category="converters" />
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
            Who Uses a Random Number Generator
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Why crypto.getRandomValues() Is Better Than Math.random()
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Most programming tutorials teach <code className="rounded bg-white/10 px-1 text-xs">Math.random()</code> as the go-to way to generate
              random numbers in JavaScript — but it has a significant flaw: it uses a deterministic
              pseudo-random number generator (PRNG) whose output is predictable if you know the seed
              or observe enough values. This is fine for shuffling a UI animation but completely
              unsuitable for anything security-sensitive like lottery draws, password salt generation,
              or fair giveaway selection. The Web Crypto API&apos;s <code className="rounded bg-white/10 px-1 text-xs">crypto.getRandomValues()</code> uses the
              operating system&apos;s entropy sources (hardware events, timing, interrupt variance) to
              produce output that is cryptographically unpredictable — the same randomness source used
              for TLS key generation. Every number generated by this tool uses <code className="rounded bg-white/10 px-1 text-xs">crypto.getRandomValues()</code>
              under the hood, which means the results are genuinely unbiased and cannot be predicted
              from previous outputs. For contests and giveaways in particular, this is an important
              distinction — using a weak PRNG means in theory a sophisticated observer could predict
              or bias the outcome.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Fisher-Yates Shuffle – How Unbiased List Picking Works
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              When you use the Pick from List mode to randomly select items from a list, the underlying
              algorithm is the Fisher-Yates shuffle (also called the Knuth shuffle), first described by
              Ronald Fisher and Frank Yates in 1938 and popularized in computing by Donald Knuth. The
              algorithm works by iterating through the list from the last element to the first, and for
              each position swapping it with a randomly chosen element from the remaining unshuffled
              portion. This produces a uniformly random permutation — every possible ordering of the
              list is equally likely. A naive approach of picking randomly and discarding duplicates
              introduces subtle biases because some items are more likely to be selected early. The
              Fisher-Yates shuffle eliminates this bias entirely. Combined with <code className="rounded bg-white/10 px-1 text-xs">crypto.getRandomValues()</code>
              for each swap decision, the Pick from List mode produces a selection that is both
              statistically unbiased and cryptographically unpredictable — making it suitable for
              public giveaways, classroom random calling, or any use case where fairness matters.
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

        <RelatedTools slug="random-number-generator" />
      </main>
    </>
  );
}
