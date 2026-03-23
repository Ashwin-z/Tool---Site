import type { Metadata } from "next";
import Link from "next/link";
import ImageCompressorTool from "@/components/image-compressor-tool";

export const metadata: Metadata = {
  title: "Image Compressor — Compress JPG, PNG & WebP Online | ToolCraft",
  description:
    "Free online Image Compressor. Reduce JPG, PNG, and WebP file sizes up to 90% without visible quality loss. Adjust quality, max width, and output format. 100% private — runs in your browser.",
};

export default function ImageCompressorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Image Compressor
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Compress JPG, PNG, and WebP images up to 90% smaller. Adjust quality, max width, and
        output format — all processing happens locally in your browser.
      </p>

      <div className="mt-8">
        <ImageCompressorTool />
      </div>
    </main>
  );
}
