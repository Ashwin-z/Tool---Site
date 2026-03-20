import type { Metadata } from "next";
import Link from "next/link";
import EditPdfTool from "@/components/edit-pdf-tool-loader";

export const metadata: Metadata = {
  title: "Edit PDF — Annotate Pages Online | ToolCraft",
  description:
    "Edit PDF pages with thumbnails, annotations, drawings, image stamps, and browser-based export.",
};

export default function EditPdfPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] px-4 py-8 md:px-6 md:py-10">
      <Link href="/" className="mb-5 inline-block text-sm text-[#9b9bb3] transition hover:text-white">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Edit PDF
      </h1>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-[#9b9bb3] md:text-base">
        Open your PDF in a full editor workspace with page thumbnails, a large canvas, and a live layer panel inspired by modern online PDF tools.
      </p>

      <div className="mt-8">
        <EditPdfTool />
      </div>
    </main>
  );
}
