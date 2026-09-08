import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import PdfToTextTool from "@/components/pdf-to-text-tool";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "PDF to Text (OCR) – Extract Text from PDF Free",
  description:
    "Extract text from PDF files online using OCR. Works on scanned PDFs and images. Free, no signup, copy or download output.",
  keywords: [
    "pdf to text",
    "extract text from pdf",
    "pdf ocr online free",
    "scanned pdf to text",
    "pdf text extractor",
    "ocr pdf online",
    "copy text from pdf",
    "free pdf to text converter",
  ],
  alternates: { canonical: "/tools/pdf-to-text" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "PDF to Text (OCR) – Extract Text from PDF Free | ToolMint",
    description:
      "Extract text from PDF files online using OCR. Works on scanned PDFs and images. Free, no signup, copy or download output.",
    url: "/tools/pdf-to-text",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Extract from scanned documents",
    desc: "Convert scanned PDFs, photographed documents, or image-based PDFs into selectable, searchable text using OCR.",
  },
  {
    title: "Copy content for reuse",
    desc: "Pull quotes, data, or reference text from a PDF report or academic paper for use in notes, presentations, or other documents.",
  },
  {
    title: "Index and search documents",
    desc: "Extract the full text content of PDFs so they can be indexed, searched, or processed by other tools and scripts.",
  },
];

const steps = [
  { title: "Upload a PDF", desc: "Select a digital or scanned PDF file from your device." },
  { title: "Extract", desc: "ToolMint extracts text from digital PDFs directly, and applies OCR to scanned pages." },
  { title: "Copy or download", desc: "Copy the extracted text or download it as a .txt file." },
];

const faqs = [
  {
    q: "Can OCR extract text from a scanned PDF?",
    a: "Yes. OCR (Optical Character Recognition) reads scanned page images and converts them to text. Accuracy is highest for clean, high-resolution scans of printed documents in common languages.",
  },
  {
    q: "How accurate is online OCR for PDFs?",
    a: "For clearly printed text in English and other common languages at 150 DPI or higher, accuracy typically exceeds 95%. Handwriting, unusual fonts, low-resolution scans, and degraded documents produce lower accuracy.",
  },
  {
    q: "What languages does OCR support?",
    a: "ToolMint's OCR supports the most common Latin-script languages including English, French, German, Spanish, Italian, and Portuguese. Support for other scripts varies — check the tool for current language options.",
  },
  {
    q: "Why is my extracted text scrambled or wrong?",
    a: "Scrambled text usually means the PDF has a non-standard text encoding, right-to-left text direction, or was created by a program that stored text in a different order than it appears visually. Low scan quality also produces garbled OCR output.",
  },
  {
    q: "Can I extract text from a password-protected PDF?",
    a: "No. Password-protected PDFs must be unlocked first. Use the Unlock PDF tool with the correct password, then return here to extract the text.",
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
      <WebAppSchema slug="pdf-to-text" />
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
          Extract Text from Scanned PDF Online – Free OCR Tool
        </h1>

        <ProcessingBadge slug="pdf-to-text" />
        <ToolAnalytics slug="pdf-to-text" category="pdf" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Pull text out of any PDF document with ToolMint. Works on digital PDFs and scanned
          documents using OCR. Copy the output or download it as a text file — no account required.
        </p>

        <div className="mt-8">
          <PdfToTextTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Extract Text from a PDF
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
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{i + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              What Is OCR and How Does It Work?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              OCR stands for Optical Character Recognition. It is a technology that analyzes the
              visual content of an image — whether a photograph, a scanned page, or a PDF rendered
              as an image — and identifies letter shapes to reconstruct text. The process involves
              preprocessing the image for contrast and orientation, segmenting the image into lines
              and characters, comparing character shapes against trained letter models, and
              assembling the recognized characters into words and sentences. Modern OCR engines
              use deep learning models that achieve high accuracy on clean printed text in supported
              languages. Handwriting, unusual typefaces, and degraded documents are harder to
              recognize accurately.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              When to Use PDF to Text Extraction
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Text extraction is most useful when you need to work with the content of a PDF rather
              than its visual layout. If you want to paste a quote, count words, translate content,
              run a search across many pages, or feed document content into another tool, extracted
              plain text is easier to work with than a PDF. Developers use text extraction to build
              search indices, data pipelines, and natural language processing workflows on document
              collections. For a simple task like copying a paragraph from a PDF you can open in
              your browser, direct copy-paste from the viewer is faster. Text extraction tools add
              value when PDFs are scanned, when content spans many pages, or when you need
              machine-readable output.
            </p>
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
