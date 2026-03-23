import type { Metadata } from "next";
import Link from "next/link";
import AddPageNumbersTool from "@/components/add-page-numbers-tool";

export const metadata: Metadata = {
  title: "Add Page Numbers — Free Online PDF Page Numberer | ToolCraft",
  description:
    "Add page numbers to a PDF with live preview, page mode, position, margin, first number, and page range controls.",
};

export default function AddPageNumbersPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Add Page Numbers
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Number selected pages of your PDF, choose single or facing-page layout, set the placement and margin, and preview the result before downloading.
      </p>

      <div className="mt-8">
        <AddPageNumbersTool />
      </div>
    </main>
  );
}