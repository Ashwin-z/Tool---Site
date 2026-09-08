import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import BreakevenCalculatorTool from "@/components/breakeven-calculator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Break-Even Calculator – Find Your Break-Even Point in Units & Sales",
  description:
    "Calculate your break-even point online for free. Find how many units to sell or how much revenue to generate to cover all costs. Ideal for small business planning. Instant.",
  keywords: [
    "break even calculator for small business",
    "break even point calculator units",
    "how many units to sell to break even",
    "break even analysis online free",
    "break even revenue calculator",
    "contribution margin calculator",
    "fixed cost break even calculator",
    "business break even point calculator",
  ],
  alternates: { canonical: "/tools/breakeven-calculator" },
  openGraph: {
    title: "Break-Even Calculator – Units, Revenue & Contribution Margin | ToolMint",
    description:
      "Find how many units to sell or how much revenue to generate to cover all costs. Free break-even analysis tool.",
    url: "/tools/breakeven-calculator",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "New product or business launch",
    desc: "Before launching, calculate the minimum sales volume needed to cover all costs and understand how long it takes to reach profitability.",
  },
  {
    title: "Pricing decisions",
    desc: "See how changing your selling price affects the break-even point — lowering price requires selling more units to cover fixed costs.",
  },
  {
    title: "Cost reduction analysis",
    desc: "Calculate how much the break-even point improves if you reduce fixed costs (rent, salaries) or variable costs (materials, packaging).",
  },
];

const steps = [
  { title: "Enter fixed costs", desc: "Total costs that don't change with volume: rent, salaries, insurance, subscriptions." },
  { title: "Enter variable cost per unit", desc: "Cost of producing or delivering one unit: materials, packaging, shipping." },
  { title: "Enter selling price per unit", desc: "The price at which you sell each unit to a customer." },
  { title: "View break-even result", desc: "See break-even units, break-even revenue, and contribution margin." },
];

const faqs = [
  {
    q: "What is the break-even point formula?",
    a: "Break-Even Units = Fixed Costs ÷ (Selling Price − Variable Cost per Unit). The denominator is the contribution margin per unit — how much each sale contributes toward covering fixed costs.",
  },
  {
    q: "What is contribution margin?",
    a: "Contribution margin = Selling Price − Variable Cost per Unit. It represents the amount each unit sale contributes toward covering fixed costs and generating profit. A higher contribution margin means fewer units needed to break even.",
  },
  {
    q: "How do I calculate break-even in revenue instead of units?",
    a: "Break-Even Revenue = Fixed Costs ÷ Contribution Margin Ratio, where Contribution Margin Ratio = Contribution Margin ÷ Selling Price. This is useful for service businesses where 'units' are not a natural measure.",
  },
  {
    q: "What happens if my variable costs are higher than my selling price?",
    a: "This means each unit sold generates a loss, and no volume of sales will ever cover fixed costs. The break-even point does not exist at those numbers — you must either raise the price or lower variable costs.",
  },
  {
    q: "Can I use this for a service business?",
    a: "Yes. Use project cost or hourly rate as the 'selling price per unit,' cost of delivering the service as 'variable cost per unit,' and monthly overheads as 'fixed costs' to find how many projects or hours are needed to break even.",
  },
];

export default function BreakevenCalculatorPage() {
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
      <WebAppSchema slug="breakeven-calculator" />
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
            { name: "Break-Even Calculator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Break-Even Calculator – Find Your Break-Even Point in Units & Revenue
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Calculate how many units you need to sell or how much revenue you need to generate
          to cover all your costs. Enter fixed costs, variable cost per unit, and selling
          price to see your break-even point and contribution margin.
        </p>

        <div className="mt-8">
          <BreakevenCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Use a Break-Even Calculator
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
            How to Find Your Break-Even Point
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
              Fixed Costs vs. Variable Costs: Categorizing Them Correctly
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Getting the break-even calculation right depends on correctly categorizing
              costs. Fixed costs stay constant regardless of sales volume: shop rent,
              employee salaries, insurance premiums, software subscriptions, loan EMI
              payments, and depreciation. Variable costs scale directly with units produced
              or sold: raw materials, packaging, delivery charges, payment gateway fees
              (% per transaction), and sales commissions. Some costs are semi-variable —
              electricity has a fixed base charge plus a variable usage component, and
              staff overtime is fixed up to a threshold. For break-even purposes, split
              semi-variable costs at their average variable portion or use the high-low
              method to separate them. A common mistake is including variable costs in
              the fixed cost bucket, which underestimates the break-even point.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How Pricing Changes Affect the Break-Even Point
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The break-even point is extremely sensitive to price changes because price
              directly changes the contribution margin. Consider a product with ₹3,000
              monthly fixed costs, ₹50 variable cost per unit, and a ₹100 selling price:
              contribution margin is ₹50, and break-even is 60 units. If you raise the
              price by just ₹10 to ₹110, the contribution margin becomes ₹60 and
              break-even drops to 50 units — a 17% reduction. Conversely, discounting by
              ₹10 to ₹90 drops contribution margin to ₹40 and raises break-even to 75
              units — a 25% increase. This asymmetry is why pricing decisions have
              outsized impact on profitability: small price changes require large volume
              changes to compensate. Use the calculator to test multiple price scenarios
              before deciding on a discount or promotion.
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

        <RelatedTools slug="breakeven-calculator" />
      </main>
    </>
  );
}
