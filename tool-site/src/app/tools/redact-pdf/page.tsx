import type { Metadata } from "next";
import RedactPdfTool from "@/components/redact-pdf-tool-loader";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Redact PDF Online Free â€“ Hide Sensitive Text",
  description:
    "Permanently redact sensitive text and images from PDFs online for free. GDPR and compliance-ready. No signup.",
  keywords: [
    "redact pdf online free",
    "pdf redaction tool",
    "black out text in pdf",
    "remove sensitive information pdf",
    "censor pdf online",
    "pdf text removal",
    "gdpr pdf redaction",
    "free pdf redactor",
  ],
  alternates: { canonical: "/tools/redact-pdf" },
  openGraph: {
    title: "Redact PDF Online Free â€“ Hide Sensitive Text | ToolMint",
    description:
      "Permanently redact sensitive text and images from PDFs online for free. GDPR and compliance-ready. No signup.",
    url: "/tools/redact-pdf",
    images: [{ url: "/og/redact-pdf.png" }],
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Legal document redaction",
    desc: "Remove names, addresses, account numbers, and other personally identifiable information from court filings or legal exhibits before public disclosure.",
  },
  {
    title: "GDPR and data privacy",
    desc: "Redact personal data from documents before sharing them externally to comply with GDPR, HIPAA, or other data protection requirements.",
  },
  {
    title: "Confidential business information",
    desc: "Black out pricing, trade secrets, or internal references before sharing contract drafts or reports with external parties.",
  },
];

const steps = [
  { title: "Upload a PDF", desc: "Select the PDF containing sensitive content to redact." },
  { title: "Select areas to redact", desc: "Draw black boxes over the text or regions you want to permanently hide." },
  { title: "Apply redaction", desc: "Confirm the redaction to permanently remove the content." },
  { title: "Download", desc: "Save the redacted PDF â€” the hidden content cannot be recovered." },
];

const faqs = [
  {
    q: "Is redacting a PDF permanent?",
    a: "Yes. When properly applied, redaction permanently removes the content from the PDF file. ToolMint replaces the redacted areas with opaque black rectangles and removes the underlying text data from the file structure.",
  },
  {
    q: "Can redacted text be recovered?",
    a: "Properly redacted text cannot be recovered. However, PDFs where content is only covered by a black shape (without removing the underlying text layer) can have their content recovered by removing the shape. ToolMint applies true redaction that removes the source text.",
  },
  {
    q: "What information should be redacted in legal documents?",
    a: "Common redaction targets include Social Security numbers, financial account numbers, home addresses, dates of birth, medical information, minor children's names, and confidential settlement terms. Requirements vary by court and jurisdiction.",
  },
  {
    q: "Does redaction reduce PDF file size?",
    a: "Removing text content slightly reduces file size, but the difference is small for most documents. The primary purpose of redaction is privacy protection, not file size reduction.",
  },
  {
    q: "Is online PDF redaction GDPR compliant?",
    a: "The redaction output meets GDPR requirements for removing personal data if properly applied to all instances of the data. The processing of the file should comply with your organization's data handling policies â€” if the document is highly sensitive, review whether browser-based processing meets your compliance standards.",
  },
];

export default function RedactPdfPage() {
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
      <WebAppSchema slug="redact-pdf" />
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
            { name: "Redact PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Redact PDF Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Permanently hide sensitive text and content from PDF documents with ToolMint. Draw
          redaction boxes over areas to remove, apply the redaction, and download a secure PDF
          where the hidden content cannot be recovered. No account required.
        </p>

        <div className="mt-8">
          <RedactPdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Redact a PDF
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
            How to Redact a PDF Online
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
              What Is PDF Redaction and Why It Matters?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Redaction is the process of permanently removing sensitive information from a
              document before sharing it. In a PDF, this means not just covering text with a
              black rectangle visually, but also removing the underlying text data so it cannot
              be extracted by copying, searching, or inspecting the file structure. True redaction
              matters because documents shared with only visual black boxes can have their hidden
              content recovered by removing the overlaid shape. Proper redaction has legal and
              compliance significance â€” courts, government agencies, and regulated industries
              require redacted documents to meet standards that ensure the information is
              genuinely irrecoverable.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Redaction vs. Deleting Text: What's the Difference?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Deleting text in a PDF editor removes the visible text object from the page, but
              the underlying content stream may still contain recoverable data in some PDF
              formats. Redaction is a more thorough process: it marks the area for removal,
              flattens the content, replaces the marked region with an opaque fill, and scrubs
              the underlying text data from the file. The key difference is that redaction is
              designed to be forensically sound â€” it is used in contexts where you must be
              able to certify that the removed information cannot be reconstructed. Simple text
              deletion in an editor does not provide the same guarantee.
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

        <RelatedTools slug="redact-pdf" />
      </main>
    </>
  );
}
