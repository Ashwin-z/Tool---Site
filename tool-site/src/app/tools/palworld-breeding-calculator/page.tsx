import type { Metadata } from "next";
import Link from "next/link";
import RelatedTools from "@/components/related-tools";
import PalworldBreedingTool from "@/components/palworld-breeding-tool";

export const metadata: Metadata = {
  title: "Palworld Breeding Calculator & Breeding Combinations - Current Breeding Power Tool",
  description:
    "Use ToolMint's Palworld breeding calculator to check parent-to-child results, find breeding combinations for any Pal, and account for special combos, same-species-only Pals, and breeding power rules.",
  keywords: [
    "palworld breeding calculator",
    "palworld breeding combinations",
    "palworld breeding combo finder",
    "palworld breeding power calculator",
    "palworld parent combinations",
    "palworld child breeding combinations",
    "palworld special breeding combos",
    "palworld breeding guide",
  ],
  alternates: { canonical: "/tools/palworld-breeding-calculator" },
  openGraph: {
    title: "Palworld Breeding Calculator & Breeding Combinations | ToolMint",
    description:
      "Calculate Palworld breeding outcomes, search parent pairs for any child, and handle special combo rules in one place.",
    url: "/tools/palworld-breeding-calculator",
  },
};

const includedTools = [
  {
    title: "Parents to Child Calculator",
    desc: "Select two parent Pals and instantly see the resulting child using the current breeding power formula or a special-combo override.",
  },
  {
    title: "Child to Parent Combinations",
    desc: "Search any target Pal and list every breeding pair that can hatch it, including special pairs and same-species-only cases.",
  },
  {
    title: "Gender-Aware Special Cases",
    desc: "Surface the few breeding outcomes that depend on which parent is female so you do not get misleading single-result output.",
  },
  {
    title: "Breeding Power Reference",
    desc: "See the average breeding power used in each calculation to understand why a pair resolves to a given child.",
  },
];

const steps = [
  {
    title: "Choose your mode",
    desc: "Use Parents to Child when you already have two Pals, or switch to Child to Parents when you want to hatch a specific target.",
  },
  {
    title: "Search exact Pal names",
    desc: "Type a Pal name and pick it from the list so the calculator can match the current dataset correctly.",
  },
  {
    title: "Check special rules",
    desc: "If a pair has a special override or a gender requirement, the tool will show it instead of only showing the average-power result.",
  },
  {
    title: "Review combinations",
    desc: "Use the reverse lookup list to compare multiple parent pairs for the same child and plan your breeding route faster.",
  },
];

const faqs = [
  {
    q: "How does the Palworld breeding calculator decide the child?",
    a: "The tool averages both parents' breeding power with the standard floor((A + B + 1) / 2) formula, then selects the closest eligible regular child unless the pair triggers a special combination override.",
  },
  {
    q: "Does this Palworld breeding tool support special combinations?",
    a: "Yes. The calculator checks special breeding combinations first, including unique subspecies and other override-only results, before it falls back to the normal breeding power formula.",
  },
  {
    q: "Why can one parent pair show more than one possible child?",
    a: "A small number of Palworld combinations depend on which parent is female. When gender changes the outcome, this tool shows the relevant possibilities instead of hiding the edge case.",
  },
  {
    q: "Can I use this tool to find all breeding combinations for a target Pal?",
    a: "Yes. Switch to Child to Parents mode, enter the Pal you want, and the tool lists every stored parent pairing that can produce that child.",
  },
  {
    q: "Does the calculator include same-species-only and unique Pals?",
    a: "Yes. Same-species breeding cases are handled directly, which is important for several legendary or unique Pals that cannot be produced through the regular child pool.",
  },
];

export default function PalworldBreedingCalculatorPage() {
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
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6 md:py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Palworld Breeding Calculator and Breeding Combinations
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Plan Palworld breeding faster with ToolMint&apos;s current calculator. Check which child two parents
          produce, reverse-search all breeding combinations for a target Pal, and account for special combos,
          same-species breeding, and gender-specific edge cases in one place.
        </p>

        <div className="mt-8">
          <PalworldBreedingTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Palworld Breeding Tools
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
            How to Use the Palworld Breeding Calculator
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            Why This Palworld Breeding Tool Is Useful
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
            <p>
              A simple Palworld breeding calculator is only helpful if it follows the current breeding power data and
              handles special-combo overrides correctly. ToolMint&apos;s version is built to do both, so the result is
              more reliable than a plain average-rank lookup.
            </p>
            <p>
              The reverse lookup is equally important. If you know the child you want but not the path to it, the
              breeding combinations view lets you compare all valid parent pairs without scanning large community charts
              by hand.
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

        <RelatedTools slug="palworld-breeding-calculator" />
      </main>
    </>
  );
}
