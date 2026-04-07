import type { Metadata } from "next";
import Link from "next/link";
import ImageConverterTool from "@/components/image-converter-tool";

export const metadata: Metadata = {
  title: "Image Format Converter Online Free — JPG, PNG, WebP & More",
  description:
    "Convert images between JPG, PNG, WebP, BMP, GIF, AVIF, TIFF, and SVG online for free with ToolMint. Adjustable quality, background-color control, and bulk conversion with ZIP export.",
  keywords: [
    "image converter online",
    "convert image format",
    "image format converter",
    "convert png to webp",
    "jpg to webp online",
    "bulk image converter",
    "free image converter",
    "webp to jpg converter",
  ],
  alternates: { canonical: "/tools/image-converter" },
  openGraph: {
    title: "Image Format Converter Online Free | ToolMint",
    description:
      "Convert between JPG, PNG, WebP, BMP, GIF, AVIF, TIFF, and SVG. Quality control and bulk conversion with ZIP export — free, browser-based.",
    url: "/tools/image-converter",
  },
};

const steps = [
  { title: "Upload images", desc: "Select or drag & drop one or more images in any supported format." },
  { title: "Choose output format", desc: "Pick the target format: JPG, PNG, WebP, or another supported type." },
  { title: "Adjust settings", desc: "Set quality, background color for transparent images, and review file previews." },
  { title: "Download", desc: "Save converted files individually or download all as a ZIP archive." },
];

const faqs = [
  {
    q: "Which image formats are supported?",
    a: "ToolMint supports JPG, PNG, WebP, BMP, GIF, AVIF, TIFF, and SVG as both input and output formats.",
  },
  {
    q: "Can I convert multiple images at once?",
    a: "Yes. Upload a batch of images and convert them all to the same format. Download individually or as a single ZIP file.",
  },
  {
    q: "What happens to transparent areas when converting to JPG?",
    a: "JPG does not support transparency. You can choose a background color (default: white) that will fill the transparent areas.",
  },
  {
    q: "Is WebP output supported?",
    a: "Yes. You can convert any supported image to WebP for smaller file sizes ideal for web use.",
  },
  {
    q: "Are my images private?",
    a: "Yes. All conversion runs in your browser using Canvas APIs. No images are uploaded to any server.",
  },
];

export default function ImageConverterPage() {
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
          Image Format Converter — Free Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert any image between JPG, PNG, WebP, BMP, GIF, AVIF, TIFF, and SVG with ToolMint.
          Control output quality, pick a background color for transparent images, and convert
          in bulk — all 100% in your browser with no file uploads.
        </p>

        <div className="mt-8">
          <ImageConverterTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Convert Image Formats
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
