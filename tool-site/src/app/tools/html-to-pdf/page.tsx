import type { Metadata } from "next";
import Link from "next/link";
import HtmlToPdfTool from "@/components/html-to-pdf-tool";

export const metadata: Metadata = {
  title: "HTML to PDF — Free Online HTML to PDF Converter",
  description:
    "Free online HTML to PDF converter. Paste a webpage URL and render that live page into a PDF document.",
};

export default function HtmlToPdfPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        HTML to PDF
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Convert live webpages into PDF documents. Paste a real URL and download the rendered page as a PDF.
      </p>

      <div className="mt-8">
        <HtmlToPdfTool />
      </div>
    </main>
  );
}
