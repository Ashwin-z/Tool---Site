import type { Metadata } from "next";
import SignPdfTool from "@/components/sign-pdf-tool-loader";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Sign PDF Online Free – Add Digital Signature",
  description:
    "Sign PDF documents online for free. Draw, type, or upload your signature and add it anywhere. No signup required.",
  keywords: [
    "sign pdf online free",
    "add signature to pdf",
    "electronic signature pdf",
    "digital signature pdf online",
    "esign pdf",
    "pdf signer online",
    "draw signature on pdf",
    "free pdf signature tool",
  ],
  alternates: { canonical: "/tools/sign-pdf" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Sign PDF Online Free – Add Digital Signature | ToolMint",
    description:
      "Sign PDF documents online for free. Draw, type, or upload your signature and add it anywhere. No signup required.",
    url: "/tools/sign-pdf",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Contracts and agreements",
    desc: "Sign contracts, NDAs, rental agreements, and service agreements electronically without printing, signing, and rescanning.",
  },
  {
    title: "Approval workflows",
    desc: "Add your signature or initials to approval documents, purchase orders, and authorization forms before returning them.",
  },
  {
    title: "Forms and applications",
    desc: "Complete application forms, consent documents, and authorization releases that require a handwritten signature.",
  },
];

const steps = [
  { title: "Upload a PDF", desc: "Select the document you need to sign." },
  { title: "Create your signature", desc: "Draw, type, or upload an image of your signature." },
  { title: "Place it", desc: "Click on the PDF to position your signature at the right location." },
  { title: "Download", desc: "Save the signed PDF to your device." },
];

const faqs = [
  {
    q: "Is an online PDF signature legally valid?",
    a: "Electronic signatures are legally valid in most countries under laws like the eSign Act (US), eIDAS (EU), and equivalent regulations in many other jurisdictions. The legal weight depends on the type of signature and the context — a simple drawn signature is accepted for most commercial agreements.",
  },
  {
    q: "What is the difference between a digital and electronic signature?",
    a: "An electronic signature is any electronic indicator of intent to sign — a drawn signature, typed name, or uploaded image. A digital signature is a specific cryptographic mechanism that uses certificates to verify the signer's identity and detect tampering. ToolMint provides electronic signatures; certified digital signatures require a certificate authority.",
  },
  {
    q: "Can I sign a PDF on my phone?",
    a: "Yes. Open ToolMint in your phone's browser, upload the PDF, draw your signature on the touchscreen, position it, and download the signed document. No app needed.",
  },
  {
    q: "How do I add my handwritten signature to a PDF?",
    a: "Use the draw option to sign with your mouse or finger on a touchscreen, replicating your handwriting. Alternatively, sign on paper, photograph or scan it, and upload the image as your signature.",
  },
  {
    q: "Can multiple people sign the same PDF?",
    a: "Yes. Each person can upload the same PDF, add their signature, and download their signed version. For coordinated multi-party signing with audit trails, a dedicated e-signature platform like DocuSign or HelloSign provides a more structured workflow.",
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
      <WebAppSchema slug="sign-pdf" />
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
            { name: "Sign PDF" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Add Digital Signature to PDF Online – Free, No Software
        </h1>

        <ProcessingBadge slug="sign-pdf" />
        <ToolAnalytics slug="sign-pdf" category="pdf" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Add your signature to any PDF document with ToolMint. Draw, type, or upload a signature
          image, place it anywhere on the page, and download the signed PDF — no account required.
        </p>

        <div className="mt-8">
          <SignPdfTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Sign a PDF Online
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Is a Digital Signature on a PDF Legally Binding?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Electronic signatures are legally recognized in most countries for most types of
              agreements. In the United States, the ESIGN Act and UETA make electronic signatures
              enforceable for contracts and agreements. The EU's eIDAS regulation similarly
              recognizes electronic signatures. For most business contracts — freelance agreements,
              service contracts, rental agreements, and corporate approvals — an electronic
              signature placed on a PDF is legally sufficient. Exceptions include wills, real
              estate deeds in some jurisdictions, and certain government forms that specifically
              require wet (physical) signatures. When in doubt about legal requirements for a
              specific document type, consult a legal professional.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Types of PDF Signatures Explained
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              There are three main types of PDF signatures. A simple electronic signature is a
              visual representation — a drawn, typed, or uploaded image of your signature —
              placed on the PDF. It carries intent but no cryptographic verification. An advanced
              electronic signature includes identity verification tied to the signer, often via
              email confirmation or SMS. A qualified digital signature (QES) is backed by a
              certificate from a trusted Certificate Authority and provides the highest level of
              legal assurance. ToolMint provides simple electronic signatures, which are accepted
              for the majority of everyday business documents.
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

        <RelatedTools slug="sign-pdf" />
      </main>
    </>
  );
}
