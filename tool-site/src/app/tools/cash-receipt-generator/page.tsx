import type { Metadata } from "next";
import Link from "next/link";
import DocumentGeneratorComingSoon from "@/components/document-generator-coming-soon";

export const metadata: Metadata = {
  title: "Cash Receipt Generator Online Free — Cash Payment Receipts | ToolMint",
  description: "Create cash payment receipts online for free with ToolMint. Add payer details, received amount, payment date, purpose, and printable PDF export. Coming soon.",
  keywords: ["cash receipt generator","cash payment receipt","money receipt generator","cash received receipt","receipt for cash payment","printable cash receipt","cash receipt pdf","toolmint cash receipt"],
  alternates: { canonical: "/tools/cash-receipt-generator" },
  openGraph: { title: "Cash Receipt Generator Online Free | ToolMint", description: "Create receipts for cash payments with amount, payer, purpose, and printable PDF output. Coming soon.", url: "/tools/cash-receipt-generator" },
};

const includedTools = [
  { title: "Cash Payment Details", desc: "Record the received cash amount, date, payer information, payment purpose, and currency for each receipt." },
  { title: "Acknowledgment Section", desc: "Add receipt notes and confirmation text that acknowledge money received in cash for goods, services, rent, or deposits." },
  { title: "Receipt Numbers & References", desc: "Generate organized cash receipt references and add invoice or transaction links for easier bookkeeping." },
  { title: "Printable Cash Receipt Output", desc: "Create a professional cash receipt layout suitable for printing, PDF export, and record retention." },
];

const steps = [
  { title: "Enter payer details", desc: "Add the name of the person or business making the cash payment and the date received." },
  { title: "Record the amount", desc: "Enter the total cash amount received and the reason or purpose of the payment." },
  { title: "Add references", desc: "Include receipt numbers, invoice references, or supporting notes for documentation." },
  { title: "Print or save", desc: "Export the finished cash receipt as PDF or print it immediately." },
];

const faqs = [
  { q: "What is a cash receipt?", a: "A cash receipt is a document confirming that a payment was received in cash. It typically includes the payer, date, amount, purpose, and recipient acknowledgment." },
  { q: "What will the cash receipt generator include?", a: "ToolMint's planned Cash Receipt Generator will include payer details, cash amount, payment purpose, dates, references, and printable receipt output." },
  { q: "Can cash receipts reference invoices or dues?", a: "Yes. The planned tool is intended to support receipt numbers and invoice references so cash collections can be connected to business records." },
  { q: "Will the tool support PDF export?", a: "Yes. The generator is being designed to support print-ready cash receipts and PDF export for filing or sharing." },
  { q: "Is the cash receipt tool ready now?", a: "Not yet. The route is live for SEO and navigation, but the full cash receipt builder is still under development." },
];

export default function CashReceiptGeneratorPage() {
  const faqSchema = {"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map((f)=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))};
  return (
    <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12"><Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">← Back to home</Link><h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">Cash Receipt Generator — Cash Payment Acknowledgments</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">Create formal cash payment receipts with payer details, payment purpose, receipt numbers, and acknowledgment notes. ToolMint&apos;s upcoming Cash Receipt Generator is designed for landlords, small businesses, service providers, and cash-based transactions.</p><DocumentGeneratorComingSoon icon="💵" title="Cash Receipt Generator" description="We&apos;re building a cash receipt generator with amount, purpose, payer details, receipt references, and printable PDF output." /><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Included Cash Receipt Tools</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{includedTools.map((tool)=>(<div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><h3 className="font-semibold text-foreground">{tool.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">How to Create a Cash Receipt Online</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map((s,i)=>(<div key={s.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><span className="font-display text-2xl font-bold text-[#6c63ff]">{i+1}</span><h3 className="mt-2 font-semibold text-foreground">{s.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Frequently Asked Questions</h2><dl className="mt-6 space-y-6">{faqs.map((f)=>(<div key={f.q}><dt className="font-semibold text-foreground">{f.q}</dt><dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd></div>))}</dl></section></main></>
  );
}