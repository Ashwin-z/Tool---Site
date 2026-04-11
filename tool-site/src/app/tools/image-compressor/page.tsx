import type { Metadata } from "next";
import Link from "next/link";
import RelatedTools from "@/components/related-tools";
import ImageCompressorTool from "@/components/image-compressor-tool";

export const metadata: Metadata = {
  title: "Compress Images Online Free — Reduce JPG, PNG & WebP Size",
  description:
    "Compress JPG, PNG, and WebP images online for free with ToolMint. Reduce file size up to 90% without visible quality loss. Adjust quality, max width, and output format. 100% browser-based.",
  keywords: [
    "compress image online",
    "image compressor",
    "reduce image size",
    "compress jpg online free",
    "compress png online",
    "reduce photo file size",
    "image compression tool",
    "webp compressor online",
  ],
  alternates: { canonical: "/tools/image-compressor" },
  openGraph: {
    title: "Compress Images Online Free | ToolMint",
    description:
      "Reduce JPG, PNG, and WebP file sizes up to 90% without quality loss. Adjust quality and output format — free, browser-based.",
    url: "/tools/image-compressor",
  },
};

const steps = [
  { title: "Upload images", desc: "Drag & drop or select JPG, PNG, or WebP files to compress." },
  { title: "Adjust settings", desc: "Set the quality slider, maximum width, and output format." },
  { title: "Preview results", desc: "Compare original and compressed sizes to see the savings." },
  { title: "Download", desc: "Save the compressed images individually or as a ZIP." },
];

const faqs = [
  {
    q: "How much can I reduce the file size?",
    a: "Depending on the image and quality setting, you can reduce file sizes by up to 90% with minimal visible quality loss.",
  },
  {
    q: "Which image formats are supported?",
    a: "You can compress JPG, PNG, and WebP images. You can also convert between these formats during compression.",
  },
  {
    q: "Does compression lower image quality?",
    a: "Lossy compression reduces some detail, but at moderate quality settings (60-80%) the difference is virtually invisible. Use the quality slider to find the right balance.",
  },
  {
    q: "Can I compress multiple images at once?",
    a: "Yes. Upload a batch of images and compress them all with the same settings. Download individually or as a ZIP archive.",
  },
  {
    q: "Is my data private?",
    a: "Yes. All compression runs in your browser. Your images are never uploaded to any server.",
  },
];

export default function ImageCompressorPage() {
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
          Compress Images Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Shrink JPG, PNG, and WebP images by up to 90% with ToolMint. Adjust the quality
          slider, set a maximum width, and choose the output format — all processing runs
          locally in your browser so your photos stay private.
        </p>

        <div className="mt-8">
          <ImageCompressorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Compress an Image
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

        <RelatedTools slug="image-compressor" />
      </main>
    </>
  );
}
