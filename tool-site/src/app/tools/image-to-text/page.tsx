import type { Metadata } from "next";
import Link from "next/link";
import ImageToTextTool from "@/components/image-to-text-tool";

export const metadata: Metadata = {
  title: "Image to Text (OCR) Online Free — Extract Text from Images",
  description:
    "Extract text from images online for free with ToolMint. OCR supports 20+ languages including English, Hindi, Chinese, and Arabic. Upload or paste from clipboard. 100% browser-based.",
  keywords: [
    "image to text",
    "ocr online free",
    "extract text from image",
    "image to text converter",
    "photo to text",
    "ocr image to text",
    "text recognition online",
    "free ocr tool",
  ],
  alternates: { canonical: "/tools/image-to-text" },
  openGraph: {
    title: "Image to Text (OCR) Online Free | ToolMint",
    description:
      "Extract text from any image using OCR. 20+ languages supported. Upload or paste from clipboard — free, browser-based.",
    url: "/tools/image-to-text",
  },
};

const steps = [
  { title: "Upload or paste", desc: "Select an image file, drag & drop, or paste from clipboard with Ctrl+V." },
  { title: "Choose language", desc: "Select the language of the text in the image from 20+ supported languages." },
  { title: "Extract text", desc: "The OCR engine scans the image and extracts all recognized text." },
  { title: "Copy or download", desc: "Copy the extracted text to your clipboard or download as a text file." },
];

const faqs = [
  {
    q: "Which languages does the OCR support?",
    a: "ToolMint supports 20+ languages including English, Hindi, Chinese, Arabic, Spanish, French, German, Japanese, Korean, and more.",
  },
  {
    q: "Can I paste an image from my clipboard?",
    a: "Yes. Press Ctrl+V (Cmd+V on Mac) to paste a screenshot or copied image directly for OCR extraction.",
  },
  {
    q: "How accurate is the text extraction?",
    a: "Accuracy depends on image quality, font clarity, and contrast. Clear, high-resolution images with standard fonts give the best results.",
  },
  {
    q: "Which image formats are supported?",
    a: "JPG, PNG, BMP, and WebP images are supported for OCR text extraction.",
  },
  {
    q: "Is my image uploaded to a server?",
    a: "No. OCR runs locally in your browser using Tesseract.js. Your image never leaves your device.",
  },
];

export default function ImageToTextPage() {
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
      <main className="image-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Image to Text (OCR) — Free Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Extract text from any image using OCR with ToolMint. Upload a photo, screenshot, or
          scanned document — or paste directly from your clipboard. Supports 20+ languages
          including English, Hindi, Chinese, Arabic, and more.
        </p>

        <div className="mt-8">
          <ImageToTextTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Extract Text from an Image
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
