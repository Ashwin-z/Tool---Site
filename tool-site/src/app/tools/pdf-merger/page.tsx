import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import PdfMergerTool from "@/components/pdf-merger-tool";

export const metadata: Metadata = {
  title: "Merge PDF Files Online - Combine PDFs in Your Browser",
  description:
    "Merge PDF files online with ToolMint. Combine up to 25 PDFs, reorder them before merging, and download one clean document in your browser. Useful for reports, application packets, and signed attachments.",
  keywords: [
    "merge pdf files online",
    "combine pdf files",
    "pdf merger",
    "join pdf documents",
    "merge multiple pdfs",
    "reorder pdf pages before merge",
    "combine scanned pdf files",
    "browser pdf merger",
  ],
  alternates: { canonical: "/tools/pdf-merger" },
  openGraph: {
    title: "Merge PDF Files Online - Combine PDFs in Your Browser | ToolMint",
    description:
      "Combine PDF files, reorder them, and download one merged document for sharing, printing, or submission.",
    url: "/tools/pdf-merger",
  },
};

const steps = [
  { title: "Upload PDFs", desc: "Drag and drop or select up to 25 PDF files from your device." },
  { title: "Reorder files", desc: "Arrange the file thumbnails in the exact order you want them to appear." },
  { title: "Merge", desc: "Click Merge and ToolMint combines the files into one document." },
  { title: "Download", desc: "Save the merged PDF to your device and use it right away." },
];

const faqs = [
  {
    q: "How many PDFs can I merge at once?",
    a: "You can merge up to 25 PDF files in a single session on ToolMint.",
  },
  {
    q: "Can I reorder pages before merging?",
    a: "Yes. After uploading, drag and drop the file thumbnails to arrange them in any order before merging.",
  },
  {
    q: "Is it safe to merge PDFs on ToolMint?",
    a: "Yes. Merging happens entirely in your browser, so your files are not uploaded to a server for this task.",
  },
  {
    q: "Does merging PDFs reduce quality?",
    a: "No. ToolMint combines files without re-encoding pages, so text, images, and formatting stay the same.",
  },
  {
    q: "Do I need an account to use the PDF merger?",
    a: "No. You can merge PDFs without signing up or creating an account.",
  },
];

const useCases = [
  {
    title: "Application packets",
    desc: "Join resumes, cover letters, certifications, and ID scans into one PDF before uploading to a job or school portal.",
  },
  {
    title: "Client and project handoff",
    desc: "Combine invoices, proposals, signed approvals, and supporting documents into one clean file for clients or managers.",
  },
  {
    title: "Records and archives",
    desc: "Merge monthly statements, receipts, or scanned pages so related paperwork stays together in one document.",
  },
];

export default function PdfMergerPage() {
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
            { name: "PDF Merger" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Merge PDF Files Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Combine multiple PDF documents into a single file with ToolMint. Upload up to 25 PDFs,
          drag to reorder them, and download one merged document in your browser. It is a practical
          workflow when you need one final PDF for applications, client packets, or recordkeeping.
        </p>

        <div className="mt-8">
          <PdfMergerTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Common Reasons to Merge PDFs
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
            How to Merge PDF Files Online
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

        <RelatedTools slug="pdf-merger" />
      </main>
    </>
  );
}
