import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import PdfSecurityTool from "@/components/pdf-security-tool";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolStatusNotice from "@/components/tool-status-notice";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Unlock PDF – Remove PDF Password Online Free",
  description:
    "Remove password protection from PDF files online for free. Unlock encrypted PDFs instantly. No signup required.",
  keywords: [
    "unlock pdf",
    "remove pdf password online",
    "decrypt pdf online free",
    "pdf password remover",
    "unlock encrypted pdf",
    "remove pdf protection",
    "pdf unlocker online",
    "free pdf password removal",
  ],
  alternates: { canonical: "/tools/unlock-pdf" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Unlock PDF – Remove PDF Password Online Free | ToolMint",
    description:
      "Remove password protection from PDF files online for free. Unlock encrypted PDFs instantly. No signup required.",
    url: "/tools/unlock-pdf",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Your own locked document",
    desc: "Unlock a PDF you protected yourself so you can edit, merge, or share it freely without re-entering the password each time.",
  },
  {
    title: "Remove print restrictions",
    desc: "Unlock PDFs that have permission restrictions preventing printing or copying, when you are authorized to do so.",
  },
  {
    title: "Workflow integration",
    desc: "Unlock secured PDFs before passing them to other tools like compressors, mergers, or text extractors.",
  },
];

const steps = [
  { title: "Upload the locked PDF", desc: "Select the password-protected or restricted PDF you need to work with." },
  { title: "Enter the password", desc: "Provide the correct open password to authorize decryption." },
  { title: "Unlock", desc: "ToolMint removes the password protection from the file." },
  { title: "Download", desc: "Save the unlocked copy to your device and continue your workflow." },
];

const faqs = [
  {
    q: "Can I unlock a PDF I forgot the password to?",
    a: "No. This tool removes protection only when you provide the correct password. PDF encryption is designed to be unbreakable without the password — there is no legitimate online recovery for truly forgotten passwords.",
  },
  {
    q: "Is it legal to remove a PDF password?",
    a: "It is legal to unlock a PDF you own or have explicit authorization to modify. Removing protection from someone else's document without permission may violate copyright, contract terms, or applicable law.",
  },
  {
    q: "What is the difference between owner and user password?",
    a: "A user password must be entered to open the file. An owner password controls permissions like printing and editing, but some tools can remove it without knowing the password because it only restricts actions, not access.",
  },
  {
    q: "Will unlocking a PDF change its content?",
    a: "No. Unlocking removes the encryption wrapper while leaving the text, images, and layout completely intact.",
  },
  {
    q: "Can I unlock a PDF that only has printing restrictions?",
    a: "Yes. PDFs with only permissions restrictions (no open password) can often be unlocked without a password, since the restrictions are advisory rather than cryptographic access controls.",
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
      <WebAppSchema slug="unlock-pdf" />
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
          Unlock PDF Online for Free
        </h1>

        <ToolStatusNotice slug="unlock-pdf" />
        <ProcessingBadge slug="unlock-pdf" />
        <ToolAnalytics slug="unlock-pdf" category="pdf" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Remove password protection from a PDF with ToolMint. Enter the password to authorize
          decryption and download an unlocked copy — no account, no software required.
        </p>

        <div className="mt-8">
          <PdfSecurityTool mode="unlock" />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Unlock a PDF
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
            How to Unlock a PDF Online
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
              When Is It Legal to Remove a PDF Password?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              It is legal to remove a password from a PDF you own, created, or have been
              explicitly authorized to modify. Common examples include unlocking a document you
              protected yourself, removing restrictions from a company-owned file with
              authorization, or processing a file as part of a legitimate business workflow where
              you have permission to do so. What is not permitted is bypassing protection to access
              content you do not have the right to see or modify, circumventing copy protection on
              commercially published materials, or extracting information in violation of a
              non-disclosure agreement. When in doubt, consult the source of the document before
              removing its protection.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Types of PDF Restrictions You Can Remove
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              PDF files can have two types of restrictions. An open password requires a password
              to open the file — ToolMint removes this when you supply the correct password.
              Permission restrictions limit actions like printing, copying, and editing but do not
              prevent the file from being opened. Some permission-restricted PDFs can be unlocked
              without a password because the restrictions rely on application compliance rather
              than strong encryption. After unlocking, all permissions are restored to default
              open access. You can re-apply more granular restrictions using the Protect PDF tool
              if needed.
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

        <RelatedTools slug="unlock-pdf" />
      </main>
    </>
  );
}
