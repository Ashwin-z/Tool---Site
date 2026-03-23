import type { Metadata } from "next";
import Link from "next/link";
import ImageToTextTool from "@/components/image-to-text-tool";

export const metadata: Metadata = {
  title: "Image to Text (OCR) — Free Online Image Text Extractor",
  description:
    "Free online Image to Text converter. Extract text from images using OCR (Optical Character Recognition). Supports JPG, PNG, BMP, WebP. 20+ languages. 100% private — runs in your browser.",
};

export default function ImageToTextPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Image to Text (OCR)
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Extract text from any image using OCR (Optical Character Recognition).
        Upload a photo, screenshot, or scanned document — supports 20+ languages
        including English, Hindi, Chinese, Arabic, and more. Paste directly from clipboard with Ctrl+V.
      </p>

      <div className="mt-8">
        <ImageToTextTool />
      </div>
    </main>
  );
}
