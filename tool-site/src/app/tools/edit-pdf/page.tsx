import type { Metadata } from "next";
import EditPdfTool from "@/components/edit-pdf-tool-loader";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";

export const metadata: Metadata = {
  title: "Edit PDF Online Free - Annotate, Draw and Stamp PDF Pages",
  description:
    "Edit PDF online for free with ToolMint. Add text, annotations, drawings, highlights, and image stamps on any page. Full editor workspace with page thumbnails and layer panel.",
  keywords: [
    "edit pdf online free",
    "annotate pdf online",
    "pdf editor online",
    "add text to pdf",
    "pdf annotation tool",
    "draw on pdf online",
    "pdf markup online",
    "free online pdf editor",
  ],
  alternates: { canonical: "/tools/edit-pdf" },
  openGraph: {
    title: "Edit PDF Online Free | ToolMint",
    description:
      "Edit PDF online, add text, drawings, highlights, and image stamps in a full browser-based editor.",
    url: "/tools/edit-pdf",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Open the PDF you want to edit in the browser-based workspace." },
  { title: "Select a tool", desc: "Choose from text, highlight, drawing, shape, or image stamp tools in the toolbar." },
  { title: "Edit pages", desc: "Add and position elements on any page using the canvas. Switch pages via the thumbnail panel." },
  { title: "Download", desc: "Export the edited PDF to your device. No server upload needed." },
];

const faqs = [
  {
    q: "What can I add to a PDF with this editor?",
    a: "You can add typed text, freehand drawings, highlight annotations, shapes, and image stamps to any page of your PDF.",
  },
  {
    q: "Can I edit text that is already in the PDF?",
    a: "This tool adds new content on top of existing pages. For editing original embedded text, a full-featured desktop PDF editor is still needed.",
  },
  {
    q: "Can I edit multiple pages?",
    a: "Yes. Use the page thumbnail panel on the left to switch between pages and add annotations to each one independently.",
  },
  {
    q: "Are my annotations saved in the PDF permanently?",
    a: "Yes. When you download, all annotations are flattened into the PDF so they appear in any viewer.",
  },
  {
    q: "Is my file uploaded to a server?",
    a: "No. All editing happens entirely in your browser. Your PDF never leaves your device.",
  },
];

export default function EditPdfPage() {
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
      <main className="pdf-tool-page mx-auto min-h-screen w-full max-w-[1600px] px-4 py-8 md:px-6 md:py-10">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "PDF Tools", href: "/tools/pdf-tools" },
            { name: "Edit PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Edit PDF Online for Free
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted md:text-base">
          Open your PDF in ToolMint&apos;s full editing workspace. Add text, freehand drawings,
          highlights, shapes, and image stamps to any page. Navigate pages with the thumbnail
          panel, manage layers, and download the annotated PDF directly from your browser.
        </p>

        <div className="mt-8">
          <EditPdfTool />
        </div>

        <section className="mt-16 max-w-5xl">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Edit a PDF Online
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

        <section className="mt-16 max-w-5xl">
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

        <div className="max-w-5xl">
          <RelatedTools slug="edit-pdf" />
        </div>
      </main>
    </>
  );
}
