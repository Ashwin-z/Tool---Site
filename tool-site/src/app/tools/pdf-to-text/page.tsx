import type { Metadata } from "next";
import Link from "next/link";
import PdfToTextTool from "@/components/pdf-to-text-tool";

export const metadata: Metadata = {
  title: "PDF to Text Online Free — Extract Text from PDF with OCR",
  description:
    "Extract text from PDF online for free with ToolMint. Use OCR to pull text from scanned PDFs, image-based documents, and regular PDFs. 20+ languages supported. No signup.",
  keywords: [
    "pdf to text",
    "extract text from pdf",
    "pdf ocr online free",
    "scanned pdf to text",
    "pdf text extractor",
    "pdf ocr converter",
    "image pdf to text",
    "pdf to txt online",
  ],
  alternates: { canonical: "/tools/pdf-to-text" },
  openGraph: {
    title: "PDF to Text Online Free — Extract Text from PDF with OCR | ToolMint",
    description:
      "Extract text from PDF online for free using OCR. Works on scanned and image-based PDFs. 20+ languages. No signup.",
    url: "/tools/pdf-to-text",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Drag & drop or select your PDF — scanned or digital." },
  { title: "Choose extraction mode", desc: "Pick Native mode for digital PDFs or OCR mode for scanned documents." },
  { title: "Select language", desc: "Choose from 20+ supported languages for accurate OCR recognition." },
  { title: "Copy or download", desc: "Get the extracted text instantly — copy to clipboard or download as a .txt file." },
];

const faqs = [
  {
    q: "What is the difference between Native and OCR mode?",
    a: "Native mode extracts embedded text directly from digital PDFs — fast and perfectly accurate. OCR mode uses optical character recognition to read scanned pages and image-based PDFs where text isn't digitally stored.",
  },
  {
    q: "Can I extract text from a scanned PDF?",
    a: "Yes. Use OCR mode and ToolMint will recognize the text from each scanned page image, supporting 20+ languages.",
  },
  {
    q: "What languages does the OCR support?",
    a: "ToolMint's OCR supports 20+ languages including English, Hindi, Spanish, French, German, Chinese, Japanese, Arabic, and more.",
  },
  {
    q: "Is my PDF processed on a server?",
    a: "OCR processing happens in your browser using WebAssembly-based Tesseract. Your files never leave your device.",
  },
  {
    q: "What file format is the extracted text saved in?",
    a: "You can copy the text directly to your clipboard or download it as a plain .txt file.",
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
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Extract Text from PDF Online Free (OCR)
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Pull text from any PDF with ToolMint — whether it&apos;s a digital PDF, a scanned document,
          or an image-based file. Use Native mode for selectable text PDFs, or OCR mode to
          recognize text from scanned pages across 20+ languages. All processing runs in your browser.
        </p>

        <div className="mt-8">
          <PdfToTextTool />
        </div>

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
      </main>
    </>
  );
}
