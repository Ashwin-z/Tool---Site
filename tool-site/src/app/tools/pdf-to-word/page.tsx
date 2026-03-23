import type { Metadata } from "next";
import Link from "next/link";
import PdfToWordTool from "@/components/pdf-to-word-tool";

export const metadata: Metadata = {
  title: "PDF to Word — Free Online PDF to DOCX Converter | ToolCraft",
  description:
    "Free online PDF to Word converter. Upload PDF files and convert them into editable Word documents using Microsoft Word on Windows.",
};

export default function PdfToWordPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        PDF to Word
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Convert PDF files into editable Word documents. Powered by Microsoft Word&apos;s native PDF import — preserves text, tables, images, and formatting.
      </p>

      <div className="mt-8">
        <PdfToWordTool />
      </div>
    </main>
  );
}
