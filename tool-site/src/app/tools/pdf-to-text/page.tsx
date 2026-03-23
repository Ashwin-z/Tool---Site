import type { Metadata } from "next";
import Link from "next/link";
import PdfToTextTool from "@/components/pdf-to-text-tool";

export const metadata: Metadata = {
  title: "PDF to Text (OCR) — Free Online PDF Text Extractor",
  description:
    "Free online PDF to Text converter. Extract text from PDFs using OCR or native text extraction. Works on scanned documents and image-based PDFs. 20+ languages. 100% private.",
};

export default function PdfToTextPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        PDF to Text (OCR)
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Extract text from any PDF — scanned documents, image-based PDFs, or regular text PDFs.
        Choose &quot;Native&quot; mode for digital PDFs with selectable text, or &quot;OCR&quot; mode
        for scanned pages. Supports 20+ languages. All processing happens in your browser.
      </p>

      <div className="mt-8">
        <PdfToTextTool />
      </div>
    </main>
  );
}
