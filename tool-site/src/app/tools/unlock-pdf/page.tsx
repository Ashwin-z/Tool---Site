import type { Metadata } from "next";
import Link from "next/link";
import PdfSecurityTool from "@/components/pdf-security-tool";

export const metadata: Metadata = {
  title: "Unlock PDF — Remove PDF Password Online | ToolCraft",
  description:
    "Unlock PDF online by removing password protection when you know the correct password. Download an unprotected copy of your PDF in seconds.",
};

export default function UnlockPdfPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Unlock PDF
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Remove password protection from a PDF when you already know the valid password. Upload the locked file, enter its password, and download the unlocked copy.
      </p>

      <div className="mt-8">
        <PdfSecurityTool mode="unlock" />
      </div>
    </main>
  );
}
