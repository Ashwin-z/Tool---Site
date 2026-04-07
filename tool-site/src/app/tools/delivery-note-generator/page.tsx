import type { Metadata } from "next";
import Link from "next/link";
import DocumentGeneratorComingSoon from "@/components/document-generator-coming-soon";

export const metadata: Metadata = {
  title: "Delivery Note Generator Online Free — Shipment Delivery Notes | ToolMint",
  description: "Create delivery notes online with ToolMint. Add shipment details, item lists, delivery addresses, and printable PDF output for dispatch workflows. Coming soon.",
  keywords: ["delivery note generator","shipment note generator","dispatch note generator","delivery challan generator","goods delivery note","delivery note template","delivery note pdf","toolmint delivery note"],
  alternates: { canonical: "/tools/delivery-note-generator" },
  openGraph: { title: "Delivery Note Generator Online Free | ToolMint", description: "Create shipment delivery notes with item lists, addresses, dispatch details, and printable PDF output. Coming soon.", url: "/tools/delivery-note-generator" },
};

const includedTools = [
  { title: "Shipment & Address Details", desc: "Add sender details, receiver details, dispatch dates, delivery addresses, and reference numbers for outgoing shipments." },
  { title: "Delivered Item List", desc: "List products, quantities, and notes for goods included in the shipment so the delivery note matches the dispatched order." },
  { title: "Dispatch & Acknowledgment Notes", desc: "Include vehicle, courier, driver, consignee, or signature fields as part of delivery confirmation workflows." },
  { title: "Printable Delivery Note Output", desc: "Generate a delivery note layout suitable for printing, dispatch packets, and PDF archiving." },
];

const steps = [
  { title: "Enter sender and receiver info", desc: "Add company details, consignee information, addresses, and dispatch dates." },
  { title: "List delivered items", desc: "Enter the products, quantities, and any shipment notes that need to appear on the delivery note." },
  { title: "Add dispatch references", desc: "Include courier, shipment, driver, or acknowledgment details if your workflow requires them." },
  { title: "Print or export", desc: "Generate the final delivery note as a printable document or PDF for dispatch records." },
];

const faqs = [
  { q: "What is a delivery note?", a: "A delivery note is a document sent with goods to confirm what was dispatched, where it was sent, and what quantities were included in the shipment." },
  { q: "Will the generator support itemized shipment lists?", a: "Yes. ToolMint's planned Delivery Note Generator is intended to support product lists, quantities, dispatch references, and receiver details." },
  { q: "Can delivery notes include dispatch or courier details?", a: "Yes. The planned tool is being designed to support shipment notes, courier references, and acknowledgment-related information for dispatch workflows." },
  { q: "Will delivery notes be exportable as PDF?", a: "Yes. ToolMint plans to support print-ready delivery note layouts and PDF export for transport and inventory workflows." },
  { q: "Is the delivery note generator available now?", a: "Not yet. This route is live for navigation and SEO, but the full delivery note builder is still under development." },
];

export default function DeliveryNoteGeneratorPage() {
  const faqSchema = {"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map((f)=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))};
  return (
    <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12"><Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">← Back to home</Link><h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">Delivery Note Generator — Shipment Delivery Documents</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">Create shipment delivery notes with sender and receiver details, delivered items, dispatch references, and printable layouts. ToolMint&apos;s upcoming Delivery Note Generator is being designed for dispatch teams, warehouses, and business shipments.</p><DocumentGeneratorComingSoon icon="🚚" title="Delivery Note Generator" description="We&apos;re building a delivery note generator with shipment details, item lists, dispatch references, acknowledgment fields, and PDF export." /><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Included Delivery Note Tools</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{includedTools.map((tool)=>(<div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><h3 className="font-semibold text-foreground">{tool.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">How to Create a Delivery Note Online</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map((s,i)=>(<div key={s.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><span className="font-display text-2xl font-bold text-[#6c63ff]">{i+1}</span><h3 className="mt-2 font-semibold text-foreground">{s.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Frequently Asked Questions</h2><dl className="mt-6 space-y-6">{faqs.map((f)=>(<div key={f.q}><dt className="font-semibold text-foreground">{f.q}</dt><dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd></div>))}</dl></section></main></>
  );
}