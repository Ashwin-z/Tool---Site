import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import PalworldBreedingTool from "@/components/palworld-breeding-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Palworld Breeding Calculator – Find Breeding Combinations & Child Pals",
  description:
    "Find the exact child Pal for any two parent Pals in Palworld. Calculate breeding combinations, discover rare Pal recipes, and plan your breeding tower. Free, instant, no signup.",
  keywords: [
    "palworld breeding calculator",
    "palworld breeding combinations chart",
    "palworld what do you get when you breed two pals",
    "palworld child pal calculator",
    "palworld rare pal breeding combinations",
    "palworld breeding guide all pals",
    "how to breed pals in palworld",
    "palworld breeding tower calculator",
  ],
  alternates: { canonical: "/tools/palworld-breeding-calculator" },
  openGraph: {
    title: "Palworld Breeding Calculator – Child Pal & Combinations Finder | ToolMint",
    description:
      "Select two parent Pals to instantly see the resulting child Pal. Plan breeding combinations and discover rare Pal recipes.",
    url: "/tools/palworld-breeding-calculator",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Planning a specific Pal",
    desc: "Work backwards from your target Pal to find which parent combinations produce it — saving hours of trial and error at the breeding farm.",
  },
  {
    title: "Discovering rare combinations",
    desc: "Find legendary and rare Pal recipes that require specific parent pairings which are not obvious from the in-game breeding menu.",
  },
  {
    title: "Optimizing passive skills",
    desc: "Plan multi-generation breeding chains to combine rare passive skills from two different Pals into a single offspring with ideal traits.",
  },
];

const steps = [
  { title: "Select Parent 1", desc: "Choose the first parent Pal from the dropdown list." },
  { title: "Select Parent 2", desc: "Choose the second parent Pal." },
  { title: "View the child", desc: "The calculator instantly shows the resulting child Pal." },
  { title: "Plan your chain", desc: "Use the result as a parent in a new calculation to plan multi-step breeding chains." },
];

const faqs = [
  {
    q: "How does Palworld breeding work?",
    a: "Breeding in Palworld requires a Breeding Farm, one male and one female Pal, and a Cake. The two parent Pals produce an egg which hatches into the child Pal. The child is determined by the parents' internal breeding power values — not their species directly — which means some combinations produce unexpected results.",
  },
  {
    q: "Can two different Pal species produce the same child?",
    a: "Yes. Palworld uses a power-ranking system where each Pal has an internal breeding value. Multiple different parent combinations can result in the same child if the average of their breeding power values falls in the same range.",
  },
  {
    q: "How do I get rare Pals through breeding?",
    a: "Some legendary and rare Pals can only be obtained through specific breeding combinations or have very high breeding power values. Examples include Frostallion Noct, Shadowbeak, and Jetragon — this calculator shows the exact parent combinations that produce them.",
  },
  {
    q: "Do passive skills carry over in breeding?",
    a: "Yes. Offspring have a chance to inherit passive skills from either parent. Each parent can pass up to 2 passive skills, giving the child up to 4 passive skill slots. To breed Pals with rare skills like Legend or Lucky, use parents that already carry those skills.",
  },
  {
    q: "What is the Breeding Farm and how do I build one?",
    a: "The Breeding Farm is an early-game structure that requires 50 Wood, 20 Stone, and 10 Fiber to build. You need one male and one female Pal placed in the farm, plus a Cake in the farm chest. Cakes are crafted from flour, red berries, milk, eggs, and honey.",
  },
];

export default function PalworldBreedingCalculatorPage() {
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
      <WebAppSchema slug="palworld-breeding-calculator" />
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
            { name: "Palworld Breeding Calculator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Palworld Breeding Calculator – Find Child Pal for Any Two Parents
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Select any two parent Pals to instantly see what child they produce. Discover
          breeding combinations for rare and legendary Pals, plan multi-generation breeding
          chains, and optimize passive skill inheritance — all without leaving the browser.
        </p>

        <div className="mt-8">
          <PalworldBreedingTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Why Use a Palworld Breeding Calculator
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
            How to Use the Breeding Calculator
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
              How Palworld Breeding Power Values Work
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Each Pal in Palworld has a hidden internal breeding power value. When two Pals
              breed, the game calculates the average of the two parents&apos; power values, then
              finds the Pal whose power value is closest to that average — that is the child.
              This means the child is not always a combination of the parents&apos; species, and
              the same child can result from many different parent pairings. For example,
              Anubis (breeding power 590) can be produced by crossing Penking and Bushi,
              or Caprity and Mossanda, or other combinations whose average is close to 590.
              The game has a few unique exceptions — certain Pals like Frostallion Noct can
              only be produced from one specific parent combination regardless of the power
              value math. This calculator handles both the general power-value system and
              the special-case overrides.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Breeding for Passive Skills: How to Get the Best Pals
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Getting a rare Pal from breeding is just the beginning — the real endgame is
              breeding one with the right passive skills. Each Pal can have up to 4 passive
              skills, and offspring inherit them randomly from their parents. The probability
              of inheriting a specific skill from one parent is roughly 50–55% per slot. To
              maximize skill inheritance, both parents should carry the desired skills.
              The most sought-after passive skills are Legend (+20% attack, defense, movement),
              Lucky (+15% attack, +15% work speed), Artisan (×1.5 work speed), and
              Swift (+30% movement). Since these skills are rare, the standard approach is:
              (1) catch wild Pals with one desired skill each, (2) breed them together to
              combine two skills in one offspring, (3) repeat until you have a Pal with all
              four target skills. Breeding for skills takes many generations — patience and
              a large Pal Box are essential.
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

        <RelatedTools slug="palworld-breeding-calculator" />
      </main>
    </>
  );
}
