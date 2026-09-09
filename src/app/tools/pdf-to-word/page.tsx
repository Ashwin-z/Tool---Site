import type { Metadata } from "next";
import Link from "next/link";
import RelatedTools from "@/components/related-tools";
import PdfToWordTool from "@/components/pdf-to-word-tool-loader";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolStatusNotice from "@/components/tool-status-notice";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "PDF to Word in Your Browser – No Upload",
  description:
    "Turn a PDF into an editable .docx without uploading it. Text, headings and images are extracted on your device. Free, no signup.",
  keywords: [
    "pdf to word",
    "pdf to docx",
    "convert pdf to word online free",
    "pdf to editable word",
    "pdf converter to word",
    "extract text from pdf to word",
    "free pdf to word converter",
    "online pdf to docx",
  ],
  alternates: { canonical: "/tools/pdf-to-word" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "PDF to Word in Your Browser – No Upload | ToolMint",
    description:
      "Turn a PDF into an editable .docx without uploading it. Text, headings and images are extracted on your device. Free, no signup.",
    url: "/tools/pdf-to-word",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Edit received documents",
    desc: "When you receive a PDF contract or form that you need to update, convert it to Word to make edits before sending it back.",
  },
  {
    title: "Reuse content",
    desc: "Extract and reformat text from PDF reports, manuals, or older documents into a fresh Word document for revision or reuse.",
  },
  {
    title: "Fill in forms offline",
    desc: "Convert a PDF form to Word so you can type into it, reformat fields, and save it as a new document.",
  },
];

const steps = [
  { title: "Upload a PDF", desc: "Select the PDF file you want to convert to Word." },
  { title: "Convert", desc: "ToolMint extracts and formats the PDF content as a Word document." },
  { title: "Download", desc: "Save the .docx file and open it in Word or Google Docs." },
];

const faqs = [
  {
    q: "How accurate is the conversion?",
    a: "Text comes across reliably — on our test documents between 78% and 96% of words were recovered, with headings inferred from font sizes and images carried over. What it does not do is rebuild complex layout: multi-column pages, and tables drawn with ruled lines rather than as real table objects, come through as positioned text rather than as Word tables. If your PDF is mostly prose, expect a good result. If it is a heavily designed layout, expect to tidy it up.",
  },
  {
    q: "What happens with a scanned PDF?",
    a: "A scanned page has no text layer to extract, so each page is embedded into the Word document as an image instead. You get an editable file, but the words in the scan are still pictures. To get real text out of a scan, use PDF to Text, which runs OCR.",
  },
  {
    q: "Why does my PDF to Word conversion look wrong?",
    a: "Complex multi-column layouts, tables with merged cells, and decorative fonts are the most common causes of formatting issues. The converter reconstructs the layout from the PDF's internal structure, which does not always match what you see visually.",
  },
  {
    q: "Can I edit a converted Word document?",
    a: "Yes. The output is a standard .docx file that opens in Microsoft Word, Google Docs, LibreOffice, and other Word-compatible applications for full editing.",
  },
  {
    q: "Does PDF to Word work on scanned PDFs?",
    a: "Scanned PDFs require OCR to extract text first. ToolMint applies OCR to detect text in scanned pages before converting, though accuracy depends on the scan quality and language of the content.",
  },
  {
    q: "Will tables be preserved when converting PDF to Word?",
    a: "Simple tables with clear borders and consistent structure usually convert well. Complex nested tables, tables without visible borders, or tables in scanned PDFs may require manual cleanup in the Word file.",
  },
  {
    q: "Is it free to convert PDF to Word online?",
    a: "Yes. ToolMint's PDF to Word converter is completely free to use. There is no signup, no subscription, and no watermark on the output document.",
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
      <WebAppSchema slug="pdf-to-word" />
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
          Convert PDF to Editable Word Document – Free, No Signup
        </h1>

        <ToolStatusNotice slug="pdf-to-word" />
        <ProcessingBadge slug="pdf-to-word" />
        <ToolAnalytics slug="pdf-to-word" category="pdf" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Turn a PDF into an editable .docx file with ToolMint. Upload your PDF and get a Word
          document that preserves text, headings, and basic layout — ready to edit in Microsoft Word
          or Google Docs. No account required.
        </p>

        <div className="mt-8">
          <PdfToWordTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Convert PDF to Word
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
            How to Convert PDF to Word Online
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
              How Accurate Is PDF to Word Conversion?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Accuracy depends on the complexity of the source PDF. Text-based PDFs with simple
              formatting — single column, standard fonts, clean paragraphs — convert with high
              fidelity. The text, headings, and basic structure map cleanly to Word styles. PDFs
              created from complex desktop publishing layouts, those with decorative fonts,
              background graphics, or multi-column designs will require more cleanup after
              conversion. Scanned PDFs rely on OCR accuracy, which varies by image quality and
              language. For most business documents like contracts, reports, and forms, conversion
              quality is good enough to work from immediately with minor adjustments.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              When Should You Convert PDF to Word?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Convert a PDF to Word when you need to edit the content, reformat it, or reuse
              sections in another document. Common scenarios include updating a contract you
              received as a PDF, extracting data from a report to paste into another document,
              or recovering a Word document when you only have the PDF version. If you only need
              to read the content, there is no reason to convert — most PDF viewers let you
              select and copy text already. Conversion is most valuable when you need to make
              structural edits, change formatting, or use the document as a starting point for
              a new version.
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

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            After converting
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
            Word is the right target for prose. If what you actually wanted was the numbers or a scanned page, one of these fits better.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "PDF to Excel", href: "/tools/pdf-to-excel", desc: "If it was tables you were after, not paragraphs." },
              { name: "PDF to Text (OCR)", href: "/tools/pdf-to-text", desc: "If the PDF is a scan with no text layer." },
              { name: "Compress PDF", href: "/tools/compress-pdf", desc: "Keep the original PDF, just smaller." },
              { name: "Split PDF", href: "/tools/split-pdf", desc: "Convert only the pages you need." },
            ].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-xl border border-white/10 bg-white/[.02] p-4 transition hover:-translate-y-0.5 hover:border-white/20"
              >
                <h3 className="font-semibold text-foreground">{t.name}</h3>
                <p className="mt-1 text-xs leading-5 text-muted">{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <RelatedTools slug="pdf-to-word" />
      </main>
    </>
  );
}
