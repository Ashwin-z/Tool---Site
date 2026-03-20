import type { Metadata } from "next";
import Link from "next/link";
import PdfSplitterTool from "@/components/pdf-splitter-tool";

export const metadata: Metadata = {
  title: "Split PDF — Free Online PDF Splitter",
  description:
    "Free online PDF splitter. Split a PDF by custom ranges, fixed page chunks, or selected pages, then download the results instantly.",
};

export default function PdfSplitterPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-[#9b9bb3] transition hover:text-white">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Split PDF
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9b9bb3] md:text-base">
        Split one PDF by custom ranges, fixed intervals, or selected pages. Download one merged selection or separate PDF files, all directly in your browser.
      </p>

      <div className="mt-8">
        <PdfSplitterTool />
      </div>
    </main>
  );
}