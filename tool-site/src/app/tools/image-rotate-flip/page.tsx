import type { Metadata } from "next";
import Link from "next/link";
import ImageRotateFlipTool from "@/components/image-rotate-flip-tool";

export const metadata: Metadata = {
  title: "Image Rotate & Flip — Rotate, Mirror & Flip Images Online | ToolCraft",
  description:
    "Free online image rotator and flipper. Rotate images by any angle (90°, 180°, or custom). Flip horizontally or vertically. Supports JPG, PNG, WebP, BMP, GIF, AVIF, TIFF. 100% private.",
};

export default function ImageRotateFlipPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Image Rotate & Flip
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Rotate images to any angle — 90°, 180°, or fine-tune with a slider. Flip horizontally
        or vertically. Batch process multiple images. Supports JPG, PNG, WebP, BMP, GIF, AVIF, and TIFF.
      </p>

      <div className="mt-8">
        <ImageRotateFlipTool />
      </div>
    </main>
  );
}
