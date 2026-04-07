import type { Metadata } from "next";
import Link from "next/link";
import DocumentGeneratorComingSoon from "@/components/document-generator-coming-soon";

export const metadata: Metadata = {
  title: "Invoice Generator Online Free — Create Professional Business Invoices | ToolMint",
  description:
    "Create professional invoices online for free with ToolMint. Add business details, line items, tax, discounts, payment terms, and download printable invoices as PDF. Coming soon.",
  keywords: [
    "invoice generator",
    "free invoice generator",
    "online invoice maker",
    "business invoice template",
    "create invoice online",
    "invoice pdf generator",
    "gst invoice generator",
    "professional invoice maker",
    "line item invoice generator",
    "toolmint invoice generator",
  ],
  alternates: { canonical: "/tools/invoice-generator" },
  openGraph: {
    title: "Invoice Generator Online Free | ToolMint",
    description:
      "Create professional invoices with line items, taxes, discounts, due dates, and printable PDF output. Coming soon.",
    url: "/tools/invoice-generator",
  },
};

const includedTools = [
  { title: "Business Details Section", desc: "Add your company name, logo, contact details, client details, invoice number, issue date, and due date in one structured invoice form." },
  { title: "Line Items & Totals", desc: "Build invoice rows with quantity, unit price, discounts, taxes, and subtotal or grand-total calculations for products or services." },
  { title: "Tax & Discount Controls", desc: "Apply GST, VAT, sales tax, flat discounts, or percentage-based discounts so the invoice total stays compliant and accurate." },
  { title: "Print & PDF Export", desc: "Generate a clean, printable invoice layout that can be saved as PDF and shared with clients or accounting teams." },
];

const steps = [
  { title: "Enter business details", desc: "Fill in your company information, customer details, invoice number, dates, and payment terms." },
  { title: "Add line items", desc: "List products or services with quantities, unit prices, and any discounts or taxes that apply." },
  { title: "Review totals", desc: "Check subtotals, tax totals, discount amounts, and the final amount due before generating the document." },
  { title: "Print or export", desc: "Download the final invoice as PDF or print it directly for billing, bookkeeping, or customer delivery." },
];

const faqs = [
  {
    q: "What will the invoice generator include?",
    a: "ToolMint's Invoice Generator will include invoice numbers, business and client details, line items, taxes, discounts, payment terms, and print or PDF export for professional invoicing.",
  },
  {
    q: "Can I create invoices for services and products?",
    a: "Yes. The invoice generator is being built to support both services and physical products, with flexible line items, quantities, pricing, and notes.",
  },
  {
    q: "Will the tool support tax and discount calculations?",
    a: "Yes. Planned invoice features include configurable tax, discount, subtotal, and final-total calculations so your invoice can match common business billing workflows.",
  },
  {
    q: "Will I be able to download invoices as PDF?",
    a: "Yes. The final tool is planned to support printable invoice layouts and PDF export so invoices can be saved, emailed, or archived easily.",
  },
  {
    q: "Is the invoice generator available now?",
    a: "Not yet. The Invoice Generator landing page is live, but the full document builder is still in development and will be released in a future update.",
  },
];

export default function InvoiceGeneratorPage() {
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
          Invoice Generator — Create Professional Invoices Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Create polished business invoices with line items, taxes, discounts, customer details, and
          payment terms. ToolMint&apos;s upcoming Invoice Generator is designed for freelancers, agencies,
          online sellers, and small businesses that need printable invoices and PDF-ready billing documents.
        </p>

        <DocumentGeneratorComingSoon
          icon="📄"
          title="Invoice Generator"
          description="We&apos;re building a full invoice builder with business details, line items, taxes, discounts, and printable PDF export for professional billing workflows."
        />

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included Invoice Generator Tools
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
            How to Create an Invoice Online
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
