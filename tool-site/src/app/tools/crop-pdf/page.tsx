import type { Metadata } from "next";
import Link from "next/link";
import CropPdfTool from "@/components/crop-pdf-tool-loader";

export const metadata: Metadata = {
  title: "Crop PDF — Free Online PDF Cropper | ToolCraft",
  description:
    "Crop PDF pages with a draggable live preview, page scope selection, and instant browser-based download.",
};

export default function CropPdfPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-[#9b9bb3] transition hover:text-white">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Crop PDF
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9b9bb3] md:text-base">
        Trim PDF pages with live previews, page scope selection, and browser-based download.
      </p>

      <div className="mt-8">
        <CropPdfTool />
      </div>
    </main>
  );
}