import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact | ToolCraft",
  description: "Get in touch with ToolCraft for feedback, support, or partnerships.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 text-foreground">
      <Link href="/" className="text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">Contact</h1>
      <p className="mt-3 text-sm leading-7 text-muted">We’d love your feedback. Reach us using the details below.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-xl font-bold text-foreground">General</h2>
          <p className="mt-2 text-sm text-foreground/75">Email: hello@toolcraft.site</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-xl font-bold text-foreground">Business</h2>
          <p className="mt-2 text-sm text-foreground/75">Partnerships: partnerships@toolcraft.site</p>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">You can replace these emails with your real business email later.</p>
    </main>
  );
}
