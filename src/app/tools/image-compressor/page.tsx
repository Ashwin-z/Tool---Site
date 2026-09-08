import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ImageCompressorTool from "@/components/image-compressor-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Compress Images Online Without Losing Quality – Free Tool",
  description:
    "Compress JPG, PNG, and WebP images online for free. Reduce file size up to 90% without visible quality loss. Adjust quality slider, max width, and output format. 100% browser-based.",
  keywords: [
    "compress image without losing quality",
    "compress image online free",
    "reduce image file size",
    "compress jpg online",
    "compress png online",
    "reduce photo size for web",
    "image compressor free",
    "webp compressor",
  ],
  alternates: { canonical: "/tools/image-compressor" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Compress Images Without Losing Quality – Free Online | ToolMint",
    description:
      "Reduce JPG, PNG, and WebP file sizes by up to 90% without visible quality loss. Browser-based, no signup.",
    url: "/tools/image-compressor",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Website & blog images",
    desc: "Oversized images are the most common cause of slow page loads. Compressing before upload keeps your site fast without degrading visual quality.",
  },
  {
    title: "Email attachments",
    desc: "Most email providers cap attachments at 10–25MB. Compress product photos, flyers, or event images so they send without being rejected.",
  },
  {
    title: "Social media uploads",
    desc: "Platforms re-compress uploads automatically. Starting with an already-compressed image gives you more control over the final quality.",
  },
];

const steps = [
  { title: "Upload images", desc: "Drag and drop or click to select JPG, PNG, or WebP files." },
  { title: "Adjust settings", desc: "Set the quality level, maximum width, and output format." },
  { title: "Preview results", desc: "Compare original vs compressed file sizes instantly." },
  { title: "Download", desc: "Save individual files or download all as a ZIP archive." },
];

const faqs = [
  {
    q: "How much can I reduce image file size without losing quality?",
    a: "At a quality setting of 70-80%, JPG and WebP images typically shrink 50-80% with no perceptible difference at normal viewing size. PNG files compress less because they are already lossless.",
  },
  {
    q: "Which image formats can I compress?",
    a: "JPG, PNG, and WebP are all supported. You can also convert between these formats during compression — for example, converting a PNG to WebP for better web compression.",
  },
  {
    q: "Does compressing an image reduce its dimensions?",
    a: "Only if you set a maximum width. Compression alone reduces file size without changing pixel dimensions. Use the max-width setting if you also want to resize.",
  },
  {
    q: "Are my images uploaded to a server?",
    a: "No. All compression runs entirely in your browser using client-side processing. Your images never leave your device.",
  },
  {
    q: "Can I compress multiple images at once?",
    a: "Yes. Upload a batch and compress all files simultaneously. Download them individually or as a single ZIP archive.",
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
      <WebAppSchema slug="image-compressor" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="image-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Image Tools", href: "/tools/image-tools" },
            { name: "Image Compressor" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Compress Images Online Without Losing Quality
        </h1>

        <ProcessingBadge slug="image-compressor" />
        <ToolAnalytics slug="image-compressor" category="image" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Shrink JPG, PNG, and WebP images by up to 90% with no visible quality loss. Adjust the
          quality slider, set a maximum width, and choose the output format — all processing runs
          locally in your browser so your photos stay private.
        </p>

        <div className="mt-8">
          <ImageCompressorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Compress an Image
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (
              <article key={item.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Compress an Image Online
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              What Quality Setting Should You Use?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              For web use, a quality setting of 70–80% is the standard recommendation. At this
              level, images look sharp on screen and the difference from the original is invisible
              to the human eye at normal viewing sizes. For print-quality output where you need
              maximum sharpness, use 85–90%. For maximum file-size reduction where quality is
              secondary — such as thumbnail previews or loading placeholders — 50–60% is
              acceptable. PNG files are lossless and compress differently: reducing their file size
              requires either switching to JPG or WebP, or reducing the image dimensions.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              JPG vs. WebP: Which Format Compresses Better?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              WebP typically produces files 25–35% smaller than JPG at the same visual quality.
              It is supported by all modern browsers including Chrome, Firefox, Safari, and Edge.
              For new web projects, converting to WebP during compression is almost always the
              right choice. For use cases where compatibility with older software or email
              clients matters — such as attaching a photo to a business email — JPG remains
              the safer option. PNG is best kept for images that require transparency, such as
              logos or design assets with transparent backgrounds.
            </p>
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