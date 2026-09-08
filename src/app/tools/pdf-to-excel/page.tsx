import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import PdfToExcelTool from "@/components/pdf-to-excel-tool";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "PDF to Excel Converter – Extract PDF Tables Free",
  description:
    "Convert PDF to Excel spreadsheet online for free. Extract tables and data into editable XLSX format instantly. No signup.",
  keywords: [
    "pdf to excel",
    "pdf to xlsx",
    "convert pdf to excel online free",
    "extract table from pdf",
    "pdf table extractor",
    "pdf data to spreadsheet",
    "free pdf to excel converter",
    "pdf to csv",
  ],
  alternates: { canonical: "/tools/pdf-to-excel" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "PDF to Excel Converter – Extract PDF Tables Free | ToolMint",
    description:
      "Convert PDF to Excel spreadsheet online for free. Extract tables and data into editable XLSX format instantly. No signup.",
    url: "/tools/pdf-to-excel",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Extract financial data",
    desc: "Pull financial statements, budget tables, or cost breakdowns from PDF reports into Excel for analysis, charting, or further calculation.",
  },
  {
    title: "Reuse survey or inventory data",
    desc: "Convert PDF survey results, inventory lists, or data exports into spreadsheet format so you can sort, filter, and work with the numbers.",
  },
  {
    title: "Recover data from legacy PDFs",
    desc: "When the original spreadsheet is lost but a PDF version survives, extract the table data to rebuild a working Excel file.",
  },
];

const steps = [
  { title: "Upload a PDF", desc: "Select the PDF containing the tables you want to extract." },
  { title: "Convert", desc: "ToolMint detects and extracts table structures from the PDF." },
  { title: "Download", desc: "Save the .xlsx file and open it in Excel or Google Sheets." },
];

const faqs = [
  {
    q: "Can PDF to Excel extract tables accurately?",
    a: "Well-defined tables with clear borders and consistent column alignment extract accurately. Tables in scanned PDFs or tables without visible grid lines may require manual cleanup after extraction.",
  },
  {
    q: "What happens to non-table content in PDF to Excel?",
    a: "Non-table content like paragraphs, headers, and images is generally not included in the Excel output. The converter focuses on extracting structured tabular data from the PDF.",
  },
  {
    q: "Does it work on scanned PDF tables?",
    a: "Scanned PDFs require OCR to read the text before table extraction can occur. ToolMint applies OCR to scanned pages, though accuracy depends on scan quality and the complexity of the table layout.",
  },
  {
    q: "Why are my numbers showing as text after PDF to Excel?",
    a: "This happens when the extracted data contains formatting characters like currency symbols, thousands separators, or extra spaces that prevent Excel from recognizing the values as numbers. Use Excel's Text to Columns or Find & Replace to clean the data after conversion.",
  },
  {
    q: "Can I convert multi-page PDFs with tables to Excel?",
    a: "Yes. ToolMint processes all pages and places each table it detects into the spreadsheet. Tables from different pages are placed in separate sections or sheets in the Excel output.",
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
      <WebAppSchema slug="pdf-to-excel" />
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
          Convert PDF to Excel Online for Free
        </h1>

        <ProcessingBadge slug="pdf-to-excel" />
        <ToolAnalytics slug="pdf-to-excel" category="pdf" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Extract tables and data from PDF documents into editable Excel spreadsheets with ToolMint.
          Upload a PDF and get an .xlsx file with the table data ready to work with in Excel or
          Google Sheets. No account required.
        </p>

        <div className="mt-8">
          <PdfToExcelTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Convert PDF to Excel
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
            How to Convert PDF to Excel Online
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
              How Does PDF to Excel Table Extraction Work?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              PDF table extraction works by analyzing the spatial coordinates of text elements on
              each page. When rows and columns of text align consistently, the converter recognizes
              those patterns as a table structure and maps them into spreadsheet rows and columns.
              PDFs that were created from Excel or Word (rather than scanned) have clean text
              positioning that makes extraction straightforward. Scanned PDFs require OCR first,
              which introduces more variability. Tables with thin or invisible borders are detected
              using alignment patterns rather than explicit grid lines, which works well for simple
              tables but can miss columns in complex layouts.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              When to Use PDF to Excel Conversion
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The clearest use case is when you need to calculate, sort, or filter data that is
              locked inside a PDF. Financial statements from banks, vendor invoices, government
              data exports, and regulatory filings frequently arrive as PDFs but contain data
              that needs to be analyzed in a spreadsheet. Rather than typing the data manually,
              conversion extracts it in seconds. It is also useful for migrating historical data
              from legacy PDF reports into a database or analytics tool. For quick one-off data
              lookups, reading the PDF directly is faster — conversion pays off when you need to
              do more than just read the numbers.
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

        <RelatedTools slug="pdf-to-excel" />
      </main>
    </>
  );
}
