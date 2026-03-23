import type { Metadata } from "next";
import Link from "next/link";
import PdfToJpgTool from "@/components/pdf-to-jpg-tool";

export const metadata: Metadata = {
  title: "PDF to JPG — Free Online PDF to Image Converter | ToolCraft",
  description:
    "Free online PDF to JPG converter. Upload a PDF and convert every page into high-quality JPG images directly in your browser. No upload to any server.",
};

export default function PdfToJpgPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        PDF to JPG
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Convert every page of your PDF into high-quality JPG images. Everything runs locally in your browser — no files are uploaded to any server.
      </p>

      <div className="mt-8">
        <PdfToJpgTool />
      </div>
    </main>
  );
}
