import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | ToolMint",
  description: "Learn how ToolMint uses cookies for analytics, ads, and site functionality.",
  alternates: { canonical: "/cookie-policy" },
  openGraph: {
    title: "Cookie Policy | ToolMint",
    description: "Learn how ToolMint uses cookies for analytics, ads, and site functionality.",
    url: "/cookie-policy",
  },
};

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 text-foreground">
      <Link href="/" className="text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">
        Cookie Policy
      </h1>
      <p className="mt-3 text-sm leading-7 text-muted">Last updated: March 29, 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-7 text-foreground/75">
        <section>
          <h2 className="font-display text-xl font-bold text-foreground">1) What are cookies?</h2>
          <p>
            Cookies are small text files stored on your device by your browser. They help websites remember
            preferences, improve performance, and measure usage.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">2) How ToolMint uses cookies</h2>
          <p>
            ToolMint may use cookies and similar technologies for essential site functionality, anonymous
            analytics, and advertising delivery or measurement.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">3) Third-party services</h2>
          <p>
            Some third-party services we use, such as analytics or ad providers, may set their own cookies
            according to their own privacy and cookie policies.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">4) Managing cookies</h2>
          <p>
            You can control or delete cookies in your browser settings. Disabling cookies may affect some
            site features and personalization.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">5) Contact</h2>
          <p>
            If you have questions about this Cookie Policy, please reach us via the <Link href="/contact" className="text-accent-light hover:text-foreground">Contact page</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}