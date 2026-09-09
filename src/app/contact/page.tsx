import type { Metadata } from "next";
import Link from "next/link";

import { CONTACT } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with ToolMint for feedback, support, bug reports, or partnership inquiries.",
  alternates: { canonical: "/contact" },
  openGraph: {
    images: ["/opengraph-image"],
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
        Have a question, suggestion, or found a bug? We&apos;d love to hear from you.
      </p>
      {!CONTACT.contactWorks && (
        /* toolmint.tools has no MX record, so mail to these addresses bounces
           silently. Saying so is better than letting someone write a message
           that is never delivered - especially a journalist or researcher
           checking a claim. Flip CONTACT.contactWorks once a test message has
           actually been received; this notice disappears on its own. */
        <p
          role="note"
          className="mt-4 max-w-2xl rounded-xl border border-border bg-surface p-4 text-sm leading-6 text-foreground/80"
        >
          <strong>Email delivery is not active yet.</strong> Mail sent to the addresses below
          currently bounces because the domain has no mail records configured. The addresses are
          listed so you know where to reach us once that is fixed — please do not rely on them
          today.
        </p>
      )}
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-xl font-bold text-foreground">General &amp; Support</h2>
          <p className="mt-1 text-sm text-foreground/75">
            Questions, feedback, or bug reports
          </p>
          {CONTACT.contactWorks ? (
            <a
              href={`mailto:${CONTACT.general}`}
              className="mt-3 inline-block text-sm font-medium text-accent-light transition hover:text-foreground"
            >
              {CONTACT.general}
            </a>
          ) : (
            <p className="mt-3 text-sm font-medium text-foreground/60">
              <span className="line-through">{CONTACT.general}</span>{" "}
              <span className="text-xs">(not receiving mail yet)</span>
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-xl font-bold text-foreground">Business &amp; Partnerships</h2>
          <p className="mt-1 text-sm text-foreground/75">
            Collaboration or advertising inquiries
          </p>
          {CONTACT.contactWorks ? (
            <a
              href={`mailto:${CONTACT.partnerships}`}
              className="mt-3 inline-block text-sm font-medium text-accent-light transition hover:text-foreground"
            >
              {CONTACT.partnerships}
            </a>
          ) : (
            <p className="mt-3 text-sm font-medium text-foreground/60">
              <span className="line-through">{CONTACT.partnerships}</span>{" "}
              <span className="text-xs">(not receiving mail yet)</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-bold text-foreground">Response Time</h2>
        <p className="mt-2 text-sm leading-7 text-foreground/75">
          {CONTACT.contactWorks
            ? "We aim to respond to all inquiries within 1-2 business days. For urgent issues, please include “Urgent” in your email subject line."
            : "No response time can be promised while email delivery is inactive, because messages are not reaching us at all."}
        </p>
      </div>
    </main>
  );
}
