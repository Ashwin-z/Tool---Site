import type { Metadata } from "next";
import Link from "next/link";
import ImageResizerTool from "@/components/image-resizer-tool";

export const metadata: Metadata = {
  title: "Resize Images Online Free — Exact Pixel Dimensions",
  description:
    "Resize images online for free with ToolMint. Scale JPG, PNG, and WebP to exact pixel dimensions using custom sizes or 12 social-media presets. Aspect-ratio lock included.",
  keywords: [
    "resize image online",
    "image resizer",
    "resize image pixels",
    "resize photo online free",
    "resize image for instagram",
    "change image dimensions",
    "resize jpg online",
    "image size changer",
  ],
  alternates: { canonical: "/tools/image-resizer" },
  openGraph: {
    title: "Resize Images Online Free | ToolMint",
    description:
      "Resize JPG, PNG, and WebP images to exact pixel dimensions. Social-media presets, aspect-ratio lock — free, browser-based.",
    url: "/tools/image-resizer",
  },
};

const steps = [
  { title: "Upload an image", desc: "Select or drag & drop a JPG, PNG, or WebP file." },
  { title: "Set dimensions", desc: "Enter exact pixel width and height, or pick a social-media preset." },
  { title: "Adjust options", desc: "Lock aspect ratio, choose output format, and set quality." },
  { title: "Download", desc: "Save the resized image to your device instantly." },
];

const faqs = [
  {
    q: "Can I maintain the aspect ratio while resizing?",
    a: "Yes. Toggle the aspect-ratio lock to automatically calculate the matching height or width when you change one dimension.",
  },
  {
    q: "What social-media presets are available?",
    a: "ToolMint includes 12 presets covering Instagram post/story, Facebook cover/profile, Twitter header, YouTube thumbnail, LinkedIn, and more.",
  },
  {
    q: "Will resizing reduce image quality?",
    a: "Enlarging an image can reduce sharpness. Shrinking preserves quality well. Use the quality slider to fine-tune the output.",
  },
  {
    q: "Can I resize multiple images at once?",
    a: "Yes. Upload a batch and apply the same dimensions to all images. Download them individually or as a ZIP.",
  },
  {
    q: "Is my image uploaded to a server?",
    a: "No. All resizing runs locally in your browser. Your images never leave your device.",
  },
];

export default function ImageResizerPage() {
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
          Resize Images Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Scale any image to exact pixel dimensions with ToolMint. Enter custom width and
          height or pick from 12 social-media presets for Instagram, Facebook, Twitter, and
          more. Lock the aspect ratio, choose your output format, and download instantly.
        </p>

        <div className="mt-8">
          <ImageResizerTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Resize an Image
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
