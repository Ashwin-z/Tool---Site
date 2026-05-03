import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import PdfToExcelTool from "@/components/pdf-to-excel-tool";

export const metadata: Metadata = {
  title: "PDF to Excel Converter Online - Extract PDF Tables",
  description:
    "Convert PDF tables to Excel with ToolMint. Pull rows and columns into editable XLSX files so you can reuse invoice data, reports, and spreadsheet-ready tables faster.",
  keywords: [
    "pdf to excel converter",
    "extract tables from pdf",
    "pdf table to xlsx",
    "convert pdf report to excel",
    "invoice pdf to excel",
    "pdf spreadsheet extraction",
    "pdf to xlsx online",
    "editable excel from pdf",
  ],
  alternates: { canonical: "/tools/pdf-to-excel" },
  openGraph: {
    title: "PDF to Excel Converter Online - Extract PDF Tables | ToolMint",
    description:
      "Turn PDF tables into editable Excel files for reports, invoices, and spreadsheet workflows.",
    url: "/tools/pdf-to-excel",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Select the PDF that contains the tables you want to reuse." },
  { title: "Detect tables", desc: "ToolMint identifies table structures and maps rows, columns, and merged cells." },
  { title: "Convert", desc: "The table data is rebuilt into an editable XLSX workbook." },
  { title: "Download XLSX", desc: "Open the spreadsheet in Excel, Google Sheets, or LibreOffice Calc." },
];

const faqs = [
  {
    q: "How accurate is the PDF to Excel table extraction?",
    a: "ToolMint is designed to preserve rows, columns, merged cells, borders, and visible structure for standard table-based PDFs.",
  },
  {
    q: "Does ToolMint preserve cell colors and borders?",
    a: "Yes. Colors, borders, merged cells, and many layout details are kept in the XLSX output where possible.",
  },
  {
    q: "Can I convert scanned PDFs to Excel?",
    a: "Scanned PDFs usually need OCR before reliable table extraction is possible, so digital PDFs with selectable text work best.",
  },
  {
    q: "What Excel format does ToolMint output?",
    a: "The output is an XLSX file that works with Microsoft Excel, Google Sheets, and LibreOffice Calc.",
  },
  {
    q: "Is my PDF secure during conversion?",
    a: "Files are processed for conversion and removed afterward. They are not kept for storage or sharing.",
  },
];

const useCases = [
  {
    title: "Invoices and statements",
    desc: "Move line items, dates, and totals from PDF invoices or financial statements into an editable spreadsheet faster.",
  },
  {
    title: "Reports and exported tables",
    desc: "Reuse tables from business reports, dashboards, or vendor PDFs without rebuilding them manually in Excel.",
  },
  {
    title: "Operations and recordkeeping",
    desc: "Extract tabular data from forms or archived PDFs when you need to sort, filter, or analyze it later.",
  },
];

export default function PdfToExcelPage() {
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
            { name: "PDF to Excel" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert PDF Tables to Excel
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Extract tables from a PDF into an editable Excel workbook with ToolMint. This page is
          built for people who need to reuse invoice lines, report tables, or spreadsheet-style
          data without copying everything by hand.
        </p>

        <div className="mt-8">
          <PdfToExcelTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Good Fits for PDF to Excel Conversion
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
            How to Convert PDF to Excel
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

        <RelatedTools slug="pdf-to-excel" />
      </main>
    </>
  );
}
