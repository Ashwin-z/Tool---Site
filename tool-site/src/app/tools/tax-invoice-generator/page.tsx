import type { Metadata } from "next";
import Link from "next/link";
import DocumentGeneratorComingSoon from "@/components/document-generator-coming-soon";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Tax Invoice Generator Online Free — GST & VAT Invoices | ToolMint",
  description:
    "Create GST, VAT, and tax-compliant invoices online with ToolMint. Add tax IDs, line items, taxable amounts, and printable PDF export. Coming soon.",
  keywords: [
    "tax invoice generator",
    "gst invoice generator",
    "vat invoice generator",
    "tax compliant invoice",
    "invoice with gst",
    "business tax invoice maker",
    "online tax invoice",
    "tax invoice pdf",
  ],
  alternates: { canonical: "/tools/tax-invoice-generator" },
  openGraph: {
    title: "Tax Invoice Generator Online Free | ToolMint",
    description:
      "Generate GST and VAT compliant invoices with tax IDs, itemized totals, and printable PDF export. Coming soon.",
    url: "/tools/tax-invoice-generator",
  },
};

const includedTools = [
  { title: "GST / VAT Fields", desc: "Add tax registration numbers, tax rates, taxable values, and invoice-level tax summaries for compliant business billing." },
  { title: "Itemized Tax Calculation", desc: "Calculate tax per line item or subtotal so each invoice shows clear taxable and final payable amounts." },
  { title: "Buyer & Seller Details", desc: "Include full supplier and customer information, billing addresses, invoice numbers, and issue dates." },
  { title: "PDF & Print Output", desc: "Generate printable tax invoice layouts for accounting records, customer sharing, and tax filing workflows." },
];

const steps = [
  { title: "Enter tax details", desc: "Add your business tax IDs, customer details, invoice number, and invoice dates." },
  { title: "Add taxable line items", desc: "Enter products or services with quantities, rates, and the tax rate that applies to each row." },
  { title: "Verify tax totals", desc: "Review taxable values, tax amounts, and the final amount payable before export." },
  { title: "Export the invoice", desc: "Print or save the completed tax invoice as PDF for customer delivery and bookkeeping." },
];

const faqs = [
  { q: "What is a tax invoice?", a: "A tax invoice is a business invoice that includes the tax information required for compliance, such as GST, VAT, or sales tax amounts, registration details, and taxable totals." },
  { q: "Will the tool support GST and VAT invoices?", a: "Yes. ToolMint's planned Tax Invoice Generator is designed for GST and VAT style invoicing, with tax fields, tax totals, and printable export." },
  { q: "Can I add tax per line item?", a: "Yes. The planned builder will support itemized products or services with tax applied at the row or summary level, depending on the invoice setup." },
  { q: "Will I be able to save tax invoices as PDF?", a: "Yes. The final tool is planned to support print-ready tax invoices and PDF export for accounting and compliance workflows." },
  { q: "Is the tax invoice generator available now?", a: "Not yet. This landing page is live for SEO and navigation, but the full tax invoice builder is still under development." },
];

export default function TaxInvoiceGeneratorPage() {
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">← Back to home</Link>
        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">Tax Invoice Generator — GST &amp; VAT Compliant Billing</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">Create tax-compliant invoices with GST, VAT, or other business tax details, plus line items, taxable values, and final payable totals. ToolMint&apos;s Tax Invoice Generator is being built for compliant billing and printable PDF export.</p>
        <DocumentGeneratorComingSoon icon="🧾" title="Tax Invoice Generator" description="We&apos;re building a tax-compliant invoice generator with GST and VAT fields, itemized tax totals, registration details, and printable PDF export." />
        <section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Included Tax Invoice Tools</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{includedTools.map((tool) => (<div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><h3 className="font-semibold text-foreground">{tool.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p></div>))}</div></section>
        <section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">How to Create a Tax Invoice Online</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map((s, i) => (<div key={s.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><span className="font-display text-2xl font-bold text-[#6c63ff]">{i + 1}</span><h3 className="mt-2 font-semibold text-foreground">{s.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p></div>))}</div></section>
        <section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Frequently Asked Questions</h2><dl className="mt-6 space-y-6">{faqs.map((f) => (<div key={f.q}><dt className="font-semibold text-foreground">{f.q}</dt><dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd></div>))}</dl></section>
      </main>
    </>
  );
}