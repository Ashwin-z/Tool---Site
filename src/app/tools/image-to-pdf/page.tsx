import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ImageToPdfTool from "@/components/image-to-pdf-tool-loader";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Image to PDF Converter – JPG, PNG to PDF Free",
  description:
    "Convert JPG, PNG, or any image to PDF online for free. Combine multiple images into one PDF. No signup, instant result.",
  keywords: [
    "image to pdf",
    "jpg to pdf",
    "png to pdf",
    "convert image to pdf online free",
    "multiple images to pdf",
    "photo to pdf",
    "picture to pdf converter",
    "free image to pdf",
  ],
  alternates: { canonical: "/tools/image-to-pdf" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Image to PDF Converter – JPG, PNG to PDF Free | ToolMint",
    description:
      "Convert JPG, PNG, or any image to PDF online for free. Combine multiple images into one PDF. No signup, instant result.",
    url: "/tools/image-to-pdf",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Scan-to-PDF workflow",
    desc: "Convert a batch of scanned JPG images from your phone into a single, organized PDF for archiving or submission.",
  },
  {
    title: "Photo documentation",
    desc: "Combine product photos, site inspection images, or event pictures into one PDF report for clients or records.",
  },
  {
    title: "Submission requirements",
    desc: "Many portals accept only PDF uploads. Convert your PNG or JPG certificates, ID scans, or receipts before submitting.",
  },
];

const steps = [
  { title: "Upload images", desc: "Select one or more JPG, PNG, or other image files from your device." },
  { title: "Reorder if needed", desc: "Drag thumbnails to set the order images appear in the PDF." },
  { title: "Set page size", desc: "Choose A4, Letter, or fit-to-image for each page." },
  { title: "Download", desc: "Click Convert and save your PDF instantly." },
];

const faqs = [
  {
    q: "Can I combine multiple images into one PDF?",
    a: "Yes. Upload as many images as you need, arrange them in the order you want, and ToolMint combines them into a single multi-page PDF with one image per page.",
  },
  {
    q: "Will converting to PDF reduce image quality?",
    a: "No significant quality loss occurs. The images are embedded in the PDF at their original resolution. You only lose quality if you choose a compression option that explicitly reduces resolution.",
  },
  {
    q: "What is the best format for images in a PDF?",
    a: "PNG is best for screenshots, graphics, and images with text because it is lossless. JPG is better for photographs where smaller file size matters more than pixel-perfect accuracy.",
  },
  {
    q: "How do I convert a JPG to PDF on mobile?",
    a: "Open ToolMint in your phone's browser, tap the upload area to select a JPG from your camera roll, and tap Convert. The PDF downloads directly to your device without any app installation.",
  },
  {
    q: "Can I set the page size when converting images to PDF?",
    a: "Yes. You can choose standard page sizes like A4 or US Letter, or use the image's natural dimensions as the page size, which produces a PDF where the page fits the image exactly.",
  },
];

export default function ImageToPdfPage() {
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
      <WebAppSchema slug="image-to-pdf" />
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
            { name: "Image to PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert Images to PDF Online for Free
        </h1>

        <ProcessingBadge slug="image-to-pdf" />
        <ToolAnalytics slug="image-to-pdf" category="pdf" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Turn JPG, PNG, WebP, or any image file into a PDF document with ToolMint. Upload multiple
          images, reorder them, choose a page size, and download a clean PDF — all in your browser
          with no account required.
        </p>

        <div className="mt-8">
          <ImageToPdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Convert Images to PDF
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
            How to Convert Images to PDF Online
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
              Why Convert Images to PDF?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              PDF is the most universally accepted document format for official submissions,
              professional sharing, and long-term storage. Many government portals, job applications,
              and academic systems only accept PDFs — not image files. Converting images to PDF also
              makes multi-page documents easier to share as a single file rather than a folder of
              separate images. PDFs are easier to print predictably, they preserve aspect ratios on
              any device, and they reduce the risk of images being accidentally edited. If you have
              photographed receipts, contracts, certificates, or handwritten notes, converting them
              to PDF is the cleanest way to archive and share that content.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              What Image Formats Can Be Converted to PDF?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              ToolMint supports JPG (JPEG), PNG, WebP, and GIF images as inputs for PDF conversion.
              JPG is the most common format for photographs and scanned documents. PNG is preferred
              for screenshots, diagrams, and images with transparency or text because it does not
              use lossy compression. WebP is a modern format produced by many phones and browsers
              that offers small file sizes at good quality. BMP and TIFF files from older scanners
              may need to be converted to JPG or PNG first before uploading. Most image files
              captured by a modern phone or downloaded from the web will work without any prior
              conversion.
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

        <RelatedTools slug="image-to-pdf" />
      </main>
    </>
  );
}
