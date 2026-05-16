import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import GSTCalculatorTool from "@/components/gst-calculator-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "GST Calculator – Add or Remove GST from Any Price Instantly",
  description:
    "Calculate GST online for India. Add GST to a price, remove GST from an inclusive amount, reverse-calculate tax rates, and total invoices with multiple tax slabs. Free, instant.",
  keywords: [
    "gst calculator india",
    "add gst to price calculator",
    "remove gst from amount calculator",
    "gst inclusive exclusive calculator",
    "18 percent gst calculator",
    "gst calculator online free india",
    "reverse gst calculator",
    "gst on invoice calculator",
  ],
  alternates: { canonical: "/tools/gst-calculator" },
  openGraph: {
    title: "GST Calculator – Add or Remove GST, Reverse Rate & Invoice Totals | ToolMint",
    description:
      "Add GST to a base price, remove GST from an inclusive amount, or reverse-calculate the tax rate. Free India GST calculator.",
    url: "/tools/gst-calculator",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Adding GST to a base price",
    desc: "Find the final GST-inclusive price for any product or service by entering the base amount and selecting the applicable GST slab (5%, 12%, 18%, or 28%).",
  },
  {
    title: "Removing GST from a price",
    desc: "Extract the pre-tax base price and exact GST amount from a GST-inclusive total — useful for expense reports and reverse-calculating supplier prices.",
  },
  {
    title: "Invoice totalling",
    desc: "Calculate the total amount with GST for multiple line items at different tax rates, useful for preparing invoices and purchase orders.",
  },
];

const steps = [
  { title: "Enter the amount", desc: "Provide the base price or GST-inclusive amount depending on your direction." },
  { title: "Select the mode", desc: "Choose 'Add GST' to calculate GST-inclusive price, or 'Remove GST' to extract base price." },
  { title: "Pick the GST rate", desc: "Select 5%, 12%, 18%, 28%, or enter a custom rate." },
  { title: "Get result", desc: "See the base amount, GST component, and total amount broken down clearly." },
];

const faqs = [
  {
    q: "What are the GST slabs in India?",
    a: "India's GST has five main rate slabs: 0% (essential goods like unprocessed food), 5% (daily necessities), 12% (processed food, medicines), 18% (most services and manufactured goods), and 28% (luxury goods, automobiles, tobacco).",
  },
  {
    q: "How do I remove GST from a GST-inclusive price?",
    a: "Divide the inclusive price by (1 + GST rate). For example, to remove 18% GST from ₹1,180: ₹1,180 ÷ 1.18 = ₹1,000 base price, with ₹180 as the GST component.",
  },
  {
    q: "What is CGST and SGST?",
    a: "For transactions within a state, GST is split equally between Central GST (CGST) and State GST (SGST). For example, 18% GST becomes 9% CGST + 9% SGST. For inter-state transactions, the full rate applies as IGST.",
  },
  {
    q: "Can I use this for VAT or sales tax?",
    a: "Yes. The 'custom rate' option lets you enter any tax percentage, making this calculator usable for VAT (UK/EU), HST/GST (Canada), or US sales tax.",
  },
  {
    q: "Does this calculator include CESS?",
    a: "The base calculation covers standard GST rates. Cess applies on top of the 28% slab for specific goods — add the cess percentage separately if applicable to your product.",
  },
];

export default function GSTCalculatorPage() {
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
      <WebAppSchema slug="gst-calculator" />
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
            { name: "GST Calculator" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          GST Calculator – Add or Remove GST from Any Price Instantly
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Calculate GST for India instantly. Add GST to a base price to get the inclusive total,
          remove GST from an inclusive amount to find the base price, or reverse-calculate the
          tax rate. Covers all GST slabs — 5%, 12%, 18%, 28%, and custom rates.
        </p>

        <div className="mt-8">
          <GSTCalculatorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Common GST Calculation Tasks
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
            How to Calculate GST Online
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
              GST-Exclusive vs. GST-Inclusive Pricing Explained
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              GST-exclusive pricing (also called base price or net price) is the amount before
              tax is added. This is the number used on B2B invoices between registered
              businesses because both parties can claim input tax credits. To get the
              GST-inclusive price, add the applicable GST percentage: a ₹10,000 base at
              18% GST gives ₹11,800 inclusive. GST-inclusive pricing is what consumers pay
              at retail — the final MRP printed on products already includes GST. To work
              backwards from an inclusive price, divide by (1 + rate): ₹11,800 ÷ 1.18 =
              ₹10,000 base. The &ldquo;Remove GST&rdquo; mode here does exactly this calculation, showing
              you both the base price and the GST component separately.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Which GST Rate Applies to Your Product or Service?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              India&apos;s GST rate structure has five slabs. The 0% slab covers essential
              unprocessed food items like fresh vegetables, milk, eggs, and grains. The 5%
              slab includes items of daily necessity such as sugar, tea, coffee, edible oils,
              and medicines. The 12% slab applies to processed foods, packaged food products,
              and certain medicines and medical devices. The 18% slab is the most common
              for services and manufactured goods — restaurant bills, hotel stays, most
              professional services, software, electronics, and consumer appliances fall here.
              The 28% slab covers luxury goods, automobiles, and products with a social cost
              such as tobacco and aerated drinks — and many of these attract an additional
              cess. When unsure, check the GST Council&apos;s official rate schedule or consult
              your CA, as misclassification leads to incorrect invoicing and compliance issues.
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

        <RelatedTools slug="gst-calculator" />
      </main>
    </>
  );
}
