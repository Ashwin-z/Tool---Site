import type { Metadata } from "next";
import Link from "next/link";
import PngToJpgTool from "@/components/png-to-jpg-tool";

export const metadata: Metadata = {
  title: "PNG to JPG Converter — Convert Any Image to JPEG Online | ToolCraft",
  description:
    "Free online image-to-JPG converter. Convert PNG, WebP, BMP, GIF, AVIF, TIFF, and SVG to JPEG format. Adjustable quality and background color for transparent images. 100% private.",
};

export default function PngToJpgPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        PNG to JPG Converter
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Convert PNG, WebP, BMP, GIF, AVIF, TIFF, and SVG files to JPEG format. Control quality
        and pick a background color to replace transparent areas — all in your browser.
      </p>

      <div className="mt-8">
        <PngToJpgTool />
      </div>
    </main>
  );
}
