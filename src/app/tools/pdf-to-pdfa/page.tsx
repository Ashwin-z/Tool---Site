import type { Metadata } from "next";
import PdfToPdfaTool from "@/components/pdf-to-pdfa-tool";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolStatusNotice from "@/components/tool-status-notice";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "PDF to PDF/A Converter – Archivable PDF Free",
  description:
    "Convert PDF to PDF/A format online for free. Create long-term archivable PDFs that meet ISO standards. No signup.",
  keywords: [
    "pdf to pdfa",
    "convert pdf to pdfa online free",
    "pdf archiving format",
    "pdfa converter",
    "iso compliant pdf",
    "long term archiving pdf",
    "pdf a1b converter",
    "archivable pdf online",
  ],
  alternates: { canonical: "/tools/pdf-to-pdfa" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "PDF to PDF/A Converter – Archivable PDF Free | ToolMint",
    description:
      "Convert PDF to PDF/A format online for free. Create long-term archivable PDFs that meet ISO standards. No signup.",
    url: "/tools/pdf-to-pdfa",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Legal and regulatory archives",
    desc: "Court filings, contracts, and compliance records often require PDF/A format to ensure documents remain readable decades later.",
  },
  {
    title: "Government submissions",
    desc: "Many government agencies and public institutions specify PDF/A for official digital document submissions and records.",
  },
  {
    title: "Long-term institutional storage",
    desc: "Universities, libraries, and enterprises use PDF/A to ensure digitized records remain accessible without software dependency.",
  },
];

const steps = [
  { title: "Upload a PDF", desc: "Select the PDF you want to convert to PDF/A format." },
  { title: "Convert", desc: "ToolMint embeds fonts, removes external dependencies, and converts to PDF/A." },
  { title: "Download", desc: "Save the compliant PDF/A file to your device." },
];

const faqs = [
  {
    q: "What is the difference between PDF and PDF/A?",
    a: "PDF/A is a subset of PDF designed specifically for long-term archiving. It prohibits features that could prevent reliable rendering in the future, such as encryption, external content links, embedded executables, and fonts that are not fully embedded within the file.",
  },
  {
    q: "Who requires PDF/A format?",
    a: "Government agencies, courts, regulated industries like healthcare and finance, and archiving institutions frequently require PDF/A. ISO 19005 is the standard that defines the format, and many compliance frameworks reference it.",
  },
  {
    q: "Is PDF/A the same as a searchable PDF?",
    a: "Not exactly. A searchable PDF contains text that can be selected and searched. PDF/A can be searchable if the source PDF contains real text, but PDF/A compliance is about archival reliability, not about text searchability specifically.",
  },
  {
    q: "Can I convert any PDF to PDF/A?",
    a: "Most PDFs can be converted, but those with encryption, external content, or unsupported features may need those elements removed first. Some highly complex PDFs may require manual review after automated conversion.",
  },
  {
    q: "What file size difference should I expect?",
    a: "PDF/A files are often slightly larger than standard PDFs because fonts must be fully embedded and some optimization techniques are not permitted. The increase is typically 10–30% depending on how many fonts are used.",
  },
];

export default function PdfToPdfaPage() {
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
      <WebAppSchema slug="pdf-to-pdfa" />
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
            { name: "PDF to PDF/A" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Convert PDF to PDF/A Online for Free
        </h1>

        <ToolStatusNotice slug="pdf-to-pdfa" />
        <ProcessingBadge slug="pdf-to-pdfa" />
        <ToolAnalytics slug="pdf-to-pdfa" category="pdf" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Create archival-compliant PDF/A documents with ToolMint. Upload a standard PDF and
          download a PDF/A file that meets ISO long-term archiving standards — no account required.
        </p>

        <div className="mt-8">
          <PdfToPdfaTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Convert PDF to PDF/A
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
            How to Convert PDF to PDF/A Online
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
              What Is PDF/A and Why Does It Matter?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              PDF/A stands for PDF for Archiving. It is an ISO-standardized version of PDF that
              removes features that could make a file unreadable in the future. Standard PDFs can
              reference external fonts, link to remote resources, include JavaScript, and use
              encryption — all of which create external dependencies. If those resources change
              or become unavailable, the PDF may not render correctly. PDF/A prohibits these
              features and requires that everything needed to display the document is embedded
              within the file itself. This makes PDF/A the correct format for any document that
              needs to remain accurate and readable for years or decades.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              PDF/A-1, PDF/A-2, PDF/A-3: What's the Difference?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              PDF/A-1, published in 2005, is the strictest conformance level and based on PDF 1.4.
              It prohibits JPEG 2000 compression and embedded files, which limits its use for
              complex documents. PDF/A-2, published in 2011 and based on PDF 1.7, adds support for
              JPEG 2000, optional content layers, digital signatures, and embedded PDF/A files.
              PDF/A-3, published in 2012, is the same as PDF/A-2 but allows embedding of any file
              format as an attachment, making it suitable for e-invoicing workflows where source
              data files like XML must accompany the visual PDF. For most standard archiving needs,
              PDF/A-1b or PDF/A-2b (the 'b' meaning basic visual conformance) are sufficient.
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

        <RelatedTools slug="pdf-to-pdfa" />
      </main>
    </>
  );
}
