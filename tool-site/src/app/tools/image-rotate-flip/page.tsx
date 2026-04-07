import type { Metadata } from "next";
import Link from "next/link";
import ImageRotateFlipTool from "@/components/image-rotate-flip-tool";

export const metadata: Metadata = {
  title: "Rotate & Flip Images Online Free — Mirror or Turn Any Angle",
  description:
    "Rotate and flip images online for free with ToolMint. Turn 90°, 180°, or any custom angle. Flip horizontally or vertically. Supports JPG, PNG, WebP, BMP, GIF, AVIF, and TIFF. Batch processing.",
  keywords: [
    "rotate image online",
    "flip image online",
    "rotate image 90 degrees",
    "mirror image online",
    "image rotator",
    "flip photo horizontally",
    "rotate jpg online free",
    "image rotate and flip tool",
  ],
  alternates: { canonical: "/tools/image-rotate-flip" },
  openGraph: {
    title: "Rotate & Flip Images Online Free | ToolMint",
    description:
      "Rotate images to any angle and flip horizontally or vertically. Batch process JPG, PNG, WebP, and more — free, browser-based.",
    url: "/tools/image-rotate-flip",
  },
};

const steps = [
  { title: "Upload images", desc: "Select or drag & drop one or more JPG, PNG, WebP, BMP, GIF, AVIF, or TIFF files." },
  { title: "Rotate or flip", desc: "Click 90° left/right, 180°, or use the slider for a custom angle. Flip horizontally or vertically." },
  { title: "Preview", desc: "See the transformed image instantly in the preview pane." },
  { title: "Download", desc: "Save the rotated or flipped image to your device." },
];

const faqs = [
  {
    q: "Can I rotate by a custom angle?",
    a: "Yes. Use the angle slider to rotate to any degree from 0° to 360°, not just 90° or 180°.",
  },
  {
    q: "What is the difference between rotate and flip?",
    a: "Rotating turns the image around its center at a chosen angle. Flipping mirrors the image along the horizontal or vertical axis.",
  },
  {
    q: "Can I rotate multiple images at once?",
    a: "Yes. Upload a batch and apply the same rotation or flip to all images. Download individually or as a ZIP.",
  },
  {
    q: "Does rotation affect image quality?",
    a: "90° and 180° rotations are lossless. Custom angles use high-quality canvas rendering with minimal quality impact.",
  },
  {
    q: "Is my image uploaded to a server?",
    a: "No. All processing runs in your browser. Your images never leave your device.",
  },
];

export default function ImageRotateFlipPage() {
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
          Rotate & Flip Images Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Rotate images to any angle — 90°, 180°, or a custom degree — and flip horizontally or
          vertically with ToolMint. Batch process multiple images at once. Supports JPG, PNG,
          WebP, BMP, GIF, AVIF, and TIFF.
        </p>

        <div className="mt-8">
          <ImageRotateFlipTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Rotate or Flip an Image
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
