import type { Metadata } from "next";
import Link from "next/link";
import ImageConverterTool from "@/components/image-converter-tool";

export const metadata: Metadata = {
  title: "Image Converter — Convert Between JPG, PNG, WebP Online | ToolCraft",
  description:
    "Free online image format converter. Convert between JPG, PNG, WebP, BMP, GIF, AVIF, TIFF, and SVG. Adjustable quality, background color control, bulk conversion with ZIP export. 100% private — runs in your browser.",
};

export default function ImageConverterPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Image Converter
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Convert any image format to JPG, PNG, or WebP. Supports BMP, GIF, AVIF, TIFF, and SVG
        input. Control quality, set background colors for transparent images, and convert in
        bulk — all 100% in your browser.
      </p>

      <div className="mt-8">
        <ImageConverterTool />
      </div>
    </main>
  );
}
