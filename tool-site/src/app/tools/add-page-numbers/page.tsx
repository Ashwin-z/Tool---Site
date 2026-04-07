import type { Metadata } from "next";
import Link from "next/link";
import AddPageNumbersTool from "@/components/add-page-numbers-tool";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF Online Free — Number PDF Pages",
  description:
    "Add page numbers to PDF online for free with ToolMint. Choose position, font, margin, start number, and page range. Live preview included. No signup, no watermark.",
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
  alternates: { canonical: "/tools/add-page-numbers" },
  openGraph: {
    title: "Add Page Numbers to PDF Online Free | ToolMint",
    description:
      "Add page numbers to PDF online for free. Choose position, font, margin, start number, and page range with live preview.",
    url: "/tools/add-page-numbers",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Drag & drop or select the PDF you want to number." },
  { title: "Configure", desc: "Set position (header/footer), alignment, font size, starting number, and page range." },
  { title: "Preview", desc: "See exactly how the page numbers will appear before committing." },
  { title: "Download", desc: "Save the numbered PDF to your device instantly." },
];

const faqs = [
  {
    q: "Can I choose where the page numbers appear?",
    a: "Yes. ToolMint supports header and footer placement with left, center, or right alignment, and a custom margin setting.",
  },
  {
    q: "Can I start numbering from a number other than 1?",
    a: "Yes. You can set any starting number, which is useful when numbering chapters or sections of a larger document.",
  },
  {
    q: "Can I skip the first page (cover page)?",
    a: "Yes. Use the page range option to start numbering from page 2 or any other page, leaving the cover unnumbered.",
  },
  {
    q: "Does adding page numbers affect the PDF quality?",
    a: "No. Numbers are drawn as clean vector text on the PDF canvas — no re-compression or quality loss.",
  },
  {
    q: "Is my PDF secure?",
    a: "Yes. All processing happens in your browser. Your PDF is never uploaded to any server.",
  },
];

export default function AddPageNumbersPage() {
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
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

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