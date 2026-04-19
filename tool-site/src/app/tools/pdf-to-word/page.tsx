import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import PdfToWordTool from "@/components/pdf-to-word-tool-loader";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";

export const metadata: Metadata = {
  title: "PDF to Word Online Free - Convert PDF to Editable DOCX",
  description:
    "Convert PDF to Word online for free with ToolMint. Turn any PDF into an editable DOCX document with text, headings, tables, and formatting preserved. No signup required.",
  keywords: [
    "pdf to word",
    "pdf to docx",
    "convert pdf to word online free",
    "pdf to editable word",
    "pdf to doc converter",
    "extract text from pdf to word",
    "free pdf to word converter",
    "pdf to docx online",
  ],
  alternates: { canonical: "/tools/pdf-to-word" },
  openGraph: {
    title: "PDF to Word Online Free - Convert PDF to Editable DOCX | ToolMint",
    description:
      "Convert PDF to Word online for free. Turn any PDF into an editable DOCX with formatting preserved. No signup.",
    url: "/tools/pdf-to-word",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Drag and drop or select the PDF you want to convert." },
  { title: "Process", desc: "ToolMint extracts text, headings, tables, and layout from the PDF." },
  { title: "Download DOCX", desc: "Get a fully editable Word document with your content intact." },
  { title: "Edit freely", desc: "Open in Microsoft Word, Google Docs, or any DOCX-compatible app." },
];

const faqs = [
  {
    q: "Is the formatting preserved when converting PDF to Word?",
    a: "Yes. ToolMint preserves text content, headings, paragraphs, and table structures in the DOCX output for most standard PDFs.",
  },
  {
    q: "Can I convert a scanned PDF to Word?",
    a: "For scanned PDFs that are image-based, use OCR or text extraction first. This converter works best with text-based PDFs.",
  },
  {
    q: "Is the PDF to Word conversion free?",
    a: "Yes. ToolMint's PDF to Word converter is completely free with no signup, no limits, and no watermarks.",
  },
  {
    q: "What Word format is the output?",
    a: "The output is a .docx file compatible with Microsoft Word 2007 and later, as well as Google Docs and LibreOffice.",
  },
  {
    q: "Is my PDF file secure during conversion?",
    a: "Yes. Files are processed securely and automatically deleted after conversion. We do not store or share your documents.",
  },
];

const useCases = [
  {
    title: "Reports and proposals",
    desc: "Convert client-ready PDFs back into editable DOCX files when you need to update wording, dates, or pricing tables.",
  },
  {
    title: "Contracts and forms",
    desc: "Reuse structured PDF text in Word so teams can redraft, annotate, or adapt documents faster.",
  },
  {
    title: "Academic material",
    desc: "Move PDF notes, lecture handouts, or drafts into Word for revision and markup.",
  },
];

export default function PdfToWordPage() {
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
            { name: "PDF to Word" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert PDF to Word Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Turn any PDF into a fully editable Word document with ToolMint. Text, headings,
          formatting, and table structures are preserved in the DOCX output so you can edit
          right away in Microsoft Word, Google Docs, or LibreOffice.
        </p>

        <div className="mt-8">
          <PdfToWordTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Good Fits for PDF to Word Conversion
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
            How to Convert PDF to Word
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

        <RelatedTools slug="pdf-to-word" />
      </main>
    </>
  );
}
