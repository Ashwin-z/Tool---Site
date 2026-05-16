import type { Metadata } from "next";
import CropPdfTool from "@/components/crop-pdf-tool-loader";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Crop PDF Pages Online Free â€“ Trim PDF Margins",
  description:
    "Crop PDF pages online for free. Remove unwanted margins or trim page areas instantly. No signup required.",
  keywords: [
    "crop pdf",
    "trim pdf margins",
    "crop pdf pages online free",
    "remove pdf borders",
    "pdf margin crop",
    "pdf page trimmer",
    "cut pdf page",
    "free pdf cropper",
  ],
  alternates: { canonical: "/tools/crop-pdf" },
  openGraph: {
    title: "Crop PDF Pages Online Free â€“ Trim PDF Margins | ToolMint",
    description:
      "Crop PDF pages online for free. Remove unwanted margins or trim page areas instantly. No signup required.",
    url: "/tools/crop-pdf",
    images: [{ url: "/og/crop-pdf.png" }],
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Remove scanner borders",
    desc: "Scanned documents often have large black or white borders. Crop the margins to show only the document content.",
  },
  {
    title: "Trim presentation headers",
    desc: "Remove slide headers, footers, or page numbers from converted PDF presentations before redistribution.",
  },
  {
    title: "Focus on specific content",
    desc: "Crop a PDF page to show only the relevant portion â€” a chart, a section of a drawing, or a specific table area.",
  },
];

const steps = [
  { title: "Upload a PDF", desc: "Select the PDF you want to crop from your device." },
  { title: "Set crop area", desc: "Drag the crop handles to define the area you want to keep." },
  { title: "Apply", desc: "Apply the crop to all pages or selected pages." },
  { title: "Download", desc: "Save the cropped PDF to your device." },
];

const faqs = [
  {
    q: "Does cropping a PDF delete the hidden content?",
    a: "In most PDF cropping implementations, the content outside the crop area is hidden but not permanently deleted from the file. The crop box tells viewers what to display. ToolMint applies the crop as a display boundary.",
  },
  {
    q: "Can I crop all pages at once?",
    a: "Yes. You can apply the same crop dimensions to all pages simultaneously, which is useful for removing consistent borders from all pages in a scanned document.",
  },
  {
    q: "How do I remove the white margins from a scanned PDF?",
    a: "Upload the scanned PDF, drag the crop handles inward to trim the white borders from all four sides, and apply the crop to all pages. The content area remains intact while the outer margins are hidden.",
  },
  {
    q: "Can I crop a PDF to a specific size like A4?",
    a: "You can set the crop dimensions manually to match standard page sizes. This is useful for standardizing mixed-size pages in a document.",
  },
  {
    q: "Will cropping increase or decrease file size?",
    a: "Cropping typically does not change file size significantly because it changes the visible area without deleting the underlying content. Compression applied after cropping can reduce file size further.",
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
      <WebAppSchema slug="crop-pdf" />
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
          Crop PDF Pages Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Trim the visible area of PDF pages with ToolMint. Remove unwanted margins, scanner
          borders, or excess whitespace by defining a crop area and applying it to any or all pages.
          No account required.
        </p>

        <div className="mt-8">
          <CropPdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Crop a PDF
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
            How to Crop PDF Pages Online
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
              What Does Cropping a PDF Page Actually Do?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Cropping a PDF page changes the crop box â€” a rectangle that defines which portion of
              the page content is visible to viewers. Content outside the crop box is not deleted
              from the file structure; it is hidden from display. This is different from cropping
              an image, where pixels outside the selection are permanently removed. In practical
              terms, most use cases treat cropped PDFs as having smaller pages because all standard
              viewers, printers, and apps respect the crop box and show only the cropped area. The
              original content can be recovered by expanding the crop box back to the full page
              dimensions in a PDF editor.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How to Remove White Borders from a Scanned PDF
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Scanners capture an area slightly larger than the document, which creates white or
              dark borders around the scanned content. To remove these, upload the PDF and drag
              the four crop edges inward until they align with the actual document content. The
              preview shows where the borders end and the content begins. Apply to all pages to
              clean up a multi-page scanned document consistently. For documents with slightly
              inconsistent scan alignment, applying the crop to all pages may still leave small
              borders on some pages â€” these can be adjusted per page for precise trimming.
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

        <RelatedTools slug="crop-pdf" />
      </main>
    </>
  );
}
