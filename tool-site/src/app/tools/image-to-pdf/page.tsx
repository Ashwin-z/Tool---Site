import type { Metadata } from "next";
import Link from "next/link";
import ImageToPdfTool from "@/components/image-to-pdf-tool";

export const metadata: Metadata = {
  title: "Image to PDF — Free Online Image to PDF Converter",
  description:
    "Free online Image to PDF converter. Upload up to 25 image files like JPG, PNG, WEBP, GIF, BMP, or SVG, arrange them, and combine them into a single PDF in your browser.",
};

export default function ImageToPdfPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Image to PDF
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Turn image files into a single PDF document. Upload up to 25 files, adjust their order, and download the combined PDF instantly.
      </p>

      <div className="mt-8">
        <ImageToPdfTool />
      </div>
    </main>
  );
}
