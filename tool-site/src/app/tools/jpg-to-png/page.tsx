import type { Metadata } from "next";
import Link from "next/link";
import JpgToPngTool from "@/components/jpg-to-png-tool";

export const metadata: Metadata = {
  title: "JPG to PNG Converter — Convert Any Image to PNG Online | ToolCraft",
  description:
    "Free online image-to-PNG converter. Convert JPG, WebP, BMP, GIF, AVIF, TIFF, and SVG to PNG with full transparency support. Lossless quality. 100% private — runs in your browser.",
};

export default function JpgToPngPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        JPG to PNG Converter
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Convert JPG, WebP, BMP, GIF, AVIF, TIFF, and SVG files to lossless PNG format with
        full transparency support. Batch convert multiple images at once.
      </p>

      <div className="mt-8">
        <JpgToPngTool />
      </div>
    </main>
  );
}
