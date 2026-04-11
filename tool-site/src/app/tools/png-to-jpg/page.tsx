import type { Metadata } from "next";
import Link from "next/link";
import RelatedTools from "@/components/related-tools";
import PngToJpgTool from "@/components/png-to-jpg-tool";

export const metadata: Metadata = {
  title: "PNG to JPG Converter Online Free — Convert Any Image to JPEG",
  description:
    "Convert PNG to JPG online for free with ToolMint. Also supports WebP, BMP, GIF, AVIF, TIFF, and SVG to JPEG conversion. Adjustable quality and transparent-background color replacement.",
  keywords: [
    "png to jpg",
    "convert png to jpg",
    "png to jpeg online free",
    "image to jpg converter",
    "webp to jpg",
    "convert image to jpeg",
    "png to jpg converter",
    "free png to jpg",
  ],
  alternates: { canonical: "/tools/png-to-jpg" },
  openGraph: {
    title: "PNG to JPG Converter Online Free | ToolMint",
    description:
      "Convert PNG, WebP, BMP, GIF, AVIF, TIFF, and SVG to JPG online. Adjust quality and background color — free, browser-based.",
    url: "/tools/png-to-jpg",
  },
};

const steps = [
  { title: "Upload an image", desc: "Select or drag & drop a PNG, WebP, BMP, GIF, AVIF, TIFF, or SVG file." },
  { title: "Set quality", desc: "Use the quality slider to balance file size and image clarity." },
  { title: "Choose background", desc: "Pick a background color to replace transparent areas (default: white)." },
  { title: "Download JPG", desc: "Save the converted JPEG file to your device instantly." },
];

const faqs = [
  {
    q: "What happens to transparency when converting to JPG?",
    a: "JPEG does not support transparency. Transparent areas are filled with the background color you choose (white by default).",
  },
  {
    q: "Which image formats can I convert to JPG?",
    a: "PNG, WebP, BMP, GIF, AVIF, TIFF, and SVG can all be converted to JPEG with this tool.",
  },
  {
    q: "Does conversion reduce quality?",
    a: "JPEG is lossy, so some detail is lost. Use a high quality setting (80-100%) to minimize visible loss.",
  },
  {
    q: "Can I convert multiple images at once?",
    a: "Yes. Upload a batch and convert them all to JPG with the same settings. Download individually or as a ZIP.",
  },
  {
    q: "Is my file uploaded to a server?",
    a: "No. Conversion runs entirely in your browser. Your images never leave your device.",
  },
];

export default function PngToJpgPage() {
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
          PNG to JPG Converter — Free Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert PNG and other image formats to JPEG with ToolMint. Upload a PNG, WebP, BMP,
          GIF, AVIF, TIFF, or SVG file, adjust quality, and choose a background color for
          transparent areas. The converted JPG is ready to download in seconds.
        </p>

        <div className="mt-8">
          <PngToJpgTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Convert PNG to JPG
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

        <RelatedTools slug="png-to-jpg" />
      </main>
    </>
  );
}
