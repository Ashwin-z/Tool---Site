import type { Metadata } from "next";
import Link from "next/link";
import PdfToJpgTool from "@/components/pdf-to-jpg-tool";

export const metadata: Metadata = {
  title: "PDF to JPG Online Free — Convert PDF Pages to Images",
  description:
    "Convert PDF to JPG online for free with ToolMint. Turn every PDF page into a high-quality image. No signup, no upload to any server — 100% browser-based PDF to image conversion.",
  keywords: [
    "pdf to jpg",
    "pdf to image",
    "convert pdf to jpg online free",
    "pdf to jpeg",
    "pdf to png",
    "pdf pages to images",
    "free pdf to jpg converter",
    "pdf image extractor",
  ],
  alternates: { canonical: "/tools/pdf-to-jpg" },
  openGraph: {
    title: "PDF to JPG Online Free — Convert PDF Pages to Images | ToolMint",
    description:
      "Convert PDF to JPG online for free. Turn every PDF page into a high-quality image. No signup, no server upload.",
    url: "/tools/pdf-to-jpg",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Drag & drop or select any PDF file from your device." },
  { title: "Choose quality", desc: "Pick your preferred image resolution and quality setting." },
  { title: "Convert", desc: "ToolMint renders each PDF page into a JPG image instantly in your browser." },
  { title: "Download", desc: "Save individual images or download all pages as a ZIP." },
];

const faqs = [
  {
    q: "What image formats can I export PDF pages to?",
    a: "ToolMint converts PDF pages to JPG (JPEG) format. The images are rendered at high resolution for crisp quality.",
  },
  {
    q: "Are my PDF files uploaded to a server?",
    a: "No. All conversion happens locally in your browser. Your PDF never leaves your device.",
  },
  {
    q: "How many pages can I convert at once?",
    a: "You can convert all pages in any PDF. Each page is rendered as a separate JPG image.",
  },
  {
    q: "Can I choose the image quality?",
    a: "Yes. ToolMint lets you select the output resolution so you can balance file size against image clarity.",
  },
  {
    q: "Can I convert just one page of a PDF to an image?",
    a: "Yes. After conversion, you can download individual page images or all pages together as a ZIP archive.",
  },
];

export default function PdfToJpgPage() {
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
          Convert PDF to JPG Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Turn any PDF into high-quality JPG images with ToolMint. Every page is rendered as a
          separate image — choose your resolution, then download individual pages or all of them
          as a ZIP. Everything processes locally in your browser; nothing is uploaded to any server.
        </p>

        <div className="mt-8">
          <PdfToJpgTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Convert PDF Pages to JPG Images
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
      </main>
    </>
  );
}
