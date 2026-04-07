import type { Metadata } from "next";
import Link from "next/link";
import DocumentGeneratorComingSoon from "@/components/document-generator-coming-soon";

export const metadata: Metadata = {
  title: "Credit Note Generator Online Free — Refund & Credit Memo | ToolMint",
  description: "Create credit notes online with ToolMint for refunds, returns, and invoice adjustments. Add customer details, original invoice references, and PDF export. Coming soon.",
  keywords: ["credit note generator","credit memo generator","refund note generator","sales return credit note","invoice adjustment note","credit note template","credit note pdf","toolmint credit note"],
  alternates: { canonical: "/tools/credit-note-generator" },
  openGraph: { title: "Credit Note Generator Online Free | ToolMint", description: "Create refund and credit memo documents with original invoice references and printable PDF export. Coming soon.", url: "/tools/credit-note-generator" },
};

const includedTools = [
  { title: "Original Invoice References", desc: "Link a credit note back to the original invoice number, date, and customer details for cleaner accounting records." },
  { title: "Refund & Adjustment Items", desc: "Add returned products, refunded services, price adjustments, and tax corrections with credit totals." },
  { title: "Reason & Notes Section", desc: "Record why the credit note was issued, including return reasons, corrections, or partial refund explanations." },
  { title: "PDF Credit Memo Output", desc: "Generate printable credit note documents suitable for customers, auditors, and accounting teams." },
];

const steps = [
  { title: "Add customer and invoice references", desc: "Enter the recipient details and the original invoice information tied to the credit note." },
  { title: "List credited items", desc: "Add returned items, service adjustments, or partial refund amounts together with tax corrections if needed." },
  { title: "Explain the adjustment", desc: "Add the reason for the credit note and review the total credit amount before finalizing." },
  { title: "Export the credit note", desc: "Print or save the document as PDF for customer communication and accounting records." },
];

const faqs = [
  { q: "What is a credit note?", a: "A credit note is a document issued to reduce or reverse part of an earlier invoice, usually for returns, refunds, billing corrections, or pricing adjustments." },
  { q: "Can a credit note reference an original invoice?", a: "Yes. ToolMint's planned Credit Note Generator is intended to include original invoice references so the adjustment is clearly tied to the earlier sale." },
  { q: "Will the tool support partial refunds and returns?", a: "Yes. The generator is being designed to support returned items, service corrections, partial credits, and tax adjustments where applicable." },
  { q: "Will I be able to export credit notes as PDF?", a: "Yes. ToolMint plans to support print-ready credit note layouts and PDF export for business records and customer communication." },
  { q: "Is the credit note generator available now?", a: "Not yet. The route is live for SEO and navigation, but the full credit note builder is still under development." },
];

export default function CreditNoteGeneratorPage() {
  const faqSchema = {"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map((f)=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))};
  return (
    <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12"><Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">← Back to home</Link><h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">Credit Note Generator — Refund &amp; Adjustment Memos</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">Create professional credit notes for refunds, returns, and billing adjustments with invoice references, credited items, and printable formatting. ToolMint&apos;s upcoming Credit Note Generator is being built for accounting and customer support workflows.</p><DocumentGeneratorComingSoon icon="↩️" title="Credit Note Generator" description="We&apos;re building a credit note generator for refunds, returns, invoice adjustments, reason tracking, and PDF export." /><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Included Credit Note Tools</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{includedTools.map((tool)=>(<div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><h3 className="font-semibold text-foreground">{tool.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">How to Create a Credit Note Online</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map((s,i)=>(<div key={s.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><span className="font-display text-2xl font-bold text-[#6c63ff]">{i+1}</span><h3 className="mt-2 font-semibold text-foreground">{s.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Frequently Asked Questions</h2><dl className="mt-6 space-y-6">{faqs.map((f)=>(<div key={f.q}><dt className="font-semibold text-foreground">{f.q}</dt><dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd></div>))}</dl></section></main></>
  );
}