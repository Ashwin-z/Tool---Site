import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import PdfSecurityTool from "@/components/pdf-security-tool";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolStatusNotice from "@/components/tool-status-notice";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Password Protect a PDF – AES-256, No Upload",
  description:
    "Add AES-256 password protection to a PDF without uploading it. The file and the password never leave your device. Free, no signup.",
  keywords: [
    "protect pdf",
    "password protect pdf online",
    "encrypt pdf online free",
    "pdf password protection",
    "lock pdf with password",
    "secure pdf online",
    "add password to pdf",
    "pdf encryption",
  ],
  alternates: { canonical: "/tools/protect-pdf" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Password Protect a PDF – AES-256, No Upload | ToolMint",
    description:
      "Add AES-256 password protection to a PDF without uploading it. The file and the password never leave your device. Free, no signup.",
    url: "/tools/protect-pdf",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Confidential document sharing",
    desc: "Add a password to sensitive contracts, financial reports, or personnel files before emailing them to ensure only authorized recipients can open them.",
  },
  {
    title: "Client deliverables",
    desc: "Protect proposals, invoices, or creative work files you share with clients so the documents cannot be forwarded or opened by others.",
  },
  {
    title: "Anything you cannot upload",
    desc: "Medical records, HR files, and legal documents you are not permitted to send to a third-party server. Encryption happens on your own device.",
  },
];

const steps = [
  { title: "Choose a PDF", desc: "The file is read by this page. It is not uploaded anywhere." },
  { title: "Set a password", desc: "Type it twice. Anyone opening the file will need it." },
  { title: "Encrypt", desc: "Your browser applies AES-256 encryption on your device." },
  { title: "Download", desc: "Save the protected PDF. Store the password somewhere safe." },
];

const faqs = [
  {
    q: "Can I restrict printing or copying instead of setting a password?",
    a: "This tool does not offer permission-only protection, and that is deliberate. A permissions password (the PDF \"owner password\") does not encrypt anything — it simply sets a flag asking the reader to disable printing or copying, and most PDF software will ignore it or strip it in seconds. Offering it would look like security without being security. What this tool does instead is real encryption: without the password, the file cannot be read at all.",
  },
  {
    q: "Can a password-protected PDF be cracked?",
    a: "ToolMint applies AES-256 encryption, which is resistant to brute-force attacks with current technology. However, simple or guessable passwords can be cracked with dictionary attacks. Use a strong, unique password for sensitive documents.",
  },
  {
    q: "How do I password protect a PDF on mobile?",
    a: "Open ToolMint in your mobile browser, upload the PDF, set your password, and download the protected file. No app installation is required — the tool works in any mobile browser.",
  },
  {
    q: "Does protecting a PDF change its file size?",
    a: "Adding a password adds a small amount of encryption overhead, typically increasing the file size by less than 5%. For most documents, the size difference is negligible.",
  },
  {
    q: "Can I set permissions to prevent printing or copying?",
    a: "Yes. The permissions settings let you restrict printing, content copying, and document modification independently. Recipients who open the file with the user password will have access limited to the permissions you set.",
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
      <WebAppSchema slug="protect-pdf" />
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
          Password Protect PDF Online – AES-256 Encryption Free
        </h1>

        <ToolStatusNotice slug="protect-pdf" />
        <ProcessingBadge slug="protect-pdf" />
        <ToolAnalytics slug="protect-pdf" category="pdf" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Add a password to a PDF using AES-256 encryption — the strongest the PDF format
          defines. The encryption happens inside this page on your own device, so a contract or a
          medical record is never uploaded to us or anyone else. No account, nothing to install.
        </p>

        <div className="mt-8">
          <PdfSecurityTool operation="protect" />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Protect a PDF
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
            How to Protect a PDF with a Password
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
              Types of PDF Password Protection Explained
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              PDF security has two distinct layers. The first is the open password (also called
              the user password), which controls access to the file — recipients must enter this
              password to open the PDF at all. The second is the owner password (also called the
              permissions password), which controls what a recipient can do once the file is open.
              With an owner password, you can prevent printing, copying text, filling in form
              fields, or making edits. You can set one or both. A file protected only by an owner
              password can be opened without a password but has restricted functionality. A file
              protected only by a user password requires the password to open but places no
              restrictions on usage.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How Strong Is PDF Password Encryption?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Modern PDFs use AES-256 encryption, which is a military-grade standard used across
              banking, government, and healthcare applications. With a strong password, AES-256
              encrypted PDFs are practically uncrackable by brute force with current hardware. The
              weak point is always the password itself. Short passwords, dictionary words, or easily
              guessed combinations can be cracked by automated tools in seconds or minutes. Use a
              password of at least 12 characters with a mix of letters, numbers, and symbols for
              any document that requires genuine security. Store the password separately — there is
              no recovery mechanism built into the PDF format.
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

        <RelatedTools slug="protect-pdf" />
      </main>
    </>
  );
}
