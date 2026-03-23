import type { Metadata } from "next";
import Link from "next/link";
import RedactPdfTool from "@/components/redact-pdf-tool-loader";

export const metadata: Metadata = {
  title: "Redact PDF — Search and Black Out Sensitive PDF Content | ToolCraft",
  description:
    "Redact PDF online with page previews, text search, manual redaction boxes, and flattened export for safer sharing.",
};

export default function RedactPdfPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] px-4 py-8 md:px-6 md:py-10">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Redact PDF
      </h1>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-muted md:text-base">
        Search text, draw manual redaction boxes, and export a flattened PDF with sensitive content permanently blacked out.
      </p>

      <div className="mt-8">
        <RedactPdfTool />
      </div>
    </main>
  );
}
