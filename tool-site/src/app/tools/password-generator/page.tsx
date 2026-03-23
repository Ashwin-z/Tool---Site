import type { Metadata } from "next";
import Link from "next/link";
import PasswordGeneratorTool from "@/components/password-generator-tool";

export const metadata: Metadata = {
  title: "Password Generator — Create Strong, Secure Passwords | ToolCraft",
  description:
    "Free online Password Generator. Create strong, cryptographically secure passwords and passphrases with custom length, character sets, and exclusion rules. 100% client-side.",
};

export default function PasswordGeneratorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Password Generator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Generate strong, cryptographically secure passwords or memorable passphrases.
        Customize length, character sets, and exclusion rules — all processing happens in your browser.
      </p>

      <div className="mt-8">
        <PasswordGeneratorTool />
      </div>
    </main>
  );
}
