import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WordToPdfTool from "@/components/word-to-pdf-tool";

export const metadata: Metadata = {
  title: "Word to PDF Converter Online - Convert DOCX to PDF",
  description:
    "Convert Word documents to PDF with ToolMint. Upload DOCX files, keep layout and formatting intact, and download polished PDFs for sharing, printing, or form submissions.",
  keywords: [
    "word to pdf converter",
    "convert docx to pdf online",
    "word document to pdf",
    "docx to pdf",
    "save word as pdf online",
    "batch word to pdf",
    "resume docx to pdf",
    "report docx to pdf",
  ],
  alternates: { canonical: "/tools/word-to-pdf" },
  openGraph: {
    title: "Word to PDF Converter Online - Convert DOCX to PDF | ToolMint",
    description:
      "Turn DOCX files into clean PDFs for sharing, printing, and submissions without changing the layout.",
    url: "/tools/word-to-pdf",
  },
};

const steps = [
  { title: "Upload Word files", desc: "Drag and drop or select up to 25 DOCX files from your device." },
  { title: "Preview", desc: "Review the file list to confirm you are converting the right documents." },
  { title: "Convert", desc: "Click Convert and each Word document is transformed into a PDF." },
  { title: "Download", desc: "Save individual PDFs or download the full batch as a ZIP archive." },
];

const faqs = [
  {
    q: "Does the formatting stay the same after conversion?",
    a: "Yes. ToolMint preserves fonts, tables, images, headers, and page layout when converting Word to PDF.",
  },
  {
    q: "Can I convert multiple Word files at once?",
    a: "Yes. You can upload and convert up to 25 DOCX files in a batch.",
  },
  {
    q: "What Word file formats are supported?",
    a: "ToolMint supports DOCX files, which cover modern Microsoft Word documents.",
  },
  {
    q: "Is my document secure during conversion?",
    a: "Yes. Files are processed for conversion and removed after the job completes. They are not kept for reuse or sharing.",
  },
  {
    q: "Do I need Microsoft Word installed?",
    a: "No. ToolMint handles the conversion without requiring Microsoft Word or Office on your device.",
  },
];

const useCases = [
  {
    title: "Job applications and resumes",
    desc: "Convert DOCX resumes, cover letters, or writing samples into PDFs before sending them to employers or portals.",
  },
  {
    title: "Contracts and formal documents",
    desc: "Turn editable drafts into PDFs so the layout stays consistent when clients, colleagues, or vendors open the file.",
  },
  {
    title: "Classwork and reports",
    desc: "Export essays, assignments, or internal reports into shareable PDFs that print more reliably than editable docs.",
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
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "PDF Tools", href: "/tools/pdf-tools" },
            { name: "Word to PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert Word to PDF Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Transform Word documents into clean, shareable PDF files with ToolMint. Upload DOCX
          files and download PDFs that keep your layout intact, which makes this tool useful for
          resumes, formal documents, reports, and print-ready handoffs.
        </p>

        <div className="mt-8">
          <WordToPdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When Word to PDF Is the Better Format
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
