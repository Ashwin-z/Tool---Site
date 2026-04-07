import type { Metadata } from "next";
import Link from "next/link";
import DocumentGeneratorComingSoon from "@/components/document-generator-coming-soon";

export const metadata: Metadata = {
  title: "Proforma Invoice Generator Online Free — Pre-Shipment Invoices | ToolMint",
  description:
    "Create proforma invoices online for free with ToolMint. Add seller and buyer details, pre-shipment pricing, taxes, and terms with printable PDF output. Coming soon.",
  keywords: [
    "proforma invoice generator",
    "pre shipment invoice",
    "proforma invoice online",
    "export invoice generator",
    "business proforma invoice",
    "proforma pdf generator",
    "commercial pre invoice",
    "toolmint proforma invoice",
  ],
  alternates: { canonical: "/tools/proforma-invoice-generator" },
  openGraph: {
    title: "Proforma Invoice Generator Online Free | ToolMint",
    description:
      "Create pre-shipment and pre-sale proforma invoices with pricing, taxes, seller and buyer details, and PDF export. Coming soon.",
    url: "/tools/proforma-invoice-generator",
  },
};

const includedTools = [
  { title: "Buyer & Seller Details", desc: "Add supplier and customer information, invoice references, and shipment-related contact details." },
  { title: "Pre-Sale Pricing Table", desc: "List products or services with estimated quantities, rates, taxes, and expected totals before final invoicing." },
  { title: "Terms & Shipment Notes", desc: "Include shipping notes, validity terms, trade conditions, and remarks commonly required for pre-shipment documents." },
  { title: "Printable PDF Layout", desc: "Generate a professional proforma invoice format suitable for review, client approval, and export documentation." },
];

const steps = [
  { title: "Add invoice parties", desc: "Enter seller and buyer details, document numbers, dates, and reference information." },
  { title: "List estimated items", desc: "Add products or services with planned quantities, prices, taxes, and expected totals." },
  { title: "Review shipment terms", desc: "Confirm payment terms, shipping notes, trade conditions, and validity dates." },
  { title: "Export the document", desc: "Print or save the proforma invoice as PDF for review, shipping workflows, or client approval." },
];

const faqs = [
  { q: "What is a proforma invoice?", a: "A proforma invoice is a preliminary invoice sent before final billing. It outlines expected products, services, pricing, taxes, and terms before a shipment or final sale is completed." },
  { q: "How is a proforma invoice different from a final invoice?", a: "A proforma invoice is an estimate or pre-sale document, while a final invoice is the official bill requesting payment for the completed transaction." },
  { q: "Will the generator support shipping and trade notes?", a: "Yes. The planned Proforma Invoice Generator is intended to support shipment notes, trade terms, and other business details typically included in pre-shipment documents." },
  { q: "Can I export proforma invoices as PDF?", a: "Yes. ToolMint plans to include print-ready layouts and PDF export so proforma invoices can be shared easily with customers or logistics teams." },
  { q: "Is the proforma invoice generator available today?", a: "Not yet. The landing page is live, but the complete document builder is still in development." },
];

export default function ProformaInvoiceGeneratorPage() {
  const faqSchema = {"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map((f)=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))};
  return (
    <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12"><Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">← Back to home</Link><h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">Proforma Invoice Generator — Pre-Shipment Billing Documents</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">Create pre-sale and pre-shipment proforma invoices with product details, pricing, taxes, buyer and seller information, and trade terms. ToolMint&apos;s Proforma Invoice Generator is being built for exporters, service providers, and B2B sales workflows.</p><DocumentGeneratorComingSoon icon="📦" title="Proforma Invoice Generator" description="We&apos;re building a proforma invoice generator for pre-shipment pricing, trade terms, buyer and seller details, and printable PDF export." /><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Included Proforma Invoice Tools</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{includedTools.map((tool)=>(<div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><h3 className="font-semibold text-foreground">{tool.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">How to Create a Proforma Invoice Online</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map((s,i)=>(<div key={s.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><span className="font-display text-2xl font-bold text-[#6c63ff]">{i+1}</span><h3 className="mt-2 font-semibold text-foreground">{s.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Frequently Asked Questions</h2><dl className="mt-6 space-y-6">{faqs.map((f)=>(<div key={f.q}><dt className="font-semibold text-foreground">{f.q}</dt><dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd></div>))}</dl></section></main></>
  );
}