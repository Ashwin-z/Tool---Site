import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import PdfSecurityTool from "@/components/pdf-security-tool";

export const metadata: Metadata = {
  title: "Password Protect PDF Online - Encrypt PDF in Browser",
  description:
    "Password protect a PDF with ToolMint. Add AES-256 encryption, set an open password, and choose sharing permissions before sending contracts, reports, or confidential files.",
  keywords: [
    "password protect pdf online",
    "encrypt pdf with password",
    "secure pdf document",
    "protect pdf in browser",
    "lock pdf file",
    "aes 256 pdf encryption",
    "protect client pdf files",
    "confidential pdf password",
  ],
  alternates: { canonical: "/tools/protect-pdf" },
  openGraph: {
    title: "Password Protect PDF Online - Encrypt PDF in Browser | ToolMint",
    description:
      "Add AES-256 password protection to PDFs and control how shared documents can be opened or printed.",
    url: "/tools/protect-pdf",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Select the PDF you want to protect before sharing or storing it." },
  { title: "Set a password", desc: "Create the open password required to access the protected file." },
  { title: "Choose permissions", desc: "Optionally restrict printing, copying, or editing for recipients." },
  { title: "Download", desc: "Save the encrypted PDF and share the password separately." },
];

const faqs = [
  {
    q: "What encryption standard is used?",
    a: "ToolMint applies AES-256 encryption, which is a strong modern standard for protecting PDF documents.",
  },
  {
    q: "Can I restrict printing or copying as well?",
    a: "Yes. You can set permission flags that limit printing, copying text, or modifying the document.",
  },
  {
    q: "What happens if I forget the password?",
    a: "There is no recovery path inside the file itself, so keep the password somewhere safe before distributing the protected PDF.",
  },
  {
    q: "Can I protect a PDF that is already encrypted?",
    a: "If the file already has an open password, unlock it first with the correct password and then re-protect it with the new settings you want.",
  },
  {
    q: "Is my PDF sent to a server?",
    a: "No. Encryption runs in your browser for this tool, so the file stays on your device during processing.",
  },
];

const useCases = [
  {
    title: "Contracts and proposals",
    desc: "Protect documents before emailing them to clients when they include terms, pricing, or personal information.",
  },
  {
    title: "Financial and HR files",
    desc: "Add a password to salary sheets, statements, internal forms, or employee paperwork before sharing them across teams.",
  },
  {
    title: "Confidential drafts",
    desc: "Lock draft agreements, reports, or board materials before wider circulation so only intended recipients can open them.",
  },
];

export default function ProtectPdfPage() {
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
            { name: "Protect PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Password Protect a PDF Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Lock a PDF with a password using ToolMint. Add AES-256 protection, decide whether viewers
          can print or copy the document, and download a safer file for contracts, reports, and
          confidential records.
        </p>

        <div className="mt-8">
          <PdfSecurityTool mode="protect" />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Good Times to Password Protect a PDF
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
            How to Password Protect a PDF
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

        <RelatedTools slug="protect-pdf" />
      </main>
    </>
  );
}
