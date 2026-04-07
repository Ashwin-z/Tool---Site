import type { Metadata } from "next";
import Link from "next/link";
import DocumentGeneratorComingSoon from "@/components/document-generator-coming-soon";

export const metadata: Metadata = {
  title: "Estimate Generator Online Free — Project Cost Estimates | ToolMint",
  description: "Create project cost estimates online with ToolMint. Add labor, materials, taxes, pricing breakdowns, and PDF-ready estimate documents. Coming soon.",
  keywords: ["estimate generator","cost estimate generator","project estimate template","service estimate maker","job estimate online","contractor estimate generator","estimate pdf maker","toolmint estimate generator"],
  alternates: { canonical: "/tools/estimate-generator" },
  openGraph: { title: "Estimate Generator Online Free | ToolMint", description: "Create project and service cost estimates with pricing breakdowns, taxes, and printable PDF output. Coming soon.", url: "/tools/estimate-generator" },
};

const includedTools = [
  { title: "Project Cost Breakdown", desc: "Add labor, materials, service items, quantities, unit prices, and optional taxes or discounts for clear estimate preparation." },
  { title: "Client & Job Details", desc: "Include customer details, estimate numbers, issue dates, project descriptions, and validity windows." },
  { title: "Terms & Scope Notes", desc: "Attach assumptions, exclusions, payment terms, and scope notes so estimates clearly define what is and is not included." },
  { title: "Print & PDF Estimate Output", desc: "Generate printable estimate documents suitable for approvals, bids, and customer review." },
];

const steps = [
  { title: "Enter project info", desc: "Add client details, estimate number, project title, and the date or validity period for the estimate." },
  { title: "Add cost items", desc: "List labor, materials, services, or tasks with quantities and pricing breakdowns." },
  { title: "Review totals and notes", desc: "Check the estimated total and add project scope, assumptions, or payment notes." },
  { title: "Export the estimate", desc: "Print the estimate or save it as PDF for client review, bidding, or approvals." },
];

const faqs = [
  { q: "What is an estimate generator used for?", a: "An estimate generator is used to prepare pricing documents before work begins. It helps businesses outline expected project costs, labor, materials, and terms in a professional format." },
  { q: "Can estimates include labor and material costs?", a: "Yes. ToolMint's planned Estimate Generator is designed to support separate labor, material, and service pricing so project costs can be broken down clearly." },
  { q: "Will the estimate tool support validity dates and terms?", a: "Yes. The planned builder is intended to support estimate validity, scope notes, assumptions, and business terms for better client communication." },
  { q: "Will I be able to export estimates as PDF?", a: "Yes. ToolMint plans to support print-ready estimate layouts and PDF export for client sharing and internal approval workflows." },
  { q: "Is the estimate generator live yet?", a: "Not yet. The estimate landing page is live, but the full estimate builder is still under development." },
];

export default function EstimateGeneratorPage() {
  const faqSchema = {"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map((f)=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))};
  return (
    <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12"><Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">← Back to home</Link><h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">Estimate Generator — Project Cost Estimates Online</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">Create clear project and service cost estimates with labor, materials, pricing breakdowns, and client-ready formatting. ToolMint&apos;s upcoming Estimate Generator is being built for contractors, agencies, freelancers, and service businesses.</p><DocumentGeneratorComingSoon icon="📐" title="Estimate Generator" description="We&apos;re building an estimate generator with labor and material breakdowns, project scope notes, pricing totals, and PDF export." /><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Included Estimate Tools</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{includedTools.map((tool)=>(<div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><h3 className="font-semibold text-foreground">{tool.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">How to Create a Cost Estimate Online</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map((s,i)=>(<div key={s.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><span className="font-display text-2xl font-bold text-[#6c63ff]">{i+1}</span><h3 className="mt-2 font-semibold text-foreground">{s.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p></div>))}</div></section><section className="mt-16"><h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Frequently Asked Questions</h2><dl className="mt-6 space-y-6">{faqs.map((f)=>(<div key={f.q}><dt className="font-semibold text-foreground">{f.q}</dt><dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd></div>))}</dl></section></main></>
  );
}