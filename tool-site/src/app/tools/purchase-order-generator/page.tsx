import type { Metadata } from "next";
import Link from "next/link";
import DocumentGeneratorComingSoon from "@/components/document-generator-coming-soon";

export const metadata: Metadata = {
  title: "Purchase Order Generator Online Free — Vendor PO Documents | ToolMint",
  description: "Create purchase orders online for free with ToolMint. Add vendor details, item quantities, rates, delivery terms, and printable PDF output. Coming soon.",
  keywords: ["purchase order generator","po generator","vendor purchase order","purchase order template","buying order generator","po pdf generator","procurement document generator","toolmint purchase order"],
  alternates: { canonical: "/tools/purchase-order-generator" },
  openGraph: { title: "Purchase Order Generator Online Free | ToolMint", description: "Create vendor purchase orders with item quantities, pricing, delivery terms, and PDF export. Coming soon.", url: "/tools/purchase-order-generator" },
};

const includedTools = [
  { title: "Vendor & Buyer Details", desc: "Add purchasing company details, supplier information, PO number, issue date, and shipping or billing addresses." },
  { title: "Order Item Table", desc: "List ordered products or materials with SKU details, quantities, unit costs, taxes, and expected totals." },
  { title: "Delivery & Payment Terms", desc: "Specify shipping instructions, delivery dates, approval notes, and commercial terms for procurement workflows." },
  { title: "Printable PO Output", desc: "Generate structured purchase order documents for vendor communication, approvals, and PDF archiving." },
];

const steps = [
  { title: "Enter buyer and vendor info", desc: "Add the purchasing company details, supplier details, addresses, and PO reference number." },
  { title: "Add ordered items", desc: "Enter item names, quantities, unit costs, taxes, and other order-specific pricing information." },
  { title: "Set terms and delivery details", desc: "Include shipping, payment, and delivery instructions to finalize the order request clearly." },
  { title: "Print or export the PO", desc: "Download the purchase order as PDF or print it for internal approval and vendor communication." },
];

const faqs = [
  { q: "What is a purchase order?", a: "A purchase order is a formal document a buyer sends to a supplier to request goods or materials, specifying quantities, pricing, delivery terms, and order references." },
  { q: "Will the purchase order generator support vendor details and item lists?", a: "Yes. ToolMint's planned Purchase Order Generator is designed to support vendor and buyer details, line items, quantities, prices, and delivery terms." },
  { q: "Can purchase orders include shipping or payment terms?", a: "Yes. The generator is being built to support delivery notes, payment terms, and procurement-related instructions in the document layout." },
  { q: "Will I be able to export purchase orders as PDF?", a: "Yes. ToolMint plans to support print-ready purchase order formatting and PDF export for business procurement workflows." },
  { q: "Is the purchase order generator live now?", a: "Not yet. The landing page is available, but the complete purchase order builder is still under development." },
];

export default function PurchaseOrderGeneratorPage() {
  const faqSchema = {"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map((f)=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))};
  return (
    <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12"><Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">← Back to home</Link><h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">Purchase Order Generator — Vendor PO Documents Online</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">Create vendor purchase orders with buyer and supplier details, ordered items, quantities, pricing, and delivery terms. ToolMint&apos;s upcoming Purchase Order Generator is being built for procurement teams, retailers, and growing businesses.</p><DocumentGeneratorComingSoon icon="📦" title="Purchase Order Generator" description="We&apos;re building a purchase order generator with vendor details, item tables, delivery instructions, approval notes, and PDF export." /><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Included Purchase Order Tools</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{includedTools.map((tool)=>(<div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><h3 className="font-semibold text-foreground">{tool.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">How to Create a Purchase Order Online</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map((s,i)=>(<div key={s.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><span className="font-display text-2xl font-bold text-[#6c63ff]">{i+1}</span><h3 className="mt-2 font-semibold text-foreground">{s.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Frequently Asked Questions</h2><dl className="mt-6 space-y-6">{faqs.map((f)=>(<div key={f.q}><dt className="font-semibold text-foreground">{f.q}</dt><dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd></div>))}</dl></section></main></>
  );
}