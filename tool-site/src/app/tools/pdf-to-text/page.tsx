import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import PdfToTextTool from "@/components/pdf-to-text-tool";

export const metadata: Metadata = {
  title: "Extract Text from PDF Online - OCR for Scanned PDFs",
  description:
    "Extract text from digital and scanned PDFs with ToolMint. Use native extraction for selectable text or OCR for scanned pages when you need reusable copy, notes, or records.",
  keywords: [
    "extract text from pdf",
    "pdf to text ocr",
    "scanned pdf to text",
    "ocr pdf online",
    "copy text from scanned pdf",
    "pdf text extractor",
    "convert pdf to txt",
    "read text from pdf image",
  ],
  alternates: { canonical: "/tools/pdf-to-text" },
  openGraph: {
    title: "Extract Text from PDF Online - OCR for Scanned PDFs | ToolMint",
    description:
      "Pull text from digital or scanned PDFs with native extraction and OCR support in the browser.",
    url: "/tools/pdf-to-text",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Choose a digital PDF or a scanned document from your device." },
  { title: "Pick extraction mode", desc: "Use Native mode for selectable text or OCR mode for scanned pages." },
  { title: "Select language", desc: "Choose the OCR language when the file is image-based or scanned." },
  { title: "Copy or download", desc: "Review the extracted text, then copy it or save it as a TXT file." },
];

const faqs = [
  {
    q: "What is the difference between Native and OCR mode?",
    a: "Native mode reads text already embedded in a digital PDF. OCR mode recognizes text from scanned pages or image-based PDFs where the text is not stored digitally.",
  },
  {
    q: "Can I extract text from a scanned PDF?",
    a: "Yes. OCR mode is specifically designed for scanned PDFs and image-based documents.",
  },
  {
    q: "What languages does the OCR support?",
    a: "ToolMint supports a broad set of OCR languages, including major languages used in business, education, and document archiving workflows.",
  },
  {
    q: "Is my PDF processed on a server?",
    a: "No. OCR and text extraction run in your browser for this tool, so your file stays on your device.",
  },
  {
    q: "What format can I save the text in?",
    a: "You can copy the extracted text directly or download it as a plain TXT file.",
  },
];

const useCases = [
  {
    title: "Scanned notes and handouts",
    desc: "Pull text out of scanned lecture notes, manuals, or printed documents so you can quote, search, or rewrite them.",
  },
  {
    title: "Archived paperwork",
    desc: "Extract text from older scanned records when you need searchable content for internal documentation or indexing.",
  },
  {
    title: "Quick reuse of document content",
    desc: "Copy paragraphs, lists, or details from PDFs into emails, spreadsheets, or editing workflows without retyping everything.",
  },
];

export default function PdfToTextPage() {
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
            { name: "PDF to Text" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Extract Text from PDF Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Pull text from digital PDFs and scanned documents with ToolMint. Use native extraction
          when the file already contains selectable text, or switch to OCR when you need text from
          scanned pages, image-based documents, or archived paperwork.
        </p>

        <div className="mt-8">
          <PdfToTextTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Useful Cases for PDF OCR and Text Extraction
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (
              <article key={item.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Extract Text from a PDF
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

        <RelatedTools slug="pdf-to-text" />
      </main>
    </>
  );
}
