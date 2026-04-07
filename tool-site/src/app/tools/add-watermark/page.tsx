import type { Metadata } from "next";
import Link from "next/link";
import AddWatermarkTool from "@/components/add-watermark-tool";

export const metadata: Metadata = {
  title: "Add Watermark to PDF Online Free — Text & Image Watermark",
  description:
    "Add text or image watermarks to any PDF online for free with ToolMint. Control position, rotation, opacity, mosaic tiling, and page range. No upload, fully browser-based.",
  keywords: [
    "add watermark to pdf",
    "pdf watermark online free",
    "watermark pdf online",
    "add text watermark to pdf",
    "add image watermark to pdf",
    "pdf watermarker",
    "stamp pdf online",
    "free pdf watermark tool",
  ],
  alternates: { canonical: "/tools/add-watermark" },
  openGraph: {
    title: "Add Watermark to PDF Online Free | ToolMint",
    description:
      "Add text or image watermarks to PDFs online. Control position, opacity, rotation, mosaic, and page range — all in your browser.",
    url: "/tools/add-watermark",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Drag & drop or select the PDF you want to watermark." },
  { title: "Choose watermark type", desc: "Add a text watermark or upload an image to use as the watermark stamp." },
  { title: "Adjust settings", desc: "Set position, alignment, rotation, opacity/transparency, mosaic tiling, and page range." },
  { title: "Download", desc: "Preview the watermarked PDF and save it to your device." },
];

const faqs = [
  {
    q: "Can I add an image watermark instead of text?",
    a: "Yes. ToolMint supports both text and image watermarks. Upload your logo or any image and position it anywhere on the page.",
  },
  {
    q: "Can I tile the watermark across the whole page?",
    a: "Yes. Enable mosaic mode to repeat the watermark in a grid pattern across the entire PDF page.",
  },
  {
    q: "Can I control which pages get the watermark?",
    a: "Yes. Use the page range selector to apply the watermark to all pages, odd pages, even pages, or a custom range.",
  },
  {
    q: "Will watermarking change my PDF quality?",
    a: "No. Watermarks are drawn as vector overlays on the PDF canvas — no re-encoding or quality loss.",
  },
  {
    q: "Is my file private?",
    a: "Yes. All processing runs entirely in your browser. Your PDF is never sent to a server.",
  },
];

export default function AddWatermarkPage() {
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
          Add Watermark to PDF Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Stamp any PDF with a text or image watermark using ToolMint. Adjust the position,
          alignment, rotation, opacity, and mosaic tiling, then choose which pages to apply
          it to — all in your browser with no file upload required.
        </p>

        <div className="mt-8">
          <AddWatermarkTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Add a Watermark to a PDF
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