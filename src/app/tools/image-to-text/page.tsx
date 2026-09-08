import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ImageToTextTool from "@/components/image-to-text-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Extract Text from Images Using OCR – Free Online Tool",
  description:
    "Extract typed or printed text from images using OCR online for free. Supports JPG, PNG, screenshots, and scanned photos. No signup, instant results.",
  keywords: [
    "extract text from image free",
    "image to text ocr online",
    "ocr online free",
    "image to text converter",
    "extract text from screenshot",
    "read text from image",
    "photo to text online",
  ],
  alternates: { canonical: "/tools/image-to-text" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Extract Text from Images Free – OCR Online | ToolMint",
    description: "Use OCR to extract text from JPG, PNG, and screenshots free online. No signup, instant output.",
    url: "/tools/image-to-text",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  { title: "Screenshots and receipts", desc: "Extract text from UI screenshots, receipts, or billing statements you saved as images rather than PDFs." },
  { title: "Scanned documents", desc: "Digitize printed notes, letters, forms, and books by extracting the text from a scanned photo without retyping." },
  { title: "Business cards and signs", desc: "Capture a business card or physical sign with your phone and extract the text — names, addresses, phone numbers — directly." },
];

const faqs = [
  { q: "What types of text can OCR extract from images?", a: "OCR works best on clearly printed or typed text in standard fonts. Handwritten text, decorative fonts, and very small print produce less reliable results." },
  { q: "What image formats does the OCR tool support?", a: "JPG, JPEG, PNG, and WebP are supported. For scanned documents stored as PDF, use the PDF to Text tool instead." },
  { q: "How accurate is the text extraction?", a: "For high-quality scans and clear screenshots, accuracy is high — typically 95%+ for standard printed text. Image blur, low contrast, and unusual fonts reduce accuracy." },
  { q: "Does the tool preserve formatting like paragraphs and tables?", a: "Basic paragraph breaks are preserved. Complex layouts, tables, and multi-column formatting may require manual cleanup after extraction." },
  { q: "Are my images uploaded to a server for OCR?", a: "Processing details depend on the tool implementation. For sensitive documents, use the PDF to Text tool which is designed with privacy considerations for documents." },
];

export default function ImageToTextPage() {
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
      <WebAppSchema slug="image-to-text" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="image-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs items={[{ name: "Home", href: "/" },{ name: "Tools", href: "/tools" },{ name: "Image Tools", href: "/tools/image-tools" },{ name: "Image to Text (OCR)" }]} />
        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Extract Text from Images Using OCR – Free Online
        </h1>

        <ProcessingBadge slug="image-to-text" />
        <ToolAnalytics slug="image-to-text" category="image" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Use optical character recognition (OCR) to extract text from photos, screenshots, and
          scanned images. No retyping, no signup — paste or upload your image and get the text instantly.
        </p>
        <div className="mt-8"><ImageToTextTool /></div>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">When to Use Image to Text</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (<article key={item.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5"><h3 className="font-semibold text-foreground">{item.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{item.desc}</p></article>))}
          </div>
        </section>
        <section className="mt-16 space-y-8">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How OCR Works
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Optical Character Recognition (OCR) analyzes the shapes of characters in an image
              and converts them into machine-readable text. Modern OCR engines use pattern
              recognition and machine learning trained on millions of text samples to identify
              characters accurately across different fonts, sizes, and page layouts.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              The key factors that affect accuracy are image resolution, contrast between text and
              background, and font regularity. A high-contrast scan at 200 DPI or higher gives the
              best results. Blurry photos, low-contrast text on patterned backgrounds, and
              handwritten content are the most common causes of extraction errors.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Tips for Better OCR Results
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Take photos of documents in good lighting with the camera held parallel to the page —
              angled shots produce skewed text that is harder to recognize. Crop out unnecessary
              margins before uploading to help the engine focus on the text area. If the source
              document is low-contrast, increase brightness and contrast using the Image Converter
              before running OCR. For scanned PDFs, the PDF to Text tool with OCR support is a
              better choice than converting the PDF to images first.
            </p>
          </div>
        </section>
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Frequently Asked Questions</h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((f, i) => (<div key={i}><dt className="font-semibold text-foreground">{f.q}</dt><dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd></div>))}
          </dl>
        </section>
        <RelatedTools slug="image-to-text" />
      </main>
    </>
  );
}