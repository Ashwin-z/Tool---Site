import type { Metadata } from "next";
import Link from "next/link";
import DocumentGeneratorComingSoon from "@/components/document-generator-coming-soon";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Sales Receipt Generator Online Free — POS & Retail Receipts | ToolMint",
  description: "Create sales receipts online with ToolMint for point-of-sale and retail transactions. Add sold items, taxes, quantities, payment methods, and PDF output. Coming soon.",
  keywords: ["sales receipt generator","pos receipt generator","retail receipt maker","sales receipt template","receipt for sold items","printable sales receipt","sales receipt pdf","toolmint sales receipt"],
  alternates: { canonical: "/tools/sales-receipt-generator" },
  openGraph: { title: "Sales Receipt Generator Online Free | ToolMint", description: "Create retail and point-of-sale receipts with sold items, taxes, totals, and payment details. Coming soon.", url: "/tools/sales-receipt-generator" },
};

const includedTools = [
  { title: "Sold Items Table", desc: "List products sold with quantities, prices, taxes, and totals for point-of-sale or retail style receipt generation." },
  { title: "Payment Method Details", desc: "Capture cash, card, transfer, or mixed payment details together with transaction references where needed." },
  { title: "Store & Customer Information", desc: "Add store details, receipt number, cashier references, customer info, and sale dates for clearer transaction records." },
  { title: "Printable POS Receipt Layout", desc: "Generate a clean sales receipt format ready for printing or saving as PDF for accounting and customer proof of purchase." },
];

const steps = [
  { title: "Add sale details", desc: "Enter store or seller information, sale date, receipt number, and customer information if needed." },
  { title: "Enter sold items", desc: "Add purchased products with quantities, rates, tax, and total amounts for each item." },
  { title: "Record payment", desc: "Select the payment method and add any reference, cashier, or transaction details required." },
  { title: "Export the receipt", desc: "Print the final sales receipt or save it as PDF for records and customer delivery." },
];

const faqs = [
  { q: "What is a sales receipt?", a: "A sales receipt is a document given after a sale is completed. It records the purchased items, amounts, taxes, payment method, and proof of purchase." },
  { q: "Will the tool support itemized retail receipts?", a: "Yes. ToolMint's planned Sales Receipt Generator is designed to support itemized products, quantities, tax, totals, and payment details for retail or point-of-sale receipts." },
  { q: "Can I include taxes on sales receipts?", a: "Yes. The tool is planned to support tax-aware receipt generation so the total reflects product pricing and tax amounts accurately." },
  { q: "Will I be able to print sales receipts?", a: "Yes. The generator is being built with print-ready formatting and PDF export so sales receipts can be shared or archived easily." },
  { q: "Is the sales receipt generator available now?", a: "Not yet. The page is available as a landing page, but the full receipt builder is still in development." },
];

export default function SalesReceiptGeneratorPage() {
  const faqSchema = {"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map((f)=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))};
  return (
    <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12"><Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">← Back to home</Link><h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">Sales Receipt Generator — Retail &amp; POS Receipts Online</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">Generate itemized sales receipts for retail, counter sales, and point-of-sale transactions. ToolMint&apos;s upcoming Sales Receipt Generator is being designed for product lines, taxes, payment methods, and fast printable output.</p><DocumentGeneratorComingSoon icon="🛒" title="Sales Receipt Generator" description="We&apos;re building a sales receipt generator for itemized retail receipts, taxes, payment methods, and printable PDF output." /><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Included Sales Receipt Tools</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{includedTools.map((tool)=>(<div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><h3 className="font-semibold text-foreground">{tool.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">How to Create a Sales Receipt Online</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map((s,i)=>(<div key={s.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><span className="font-display text-2xl font-bold text-[#6c63ff]">{i+1}</span><h3 className="mt-2 font-semibold text-foreground">{s.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Frequently Asked Questions</h2><dl className="mt-6 space-y-6">{faqs.map((f)=>(<div key={f.q}><dt className="font-semibold text-foreground">{f.q}</dt><dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd></div>))}</dl></section></main></>
  );
}