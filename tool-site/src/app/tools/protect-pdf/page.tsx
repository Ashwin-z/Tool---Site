import type { Metadata } from "next";
import Link from "next/link";
import PdfSecurityTool from "@/components/pdf-security-tool";

export const metadata: Metadata = {
  title: "Protect PDF Online Free — Password Encrypt PDF with AES-256",
  description:
    "Protect PDF online for free with ToolMint. Add AES-256 password encryption, set an open password, and control viewer permissions. Browser-based, no server upload.",
  keywords: [
    "protect pdf online",
    "password protect pdf",
    "encrypt pdf online free",
    "lock pdf with password",
    "pdf password protection",
    "secure pdf online",
    "pdf encryption tool",
    "aes 256 pdf encryption",
  ],
  alternates: { canonical: "/tools/protect-pdf" },
  openGraph: {
    title: "Protect PDF Online Free | ToolMint",
    description:
      "Add AES-256 password encryption to any PDF online. Set an open password and control viewer permissions — all in your browser.",
    url: "/tools/protect-pdf",
  },
};

const steps = [
  { title: "Upload a PDF", desc: "Select the PDF you want to password-protect." },
  { title: "Set a password", desc: "Enter the open password required to view the protected file." },
  { title: "Choose permissions", desc: "Optionally restrict printing, copying, or editing by setting permission flags." },
  { title: "Download", desc: "Download the AES-256 encrypted PDF ready to share securely." },
];

const faqs = [
  {
    q: "What encryption standard is used?",
    a: "ToolMint applies AES-256 bit encryption, which is the industry standard for securing PDF documents.",
  },
  {
    q: "Can I restrict printing or copying as well?",
    a: "Yes. The permissions panel lets you individually restrict printing, copying text, and modifying the document.",
  },
  {
    q: "What happens if I forget the password?",
    a: "There is no way to recover a forgotten password — keep it somewhere safe. If you lose it, the file cannot be decrypted.",
  },
  {
    q: "Can I protect a PDF that is already encrypted?",
    a: "You need to unlock the existing encryption first using the Unlock PDF tool, then re-protect with a new password.",
  },
  {
    q: "Is my PDF sent to a server?",
    a: "No. Encryption is performed entirely in your browser using WebAssembly. Your file never leaves your device.",
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
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Protect PDF Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Lock any PDF with a password using strong AES-256 encryption on ToolMint. Set the
          open password viewers will need to access the file, and optionally restrict
          permissions such as printing and copying — all without uploading to any server.
        </p>

        <div className="mt-8">
          <PdfSecurityTool mode="protect" />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Password-Protect a PDF
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
