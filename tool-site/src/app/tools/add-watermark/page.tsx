import type { Metadata } from "next";
import Link from "next/link";
import AddWatermarkTool from "@/components/add-watermark-tool";

export const metadata: Metadata = {
  title: "Add Watermark — Free Online PDF Watermarker | ToolCraft",
  description:
    "Add text or image watermarks to PDFs with page range, position, rotation, transparency, mosaic, and layer controls.",
};

export default function AddWatermarkPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-[#9b9bb3] transition hover:text-white">← Back to home</Link>
      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">Add Watermark</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9b9bb3] md:text-base">Add text or image watermarks to your PDF with live preview, page range selection, position controls, transparency, rotation, mosaic, and layer options.</p>
      <div className="mt-8"><AddWatermarkTool /></div>
    </main>
  );
}