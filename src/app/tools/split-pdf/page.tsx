import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import PdfSplitterTool from "@/components/pdf-splitter-tool-loader";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Split PDF Online Free – Extract PDF Pages",
  description:
    "Split a PDF into separate pages or extract a page range online for free. Fast, easy, no signup needed.",
  keywords: [
    "split pdf",
    "extract pdf pages",
    "pdf splitter online free",
    "separate pdf pages",
    "split pdf by pages",
    "divide pdf",
    "free pdf splitter",
    "pdf page extractor",
  ],
  alternates: { canonical: "/tools/split-pdf" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Split PDF Online Free – Extract PDF Pages | ToolMint",
    description:
      "Split a PDF into separate pages or extract a page range online for free. Fast, easy, no signup needed.",
    url: "/tools/split-pdf",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Extract a chapter or section",
    desc: "Pull out specific pages from a long report, textbook, or contract so you can share only the relevant section.",
  },
  {
    title: "Break up large submissions",
    desc: "Split an oversized scanned document into smaller parts to meet portal upload size limits.",
  },
  {
    title: "Separate individual forms",
    desc: "When a batch-scanned PDF contains multiple separate forms or invoices, split it so each page becomes its own file.",
  },
];

const steps = [
  { title: "Upload a PDF", desc: "Drag and drop or select a PDF file from your device." },
  { title: "Choose split mode", desc: "Select custom ranges, fixed intervals, or pick individual pages." },
  { title: "Select pages", desc: "Define which pages to extract using the visual page selector." },
  { title: "Download", desc: "Get your split PDF as one file or as separate downloads." },
];

const faqs = [
  {
    q: "Can I split a PDF into individual pages?",
    a: "Yes. Use the individual page selection mode to extract any single page as a standalone PDF, or select multiple pages to save them as a combined file.",
  },
  {
    q: "How do I extract specific page ranges?",
    a: "Choose the custom range mode and enter the pages you need, such as 3-7 or 10-15. You can specify multiple non-consecutive ranges in a single split operation.",
  },
  {
    q: "Does splitting a PDF affect quality?",
    a: "No. ToolMint extracts pages without recompressing content, preserving the original quality of text, images, and formatting in each output file.",
  },
  {
    q: "Can I split password-protected PDFs?",
    a: "You need to unlock the PDF first. Use the Unlock PDF tool to remove the password, then return here to split the unlocked file.",
  },
  {
    q: "How do I split a large PDF into smaller parts?",
    a: "Use the fixed-interval mode to divide a long PDF into equal chunks — for example, every 10 pages. Each chunk downloads as a separate file, or you can choose to combine them all into one output.",
  },
];

export default function SplitPdfPage() {
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
      <WebAppSchema slug="split-pdf" />
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
            { name: "Split PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Split PDF Online for Free
        </h1>

        <ProcessingBadge slug="split-pdf" />
        <ToolAnalytics slug="split-pdf" category="pdf" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Extract specific pages from any PDF document with ToolMint. Split by custom page ranges,
          fixed intervals, or hand-pick individual pages. Download your selections as a single
          merged PDF or as separate files — all processed in your browser.
        </p>

        <div className="mt-8">
          <PdfSplitterTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Split a PDF
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
            How to Split a PDF Online
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              When Do You Need to Split a PDF?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Splitting a PDF is useful any time you need to share or use only part of a larger
              document. The most common scenarios include extracting one chapter from a long report,
              separating a batch-scanned document into individual records, or trimming a file down
              to fit a portal upload limit. Legal teams often split contracts to share only relevant
              clauses. Students extract specific readings from course packs. Finance teams pull
              individual invoices from a monthly statement PDF. Rather than sending a full 50-page
              document when a recipient needs only pages 12–15, splitting produces a smaller, more
              focused file that is easier to work with.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How to Extract Just One Page from a PDF
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              To pull a single page, upload your PDF and switch to individual page selection mode.
              Click the thumbnail of the page you want and click Download. The output is a
              single-page PDF with the same quality as the original. If you need several non-adjacent
              pages — for example, pages 2, 5, and 9 — select each one individually and download
              them together as a combined file or as separate PDFs. The fixed-interval mode is better
              suited for splitting a long document into equal chunks rather than extracting specific
              pages. For most single-page extraction tasks, individual selection is the fastest path.
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

        <RelatedTools slug="split-pdf" />
      </main>
    </>
  );
}
