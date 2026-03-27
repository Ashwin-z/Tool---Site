import type { Metadata } from "next";
import Link from "next/link";
import SignPdfTool from "@/components/sign-pdf-tool-loader";

export const metadata: Metadata = {
  title: "Sign PDF — Add Signatures & Fields Online | ToolCraft",
  description:
    "Sign PDF documents online. Add signatures, initials, name, date, text, and company stamps. Generate, draw, or upload your signature.",
};

export default function SignPdfPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] px-4 py-8 md:px-6 md:py-10">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Sign PDF
      </h1>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-muted md:text-base">
        Add your signature, initials, name, dates, text, and company stamp to any PDF page.
        Place and resize elements exactly where you need them, then download a signed copy.
      </p>

      <div className="mt-8">
        <SignPdfTool />
      </div>
    </main>
  );
}
