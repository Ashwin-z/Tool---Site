import type { Metadata } from "next";
import Link from "next/link";
import PowerPointToPdfTool from "@/components/powerpoint-to-pdf-tool";

export const metadata: Metadata = {
  title: "PowerPoint to PDF — Free Online PowerPoint to PDF Converter",
  description:
    "Free online PowerPoint to PDF converter. Upload up to 25 PPTX files and convert each slide deck into a PDF document directly in your browser.",
};

export default function PowerPointToPdfPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        PowerPoint to PDF
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Convert PPTX files into PDF documents. Upload up to 25 PowerPoint files and download either a single PDF or a ZIP of converted files.
      </p>

      <div className="mt-8">
        <PowerPointToPdfTool />
      </div>
    </main>
  );
}
