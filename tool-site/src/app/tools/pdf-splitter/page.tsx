import type { Metadata } from "next";
import Link from "next/link";
import PdfSplitterTool from "@/components/pdf-splitter-tool";

export const metadata: Metadata = {
  title: "Split PDF Online Free — Extract PDF Pages",
  description:
    "Split PDF files online for free with ToolMint. Extract pages by custom ranges, fixed intervals, or individual selection. No signup, no watermark — instant PDF splitting.",
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
  alternates: { canonical: "/tools/pdf-splitter" },
  openGraph: {
    title: "Split PDF Online Free — Extract PDF Pages | ToolMint",
    description:
      "Split PDF files online for free. Extract pages by custom ranges, fixed intervals, or individual selection. No signup.",
    url: "/tools/pdf-splitter",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Drag & drop or select a PDF file from your device." },
  { title: "Choose split mode", desc: "Select custom ranges, fixed intervals, or pick individual pages." },
  { title: "Select pages", desc: "Define which pages to extract using the visual page selector." },
  { title: "Download", desc: "Get your split PDF as one file or separate downloads." },
];

const faqs = [
  {
    q: "What split modes does ToolMint offer?",
    a: "ToolMint offers three modes: custom page ranges (e.g., 1–3, 7–10), fixed-size chunks (e.g., every 5 pages), and individual page selection.",
  },
  {
    q: "Can I extract a single page from a PDF?",
    a: "Yes. Use the individual page selection mode, click the page you need, and download it as a standalone PDF.",
  },
  {
    q: "Can I split a large PDF into equal parts?",
    a: "Yes. The fixed-interval mode lets you split a PDF into equal chunks of any size you choose.",
  },
  {
    q: "Is my PDF secure when splitting?",
    a: "Yes. All splitting happens locally in your browser. Your files never leave your device.",
  },
  {
    q: "Does splitting a PDF affect quality?",
    a: "No. ToolMint extracts pages without recompression, preserving the original quality of text, images, and formatting.",
  },
];

export default function PdfSplitterPage() {
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
          Split PDF Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Extract specific pages from any PDF document with ToolMint. Split by custom page ranges,
          fixed intervals, or hand-pick individual pages. Download your selections as a single
          merged PDF or separate files — all processed in your browser.
        </p>

        <div className="mt-8">
          <PdfSplitterTool />
        </div>

        {/* How-to section */}
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