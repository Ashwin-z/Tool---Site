import type { Metadata } from "next";
import Link from "next/link";
import DocumentGeneratorComingSoon from "@/components/document-generator-coming-soon";

export const metadata: Metadata = {
  title: "Receipt Generator Online Free — Create Payment Receipts | ToolMint",
  description: "Create professional payment receipts online with ToolMint. Add payer details, payment methods, amounts, references, and printable PDF output. Coming soon.",
  keywords: ["receipt generator","payment receipt maker","receipt template online","receipt pdf generator","money receipt generator","simple receipt maker","printable receipt online","toolmint receipt generator"],
  alternates: { canonical: "/tools/receipt-generator" },
  openGraph: { title: "Receipt Generator Online Free | ToolMint", description: "Create payment confirmation receipts with amounts, dates, payment method details, and PDF export. Coming soon.", url: "/tools/receipt-generator" },
};

const includedTools = [
  { title: "Payer & Receiver Details", desc: "Add business details, customer name, receipt number, payment date, and contact information for both sides of the transaction." },
  { title: "Payment Summary", desc: "Record the paid amount, currency, payment method, transaction reference, and balance notes if required." },
  { title: "Receipt Notes Section", desc: "Include remarks, invoice references, purpose of payment, and acknowledgment text for formal receipt confirmation." },
  { title: "PDF & Print Receipt Output", desc: "Generate a clean receipt layout ready for printing, emailing, or archiving as PDF." },
];

const steps = [
  { title: "Enter payment details", desc: "Add the payer, receiver, date, receipt number, and reason for the payment." },
  { title: "Record amount and method", desc: "Enter the received amount, currency, payment method, and any transaction or reference number." },
  { title: "Add notes", desc: "Include acknowledgment text, invoice references, or remarks if your receipt needs supporting details." },
  { title: "Print or save", desc: "Download the receipt as PDF or print it for record-keeping and customer confirmation." },
];

const faqs = [
  { q: "What is a receipt generator used for?", a: "A receipt generator helps create payment confirmation documents that show who paid, how much was paid, when it was paid, and what the payment was for." },
  { q: "Will the tool support payment method details?", a: "Yes. ToolMint's planned Receipt Generator is designed to include cash, card, transfer, and reference-based payment details in the receipt layout." },
  { q: "Can I include invoice references on receipts?", a: "Yes. The planned builder will support receipt notes and invoice references so payments can be linked back to sales or outstanding invoices." },
  { q: "Will receipts be exportable as PDF?", a: "Yes. The final tool is planned to offer printable receipts and PDF export for accounting and customer communication." },
  { q: "Is the receipt generator available already?", a: "Not yet. This receipt landing page is live, but the full generator is still under development." },
];

export default function ReceiptGeneratorPage() {
  const faqSchema = {"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map((f)=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))};
  return (
    <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12"><Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">← Back to home</Link><h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">Receipt Generator — Create Payment Receipts Online</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">Create professional payment receipts with payer details, payment methods, dates, references, and acknowledgment notes. ToolMint&apos;s upcoming Receipt Generator is designed for freelancers, retail businesses, and service providers that need printable proof of payment.</p><DocumentGeneratorComingSoon icon="🧾" title="Receipt Generator" description="We&apos;re building a payment receipt generator with amount, payment method, reference details, acknowledgment notes, and PDF export." /><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Included Receipt Tools</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{includedTools.map((tool)=>(<div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><h3 className="font-semibold text-foreground">{tool.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">How to Create a Receipt Online</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map((s,i)=>(<div key={s.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><span className="font-display text-2xl font-bold text-[#6c63ff]">{i+1}</span><h3 className="mt-2 font-semibold text-foreground">{s.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Frequently Asked Questions</h2><dl className="mt-6 space-y-6">{faqs.map((f)=>(<div key={f.q}><dt className="font-semibold text-foreground">{f.q}</dt><dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd></div>))}</dl></section></main></>
  );
}