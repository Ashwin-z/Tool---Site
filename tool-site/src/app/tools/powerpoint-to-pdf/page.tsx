import type { Metadata } from "next";
import PowerPointToPdfTool from "@/components/powerpoint-to-pdf-tool";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";

export const metadata: Metadata = {
  title: "PowerPoint to PDF Online Free - Convert PPTX to PDF",
  description:
    "Convert PowerPoint to PDF online for free with ToolMint. Upload PPTX presentations and download them as PDF documents. No signup, no watermark.",
  keywords: [
    "powerpoint to pdf",
    "pptx to pdf",
    "convert powerpoint to pdf",
    "ppt to pdf converter online free",
    "presentation to pdf",
    "slides to pdf",
    "free pptx to pdf",
    "powerpoint to pdf converter",
  ],
  alternates: { canonical: "/tools/powerpoint-to-pdf" },
  openGraph: {
    title: "PowerPoint to PDF Online Free - Convert PPTX to PDF | ToolMint",
    description:
      "Convert PowerPoint to PDF online for free. Upload PPTX presentations and download PDFs instantly.",
    url: "/tools/powerpoint-to-pdf",
  },
};

const steps = [
  { title: "Upload presentations", desc: "Drag and drop or select up to 25 PPTX files from your device." },
  { title: "Preview", desc: "Check the file list before converting." },
  { title: "Convert", desc: "Click Convert and each presentation is rendered as a PDF." },
  { title: "Download", desc: "Save individual PDFs or download all files as a ZIP." },
];

const faqs = [
  {
    q: "Does the slide layout stay intact after conversion?",
    a: "Yes. ToolMint preserves slide layouts, images, shapes, and text formatting in the PDF output.",
  },
  {
    q: "Can I convert multiple presentations at once?",
    a: "Yes. Upload up to 25 PPTX files and convert them all in a single batch.",
  },
  {
    q: "What PowerPoint formats are supported?",
    a: "ToolMint supports PPTX files from modern versions of PowerPoint.",
  },
  {
    q: "Are animations or transitions preserved in the PDF?",
    a: "No. PDFs are static documents, so animations and transitions are not included. Each slide becomes a single PDF page.",
  },
  {
    q: "Is my presentation data secure?",
    a: "Yes. Your files are processed for conversion and removed afterward.",
  },
];

export default function PowerPointToPdfPage() {
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
            { name: "PowerPoint to PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert PowerPoint to PDF Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Turn your PowerPoint presentations into PDF documents with ToolMint. Upload up to
          25 PPTX files and download them as clean, print-ready PDFs that anyone can open
          without PowerPoint installed.
        </p>

        <div className="mt-8">
          <PowerPointToPdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Convert PowerPoint to PDF
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

        <RelatedTools slug="powerpoint-to-pdf" />
      </main>
    </>
  );
}
