import type { Metadata } from "next";
import Link from "next/link";
import DocumentGeneratorComingSoon from "@/components/document-generator-coming-soon";

export const metadata: Metadata = {
  title: "Quotation Generator Online Free — Create Business Quotes | ToolMint",
  description:
    "Create professional business quotations online for free with ToolMint. Add client details, line items, taxes, pricing, terms, and printable PDF export. Coming soon.",
  keywords: [
    "quotation generator",
    "quote generator",
    "business quotation maker",
    "quotation format online",
    "price quote generator",
    "sales quotation generator",
    "quotation pdf generator",
    "online quote maker",
    "professional quotation template",
    "toolmint quotation generator",
  ],
  alternates: { canonical: "/tools/quotation-generator" },
  openGraph: {
    title: "Quotation Generator Online Free | ToolMint",
    description:
      "Create business quotations with client details, pricing, taxes, terms, and printable PDF export. Coming soon.",
    url: "/tools/quotation-generator",
  },
};

const includedTools = [
  { title: "Client & Company Details", desc: "Add sender details, recipient information, quotation number, validity dates, and reference details for business quote preparation." },
  { title: "Line Items & Pricing", desc: "List products or services with quantities, rates, unit pricing, taxes, discounts, and calculated totals for transparent quotations." },
  { title: "Terms & Validity Section", desc: "Include quotation terms, payment expectations, delivery notes, and expiration dates so clients know exactly how long the quote is valid." },
  { title: "Print & PDF Quote Export", desc: "Generate a professional quotation layout that can be printed or exported as PDF for sharing with prospects and customers." },
];

const steps = [
  { title: "Enter company and client info", desc: "Fill in business details, customer name, quote number, issue date, and quotation validity period." },
  { title: "Add pricing details", desc: "Insert products or services with rates, quantities, taxes, and any discounts that apply to the quotation." },
  { title: "Review quote terms", desc: "Check totals, note any commercial terms, and confirm the quote clearly reflects the offer you want to send." },
  { title: "Export the quotation", desc: "Print the document or save it as PDF for email delivery, approvals, or sales follow-up." },
];

const faqs = [
  {
    q: "What is a quotation generator used for?",
    a: "A quotation generator is used to create formal business quotes for products or services before a sale is finalized. It helps businesses send clear pricing, taxes, validity dates, and terms to customers.",
  },
  {
    q: "What will ToolMint's quotation generator include?",
    a: "The planned quotation generator will include company and client details, line items, taxes, discounts, totals, quote validity, business terms, and printable PDF export.",
  },
  {
    q: "Can quotations include tax and discounts?",
    a: "Yes. The tool is being designed to support taxes, percentage discounts, flat discounts, and detailed price breakdowns so sales quotations remain clear and professional.",
  },
  {
    q: "Will I be able to export quotes as PDF?",
    a: "Yes. ToolMint plans to include both print-ready formatting and PDF export so quotations can be shared quickly with clients.",
  },
  {
    q: "Is the quotation generator live yet?",
    a: "Not yet. The quotation landing page is available, but the full builder is still under development and will be released in a future update.",
  },
];

export default function QuotationGeneratorPage() {
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
      <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Quotation Generator — Create Business Quotes Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Create professional business quotations with customer details, pricing, line items, taxes,
          discounts, and validity periods. ToolMint&apos;s upcoming Quotation Generator is built for sales
          teams, freelancers, and service businesses that need clean PDF-ready quotes.
        </p>

        <DocumentGeneratorComingSoon
          icon="📋"
          title="Quotation Generator"
          description="We&apos;re building a business quotation tool with pricing tables, taxes, quote validity, terms, and PDF export so you can send polished quotes faster."
        />

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Quotation Generator Tools
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
            How to Create a Business Quote Online
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
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
            {faqs.map((f) => (
              <div key={f.q}>
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
