import type { Metadata } from "next";
import ExcelToPdfTool from "@/components/excel-to-pdf-tool-loader";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Excel to PDF Converter â€“ Convert XLSX to PDF Free",
  description:
    "Convert Excel spreadsheets to PDF online for free. Upload .xlsx or .xls and get a perfectly formatted PDF. No signup.",
  keywords: [
    "excel to pdf",
    "xlsx to pdf",
    "convert excel to pdf online free",
    "spreadsheet to pdf",
    "xls to pdf",
    "microsoft excel to pdf",
    "free excel to pdf converter",
    "export excel as pdf",
  ],
  alternates: { canonical: "/tools/excel-to-pdf" },
  openGraph: {
    title: "Excel to PDF Converter â€“ Convert XLSX to PDF Free | ToolMint",
    description:
      "Convert Excel spreadsheets to PDF online for free. Upload .xlsx or .xls and get a perfectly formatted PDF. No signup.",
    url: "/tools/excel-to-pdf",
    images: [{ url: "/og/excel-to-pdf.png" }],
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Sharing reports without formulas",
    desc: "Send spreadsheet data as a read-only PDF so recipients see the numbers without being able to modify or copy formulas.",
  },
  {
    title: "Invoice and financial documents",
    desc: "Convert invoice, budget, or financial summary sheets to PDF before emailing to clients or submitting to accounting systems.",
  },
  {
    title: "Print-ready tables",
    desc: "Fix column widths and page breaks before converting to PDF to ensure tables print neatly across pages.",
  },
];

const steps = [
  { title: "Upload your Excel file", desc: "Select a .xlsx or .xls file from your device." },
  { title: "Convert", desc: "ToolMint renders each sheet as a PDF page." },
  { title: "Download", desc: "Save the formatted PDF to your device." },
];

const faqs = [
  {
    q: "Does Excel to PDF preserve formulas?",
    a: "No. The PDF shows the calculated values of formula cells, not the formulas themselves. This is usually the desired behavior when sharing data â€” recipients see the result, not the underlying calculation.",
  },
  {
    q: "How do I convert multiple Excel sheets to PDF?",
    a: "ToolMint converts the active or visible sheets in the uploaded file. If you need all sheets in one PDF, make sure they are set to print in the workbook before uploading.",
  },
  {
    q: "Why does my Excel PDF cut off columns?",
    a: "This happens when the spreadsheet is wider than the page size selected for the PDF. Adjust column widths, reduce font size, or set the sheet to 'Fit to page' in Excel's Page Layout settings before converting.",
  },
  {
    q: "Can I convert a password-protected Excel file to PDF?",
    a: "No. Password-protected Excel files must be unlocked in Excel first before they can be converted to PDF.",
  },
  {
    q: "How do I convert Excel to PDF on mobile?",
    a: "Open ToolMint in your mobile browser, upload the .xlsx file from your phone's storage, and tap Convert. The PDF downloads directly without needing any app.",
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
      <WebAppSchema slug="excel-to-pdf" />
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
          Turn .xlsx and .xls spreadsheets into PDF documents with ToolMint. Upload your Excel file
          and download a clean, print-ready PDF â€” no account, no software required.
        </p>

        <div className="mt-8">
          <ExcelToPdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Convert Excel to PDF
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
            How to Convert Excel to PDF Online
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
              Why Convert Excel to PDF?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Excel files look different depending on the software version and screen size used to
              open them. Columns shift, formulas display instead of values, and charts render
              differently across versions. PDF locks the visual layout so every recipient sees the
              same thing. This matters for invoices, financial reports, and any data that will be
              signed, printed, or filed. PDFs are also smaller and harder to accidentally modify,
              which makes them better for distribution. For compliance and record-keeping, a PDF
              snapshot of a spreadsheet provides a stable reference that will not change even if
              the original Excel data is later edited.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How to Fit an Excel Sheet on One PDF Page
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Before converting, open the Excel file and go to Page Layout â†’ Scale to Fit. Set
              Width to 1 page and Height to 1 page (or adjust only width for tall datasets). This
              tells Excel to shrink the content to fit within a single page when it renders the
              sheet. Alternatively, reduce the font size and narrow column widths to bring the data
              within the printable area. You can also set the orientation to Landscape for wide
              tables. Making these adjustments in Excel before uploading the file to ToolMint
              ensures the PDF output matches what you expect rather than requiring post-conversion
              editing.
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

        <RelatedTools slug="excel-to-pdf" />
      </main>
    </>
  );
}
