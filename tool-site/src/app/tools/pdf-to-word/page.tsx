import type { Metadata } from "next";
import Link from "next/link";
import PdfToWordTool from "@/components/pdf-to-word-tool";

export const metadata: Metadata = {
  title: "PDF to Word — Free Online PDF to DOCX Converter | ToolCraft",
  description:
    "Free online PDF to Word converter. Upload PDF files and convert them into editable Word documents entirely in your browser — no upload needed.",
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
        Convert PDF files into editable Word documents entirely in your browser. Preserves text, formatting, headings, and layout — no server upload needed.
      </p>

      <div className="mt-8">
        <PdfToWordTool />
      </div>
    </main>
  );
}
