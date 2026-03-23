import type { Metadata } from "next";
import Link from "next/link";
import PdfToPdfaTool from "@/components/pdf-to-pdfa-tool";

export const metadata: Metadata = {
  title: "PDF to PDF/A — Free Online PDF/A Converter | ToolCraft",
  description:
    "Free online PDF to PDF/A converter. Convert your PDF files to archival-quality PDF/A-1b, PDF/A-2b, or PDF/A-3b format for long-term preservation.",
};

export default function PdfToPdfaPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        PDF to PDF/A
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Convert PDF files to PDF/A format for long-term archiving and compliance. Choose from PDF/A-1b, PDF/A-2b, or PDF/A-3b conformance levels. Powered by Ghostscript — supports batch conversion.
      </p>

      <div className="mt-8">
        <PdfToPdfaTool />
      </div>
    </main>
  );
}
