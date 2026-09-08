import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us | ToolMint",
  description:
    "Get in touch with ToolMint for feedback, support, bug reports, or partnership inquiries.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us | ToolMint",
    description:
      "Get in touch with ToolMint for feedback, support, bug reports, or partnership inquiries.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 text-foreground">
      <Link href="/" className="text-sm text-muted transition hover:text-foreground">
        &larr; Back to home
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">Contact Us</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
        Have a question, suggestion, or found a bug? We&apos;d love to hear from you. Use the email
        addresses below to get in touch.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-xl font-bold text-foreground">General &amp; Support</h2>
          <p className="mt-1 text-sm text-foreground/75">
            Questions, feedback, or bug reports
          </p>
          <a
            href="mailto:hello@toolmint.tools"
            className="mt-3 inline-block text-sm font-medium text-accent-light transition hover:text-foreground"
          >
            hello@toolmint.tools
          </a>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-xl font-bold text-foreground">Business &amp; Partnerships</h2>
          <p className="mt-1 text-sm text-foreground/75">
            Collaboration or advertising inquiries
          </p>
          <a
            href="mailto:partnerships@toolmint.tools"
            className="mt-3 inline-block text-sm font-medium text-accent-light transition hover:text-foreground"
          >
            partnerships@toolmint.tools
          </a>
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-bold text-foreground">Response Time</h2>
        <p className="mt-2 text-sm leading-7 text-foreground/75">
          We aim to respond to all inquiries within 1-2 business days. For urgent issues, please include
          &quot;Urgent&quot; in your email subject line.
        </p>
      </div>
    </main>
  );
}
