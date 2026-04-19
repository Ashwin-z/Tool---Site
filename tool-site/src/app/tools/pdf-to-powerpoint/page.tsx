import type { Metadata } from "next";
import PdfToPowerpointTool from "@/components/pdf-to-powerpoint-tool-loader";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";

export const metadata: Metadata = {
  title: "PDF to PowerPoint Online Free - Convert PDF to PPTX",
  description:
    "Convert PDF to PowerPoint online for free with ToolMint. Turn each PDF page into a PowerPoint slide with full visual fidelity. No signup, no watermark - instant PDF to PPTX.",
  keywords: [
    "pdf to powerpoint",
    "pdf to pptx",
    "convert pdf to powerpoint online free",
    "pdf to slides",
    "pdf to presentation",
    "pdf to ppt converter",
    "free pdf to pptx",
    "pdf to powerpoint converter",
  ],
  alternates: { canonical: "/tools/pdf-to-powerpoint" },
  openGraph: {
    title: "PDF to PowerPoint Online Free - Convert PDF to PPTX | ToolMint",
    description:
      "Convert PDF to PowerPoint online for free. Each page becomes a slide with full visual fidelity. No signup.",
    url: "/tools/pdf-to-powerpoint",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Drag and drop or select the PDF file you want to convert." },
  { title: "Convert", desc: "ToolMint renders each PDF page as a full-bleed slide in your presentation." },
  { title: "Download PPTX", desc: "Get a PowerPoint file with one slide per PDF page." },
  { title: "Edit in PowerPoint", desc: "Open in Microsoft PowerPoint or Google Slides to add your own content." },
];

const faqs = [
  {
    q: "How does PDF to PowerPoint conversion work?",
    a: "Each PDF page is rendered as a high-resolution image and placed as a full-bleed slide in a PPTX file, preserving the visual layout.",
  },
  {
    q: "Can I edit the text in the PowerPoint slides after conversion?",
    a: "The slides contain page images, not editable text. To work with editable text first, use a text extraction workflow before rebuilding the deck.",
  },
  {
    q: "Is the PDF to PowerPoint conversion free?",
    a: "Yes. It is free to use with no signup, no limits, and no watermarks on ToolMint.",
  },
  {
    q: "What PowerPoint format is the output?",
    a: "The output is a .pptx file compatible with Microsoft PowerPoint 2007 and later, as well as Google Slides and LibreOffice Impress.",
  },
  {
    q: "Is my PDF secure during conversion?",
    a: "Yes. Files are processed privately and deleted automatically after conversion. Nothing is stored or shared.",
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
          Transform any PDF into a PowerPoint presentation with ToolMint. Each page is rendered
          as a full-bleed slide preserving layout, images, fonts, and graphics in a PPTX file
          you can open in Microsoft PowerPoint or Google Slides.
        </p>

        <div className="mt-8">
          <PdfToPowerpointTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Convert PDF to PowerPoint
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
