import type { Metadata } from "next";
import Link from "next/link";
import RelatedTools from "@/components/related-tools";
import WordToPdfTool from "@/components/word-to-pdf-tool";

export const metadata: Metadata = {
  title: "Word to PDF Online Free — Convert DOCX to PDF",
  description:
    "Convert Word documents to PDF online for free with ToolMint. Upload DOCX files and download perfectly formatted PDFs. No signup, no watermark — fast conversion.",
  keywords: [
    "word to pdf",
    "docx to pdf",
    "convert word to pdf",
    "word to pdf converter online free",
    "doc to pdf",
    "word document to pdf",
    "free word to pdf",
    "docx to pdf converter",
  ],
  alternates: { canonical: "/tools/word-to-pdf" },
  openGraph: {
    title: "Word to PDF Online Free — Convert DOCX to PDF | ToolMint",
    description:
      "Convert Word documents to PDF online for free. Upload DOCX files and download perfectly formatted PDFs. No signup.",
    url: "/tools/word-to-pdf",
  },
};

const steps = [
  { title: "Upload Word files", desc: "Drag & drop or select up to 25 DOCX files from your device." },
  { title: "Preview", desc: "Review the files before conversion to ensure you have the right documents." },
  { title: "Convert", desc: "Click Convert and each Word file is transformed into a PDF." },
  { title: "Download", desc: "Save individual PDFs or download all files as a ZIP archive." },
];

const faqs = [
  {
    q: "Does the formatting stay the same after conversion?",
    a: "Yes. ToolMint preserves fonts, tables, images, headers, and page layout when converting Word to PDF.",
  },
  {
    q: "Can I convert multiple Word files at once?",
    a: "Yes. You can upload and convert up to 25 DOCX files simultaneously.",
  },
  {
    q: "What Word file formats are supported?",
    a: "ToolMint supports .docx files (Microsoft Word 2007 and later format).",
  },
  {
    q: "Is my document secure during conversion?",
    a: "Yes. Files are processed securely and never stored or shared.",
  },
  {
    q: "Do I need Microsoft Word installed?",
    a: "No. ToolMint converts Word files independently — no Microsoft Office or any other software is needed.",
  },
];

export default function WordToPdfPage() {
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
          Convert Word to PDF Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Transform your Word documents into universally shareable PDF files with ToolMint. Upload
          up to 25 DOCX files and download them as perfectly formatted PDFs — or get everything
          in a single ZIP file.
        </p>

        <div className="mt-8">
          <WordToPdfTool />
        </div>

        {/* How-to section */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Convert Word to PDF
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

        {/* FAQ section */}
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

        <RelatedTools slug="word-to-pdf" />
      </main>
    </>
  );
}