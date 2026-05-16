import type { Metadata } from "next";
import AddWatermarkTool from "@/components/add-watermark-tool-loader";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Add Watermark to PDF Online Free",
  description:
    "Add text or image watermarks to PDF files online for free. Customize position, opacity, and size. No signup required.",
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
  alternates: { canonical: "/tools/add-watermark-to-pdf" },
  openGraph: {
    title: "Add Watermark to PDF Online Free | ToolMint",
    description:
      "Add text or image watermarks to PDF files online for free. Customize position, opacity, and size. No signup required.",
    url: "/tools/add-watermark-to-pdf",
    images: [{ url: "/og/add-watermark-to-pdf.png" }],
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Draft and review copies",
    desc: "Stamp 'DRAFT' or 'CONFIDENTIAL' across pages before circulating a document internally so recipients know it is not the final version.",
  },
  {
    title: "Branded documents",
    desc: "Add a logo or company name watermark to proposals, reports, and client deliverables to reinforce brand identity.",
  },
  {
    title: "Copyright protection",
    desc: "Overlay your name, website, or copyright notice on creative work or research before sharing it publicly.",
  },
];

const steps = [
  { title: "Upload a PDF", desc: "Drag and drop or select the PDF you want to watermark." },
  { title: "Choose watermark type", desc: "Add a text watermark or upload an image to use as the watermark stamp." },
  { title: "Adjust settings", desc: "Set position, alignment, rotation, opacity, mosaic tiling, and page range." },
  { title: "Download", desc: "Preview the watermarked PDF and save it to your device." },
];

const faqs = [
  {
    q: "Can I add a transparent watermark to a PDF?",
    a: "Yes. Use the opacity slider to set how transparent the watermark appears. Lower opacity values produce a subtle, semi-transparent stamp that does not obscure the underlying content.",
  },
  {
    q: "How do I add a 'Confidential' watermark to a PDF?",
    a: "Select text watermark, type 'CONFIDENTIAL' in the text field, set the rotation to 45 degrees, and reduce opacity to around 30â€“50% for a professional-looking stamp across every page.",
  },
  {
    q: "Can I remove a watermark added by this tool?",
    a: "Watermarks added by ToolMint are embedded in the PDF content layer. They cannot be removed with a simple undo after download, but can be edited using tools like Adobe Acrobat that allow direct content removal.",
  },
  {
    q: "Will the watermark appear on every page?",
    a: "Yes by default. You can also use the page range setting to apply the watermark to specific pages, odd pages, even pages, or a custom range.",
  },
  {
    q: "Can I add an image logo as a watermark?",
    a: "Yes. Select the image watermark option, upload your logo or any PNG or JPG image, then adjust the position, size, and opacity to fit the page layout.",
  },
];

export default function AddWatermarkToPdfPage() {
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
      <WebAppSchema slug="add-watermark-to-pdf" />
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
            { name: "Add Watermark to PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Add Watermark to PDF Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Stamp any PDF with a text or image watermark using ToolMint. Adjust the position,
          alignment, rotation, opacity, and mosaic tiling, then choose which pages to apply it to â€”
          all in your browser without uploading to any server.
        </p>

        <div className="mt-8">
          <AddWatermarkTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Add a Watermark to a PDF
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Why Add a Watermark to a PDF?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Watermarks serve several practical purposes depending on the document type. For
              internal documents that are not yet final, a 'DRAFT' stamp prevents recipients from
              treating early versions as authoritative. For sensitive materials, a 'CONFIDENTIAL'
              watermark signals handling requirements without requiring separate instructions. For
              creative work and research, overlaying a copyright notice or website URL discourages
              unauthorized redistribution. Brands use watermarks to embed their identity in
              proposals, reports, and presentations even when the document is shared as a plain
              PDF. The key is matching the watermark style â€” opacity, position, and size â€” to the
              use case, so it communicates the right message without making the content unreadable.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Text vs. Image Watermarks: Which to Use?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Text watermarks are faster to set up and scale cleanly at any size because they are
              rendered as vector elements. They are ideal for status labels like DRAFT, SAMPLE, or
              CONFIDENTIAL. Image watermarks are better when you want to embed a logo, seal, or
              signature-style graphic that matches your brand identity. The downside is that image
              watermarks need a transparent PNG to look good against page content â€” a JPEG with a
              white background will produce a visible white box. For most document workflows, a
              text watermark with a diagonal rotation, subtle opacity, and centered position covers
              the majority of use cases cleanly and quickly.
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

        <RelatedTools slug="add-watermark-to-pdf" />
      </main>
    </>
  );
}
