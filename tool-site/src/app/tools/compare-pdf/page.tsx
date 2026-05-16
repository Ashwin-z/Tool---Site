import type { Metadata } from "next";
import ComparePdfTool from "@/components/compare-pdf-tool-loader";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Compare PDF Files Online Free â€“ PDF Diff Tool",
  description:
    "Compare two PDF documents online for free. Highlight differences in text and layout side by side. No signup required.",
  keywords: [
    "compare pdf online free",
    "pdf diff tool",
    "pdf comparison tool",
    "find differences in pdf",
    "compare two pdf files",
    "pdf version compare",
    "pdf document comparison",
    "free pdf compare",
  ],
  alternates: { canonical: "/tools/compare-pdf" },
  openGraph: {
    title: "Compare PDF Files Online Free â€“ PDF Diff Tool | ToolMint",
    description:
      "Compare two PDF documents online for free. Highlight differences in text and layout side by side. No signup required.",
    url: "/tools/compare-pdf",
    images: [{ url: "/og/compare-pdf.png" }],
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Contract version review",
    desc: "Compare two versions of a contract or agreement to quickly identify which clauses were added, removed, or changed between drafts.",
  },
  {
    title: "Document audit",
    desc: "Verify that a final signed document matches an approved draft by comparing them side by side to detect unauthorized changes.",
  },
  {
    title: "Report proofreading",
    desc: "Compare an edited report to the original to confirm all intended changes were made and no unintended edits were introduced.",
  },
];

const steps = [
  { title: "Upload two PDFs", desc: "Select the original and the revised PDF you want to compare." },
  { title: "Compare", desc: "ToolMint analyzes the text and layout of both documents." },
  { title: "Review differences", desc: "View highlighted additions, deletions, and changes side by side." },
  { title: "Download", desc: "Save a comparison report if needed." },
];

const faqs = [
  {
    q: "Can I compare PDFs with different formatting?",
    a: "Yes. The comparison focuses on text content differences, so minor layout variations like font changes, spacing, or margins do not generate false positives for content changes.",
  },
  {
    q: "Does PDF compare work on scanned documents?",
    a: "Comparing scanned PDFs requires OCR to extract text from both documents first. Results are less accurate than comparing text-based PDFs because OCR introduces potential recognition differences unrelated to actual content changes.",
  },
  {
    q: "What types of differences does PDF compare detect?",
    a: "ToolMint detects text additions, deletions, and substitutions between the two documents. It highlights where words, sentences, or paragraphs were added or removed.",
  },
  {
    q: "Can I compare specific pages only?",
    a: "You can use the Split PDF tool to extract the specific pages you want to compare, then run the comparison on those page subsets.",
  },
  {
    q: "Is there a free way to compare two PDF files?",
    a: "Yes. ToolMint's PDF comparison tool is completely free to use with no signup, no file limits for typical documents, and no watermark on the output.",
  },
];

export default function ComparePdfPage() {
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
      <WebAppSchema slug="compare-pdf" />
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
            { name: "Compare PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Compare PDF Files Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Find differences between two PDF documents with ToolMint. Upload the original and
          revised versions to see added, removed, and changed text highlighted side by side â€”
          no account required.
        </p>

        <div className="mt-8">
          <ComparePdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Compare Two PDF Files
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
            How to Compare PDF Files Online
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
              When Do You Need to Compare Two PDF Files?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              PDF comparison is most valuable when two versions of a document exist and you need
              to understand exactly what changed between them. Legal teams compare contract drafts
              to track negotiated changes. Finance teams compare budget reports to confirm updates.
              Compliance teams compare policy documents to verify that approved changes were
              implemented correctly and no unauthorized edits were introduced. Without a diff tool,
              reviewing changes in a long document manually is tedious and error-prone. A side-by-side
              comparison with highlighted differences lets you jump directly to changes without
              reading the entire document from scratch.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How to Track Changes Between PDF Versions
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Unlike Word documents that have a native Track Changes feature, PDFs do not store
              edit history. When you receive two PDF versions of a document, the only way to
              identify differences is to compare them externally. PDF comparison tools extract
              the text from both documents, align the content, and highlight additions and
              deletions using a diff algorithm similar to those used in software version control.
              The result is a visual markup showing exactly what text was added, removed, or
              changed. For the cleanest comparison results, use text-based PDFs rather than
              scanned documents, and ensure both PDFs cover the same page range.
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

        <RelatedTools slug="compare-pdf" />
      </main>
    </>
  );
}
