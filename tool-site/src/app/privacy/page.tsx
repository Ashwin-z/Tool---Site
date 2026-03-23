import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | ToolCraft",
  description: "Read ToolCraft's privacy policy and how we handle data.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 text-foreground">
      <Link href="/" className="text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">Privacy Policy</h1>
      <p className="mt-3 text-sm leading-7 text-muted">Last updated: March 16, 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-7 text-foreground/75">
        <section>
          <h2 className="font-display text-xl font-bold text-foreground">1) What we collect</h2>
          <p>ToolCraft tools run in your browser. We do not require account signup. We may collect basic analytics and ad-related metrics to improve performance.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">2) Cookies and ads</h2>
          <p>We may use cookies for analytics and ad delivery (including AdSense). Third-party services may collect anonymous usage data according to their own policies.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">3) Your content</h2>
          <p>For text-based tools like Word Counter, your text is processed locally in the browser and is not stored by us unless explicitly stated in the tool.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">4) Contact</h2>
          <p>If you have questions, please use our contact page.</p>
        </section>
      </div>
    </main>
  );
}
