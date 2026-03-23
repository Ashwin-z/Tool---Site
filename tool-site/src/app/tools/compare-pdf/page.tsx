import type { Metadata } from "next";
import Link from "next/link";
import ComparePdfTool from "@/components/compare-pdf-tool-loader";

export const metadata: Metadata = {
  title: "Compare PDF — Compare Text and Page Changes | ToolCraft",
  description:
    "Compare two PDF files side by side with semantic text diff, visual overlay mode, and a downloadable change report.",
};

export default function ComparePdfPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1700px] px-4 py-8 md:px-6 md:py-10">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Compare PDF
      </h1>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-muted md:text-base">
        Compare two PDFs with side-by-side previews, semantic text change detection, and a visual overlay mode for spotting page-level differences.
      </p>

      <div className="mt-8">
        <ComparePdfTool />
      </div>
    </main>
  );
}
