import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer | ToolMint",
  description: "Read ToolMint's legal disclaimer regarding tool outputs, accuracy, and liability.",
  alternates: { canonical: "/disclaimer" },
  openGraph: {
    title: "Disclaimer | ToolMint",
    description: "Read ToolMint's legal disclaimer regarding tool outputs, accuracy, and liability.",
    url: "/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 text-foreground">
      <Link href="/" className="text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">
        Disclaimer
      </h1>
      <p className="mt-3 text-sm leading-7 text-muted">Last updated: March 29, 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-7 text-foreground/75">
        <section>
          <h2 className="font-display text-xl font-bold text-foreground">1) General information only</h2>
          <p>
            ToolMint provides free online tools for general informational and productivity use. Content and
            outputs are provided "as is" and should not be considered professional advice.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">2) Accuracy and availability</h2>
          <p>
            We aim to provide reliable tools, but we do not guarantee that outputs are always complete,
            error-free, or suitable for every specific use case.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">3) No legal, financial, or medical advice</h2>
          <p>
            Calculator, converter, and document outputs are not a substitute for advice from qualified legal,
            financial, tax, medical, or other licensed professionals.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">4) User responsibility</h2>
          <p>
            You are responsible for reviewing and validating any result before relying on it for personal,
            business, legal, or compliance-related decisions.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">5) External services and links</h2>
          <p>
            Some tools may use or link to third-party services. ToolMint is not responsible for the content,
            policies, or practices of third-party websites or providers.
          </p>
        </section>
      </div>
    </main>
  );
}