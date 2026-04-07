import type { Metadata } from "next";
import Link from "next/link";
import PdfMergerTool from "@/components/pdf-merger-tool";

export const metadata: Metadata = {
  title: "Merge PDF Online Free — Combine PDF Files",
  description:
    "Merge PDF files online for free with ToolMint. Combine up to 25 PDFs into one document, drag to reorder pages. No signup, no watermark — instant browser-based merging.",
  keywords: [
    "merge pdf",
    "combine pdf",
    "pdf merger online free",
    "join pdf files",
    "merge pdf files",
    "combine multiple pdfs",
    "free pdf merger",
    "pdf combiner",
  ],
  alternates: { canonical: "/tools/pdf-merger" },
  openGraph: {
    title: "Merge PDF Online Free — Combine PDF Files | ToolMint",
    description:
      "Merge PDF files online for free. Combine up to 25 PDFs into one document, drag to reorder. No signup, no watermark.",
    url: "/tools/pdf-merger",
  },
};

const steps = [
  { title: "Upload PDFs", desc: "Drag & drop or select up to 25 PDF files from your device." },
  { title: "Reorder files", desc: "Drag the thumbnails into your preferred page order." },
  { title: "Merge", desc: "Click Merge and the files are combined instantly in your browser." },
  { title: "Download", desc: "Save the single merged PDF to your device." },
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
    a: "Absolutely. Merging happens entirely in your browser — your files are never uploaded to a server.",
  },
  {
    q: "Does merging PDFs reduce quality?",
    a: "No. ToolMint combines files without re-encoding, so text, images, and formatting stay exactly as they are.",
  },
  {
    q: "Do I need to sign up to use the PDF merger?",
    a: "No. ToolMint is 100% free with no signup, no account, and no watermarks.",
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
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Merge PDF Files Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Combine multiple PDF documents into a single file with ToolMint. Upload up to 25 PDFs,
          drag to reorder them, and download one merged document — all processed locally in your
          browser with zero uploads to any server.
        </p>

        <div className="mt-8">
          <PdfMergerTool />
        </div>

        {/* How-to section */}
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

        {/* FAQ section */}
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
      </main>
    </>
  );
}