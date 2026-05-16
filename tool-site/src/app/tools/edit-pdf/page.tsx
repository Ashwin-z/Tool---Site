import type { Metadata } from "next";
import EditPdfTool from "@/components/edit-pdf-tool-loader";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Edit PDF Online Free â€“ Add Text, Images & More",
  description:
    "Edit PDF files online for free. Add text, images, shapes, and annotations without any software. No signup required.",
  keywords: [
    "edit pdf online free",
    "pdf editor online",
    "add text to pdf",
    "annotate pdf online",
    "fill pdf form online",
    "pdf editor no signup",
    "free pdf editor",
    "edit pdf in browser",
  ],
  alternates: { canonical: "/tools/edit-pdf" },
  openGraph: {
    title: "Edit PDF Online Free â€“ Add Text, Images & More | ToolMint",
    description:
      "Edit PDF files online for free. Add text, images, shapes, and annotations without any software. No signup required.",
    url: "/tools/edit-pdf",
    images: [{ url: "/og/edit-pdf.png" }],
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Fill in PDF forms",
    desc: "Add text to form fields, checkboxes, and signature lines on PDF forms without converting them to Word first.",
  },
  {
    title: "Annotate and review documents",
    desc: "Add comments, highlights, and shapes to contracts, reports, or design mockups before returning them for review.",
  },
  {
    title: "Add branding elements",
    desc: "Insert logos, custom text, or stamps onto PDFs before sending them to clients or publishing them externally.",
  },
];

const steps = [
  { title: "Upload a PDF", desc: "Select the PDF file you want to edit." },
  { title: "Add content", desc: "Use the toolbar to add text, images, shapes, or annotations." },
  { title: "Position and style", desc: "Move, resize, and format the elements you added." },
  { title: "Download", desc: "Save the edited PDF to your device." },
];

const faqs = [
  {
    q: "Can I add text to a PDF without Acrobat?",
    a: "Yes. ToolMint's PDF editor lets you add text boxes anywhere on a PDF page without Adobe Acrobat. You can set the font size, color, and position of the text.",
  },
  {
    q: "Can I delete text from a PDF online?",
    a: "Deleting existing text from a PDF is significantly harder than adding new content, because PDF text is stored in compressed content streams. Most online editors, including this one, focus on adding content on top of the existing page rather than removing embedded text.",
  },
  {
    q: "How do I fill in a PDF form online?",
    a: "Upload the PDF form, use the text tool to click on each field and type your information, then download the completed PDF. For interactive PDF forms with clickable fields, the form fields may be fillable directly without using the text overlay tool.",
  },
  {
    q: "Can I add images or logos to a PDF?",
    a: "Yes. Use the image insertion tool to upload a JPG or PNG and place it anywhere on the PDF page. You can resize and reposition the image before saving.",
  },
  {
    q: "Is online PDF editing secure?",
    a: "Yes. ToolMint processes your PDF in your browser where possible. Your document is not stored on any server after the session ends.",
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
      <WebAppSchema slug="edit-pdf" />
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
            { name: "Edit PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Edit PDF Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Add text, images, shapes, and annotations to any PDF document with ToolMint. No software
          installation needed â€” edit directly in your browser and download the result instantly.
        </p>

        <div className="mt-8">
          <EditPdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Use an Online PDF Editor
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              What Can You Edit in a PDF Online?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Online PDF editors work by layering new content on top of the existing page rather
              than modifying the original content streams. This means you can add text boxes,
              images, shapes, lines, highlights, and sticky note annotations anywhere on the page.
              You can move, resize, and delete these added elements before saving. What you cannot
              easily do is modify the original embedded text â€” changing a word in a paragraph
              requires replacing that text with a new text box placed precisely over the original,
              which works but requires careful positioning. For filling in blank areas and adding
              new information, online editors work very well.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              When to Use an Online PDF Editor vs. Adobe Acrobat
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              An online editor like ToolMint is the right choice for quick tasks: filling in a form,
              adding a date or signature, inserting a logo, or annotating a document for review.
              It requires no software purchase, no installation, and works on any device. Adobe
              Acrobat (or the free Adobe Acrobat Reader with comments enabled) is better for heavy
              editing workflows: restructuring layouts, editing embedded text in long documents,
              complex form design, digital signature certificates, and accessibility remediation.
              For most day-to-day PDF editing tasks that involve adding content rather than
              rewriting it, an online editor is faster and sufficient.
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

        <RelatedTools slug="edit-pdf" />
      </main>
    </>
  );
}
