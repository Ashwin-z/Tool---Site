import type { Metadata } from "next";
import CropPdfTool from "@/components/crop-pdf-tool-loader";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";

export const metadata: Metadata = {
  title: "Crop PDF Online Free - Trim PDF Pages to Any Size",
  description:
    "Crop PDF pages online for free with ToolMint. Use the draggable crop box on a live preview to trim margins or remove unwanted areas. No upload, browser-based.",
  keywords: [
    "crop pdf online",
    "trim pdf pages",
    "crop pdf free",
    "pdf cropper online",
    "remove pdf margins",
    "pdf page trimmer",
    "crop pdf margins",
    "resize pdf page online",
  ],
  alternates: { canonical: "/tools/crop-pdf" },
  openGraph: {
    title: "Crop PDF Online Free | ToolMint",
    description:
      "Crop PDF pages online. Drag the crop box on a live preview to remove margins or unwanted areas.",
    url: "/tools/crop-pdf",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Select or drag and drop the PDF whose pages you want to crop." },
  { title: "Set the crop area", desc: "Drag the handles on the live page preview to define the region you want to keep." },
  { title: "Choose page scope", desc: "Apply the crop to all pages, just the current page, or a custom page range." },
  { title: "Download", desc: "Save the cropped PDF to your device instantly." },
];

const faqs = [
  {
    q: "What does cropping a PDF actually do?",
    a: "Cropping adjusts the visible area of each page without discarding any underlying content. It is useful for removing white margins or cutting out unwanted borders.",
  },
  {
    q: "Can I crop different pages to different sizes?",
    a: "Yes. Switch to individual page mode and set a unique crop rectangle for each page before downloading.",
  },
  {
    q: "Will cropping reduce the file size?",
    a: "Cropping changes page dimensions but does not remove embedded content from the file, so the size reduction is usually minimal. Use the PDF Compressor tool when size is the main goal.",
  },
  {
    q: "Can I undo a crop after downloading?",
    a: "The crop is applied to the downloaded file, so keep your original PDF if you may want to adjust the crop later.",
  },
  {
    q: "Is my file uploaded anywhere?",
    a: "No. All cropping runs locally in your browser. Your file never leaves your device.",
  },
];

export default function CropPdfPage() {
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
            { name: "Crop PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Crop PDF Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Trim the pages of any PDF to a custom size with ToolMint. Drag the crop handles
          directly on a live page preview to remove margins, borders, or unwanted areas.
          Apply the crop to all pages or a specific range, then download instantly.
        </p>

        <div className="mt-8">
          <CropPdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Crop a PDF
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

        <RelatedTools slug="crop-pdf" />
      </main>
    </>
  );
}
