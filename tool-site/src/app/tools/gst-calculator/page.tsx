import type { Metadata } from "next";
import Link from "next/link";
import GSTCalculatorTool from "@/components/gst-calculator-tool";

export const metadata: Metadata = {
  title: "GST / Sales Tax Calculator Online Free - Add Tax, Remove Tax & Reverse Rate",
  description:
    "Use ToolMint's free GST and sales tax calculator to add tax, remove tax, reverse-calculate tax rates, and total multi-item invoices with different tax percentages.",
  keywords: [
    "gst calculator",
    "sales tax calculator",
    "gst calculator online free",
    "vat calculator",
    "add tax calculator",
    "remove tax calculator",
    "reverse tax rate calculator",
    "free tax calculator",
  ],
  alternates: { canonical: "/tools/gst-calculator" },
  openGraph: {
    title: "GST / Sales Tax Calculator Online Free | ToolMint",
    description:
      "Add or remove GST, VAT, or sales tax instantly, reverse-calculate tax rates, and total multi-item invoices.",
    url: "/tools/gst-calculator",
  },
};

const includedTools = [
  { title: "Add Tax", desc: "Add GST, VAT, or sales tax to a base price and get the final amount." },
  { title: "Remove Tax", desc: "Extract pre-tax value and tax amount from a tax-inclusive price." },
  { title: "Multi-item Invoice", desc: "Calculate totals across multiple items with different tax rates." },
  { title: "Reverse Tax Rate Finder", desc: "Work backward from inclusive and exclusive prices to identify the applied tax rate." },
];

const steps = [
  { title: "Choose tax mode", desc: "Select whether you want to add tax, remove tax, or reverse-calculate the applied rate." },
  { title: "Enter amount and rate", desc: "Provide the price and GST, VAT, or sales tax percentage." },
  { title: "Calculate totals", desc: "The tool instantly shows pre-tax amount, tax value, and final total." },
  { title: "Use invoice results", desc: "Apply the totals to invoices, pricing, receipts, or tax-inclusive product calculations." },
];

const faqs = [
  {
    q: "Can I add and remove GST or sales tax?",
    a: "Yes. The calculator supports both adding tax to a base price and extracting tax from a tax-inclusive amount.",
  },
  {
    q: "Does it work for VAT too?",
    a: "Yes. It works for GST, VAT, sales tax, and most percentage-based indirect tax systems.",
  },
  {
    q: "Does this page include reverse tax calculation?",
    a: "Yes. Reverse tax calculation helps you determine the original pre-tax price or tax rate when you already know the final price.",
  },
  {
    q: "Can I calculate invoices with different tax rates?",
    a: "Yes. The multi-item invoice mode helps you total multiple items that each use different tax percentages.",
  },
  {
    q: "Is this GST calculator free?",
    a: "Yes. It is free to use online with no signup required.",
  },
];

export default function GSTCalculatorPage() {
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
          GST / Sales Tax Calculator Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Calculate GST, VAT, and sales tax instantly with ToolMint. Add tax to a base price, remove tax from an
          inclusive amount, reverse-calculate rates, and handle multi-item tax-based pricing more accurately for invoices and sales.
        </p>

        <div className="mt-8">
          <GSTCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Tax Calculators
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
            How to Calculate GST or Sales Tax Online
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
