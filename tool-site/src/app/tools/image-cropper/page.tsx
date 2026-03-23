import type { Metadata } from "next";
import Link from "next/link";
import ImageCropperTool from "@/components/image-cropper-tool";

export const metadata: Metadata = {
  title: "Image Cropper — Crop JPG, PNG, WebP & More Online | ToolCraft",
  description:
    "Free online Image Cropper. Visually crop any image — JPG, PNG, WebP, BMP, GIF, AVIF. Aspect ratio presets for social media. Rule-of-thirds grid. 100% private — runs in your browser.",
};

export default function ImageCropperPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Image Cropper
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Visually crop any image to the exact area you need. Lock to popular aspect ratios like
        1:1, 4:3, 16:9, or crop freely. Supports JPG, PNG, WebP, BMP, GIF, AVIF, and TIFF.
      </p>

      <div className="mt-8">
        <ImageCropperTool />
      </div>
    </main>
  );
}
