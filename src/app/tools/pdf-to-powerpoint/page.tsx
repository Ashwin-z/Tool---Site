import type { Metadata } from "next";
import PdfToPowerpointTool from "@/components/pdf-to-powerpoint-tool-loader";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "PDF to PowerPoint â€“ Convert PDF to PPTX Free",
  description:
    "Convert PDF files to editable PowerPoint presentations online for free. Fast, accurate, no signup needed.",
  keywords: [
    "pdf to powerpoint",
    "pdf to pptx",
    "convert pdf to powerpoint online free",
    "pdf to slides",
    "pdf presentation converter",
    "pdf to pptx free",
    "export pdf as pptx",
    "pdf to editable slides",
  ],
  alternates: { canonical: "/tools/pdf-to-powerpoint" },
  openGraph: {
    title: "PDF to PowerPoint â€“ Convert PDF to PPTX Free | ToolMint",
    description:
      "Convert PDF files to editable PowerPoint presentations online for free. Fast, accurate, no signup needed.",
    url: "/tools/pdf-to-powerpoint",
    images: [{ url: "/og/pdf-to-powerpoint.png" }],
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Edit a received presentation",
    desc: "When a colleague or client shares a presentation as a PDF, convert it to PPTX to update slides, add notes, or change the design.",
  },
  {
    title: "Repurpose existing content",
    desc: "Convert a PDF report into a slide deck for a presentation by turning each page into an editable slide.",
  },
  {
    title: "Recover lost source files",
    desc: "If the original .pptx file is unavailable but you have a PDF version, convert it back to PPTX as a starting point for editing.",
  },
];

const steps = [
  { title: "Upload a PDF", desc: "Select the PDF you want to convert to PowerPoint." },
  { title: "Convert", desc: "ToolMint maps each PDF page to a PowerPoint slide." },
  { title: "Download", desc: "Save the .pptx file and open it in PowerPoint or Google Slides." },
];

const faqs = [
  {
    q: "Will all PDF slides become PowerPoint slides?",
    a: "Yes. Each page of the PDF becomes one slide in the output .pptx file. The content is placed on the slide as an editable image or extracted text, depending on how the PDF was created.",
  },
  {
    q: "Does PDF to PPTX preserve images and charts?",
    a: "Images embedded in the PDF are preserved in the PPTX output. Charts that were created in PowerPoint and then saved to PDF may be converted as images rather than editable chart objects.",
  },
  {
    q: "Can I convert a scanned PDF to PowerPoint?",
    a: "Yes. Scanned PDFs are converted with each page placed as an image on a slide. The images are not editable as text, but you can resize, move, or replace them in PowerPoint.",
  },
  {
    q: "Why is my PDF to PowerPoint conversion misaligned?",
    a: "Misalignment usually occurs when the PDF uses a non-standard page size that does not match the default 16:9 or 4:3 PowerPoint slide ratio. Adjusting the slide size in PowerPoint after conversion resolves most layout issues.",
  },
  {
    q: "Is there a free way to convert PDF to PowerPoint?",
    a: "Yes. ToolMint converts PDF to PPTX for free with no account, no watermark, and no file size limit for typical presentation files.",
  },
];

export default function PdfToPowerpointPage() {
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
      <WebAppSchema slug="pdf-to-powerpoint" />
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
            { name: "PDF to PowerPoint" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert PDF to PowerPoint Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Turn a PDF into an editable .pptx presentation with ToolMint. Upload your PDF and get a
          PowerPoint file where each page becomes a slide â€” ready to edit in Microsoft PowerPoint
          or Google Slides. No account required.
        </p>

        <div className="mt-8">
          <PdfToPowerpointTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Convert PDF to PowerPoint
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
            How to Convert PDF to PowerPoint Online
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              Why Convert a PDF Presentation to PowerPoint?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              PDF is a final-state format â€” it is ideal for reading and sharing but not for editing.
              If you receive a presentation as a PDF and need to update its content, change the
              branding, add slides, or use it as a starting template, converting to PPTX gives you
              a workable file. Teams also convert PDFs to PowerPoint when repurposing content from
              reports or whitepapers â€” each page becomes a slide that can be rearranged or redesigned.
              For archiving, keeping a .pptx version alongside the PDF allows future editing without
              starting from scratch.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Can You Edit a PDF Converted to PowerPoint?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Yes, but the level of editability depends on how the PDF was created. PDFs made from
              PowerPoint files typically convert with text that can be selected and edited in the
              .pptx output. PDFs created from scanned documents or complex desktop publishing
              layouts are converted as images on slides â€” the visual content is preserved, but text
              cannot be edited directly without OCR post-processing. In both cases, you can add new
              text boxes, change backgrounds, reorder slides, and apply themes in PowerPoint after
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

        <RelatedTools slug="pdf-to-powerpoint" />
      </main>
    </>
  );
}
