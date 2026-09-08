import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import TipCalculatorTool from "@/components/tip-calculator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Tip Calculator – Calculate Tips and Split Bills Between Friends",
  description:
    "Calculate the tip amount and split the total bill between any number of people online for free. Choose a tip percentage or enter a custom amount. Instant, no signup.",
  keywords: [
    "tip calculator for restaurant",
    "bill split calculator for groups",
    "how much to tip at a restaurant",
    "tip calculator split between friends",
    "gratuity calculator online free",
    "restaurant bill split calculator",
    "tip percentage calculator",
    "per person bill calculator",
  ],
  alternates: { canonical: "/tools/tip-calculator" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Tip Calculator – Split Bills Between Friends & Calculate Gratuity | ToolMint",
    description:
      "Calculate tips, split bills between any number of people, and compare tip percentages. Free, instant.",
    url: "/tools/tip-calculator",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Restaurant dining",
    desc: "Calculate the tip on any restaurant bill and find each person's share when the group wants to split equally.",
  },
  {
    title: "Group outings and travel",
    desc: "Divide hotel bills, tour costs, or group meals evenly and find the exact per-person amount including tip.",
  },
  {
    title: "Comparing tip percentages",
    desc: "See the tip amount for 10%, 15%, 18%, and 20% side by side to decide how much feels right for the service quality.",
  },
];

const steps = [
  { title: "Enter bill amount", desc: "Type the total bill before tip." },
  { title: "Choose tip percentage", desc: "Select a preset (10%, 15%, 18%, 20%) or enter a custom percentage." },
  { title: "Enter number of people", desc: "Set how many people are splitting the bill." },
  { title: "View results", desc: "See tip amount, total bill, and amount per person instantly." },
];

const faqs = [
  {
    q: "How much should I tip at a restaurant in India?",
    a: "Tipping is not mandatory in India, but a 10% tip for good service at a sit-down restaurant is common. Upscale restaurants often add a service charge of 5–10% to the bill, which replaces the tip. Fast food and street food do not expect tips.",
  },
  {
    q: "How do I split a bill unequally?",
    a: "This calculator splits the bill equally between all people entered. For unequal splits, calculate each person's share of the food cost separately and add the appropriate tip portion to each.",
  },
  {
    q: "Should I tip on the pre-tax or post-tax amount?",
    a: "Tipping on the pre-tax (subtotal) amount is the most common practice. This calculator uses the bill amount you enter — if you enter the pre-tax total, the tip is calculated on that. If GST is already included, the tip is calculated on the inclusive total.",
  },
  {
    q: "What is a service charge and is it the same as a tip?",
    a: "A service charge is a mandatory fee added by the restaurant — it goes to the establishment and may or may not be passed to staff. A tip is a voluntary additional payment directly to the server. In India, the National Restaurant Association of India (NRAI) clarified in 2023 that restaurants cannot force customers to pay a service charge.",
  },
  {
    q: "Can I calculate tip for delivery orders?",
    a: "Yes. Enter the order subtotal as the bill amount and calculate the tip percentage. For delivery, 10–15% is a common tip on the food total, separate from any delivery fee.",
  },
];

export default function TipCalculatorPage() {
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
      <WebAppSchema slug="tip-calculator" />
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
            { name: "Tip Calculator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Tip Calculator – Calculate Tips and Split Bills Between Friends
        </h1>

        <ProcessingBadge slug="tip-calculator" />
        <ToolAnalytics slug="tip-calculator" category="calculators" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Enter the bill amount, choose a tip percentage, and split between any number of
          people instantly. See the tip amount, total bill with tip, and exact amount owed
          per person — no mental math required.
        </p>

        <div className="mt-8">
          <TipCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Use a Tip Calculator
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
            How to Calculate a Tip
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
              Tipping Culture in India vs. Abroad
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Tipping norms vary significantly by country. In the United States, tipping
              15–20% at sit-down restaurants is culturally expected and serves as a major
              part of a server&apos;s income. In the UK, 10–12.5% is the norm and some restaurants
              add a service charge automatically. In India, tipping is common but not
              obligatory — 10% is the typical amount at mid-range and upscale restaurants.
              Many Indian restaurants add a 5–10% service charge automatically, which
              replaces the tip in most diners&apos; minds. At dhabas, street food stalls, and
              fast food chains, tipping is not standard. When traveling internationally, use
              this calculator to quickly find the right tip amount in the local currency on
              any restaurant bill.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How to Split a Large Group Bill Fairly
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              For equal splits, this calculator divides the full bill including tip by the
              number of people to get the per-person amount. The common rounding issue at
              restaurants — where the amounts don&apos;t add up to exactly the total — is handled
              by rounding most shares down and adding the remaining cents to one person&apos;s
              share. For groups where people ordered very different amounts, a truly fair
              split requires calculating each person&apos;s food subtotal first, then adding the
              tip as a percentage of each individual&apos;s share. The simplest workaround when
              everyone wants fairness at a casual dinner: use UPI or a payment app to
              settle after one person pays, using the exact per-person figure from this
              calculator.
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

        <RelatedTools slug="tip-calculator" />
      </main>
    </>
  );
}
