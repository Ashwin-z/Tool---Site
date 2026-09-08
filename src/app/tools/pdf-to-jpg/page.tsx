import type { Metadata } from "next";
import PdfToJpgTool from "@/components/pdf-to-jpg-tool";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "PDF to JPG Converter – Convert PDF Pages to Images Free",
  description:
    "Convert PDF pages to high-quality JPG images online for free. Download pages individually or as a zip. No signup.",
  keywords: [
    "pdf to jpg",
    "pdf to image",
    "convert pdf to jpg online free",
    "pdf page to jpeg",
    "extract images from pdf",
    "pdf to png",
    "save pdf as image",
    "free pdf to jpg converter",
  ],
  alternates: { canonical: "/tools/pdf-to-jpg" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "PDF to JPG Converter – Convert PDF Pages to Images Free | ToolMint",
    description:
      "Convert PDF pages to high-quality JPG images online for free. Download pages individually or as a zip. No signup.",
    url: "/tools/pdf-to-jpg",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Preview and thumbnails",
    desc: "Convert PDF pages to JPG for use as document previews, social media images, or thumbnails in a file management system.",
  },
  {
    title: "Extract specific content",
    desc: "Pull a chart, diagram, or scanned page from a PDF as an image for use in presentations or documents.",
  },
  {
    title: "Platforms that require images",
    desc: "Submit PDF content to platforms like Instagram, Canva, or email builders that accept image uploads but not PDF files.",
  },
];

const steps = [
  { title: "Upload a PDF", desc: "Select a PDF file from your device." },
  { title: "Choose quality", desc: "Set the output resolution or quality level for the JPG images." },
  { title: "Convert", desc: "ToolMint renders each PDF page as a JPG image." },
  { title: "Download", desc: "Download pages individually or as a zip archive." },
];

const faqs = [
  {
    q: "Can I convert all PDF pages to JPG at once?",
    a: "Yes. ToolMint converts every page in the PDF to a separate JPG image. You can download them individually or as a single zip archive containing all pages.",
  },
  {
    q: "What quality setting should I use for PDF to JPG?",
    a: "Use high quality (150–300 DPI) for documents where text or fine detail needs to remain readable in the image. Use medium quality for web use or social media where file size matters more than pixel precision.",
  },
  {
    q: "Does converting PDF to JPG lose quality?",
    a: "Some quality loss occurs because JPG is a lossy format. Text and sharp lines can look slightly softer compared to the original PDF. For documents with a lot of fine text, PNG output at the same resolution produces a sharper result.",
  },
  {
    q: "Can I convert a scanned PDF to JPG?",
    a: "Yes. A scanned PDF is already an image embedded in a PDF container. Converting it to JPG extracts those images at the resolution they were scanned and saved.",
  },
  {
    q: "Is JPG or PNG better for converting PDF pages?",
    a: "PNG is better for text-heavy pages because it is lossless and preserves sharp edges. JPG is better for photo-heavy pages where a smaller file size is the priority. For most document-to-image conversions, PNG produces a higher-fidelity result.",
  },
];

export default function PdfToJpgPage() {
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
      <WebAppSchema slug="pdf-to-jpg" />
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
            { name: "PDF to JPG" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert PDF to JPG Online for Free
        </h1>

        <ProcessingBadge slug="pdf-to-jpg" />
        <ToolAnalytics slug="pdf-to-jpg" category="pdf" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Turn PDF pages into high-quality JPG images with ToolMint. Convert a single page or an
          entire document and download the images individually or as a zip archive — no account
          required.
        </p>

        <div className="mt-8">
          <PdfToJpgTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Convert PDF to JPG
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
            How to Convert PDF to JPG Online
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
              When to Convert PDF to JPG Instead of Sharing as PDF
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Some platforms and workflows accept images but not PDFs. Social media platforms,
              presentation tools, email campaign builders, and messaging apps are common examples.
              Converting PDF pages to JPG is also useful when you need to embed a document page
              inside a Word file, Google Slides, or Canva design. For quick sharing in a chat or
              messaging platform, a JPG is simpler than a PDF — it opens immediately without a
              viewer. Marketers often convert PDF brochures and catalogs to JPG pages for use in
              product listings, website galleries, or digital ads.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              What Resolution Should PDF to JPG Be?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Resolution determines how sharp the image looks at different sizes. 72–96 DPI is
              sufficient for screen display and web use. 150 DPI is a good middle ground for
              documents where text needs to remain readable in the image. 300 DPI is the standard
              for high-quality print output where the image will be enlarged or printed at full
              page size. For most web and document use cases, 150 DPI gives a sharp image at a
              reasonable file size. Going higher than 300 DPI rarely produces visible improvement
              for document pages and significantly increases file size.
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

        <RelatedTools slug="pdf-to-jpg" />
      </main>
    </>
  );
}
