import type { Metadata } from "next";
import Link from "next/link";
import PdfToExcelTool from "@/components/pdf-to-excel-tool";

export const metadata: Metadata = {
  title: "PDF to Excel Online Free — Convert PDF Tables to XLSX",
  description:
    "Convert PDF to Excel online for free with ToolMint. Extract tables from PDFs into editable XLSX spreadsheets — colors, borders, merged cells, and images preserved. No signup.",
  keywords: [
    "pdf to excel",
    "pdf to xlsx",
    "convert pdf to excel online free",
    "pdf table to excel",
    "pdf to spreadsheet",
    "pdf data extraction",
    "free pdf to excel converter",
    "pdf to xls",
  ],
  alternates: { canonical: "/tools/pdf-to-excel" },
  openGraph: {
    title: "PDF to Excel Online Free — Convert PDF Tables to XLSX | ToolMint",
    description:
      "Convert PDF to Excel online for free. Extract tables into editable XLSX with colors, borders, and merged cells preserved. No signup.",
    url: "/tools/pdf-to-excel",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Drag & drop or select the PDF containing tables you need to extract." },
  { title: "Detect tables", desc: "ToolMint automatically identifies and maps all table structures in the PDF." },
  { title: "Convert", desc: "Rows, columns, colors, borders, and merged cells are rebuilt in an XLSX file." },
  { title: "Download XLSX", desc: "Open your spreadsheet in Excel, Google Sheets, or LibreOffice Calc." },
];

const faqs = [
  {
    q: "How accurate is the PDF to Excel table extraction?",
    a: "ToolMint uses industry-grade table detection to extract rows, columns, cell formatting (colors, borders, merged cells), and embedded images with high accuracy.",
  },
  {
    q: "Does ToolMint preserve cell colors and borders?",
    a: "Yes. Colors, borders, merged cells, and images are all preserved in the XLSX output.",
  },
  {
    q: "Can I convert scanned PDFs to Excel?",
    a: "Scanned PDFs require OCR to recognize text before table extraction is possible. For best results, use digital (non-scanned) PDFs.",
  },
  {
    q: "Is the PDF to Excel conversion free?",
    a: "Yes. ToolMint's converter is completely free — no signup, no watermarks, no limits.",
  },
  {
    q: "What Excel format does ToolMint output?",
    a: "The output is an .xlsx file compatible with Microsoft Excel 2007 and later, Google Sheets, and LibreOffice Calc.",
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
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert PDF to Excel Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Extract tables from any PDF into fully editable Excel spreadsheets with ToolMint.
          Rows, columns, cell colors, borders, merged cells, and embedded images are all
          preserved in the XLSX output — ready to open in Microsoft Excel, Google Sheets,
          or LibreOffice Calc.
        </p>

        <div className="mt-8">
          <PdfToExcelTool />
        </div>

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
      </main>
    </>
  );
}
