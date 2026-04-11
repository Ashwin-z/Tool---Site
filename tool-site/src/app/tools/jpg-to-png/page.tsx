import type { Metadata } from "next";
import Link from "next/link";
import RelatedTools from "@/components/related-tools";
import JpgToPngTool from "@/components/jpg-to-png-tool";

export const metadata: Metadata = {
  title: "JPG to PNG Converter Online Free — Keep Transparency",
  description:
    "Convert JPG to PNG online for free with ToolMint. Also supports WebP, BMP, GIF, AVIF, TIFF, and SVG to lossless PNG with full transparency support. Batch convert multiple images.",
  keywords: [
    "jpg to png",
    "convert jpg to png",
    "jpg to png online free",
    "image to png converter",
    "jpeg to png",
    "convert image to png",
    "jpg to png converter",
    "lossless png converter",
  ],
  alternates: { canonical: "/tools/jpg-to-png" },
  openGraph: {
    title: "JPG to PNG Converter Online Free | ToolMint",
    description:
      "Convert JPG, WebP, BMP, GIF, AVIF, TIFF, and SVG to lossless PNG with transparency support — free, browser-based.",
    url: "/tools/jpg-to-png",
  },
};

const steps = [
  { title: "Upload an image", desc: "Select or drag & drop a JPG, WebP, BMP, GIF, AVIF, TIFF, or SVG file." },
  { title: "Preview", desc: "See the converted PNG preview with full transparency intact." },
  { title: "Batch convert", desc: "Upload multiple images to convert them all to PNG at once." },
  { title: "Download", desc: "Save the lossless PNG file to your device or download all as a ZIP." },
];

const faqs = [
  {
    q: "Why convert JPG to PNG?",
    a: "PNG is lossless and supports transparency. Converting to PNG preserves every pixel without further compression artifacts, making it ideal for graphics and logos.",
  },
  {
    q: "Which formats can I convert to PNG?",
    a: "JPG, WebP, BMP, GIF, AVIF, TIFF, and SVG files can all be converted to lossless PNG.",
  },
  {
    q: "Will the PNG file be larger than the original JPG?",
    a: "Usually yes. PNG is lossless, so it preserves full quality at the cost of larger file size compared to lossy JPG.",
  },
  {
    q: "Can I batch convert multiple files?",
    a: "Yes. Upload several images and convert them all to PNG at once. Download individually or as a ZIP archive.",
  },
  {
    q: "Is my image uploaded to a server?",
    a: "No. All conversion runs in your browser. Your images never leave your device.",
  },
];

export default function JpgToPngPage() {
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
          JPG to PNG Converter — Free Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert JPG and other image formats to lossless PNG with ToolMint. Upload JPG, WebP,
          BMP, GIF, AVIF, TIFF, or SVG files and get a high-quality PNG with full transparency
          support. Batch convert multiple images at once.
        </p>

        <div className="mt-8">
          <JpgToPngTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Convert JPG to PNG
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

        <RelatedTools slug="jpg-to-png" />
      </main>
    </>
  );
}
