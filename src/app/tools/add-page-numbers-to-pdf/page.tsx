import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import AddPageNumbersTool from "@/components/add-page-numbers-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF Online Free",
  description:
    "Add page numbers to PDF documents online for free. Choose position, font, and starting number. No signup needed.",
  keywords: [
    "add page numbers to pdf",
    "number pdf pages",
    "pdf page numbering online free",
    "add page numbers pdf online",
    "pdf numbering tool",
    "insert page numbers pdf",
    "free pdf page number adder",
    "pdf footer page numbers",
  ],
  alternates: { canonical: "/tools/add-page-numbers-to-pdf" },
  openGraph: {
    title: "Add Page Numbers to PDF Online Free | ToolMint",
    description:
      "Add page numbers to PDF documents online for free. Choose position, font, and starting number. No signup needed.",
    url: "/tools/add-page-numbers-to-pdf",
    images: [{ url: "/og/add-page-numbers-to-pdf.png" }],
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Reports and handbooks",
    desc: "Number the pages of internal reports, procedure manuals, or employee handbooks so readers can reference specific sections.",
  },
  {
    title: "Academic submissions",
    desc: "Add page numbers to essays, theses, or research papers where style guidelines require them in the header or footer.",
  },
  {
    title: "Print-ready documents",
    desc: "Number a presentation or brochure before sending it to a print shop so physical copies stay in order.",
  },
];

const steps = [
  { title: "Upload a PDF", desc: "Drag and drop or select the PDF you want to number." },
  { title: "Configure numbering", desc: "Set position (header/footer), alignment, font size, starting number, and page range." },
  { title: "Preview", desc: "See exactly how the page numbers will appear before committing." },
  { title: "Download", desc: "Save the numbered PDF to your device instantly." },
];

const faqs = [
  {
    q: "Can I start page numbers from a specific page?",
    a: "Yes. Use the page range option to start numbering from any page you choose. This is useful when the first few pages are a cover or table of contents that should not be numbered.",
  },
  {
    q: "Can I add Roman numerals as page numbers?",
    a: "The tool currently supports Arabic numerals. For Roman numeral numbering (common in front matter), you would need a desktop PDF editor like Adobe Acrobat or LibreOffice.",
  },
  {
    q: "Will adding page numbers change the file size significantly?",
    a: "No. Page numbers are lightweight vector text elements. Adding them to a PDF increases file size by only a few kilobytes regardless of how many pages the document has.",
  },
  {
    q: "How do I add page numbers to a PDF without Acrobat?",
    a: "Upload your PDF here, configure the numbering settings, and download the result. No Adobe Acrobat or any other installed software is needed â€” the tool runs entirely in your browser.",
  },
  {
    q: "Can I choose the font and size of page numbers?",
    a: "Yes. You can set the font size and adjust the margin offset to control how far the numbers appear from the edge of the page.",
  },
];

export default function AddPageNumbersToPdfPage() {
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
      <WebAppSchema slug="add-page-numbers-to-pdf" />
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
            { name: "Add Page Numbers to PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Add Page Numbers to PDF Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Number the pages of any PDF document with ToolMint. Customize the position (header
          or footer), alignment, font size, starting number, and the page range to number. A
          live preview shows exactly how the numbers will look before you download.
        </p>

        <div className="mt-8">
          <AddPageNumbersTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Add Page Numbers to a PDF
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
            How to Add Page Numbers to a PDF
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
              Why Add Page Numbers to a PDF?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Page numbers are a practical navigation aid in any multi-page document. Readers can
              quickly jump to a referenced section, facilitators can direct a group to the right
              page during a meeting, and reviewers can leave precise comments tied to a specific
              page number. Many academic and legal submission guidelines mandate page numbers and
              specify where they should appear. Printed documents benefit especially, since digital
              navigation aids like hyperlinks and bookmarks are unavailable on paper. Even a simple
              10-page report is easier to reference and discuss when every page has a number.
              Adding them takes less than a minute with ToolMint.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Best Practices for PDF Page Numbering
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Position matters: footers work well for reports and academic papers because they do
              not compete with content at the top of the page. Headers are common in legal documents
              where the footer may already carry signature lines or confidentiality notices. For
              documents with a cover page that should not be numbered, set the starting page to 2 or
              use the page range to exclude the first page. If you are assembling a larger document
              from sections that will be merged later, decide on a consistent numbering scheme before
              adding numbers so you do not need to renumber after merging. A starting number higher
              than 1 is useful when a document is part of a series or larger binder.
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

        <RelatedTools slug="add-page-numbers-to-pdf" />
      </main>
    </>
  );
}
