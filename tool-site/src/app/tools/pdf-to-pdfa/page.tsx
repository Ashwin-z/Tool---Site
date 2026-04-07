import type { Metadata } from "next";
import Link from "next/link";
import PdfToPdfaTool from "@/components/pdf-to-pdfa-tool";

export const metadata: Metadata = {
  title: "PDF to PDF/A Online Free — Convert PDF for Long-Term Archiving",
  description:
    "Convert PDF to PDF/A online for free with ToolMint. Create archival-quality PDF/A-1b, PDF/A-2b, or PDF/A-3b documents that meet ISO 19005 compliance standards. No signup.",
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
    title: "PDF to PDF/A Online Free — Convert PDF for Long-Term Archiving | ToolMint",
    description:
      "Convert PDF to PDF/A online for free. Create ISO 19005-compliant archival PDFs in PDF/A-1b, 2b, or 3b. No signup.",
    url: "/tools/pdf-to-pdfa",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Drag & drop or select the PDF file you want to archive." },
  { title: "Select conformance", desc: "Choose PDF/A-1b, PDF/A-2b, or PDF/A-3b based on your compliance requirements." },
  { title: "Convert", desc: "ToolMint processes the file with Ghostscript to produce a fully conformant PDF/A." },
  { title: "Download", desc: "Save the archival PDF ready for long-term storage or submission." },
];

const faqs = [
  {
    q: "What is PDF/A format?",
    a: "PDF/A is an ISO 19005 standard designed for long-term digital preservation. It embeds all fonts, colors, and resources to ensure documents look the same decades from now.",
  },
  {
    q: "What is the difference between PDF/A-1b, PDF/A-2b, and PDF/A-3b?",
    a: "PDF/A-1b is the broadest compatibility level. PDF/A-2b adds support for JPEG 2000, transparency layers, and digital signatures. PDF/A-3b extends this by allowing embedded files of any format.",
  },
  {
    q: "Is the conversion done server-side?",
    a: "Yes. PDF/A conversion requires Ghostscript, which runs server-side. Your file is processed securely and deleted automatically after conversion.",
  },
  {
    q: "Does PDF/A support digital signatures?",
    a: "PDF/A-2b and PDF/A-3b support digital signatures. PDF/A-1b does not.",
  },
  {
    q: "Is this tool suitable for legal or government submissions?",
    a: "Yes. ToolMint produces ISO-compliant PDF/A files suitable for legal archives, government submissions, and institutional repositories that require long-term preservation.",
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
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert PDF to PDF/A for Long-Term Archiving
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Create ISO 19005-compliant archival PDFs with ToolMint. Choose PDF/A-1b, PDF/A-2b,
          or PDF/A-3b conformance to meet legal, government, or institutional archiving
          requirements. Conversion is powered by Ghostscript — batch conversion supported.
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
      </main>
    </>
  );
}
