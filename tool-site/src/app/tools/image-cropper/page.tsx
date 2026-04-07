import type { Metadata } from "next";
import Link from "next/link";
import ImageCropperTool from "@/components/image-cropper-tool";

export const metadata: Metadata = {
  title: "Crop Images Online Free — Crop by Aspect Ratio or Custom Area",
  description:
    "Crop images online for free with ToolMint. Visual crop editor with aspect-ratio presets for social media and a rule-of-thirds grid. Supports JPG, PNG, WebP, BMP, GIF, AVIF, and TIFF.",
  keywords: [
    "crop image online",
    "image cropper",
    "crop photo online free",
    "crop image by ratio",
    "crop jpg online",
    "crop png online",
    "photo cropper",
    "image crop tool",
  ],
  alternates: { canonical: "/tools/image-cropper" },
  openGraph: {
    title: "Crop Images Online Free | ToolMint",
    description:
      "Crop any image with aspect-ratio presets and a rule-of-thirds grid. Supports JPG, PNG, WebP, BMP, GIF, AVIF, and TIFF.",
    url: "/tools/image-cropper",
  },
};

const steps = [
  { title: "Upload an image", desc: "Drag & drop or select a JPG, PNG, WebP, BMP, GIF, AVIF, or TIFF file." },
  { title: "Set the crop area", desc: "Drag the handles to define the crop region, or choose a preset ratio like 1:1, 4:3, or 16:9." },
  { title: "Fine-tune", desc: "Toggle the rule-of-thirds grid to align subjects, then adjust position." },
  { title: "Download", desc: "Save the cropped image to your device in the format you choose." },
];

const faqs = [
  {
    q: "What aspect-ratio presets are available?",
    a: "ToolMint includes presets for 1:1 (square), 4:3, 3:2, 16:9, 9:16 (stories), and free crop with no ratio constraint.",
  },
  {
    q: "Can I crop to an exact pixel size?",
    a: "Set the desired ratio and then resize after cropping using the Image Resizer tool for exact pixel dimensions.",
  },
  {
    q: "What image formats are supported?",
    a: "JPG, PNG, WebP, BMP, GIF, AVIF, and TIFF. You can also choose the output format when downloading.",
  },
  {
    q: "What is the rule-of-thirds grid?",
    a: "It overlays a 3\u00d73 grid on the crop area to help you align subjects along the power lines for better composition.",
  },
  {
    q: "Is my image uploaded to a server?",
    a: "No. All cropping runs locally in your browser. Your image never leaves your device.",
  },
];

export default function ImageCropperPage() {
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
          Crop Images Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Visually crop any image to the exact area you need with ToolMint. Lock to popular
          aspect ratios like 1:1, 4:3, or 16:9 for social-media posts, use the rule-of-thirds
          grid for perfect composition, or crop freely. Supports JPG, PNG, WebP, BMP, GIF,
          AVIF, and TIFF.
        </p>

        <div className="mt-8">
          <ImageCropperTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Crop an Image
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
