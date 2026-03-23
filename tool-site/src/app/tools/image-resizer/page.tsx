import type { Metadata } from "next";
import Link from "next/link";
import ImageResizerTool from "@/components/image-resizer-tool";

export const metadata: Metadata = {
  title: "Image Resizer — Resize Images to Exact Pixels Online | ToolCraft",
  description:
    "Free online Image Resizer. Resize JPG, PNG, and WebP images to exact pixel dimensions. 12 social-media presets for Instagram, Facebook, Twitter & more. 100% private — runs in your browser.",
};

export default function ImageResizerPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Image Resizer
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Resize images to exact pixel dimensions. Pick from 12 social-media presets or enter
        custom sizes — with aspect-ratio lock, format selection, and quality control.
      </p>

      <div className="mt-8">
        <ImageResizerTool />
      </div>
    </main>
  );
}
