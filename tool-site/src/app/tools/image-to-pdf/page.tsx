import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ImageToPdfTool from "@/components/image-to-pdf-tool-loader";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";

export const metadata: Metadata = {
  title: "Image to PDF Online Free - Convert JPG, PNG to PDF",
  description:
    "Convert images to PDF online for free with ToolMint. Upload JPG, PNG, WEBP, GIF, BMP, or SVG files, arrange them, and create a single PDF. No signup, no limits.",
  keywords: [
    "image to pdf",
    "jpg to pdf",
    "png to pdf",
    "convert image to pdf",
    "photo to pdf",
    "picture to pdf online free",
    "free image to pdf converter",
    "images to pdf",
  ],
  alternates: { canonical: "/tools/image-to-pdf" },
  openGraph: {
    title: "Image to PDF Online Free - Convert JPG, PNG to PDF | ToolMint",
    description:
      "Convert images to PDF online for free. Upload JPG, PNG, WEBP, GIF, BMP or SVG and create a single PDF. No signup.",
    url: "/tools/image-to-pdf",
  },
};

const steps = [
  { title: "Upload images", desc: "Drag and drop or select up to 25 image files such as JPG, PNG, WEBP, GIF, BMP, or SVG." },
  { title: "Arrange order", desc: "Drag thumbnails to set the page order in your PDF." },
  { title: "Convert", desc: "Click Convert and your images are assembled into a PDF instantly." },
  { title: "Download", desc: "Save the combined PDF to your device." },
];

const faqs = [
  {
    q: "What image formats can I convert to PDF?",
    a: "ToolMint supports JPG and JPEG, PNG, WEBP, GIF, BMP, and SVG image formats.",
  },
  {
    q: "How many images can I combine into one PDF?",
    a: "You can upload and combine up to 25 images in a single PDF document.",
  },
  {
    q: "Can I rearrange the image order before converting?",
    a: "Yes. After uploading, drag and drop thumbnails to set the exact page order you want in the final PDF.",
  },
  {
    q: "Is the image quality preserved in the PDF?",
    a: "Yes. Images are embedded at their original resolution without additional compression.",
  },
  {
    q: "Do I need to install any software?",
    a: "No. ToolMint works entirely in your browser with no downloads, plugins, or signup required.",
  },
];

const useCases = [
  {
    title: "JPG to PDF for forms",
    desc: "Bundle photo scans of forms, ID copies, or signed pages into one PDF before uploading to a portal.",
  },
  {
    title: "Receipts and invoices",
    desc: "Turn phone photos of receipts or invoices into a cleaner PDF file that is easier to email and archive.",
  },
  {
    title: "Assignments and notes",
    desc: "Combine notebook photos, worksheets, or whiteboard captures into a single PDF document for sharing.",
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
          JPG to PDF and Image to PDF Converter Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Turn your images into a polished PDF document with ToolMint. Upload up to 25 JPG, PNG,
          WEBP, GIF, BMP, or SVG files, drag to rearrange them, and download a single combined
          PDF. This page is ideal when you need a fast JPG to PDF converter for receipts, scans,
          assignments, or photo collections.
        </p>

        <div className="mt-8">
          <ImageToPdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Common Uses for JPG to PDF Conversion
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
            How to Convert Images to PDF
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

        <RelatedTools slug="image-to-pdf" />
      </main>
    </>
  );
}
