import type { Metadata } from "next";
import Link from "next/link";
import PdfSecurityTool from "@/components/pdf-security-tool";

export const metadata: Metadata = {
  title: "Unlock PDF Online Free — Remove PDF Password Instantly",
  description:
    "Unlock PDF online for free with ToolMint. Remove password protection from any PDF when you know the correct password. No server upload, instant browser-based processing.",
  keywords: [
    "unlock pdf online",
    "remove pdf password",
    "pdf password remover",
    "unlock pdf free",
    "decrypt pdf online",
    "remove pdf encryption",
    "pdf unlocker online",
    "password protected pdf unlock",
  ],
  alternates: { canonical: "/tools/unlock-pdf" },
  openGraph: {
    title: "Unlock PDF Online Free | ToolMint",
    description:
      "Remove password protection from a PDF online. Enter the correct password and download an unprotected copy instantly.",
    url: "/tools/unlock-pdf",
  },
};

const steps = [
  { title: "Upload the locked PDF", desc: "Select the password-protected PDF you want to unlock." },
  { title: "Enter the password", desc: "Type in the correct password for the PDF. Without the password, the file cannot be unlocked." },
  { title: "Decrypt", desc: "ToolMint decrypts the PDF in your browser using the provided password." },
  { title: "Download", desc: "Save the unlocked, unencrypted PDF to your device." },
];

const faqs = [
  {
    q: "Do I need to know the password to unlock the PDF?",
    a: "Yes. This tool decrypts PDFs using the correct password you provide. It cannot bypass or crack an unknown password.",
  },
  {
    q: "What type of PDF encryption can this remove?",
    a: "The tool handles standard PDF password encryption including AES-128 and AES-256 protected files, provided you know the open password.",
  },
  {
    q: "Will unlocking change the content of my PDF?",
    a: "No. Only the encryption wrapper is removed. All text, images, and formatting remain exactly as they were.",
  },
  {
    q: "Can I unlock a PDF with permission restrictions but no open password?",
    a: "Yes. PDFs with only permission flags (restrictions on printing or editing) but no open password can be stripped of those restrictions.",
  },
  {
    q: "Is my PDF sent to a server?",
    a: "No. All decryption runs locally in your browser. Your file and password are never transmitted anywhere.",
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
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Unlock PDF Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Remove the password protection from any encrypted PDF with ToolMint. Upload the
          locked file, enter its password, and download a clean, unrestricted copy —
          everything processed locally in your browser.
        </p>

        <div className="mt-8">
          <PdfSecurityTool mode="unlock" />
        </div>

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
      </main>
    </>
  );
}
