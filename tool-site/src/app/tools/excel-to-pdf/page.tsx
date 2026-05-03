import type { Metadata } from "next";
import ExcelToPdfTool from "@/components/excel-to-pdf-tool-loader";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";

export const metadata: Metadata = {
  title: "Excel to PDF Online Free - Convert XLSX and CSV to PDF",
  description:
    "Convert Excel to PDF online for free with ToolMint. Upload XLSX, XLS, or CSV spreadsheets and download polished PDF documents. No signup, no watermark.",
  keywords: [
    "excel to pdf",
    "xlsx to pdf",
    "convert excel to pdf",
    "spreadsheet to pdf",
    "csv to pdf",
    "excel to pdf converter online free",
    "xls to pdf",
    "free excel to pdf",
  ],
  alternates: { canonical: "/tools/excel-to-pdf" },
  openGraph: {
    title: "Excel to PDF Online Free - Convert XLSX and CSV to PDF | ToolMint",
    description:
      "Convert Excel to PDF online for free. Upload XLSX, XLS, or CSV and download polished PDFs.",
    url: "/tools/excel-to-pdf",
  },
};

const steps = [
  { title: "Upload spreadsheets", desc: "Drag and drop or select up to 25 Excel or CSV files from your device." },
  { title: "Preview", desc: "Review the uploaded files before conversion." },
  { title: "Convert", desc: "Click Convert and each spreadsheet is rendered into a formatted PDF." },
  { title: "Download", desc: "Save individual PDFs or grab all files as a ZIP archive." },
];

const faqs = [
  {
    q: "What spreadsheet formats can I convert to PDF?",
    a: "ToolMint supports XLSX, XLS, and CSV file formats.",
  },
  {
    q: "Does the table formatting stay the same?",
    a: "Yes. Cell borders, colors, fonts, and layout are preserved in the PDF output.",
  },
  {
    q: "Can I convert multiple spreadsheets at once?",
    a: "Yes. Upload up to 25 files and convert all of them in a single batch.",
  },
  {
    q: "Are formulas visible in the converted PDF?",
    a: "The PDF shows calculated values rather than the formulas themselves, which matches what you see in the sheet view.",
  },
  {
    q: "Is my data secure during conversion?",
    a: "Yes. Your files are processed for conversion and removed after the job completes.",
  },
];

export default function ExcelToPdfPage() {
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
            { name: "Excel to PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert Excel to PDF Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Transform your spreadsheets into shareable PDF documents with ToolMint. Upload up to
          25 XLSX, XLS, or CSV files and download clean, formatted PDFs ready for printing
          or sharing.
        </p>

        <div className="mt-8">
          <ExcelToPdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Convert Excel to PDF
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

        <RelatedTools slug="excel-to-pdf" />
      </main>
    </>
  );
}
