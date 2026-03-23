import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | ToolCraft",
  description: "Read the terms for using ToolCraft online tools.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 text-foreground">
      <Link href="/" className="text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">Terms of Service</h1>
      <p className="mt-3 text-sm leading-7 text-muted">Last updated: March 16, 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-7 text-foreground/75">
        <section>
          <h2 className="font-display text-xl font-bold text-foreground">1) Acceptance</h2>
          <p>By accessing ToolCraft, you agree to these terms. If you do not agree, please do not use the website.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">2) Fair usage</h2>
          <p>You may use ToolCraft for lawful purposes only. You must not attempt to disrupt service, scrape aggressively, or abuse website resources.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">3) No warranties</h2>
          <p>Tools are provided &quot;as is&quot; without warranty. We are not liable for indirect or consequential loss from tool usage.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">4) Changes</h2>
          <p>We may update these terms at any time. Continued usage means you accept the updated terms.</p>
        </section>
      </div>
    </main>
  );
}
