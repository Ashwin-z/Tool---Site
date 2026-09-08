import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ProfitMarginCalculatorTool from "@/components/profit-margin-calculator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Profit Margin Calculator – Gross Margin, Markup & Net Profit",
  description:
    "Calculate profit margin, gross margin, markup, and net profit online for free. Find the selling price from cost and desired margin. Ideal for small business pricing. Instant.",
  keywords: [
    "profit margin calculator for small business",
    "gross margin calculator online",
    "markup calculator from cost price",
    "how to calculate profit margin",
    "net profit margin calculator",
    "selling price from margin calculator",
    "markup vs margin calculator",
    "profit percentage calculator",
  ],
  alternates: { canonical: "/tools/profit-margin-calculator" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Profit Margin Calculator – Gross Margin, Markup & Net Profit | ToolMint",
    description:
      "Calculate gross margin, markup, and net profit from cost and revenue. Find the selling price from a target margin. Free.",
    url: "/tools/profit-margin-calculator",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Pricing a product or service",
    desc: "Enter your cost and target profit margin to find the minimum selling price needed to hit your margin goal.",
  },
  {
    title: "Checking profitability of existing products",
    desc: "Enter cost and selling price to instantly see gross margin, markup percentage, and net profit amount.",
  },
  {
    title: "Comparing margin vs. markup",
    desc: "Understand the difference between margin (profit as % of revenue) and markup (profit as % of cost) to price correctly.",
  },
];

const steps = [
  { title: "Enter cost price", desc: "Provide the cost of producing or acquiring the product or service." },
  { title: "Enter selling price", desc: "Provide the price at which you sell the product or service." },
  { title: "View margin and markup", desc: "See gross profit, gross margin %, markup %, and net profit instantly." },
  { title: "Reverse-calculate", desc: "Or enter cost and desired margin to find the required selling price." },
];

const faqs = [
  {
    q: "What is the difference between profit margin and markup?",
    a: "Profit margin is profit divided by selling price × 100. Markup is profit divided by cost × 100. A 50% markup gives a 33.3% margin — they are different percentages of different bases. Use margin for financial reporting and markup for pricing decisions.",
  },
  {
    q: "What is a good profit margin for a small business?",
    a: "This varies by industry. Retail typically targets 10–30% gross margin. Software and services aim for 60–80%. Food businesses often run at 20–35%. The key number is net margin after all expenses — a 5–10% net margin is considered healthy for most small businesses.",
  },
  {
    q: "How do I find the selling price if I know cost and desired margin?",
    a: "Selling Price = Cost ÷ (1 − Margin %). For a 40% margin on a ₹600 cost: ₹600 ÷ 0.60 = ₹1,000 selling price. Use the reverse-calculate mode in this tool to get this directly.",
  },
  {
    q: "Does this calculate gross or net margin?",
    a: "The calculator shows gross margin (revenue minus cost of goods sold). Net margin requires subtracting all operating expenses, taxes, and interest — enter those in the additional costs field if available.",
  },
  {
    q: "Can I use this for service-based businesses?",
    a: "Yes. For services, use your hourly rate or project cost as the 'cost' input and the client billing rate or project fee as the 'selling price' to find your margin on each engagement.",
  },
];

export default function ProfitMarginCalculatorPage() {
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
      <WebAppSchema slug="profit-margin-calculator" />
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
            { name: "Profit Margin Calculator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Profit Margin Calculator – Gross Margin, Markup & Selling Price
        </h1>

        <ProcessingBadge slug="profit-margin-calculator" />
        <ToolAnalytics slug="profit-margin-calculator" category="calculators" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Calculate gross profit margin, markup percentage, and net profit from cost and
          selling price. Or reverse-calculate: enter cost and desired margin to find the
          required selling price. Built for small business owners, freelancers, and product
          teams.
        </p>

        <div className="mt-8">
          <ProfitMarginCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Use a Profit Margin Calculator
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
            How to Calculate Profit Margin
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
              Markup vs. Margin: Why the Difference Matters for Pricing
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Markup and margin are both expressed as percentages but are calculated from
              different bases, which is why confusing them leads to systematic under-pricing.
              Markup is profit divided by cost: if you pay ₹400 for a product and sell it for
              ₹600, your markup is (200 ÷ 400) × 100 = 50%. Margin is profit divided by
              selling price: (200 ÷ 600) × 100 = 33.3%. If you set a target of &ldquo;30% profit&rdquo;
              and interpret this as markup, your actual margin will only be 23%. If your
              business plan promises investors a 40% margin and you price using a 40% markup,
              you will miss the target every time. Use margin for finance and investor
              conversations; use markup to set prices from cost. The conversion formula:
              Margin = Markup ÷ (1 + Markup).
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Profit Margins by Industry in India
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Gross profit margins vary widely by industry. Kirana and retail grocery
              stores typically operate on 10–20% gross margins. Clothing and apparel retail
              targets 40–60%. Software products and SaaS aim for 70–85% gross margins.
              Restaurants and food businesses average 20–35% gross margin but net margins of
              only 3–9% after rent, staff, and utilities. Manufacturing companies vary from
              15–40% gross margin depending on the product category. E-commerce in India
              often runs at very thin margins (5–15% gross) due to high customer acquisition
              costs and delivery expenses. Understanding your industry benchmark helps you
              identify whether your pricing is competitive or leaving money on the table.
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

        <RelatedTools slug="profit-margin-calculator" />
      </main>
    </>
  );
}
