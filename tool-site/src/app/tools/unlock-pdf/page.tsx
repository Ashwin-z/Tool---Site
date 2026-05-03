import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import PdfSecurityTool from "@/components/pdf-security-tool";

export const metadata: Metadata = {
  title: "Unlock PDF Online If You Know the Password | ToolMint",
  description:
    "Unlock a PDF with ToolMint when you know the correct password or have permission to remove restrictions. Remove encryption before editing, compressing, or re-saving the file.",
  keywords: [
    "unlock pdf online",
    "remove pdf password",
    "unlock pdf if password is known",
    "remove pdf restrictions",
    "decrypt pdf online",
    "unlock pdf for editing",
    "permission restricted pdf",
    "pdf password remover",
  ],
  alternates: { canonical: "/tools/unlock-pdf" },
  openGraph: {
    title: "Unlock PDF Online If You Know the Password | ToolMint",
    description:
      "Remove a PDF password or permission restrictions from files you own or are authorized to edit.",
    url: "/tools/unlock-pdf",
  },
};

const steps = [
  { title: "Upload the locked PDF", desc: "Select the password-protected or restricted PDF you need to work with." },
  { title: "Enter the password", desc: "Type the correct password when the file requires it for access." },
  { title: "Unlock", desc: "ToolMint removes the encryption or restrictions so you can use the file more freely." },
  { title: "Download", desc: "Save the unlocked copy to your device and continue your workflow." },
];

const faqs = [
  {
    q: "Do I need to know the password to unlock the PDF?",
    a: "Yes. This tool removes protection only when you provide the correct password or when the file has permission restrictions without an open password.",
  },
  {
    q: "Can this tool crack or guess an unknown password?",
    a: "No. ToolMint does not bypass unknown passwords or perform password cracking.",
  },
  {
    q: "Will unlocking change the content of my PDF?",
    a: "No. Unlocking removes the protection layer while keeping the text, images, and layout intact.",
  },
  {
    q: "Can I unlock a PDF with only permission restrictions?",
    a: "Yes. If a file opens normally but restricts printing, copying, or editing, those permission flags can be removed.",
  },
  {
    q: "Is my PDF sent to a server?",
    a: "No. The unlock process runs locally in your browser for this tool, so your file and password stay on your device.",
  },
];

const useCases = [
  {
    title: "Edit or annotate your own file",
    desc: "Unlock a PDF before adding notes, watermarks, page numbers, or other changes to a file you own.",
  },
  {
    title: "Prepare a restricted file for upload",
    desc: "Remove restrictions first if you need to compress, merge, or convert a PDF that otherwise blocks those workflows.",
  },
  {
    title: "Reuse authorized content",
    desc: "Unlock a report or form you are allowed to work with before converting it to Word, Excel, or text.",
  },
];

export default function UnlockPdfPage() {
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
            { name: "Unlock PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Unlock a PDF Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Remove the password or usage restrictions from a PDF with ToolMint when you know the
          correct password or are authorized to edit the document. This is useful when you need to
          annotate, compress, merge, or convert a protected file as part of a larger workflow.
        </p>

        <div className="mt-8">
          <PdfSecurityTool mode="unlock" />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When This PDF Unlock Tool Helps
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
            How to Unlock a Password-Protected PDF
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

        <RelatedTools slug="unlock-pdf" />
      </main>
    </>
  );
}
