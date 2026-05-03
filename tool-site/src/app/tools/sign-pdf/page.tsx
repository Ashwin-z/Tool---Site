import type { Metadata } from "next";
import SignPdfTool from "@/components/sign-pdf-tool-loader";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";

export const metadata: Metadata = {
  title: "Sign PDF Online Free - Add Signature to PDF",
  description:
    "Sign PDF online for free with ToolMint. Add your signature, initials, name, date, or company stamp to any page. Draw, type, or upload your signature.",
  keywords: [
    "sign pdf online free",
    "add signature to pdf",
    "pdf signature online",
    "electronic signature pdf",
    "esign pdf free",
    "draw signature on pdf",
    "pdf signer online",
    "sign pdf without adobe",
  ],
  alternates: { canonical: "/tools/sign-pdf" },
  openGraph: {
    title: "Sign PDF Online Free | ToolMint",
    description:
      "Add your signature to any PDF online. Draw, type, or upload your signature and place it on any page.",
    url: "/tools/sign-pdf",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Open the PDF you need to sign in the browser workspace." },
  { title: "Create your signature", desc: "Draw your signature, type it in a style, or upload an image of your signature." },
  { title: "Place on the page", desc: "Drag and resize the signature, initials, name, date, or stamp fields anywhere on the page." },
  { title: "Download", desc: "Download the signed PDF instantly. No account or email required." },
];

const faqs = [
  {
    q: "How can I create my signature?",
    a: "Draw it freehand with your mouse or touchscreen, type it and choose a handwriting font, or upload an image file of your signature.",
  },
  {
    q: "Can I add a date and initials as well?",
    a: "Yes. Insert name, initials, date, company, and free text fields in addition to your signature, then drag each element into place.",
  },
  {
    q: "Is this a legally binding electronic signature?",
    a: "This tool creates visual signatures on PDF pages. Legal validity depends on your jurisdiction and use case, so use a qualified signature service when a regulated e-signature is required.",
  },
  {
    q: "Can I sign multiple pages?",
    a: "Yes. Use the page panel to switch between pages and add signature elements to each one as needed.",
  },
  {
    q: "Is my PDF uploaded anywhere?",
    a: "No. All signing runs entirely in your browser. Your document never leaves your device.",
  },
];

export default function SignPdfPage() {
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
      <main className="pdf-tool-page mx-auto min-h-screen w-full max-w-[1600px] px-4 py-8 md:px-6 md:py-10">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "PDF Tools", href: "/tools/pdf-tools" },
            { name: "Sign PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Sign PDF Online for Free
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted md:text-base">
          Add your signature to any PDF document with ToolMint. Draw, type, or upload your
          signature, then place it alongside initials, date, name, and company stamp fields
          on any page. Resize and reposition every element before downloading the signed PDF.
        </p>

        <div className="mt-8">
          <SignPdfTool />
        </div>

        <section className="mt-16 max-w-5xl">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Sign a PDF Online
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

        <section className="mt-16 max-w-5xl">
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

        <div className="max-w-5xl">
          <RelatedTools slug="sign-pdf" />
        </div>
      </main>
    </>
  );
}
