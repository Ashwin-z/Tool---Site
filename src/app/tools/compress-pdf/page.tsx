import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import PdfCompressorTool from "@/components/pdf-compressor-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Compress PDF Online Free â€“ Reduce PDF Size",
  description:
    "Compress PDF files online for free. Reduce PDF size by up to 90% with no quality loss. No signup, no watermark, instant download.",
  keywords: [
    "compress pdf",
    "reduce pdf size",
    "pdf compressor online free",
    "shrink pdf",
    "compress pdf file",
    "pdf size reducer",
    "make pdf smaller",
    "free pdf compressor",
  ],
  alternates: { canonical: "/tools/compress-pdf" },
  openGraph: {
    title: "Compress PDF Online Free â€“ Reduce PDF Size | ToolMint",
    description:
      "Compress PDF files online for free. Reduce PDF size by up to 90% with no quality loss. No signup, no watermark, instant download.",
    url: "/tools/compress-pdf",
    images: [{ url: "/og/compress-pdf.png" }],
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Email attachments",
    desc: "Reduce large PDFs before attaching them to Gmail, Outlook, or support messages that enforce upload size limits.",
  },
  {
    title: "Portal uploads",
    desc: "Shrink PDFs for job applications, visa forms, school submissions, or government portals that reject files over a set size.",
  },
  {
    title: "Faster sharing",
    desc: "Compress presentation decks, brochures, and scanned documents so they upload and download faster on slower connections.",
  },
];

const steps = [
  { title: "Upload your PDF", desc: "Drag and drop or click to select a PDF file from your device." },
  { title: "Choose compression level", desc: "Pick Low, Medium, or High compression depending on your quality vs. size needs." },
  { title: "Compress", desc: "Hit Compress and let the engine optimize your file." },
  { title: "Download", desc: "Save your smaller PDF instantly. The original is never stored." },
];

const faqs = [
  {
    q: "How do I compress a PDF to under 1MB?",
    a: "Choose High compression mode and upload your PDF. Image-heavy files can drop below 1MB in most cases. If the file is still too large after compression, try splitting it into smaller sections first.",
  },
  {
    q: "Does compressing a PDF remove pages?",
    a: "No. Compression only reduces file size by optimizing images and internal data streams. All pages, text, and formatting remain intact.",
  },
  {
    q: "Is it safe to compress a PDF online?",
    a: "Yes. Your file is processed securely and deleted automatically after compression. ToolMint does not store, share, or access your documents.",
  },
  {
    q: "What causes a PDF to be so large?",
    a: "High-resolution images embedded in the PDF are the most common cause. Scanned documents, embedded fonts, and unoptimized export settings from Word or PowerPoint also produce large files.",
  },
  {
    q: "Can I compress a PDF on my phone?",
    a: "Yes. ToolMint works in any mobile browser. Open the page on your phone, upload your PDF, and download the compressed file without installing any app.",
  },
];

export default function CompressPdfPage() {
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
      <WebAppSchema slug="compress-pdf" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="pdf-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "PDF Tools", href: "/tools/pdf-tools" },
            { name: "Compress PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Compress PDF Without Losing Quality – Free Online Tool
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Reduce the file size of any PDF document in seconds. ToolMint offers three compression
          levels so you can balance quality and file size â€” from minimal reduction for print-ready
          files to maximum compression for email and portal uploads.
        </p>

        <div className="mt-8">
          <PdfCompressorTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Compress a PDF
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
            How to Compress a PDF Online
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
              What Is a Good PDF File Size?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              A good target depends on where the file is going. For email attachments, most providers
              cap uploads at 10â€“25MB, but recipients appreciate files under 5MB for fast loading. For
              government or job portal uploads, limits are commonly 2â€“5MB. For web downloads, keeping
              a PDF under 1â€“2MB improves page speed and user experience. Scanned documents often
              compress the most because their embedded images have the most room for optimization.
              Text-only PDFs are already compact and rarely need compression unless they contain
              embedded fonts or a large number of pages. If your file is already under 500KB, there is
              little practical benefit to compressing it further.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Does Compressing a PDF Reduce Quality?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              It depends on the compression level you choose. Low compression reduces file size by
              roughly 20â€“40% with almost no visible change to images or text rendering. Medium
              compression targets 50â€“70% reduction and is the best choice for most document sharing
              needs â€” quality remains acceptable for screen reading and standard printing. High
              compression maximizes size reduction, which can produce some image softening in
              photo-heavy PDFs. Text and vector content are never degraded regardless of the level
              chosen, because only raster images are re-sampled during compression. If you are
              preparing a file for professional print or archiving, use Low or Medium. For quick
              uploads and email, High compression produces the smallest result.
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

        <RelatedTools slug="compress-pdf" />
      </main>
    </>
  );
}
