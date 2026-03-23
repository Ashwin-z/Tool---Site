import type { Metadata } from "next";
import Link from "next/link";
import PdfMergerTool from "@/components/pdf-merger-tool";

export const metadata: Metadata = {
  title: "Merge PDF — Free Online PDF Merger",
  description:
    "Free online PDF merger. Upload up to 25 PDFs, rearrange them in any order, and combine them into one merged PDF right in your browser.",
};

export default function PdfMergerPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Merge PDF
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Combine multiple PDFs into one file, reorder them before merging, and download a single merged document.
        You can upload up to 25 PDFs at a time, and merging happens locally in your browser.
      </p>

      <div className="mt-8">
        <PdfMergerTool />
      </div>
    </main>
  );
}