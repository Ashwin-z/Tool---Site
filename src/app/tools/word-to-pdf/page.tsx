import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WordToPdfTool from "@/components/word-to-pdf-tool";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolStatusNotice from "@/components/tool-status-notice";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Word to PDF Converter – Convert DOCX to PDF Free",
  description:
    "Convert Word documents to PDF online for free. Upload .doc or .docx and get a perfect PDF instantly. No signup required.",
  keywords: [
    "word to pdf",
    "docx to pdf",
    "convert word to pdf online free",
    "word document to pdf",
    "doc to pdf converter",
    "microsoft word to pdf",
    "free word to pdf",
    "online word converter",
  ],
  alternates: { canonical: "/tools/word-to-pdf" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Word to PDF Converter – Convert DOCX to PDF Free | ToolMint",
    description:
      "Convert Word documents to PDF online for free. Upload .doc or .docx and get a perfect PDF instantly. No signup required.",
    url: "/tools/word-to-pdf",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Sharing final documents",
    desc: "Convert a finished Word document to PDF before emailing it so recipients see it exactly as intended, regardless of their Word version.",
  },
  {
    title: "Portal and form submissions",
    desc: "Government portals, job applications, and academic systems commonly require PDF uploads — convert your .docx before submitting.",
  },
  {
    title: "Print-ready files",
    desc: "PDF preserves fonts, margins, and layout across printers. Convert Word to PDF before sending files to a print shop.",
  },
];

const steps = [
  { title: "Upload your Word file", desc: "Select a .doc or .docx file from your device." },
  { title: "Convert", desc: "ToolMint converts the document to PDF while preserving formatting." },
  { title: "Download", desc: "Save the PDF to your device instantly." },
];

const faqs = [
  {
    q: "Does converting Word to PDF lose formatting?",
    a: "Formatting is generally preserved, including fonts, headings, tables, and images. Complex layouts with custom fonts that are not embedded may render slightly differently if those fonts are not available during conversion.",
  },
  {
    q: "Can I convert a Word doc with images to PDF?",
    a: "Yes. Images embedded in the Word document are included in the PDF output at their original resolution.",
  },
  {
    q: "Why does my Word to PDF look different?",
    a: "The most common cause is a font not being embedded in the original .docx file. The converter uses a substitute font, which can shift text flow and spacing. Re-embedding fonts in Word before converting usually resolves this.",
  },
  {
    q: "Can I convert .doc (old Word format) to PDF?",
    a: "Yes. ToolMint supports both the legacy .doc format and the modern .docx format. Both convert to PDF with the same quality.",
  },
  {
    q: "Is it better to save as PDF from Word or use a converter?",
    a: "Saving directly from Word (File → Save As → PDF) gives the most accurate result because Word handles its own formatting. An online converter is the right choice when you do not have Word installed or are working on a shared or mobile device.",
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
      <WebAppSchema slug="word-to-pdf" />
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
          Convert Word to PDF Online for Free
        </h1>

        <ToolStatusNotice slug="word-to-pdf" />
        <ProcessingBadge slug="word-to-pdf" />
        <ToolAnalytics slug="word-to-pdf" category="pdf" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert .doc and .docx files to PDF with ToolMint. Upload your Word document and download
          a properly formatted PDF in seconds. No account, no watermark, no software to install.
        </p>

        <div className="mt-8">
          <WordToPdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Convert Word to PDF
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
            How to Convert Word to PDF Online
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
              Why Convert Word to PDF Instead of Sharing .docx?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              A .docx file looks different depending on the version of Microsoft Word or the
              application used to open it. Recipients using Google Docs, LibreOffice, or an older
              version of Word may see shifted paragraphs, missing fonts, or broken table layouts.
              PDF eliminates this variability — the document looks identical on every device, screen
              size, and operating system. PDF also prevents casual editing, which matters when you
              are sharing a final contract, a report, or a resume. For anything where appearance and
              content integrity matter, PDF is the right format to share.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Does Word to PDF Preserve Formatting?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              In most cases, yes. Standard formatting including fonts, bold and italic styling,
              headings, lists, tables, and embedded images all convert cleanly. The main exception
              is non-standard fonts that are not embedded in the file — if the converter cannot find
              the font, it substitutes a default, which can change text spacing. Track changes and
              comments are typically stripped from the PDF output, which is usually the desired
              behavior when sharing a final version. Headers, footers, and page numbers convert
              correctly. Very complex multi-column layouts or documents with linked text boxes may
              occasionally need minor cleanup.
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

        <RelatedTools slug="word-to-pdf" />
      </main>
    </>
  );
}
