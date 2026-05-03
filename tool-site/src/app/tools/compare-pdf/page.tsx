import type { Metadata } from "next";
import ComparePdfTool from "@/components/compare-pdf-tool-loader";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";

export const metadata: Metadata = {
  title: "Compare PDF Online Free - Side-by-Side PDF Diff Tool",
  description:
    "Compare two PDF files online for free with ToolMint. Detect text changes with semantic diff, overlay pages visually, and download a change report. Browser-based, no upload.",
  keywords: [
    "compare pdf online",
    "pdf diff tool",
    "compare two pdfs",
    "pdf comparison online free",
    "side by side pdf compare",
    "pdf change detection",
    "pdf document comparison",
    "find differences in pdf",
  ],
  alternates: { canonical: "/tools/compare-pdf" },
  openGraph: {
    title: "Compare PDF Online Free - Side-by-Side PDF Diff Tool | ToolMint",
    description:
      "Compare two PDF files side by side. Detect text changes with semantic diff, overlay pages visually, and download a change report.",
    url: "/tools/compare-pdf",
  },
};

const steps = [
  { title: "Upload two PDFs", desc: "Load the original PDF and the revised PDF you want to compare." },
  { title: "Choose comparison mode", desc: "Select text diff to see semantic changes, or overlay mode to spot visual page differences." },
  { title: "Review changes", desc: "Browse the highlighted differences side by side across all pages." },
  { title: "Download report", desc: "Export a change report summarizing all detected insertions, deletions, and modifications." },
];

const faqs = [
  {
    q: "What types of changes can this tool detect?",
    a: "The text diff engine detects word-level insertions, deletions, and substitutions. The overlay mode highlights pixel-level visual differences between pages.",
  },
  {
    q: "Does it work on scanned PDFs?",
    a: "Text diff requires selectable text in the PDF. Scanned image-only PDFs will not yield text differences, but the visual overlay mode still works for them.",
  },
  {
    q: "Can I compare PDFs with different page counts?",
    a: "Yes. Pages are matched by order. Extra pages in either document are flagged as entirely added or removed.",
  },
  {
    q: "Can I download the comparison results?",
    a: "Yes. Export a change report as a PDF or plain text document summarizing all differences found between the two files.",
  },
  {
    q: "Are my PDFs uploaded to a server?",
    a: "No. Both PDFs are processed entirely in your browser. Your documents never leave your device.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="pdf-tool-page mx-auto min-h-screen w-full max-w-[1700px] px-4 py-8 md:px-6 md:py-10">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "PDF Tools", href: "/tools/pdf-tools" },
            { name: "Compare PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Compare PDF Online for Free
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted md:text-base">
          Find what changed between two PDF documents using ToolMint. Use semantic text diff
          to spot word-level insertions and deletions, or switch to visual overlay mode to
          compare pages pixel by pixel. Download a full change report when done.
        </p>

        <div className="mt-8">
          <ComparePdfTool />
        </div>

        <section className="mt-16 max-w-5xl">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Compare Two PDFs
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
          <RelatedTools slug="compare-pdf" />
        </div>
      </main>
    </>
  );
}
