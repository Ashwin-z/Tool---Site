import type { Metadata } from "next";
import RedactPdfTool from "@/components/redact-pdf-tool-loader";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";

export const metadata: Metadata = {
  title: "Redact PDF Online Free - Black Out Sensitive Text in PDF",
  description:
    "Redact PDF online for free with ToolMint. Search for text to auto-mark, draw manual black-out boxes, and export a flattened PDF with sensitive content permanently removed.",
  keywords: [
    "redact pdf online",
    "black out text in pdf",
    "pdf redaction tool",
    "remove sensitive information pdf",
    "redact pdf free",
    "pdf black out text online",
    "hide text in pdf",
    "pdf content removal",
  ],
  alternates: { canonical: "/tools/redact-pdf" },
  openGraph: {
    title: "Redact PDF Online Free | ToolMint",
    description:
      "Black out sensitive text and areas in any PDF online. Search by keyword or draw manual boxes, then export a permanently flattened PDF.",
    url: "/tools/redact-pdf",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Open the PDF that contains sensitive content you need to redact." },
  { title: "Mark content", desc: "Search for text to auto-select matching words, or draw redaction boxes manually over any area." },
  { title: "Review", desc: "Check all redaction marks on the page preview before finalizing." },
  { title: "Download flattened PDF", desc: "Export the permanently redacted PDF with all marked content blacked out." },
];

const faqs = [
  {
    q: "Is the redaction permanent?",
    a: "Yes. ToolMint flattens the PDF on export, permanently removing the content under each redaction box from the downloaded file.",
  },
  {
    q: "Can I search for specific words to redact?",
    a: "Yes. Use the text search to automatically find and mark all occurrences of a word or phrase across all pages.",
  },
  {
    q: "Can I redact images or non-text areas?",
    a: "Yes. Draw a manual redaction box over any area of the page, including images, tables, or handwritten content.",
  },
  {
    q: "What color are the redaction boxes?",
    a: "Redacted areas are filled with a solid black rectangle, which is the standard appearance for professional document redaction.",
  },
  {
    q: "Is my PDF uploaded to a server?",
    a: "No. All redaction processing runs in your browser. Your document never leaves your device.",
  },
];

export default function RedactPdfPage() {
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
      <main className="pdf-tool-page mx-auto min-h-screen w-full max-w-[1600px] px-4 py-8 md:px-6 md:py-10">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "PDF Tools", href: "/tools/pdf-tools" },
            { name: "Redact PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Redact PDF Online for Free
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted md:text-base">
          Permanently black out sensitive text and areas in any PDF using ToolMint. Search
          for keywords to auto-mark all matches, or draw manual redaction boxes over any
          part of the page. The exported PDF is flattened so redacted content cannot
          be recovered.
        </p>

        <div className="mt-8">
          <RedactPdfTool />
        </div>

        <section className="mt-16 max-w-5xl">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Redact a PDF
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

        <section className="mt-16 max-w-5xl">
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

        <div className="max-w-5xl">
          <RelatedTools slug="redact-pdf" />
        </div>
      </main>
    </>
  );
}
