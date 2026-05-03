import type { Metadata } from "next";
import PdfToPdfaTool from "@/components/pdf-to-pdfa-tool";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";

export const metadata: Metadata = {
  title: "PDF to PDF/A Online Free - Convert PDF for Long-Term Archiving",
  description:
    "Convert PDF to PDF/A online for free with ToolMint. Create archival-quality PDF/A-1b, PDF/A-2b, or PDF/A-3b documents that meet long-term storage requirements.",
  keywords: [
    "pdf to pdfa",
    "pdf to pdf/a",
    "pdf/a converter",
    "archival pdf",
    "iso 19005 pdf",
    "pdf/a-1b converter",
    "pdf/a-2b converter",
    "convert pdf to archival format",
  ],
  alternates: { canonical: "/tools/pdf-to-pdfa" },
  openGraph: {
    title: "PDF to PDF/A Online Free - Convert PDF for Long-Term Archiving | ToolMint",
    description:
      "Convert PDF to PDF/A online for free. Create archival PDF/A files in PDF/A-1b, PDF/A-2b, or PDF/A-3b.",
    url: "/tools/pdf-to-pdfa",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Drag and drop or select the PDF file you want to archive." },
  { title: "Select conformance", desc: "Choose PDF/A-1b, PDF/A-2b, or PDF/A-3b based on your archive requirements." },
  { title: "Convert", desc: "ToolMint processes the file into a conformant PDF/A document." },
  { title: "Download", desc: "Save the archival PDF ready for long-term storage or submission." },
];

const faqs = [
  {
    q: "What is PDF/A format?",
    a: "PDF/A is a standard for long-term digital preservation. It embeds the resources needed so the document is more likely to render consistently in the future.",
  },
  {
    q: "What is the difference between PDF/A-1b, PDF/A-2b, and PDF/A-3b?",
    a: "PDF/A-1b is the broadest compatibility level. PDF/A-2b adds support for newer PDF features, while PDF/A-3b allows embedded files.",
  },
  {
    q: "Is the conversion done server-side?",
    a: "Yes. PDF/A conversion is handled as a server-assisted task and the file is removed after processing completes.",
  },
  {
    q: "Does PDF/A support digital signatures?",
    a: "PDF/A-2b and PDF/A-3b can support digital signatures depending on the workflow. PDF/A-1b is more limited.",
  },
  {
    q: "Is this tool suitable for legal or government submissions?",
    a: "It is useful for archiving and submission workflows that request PDF/A, but you should always confirm the exact version required by the receiving system.",
  },
];

export default function PdfToPdfaPage() {
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
      <main className="pdf-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "PDF Tools", href: "/tools/pdf-tools" },
            { name: "PDF to PDF/A" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert PDF to PDF/A for Long-Term Archiving
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Create archival PDF/A files with ToolMint. Choose PDF/A-1b, PDF/A-2b,
          or PDF/A-3b when you need a document format better suited to records,
          institutional storage, or submission requirements.
        </p>

        <div className="mt-8">
          <PdfToPdfaTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Convert PDF to PDF/A
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
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
            {faqs.map((f, i) => (
              <div key={i}>
                <dt className="font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <RelatedTools slug="pdf-to-pdfa" />
      </main>
    </>
  );
}
