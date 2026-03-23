import type { Metadata } from "next";
import Link from "next/link";
import PdfToPowerpointTool from "@/components/pdf-to-powerpoint-tool";

export const metadata: Metadata = {
  title: "PDF to PowerPoint — Free Online PDF to PPTX Converter | ToolCraft",
  description:
    "Free online PDF to PowerPoint converter. Upload a PDF and convert every page into a PowerPoint slide with full visual fidelity.",
};

export default function PdfToPowerpointPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        PDF to PowerPoint
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Convert PDF pages into PowerPoint slides. Each page becomes a full-bleed slide image — preserving every visual detail exactly as it appears.
      </p>

      <div className="mt-8">
        <PdfToPowerpointTool />
      </div>
    </main>
  );
}
