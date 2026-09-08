import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import PdfMergerTool from "@/components/pdf-merger-tool";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Merge PDF in Your Browser – No Upload",
  description:
    "Combine PDF files into one without uploading them. Drag to reorder, merge on your own device, download instantly. Free, no signup, no watermark.",
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
  alternates: { canonical: "/tools/merge-pdf" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Merge PDF in Your Browser – No Upload | ToolMint",
    description:
      "Combine PDF files into one without uploading them. Drag to reorder, merge on your own device, download instantly. Free, no signup, no watermark.",
    url: "/tools/merge-pdf",
  },
  twitter: { card: "summary_large_image" },
};

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

const steps = [
  { title: "Upload PDFs", desc: "Drag and drop or select up to 25 PDF files from your device." },
  { title: "Reorder files", desc: "Arrange the file thumbnails in the exact order you want them to appear." },
  { title: "Merge", desc: "Click Merge and ToolMint combines the files into one document." },
  { title: "Download", desc: "Save the merged PDF to your device and use it right away." },
];

const faqs = [
  {
    q: "How many PDFs can I merge at once?",
    a: "You can merge up to 25 PDF files in a single session on ToolMint. If you need to combine more files, merge the first batch, then use the result as the starting file for a second merge.",
  },
  {
    q: "Does merging PDFs reduce quality?",
    a: "No. ToolMint combines files without re-encoding pages, so text, images, and formatting stay the same quality as the originals.",
  },
  {
    q: "Can I reorder pages when merging PDFs?",
    a: "Yes. After uploading, drag and drop the file thumbnails to arrange them in any order before merging. The final document follows exactly the sequence you set.",
  },
  {
    q: "Will merged PDFs retain bookmarks?",
    a: "Bookmarks from individual source files are preserved in the merged output where the source files contained them. Some complex bookmark structures may be simplified during merging.",
  },
  {
    q: "Is it safe to merge PDFs online?",
    a: "Yes. Merging happens entirely in your browser, so your files are not uploaded to a server. Nothing leaves your device during the process.",
  },
];

export default function MergePdfPage() {
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
      <WebAppSchema slug="merge-pdf" />
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
            { name: "Merge PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Merge PDF Files Into One Document – Free Online
        </h1>

        <ProcessingBadge slug="merge-pdf" />
        <ToolAnalytics slug="merge-pdf" category="pdf" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Combine multiple PDF documents into a single file with ToolMint. Upload up to 25 PDFs,
          drag to reorder them, and download one merged document entirely in your browser. A practical
          workflow for applications, client packets, and recordkeeping.
        </p>

        <div className="mt-8">
          <PdfMergerTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Merge PDF Files
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              When Should You Merge PDF Files?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Merging PDFs is most useful when a recipient or system expects a single file rather than
              multiple attachments. Job portals often accept one uploaded document per application, so
              combining your resume, cover letter, and portfolio into one PDF avoids rejected submissions.
              Legal and compliance workflows commonly require all supporting documents in a single packet.
              Report distribution is cleaner when appendices, charts, and main content arrive as one file
              rather than a loose set. Archive and backup scenarios also benefit from merged files because
              they are easier to find, organize, and store long-term than scattered individual documents.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              What Is the Best Order to Merge PDFs?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The right order depends on how the merged document will be read. For professional
              submissions, put the most important document first — a cover letter before a resume,
import WebAppSchema from "@/components/web-app-schema";
              or a summary report before detailed appendices. For archive packets, chronological order
              tends to be most intuitive. For client handoffs, match the order of a table of contents
              if one exists. ToolMint's drag-and-drop reordering lets you arrange files before merging,
              so spend a moment previewing the thumbnail sequence before you click Merge. Fixing the
              order before combining is faster than splitting and re-merging afterward.
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

        <RelatedTools slug="merge-pdf" />
      </main>
    </>
  );
}
