import type { Metadata } from "next";
import Link from "next/link";
import WordToPdfTool from "@/components/word-to-pdf-tool";

export const metadata: Metadata = {
  title: "Word to PDF — Free Online Word to PDF Converter",
  description:
    "Free online Word to PDF converter. Upload up to 25 DOCX files and convert them into PDF documents directly in your browser.",
};

export default function WordToPdfPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-[#9b9bb3] transition hover:text-white">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Word to PDF
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9b9bb3] md:text-base">
        Convert DOCX files to PDF. Upload up to 25 Word files and download either a single PDF or a ZIP of converted files.
      </p>

      <div className="mt-8">
        <WordToPdfTool />
      </div>
    </main>
  );
}