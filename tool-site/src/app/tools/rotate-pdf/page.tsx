import type { Metadata } from "next";
import Link from "next/link";
import RotatePdfTool from "@/components/rotate-pdf-tool";

export const metadata: Metadata = {
  title: "Rotate PDF — Free Online PDF Rotator | ToolCraft",
  description:
    "Rotate PDF pages left or right with a live preview, then download the updated file instantly in your browser.",
};

export default function RotatePdfPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Rotate PDF
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Upload a PDF, rotate it left or right in 90° steps, and watch the live preview update after every click. Reset the rotation any time and download the final PDF when you’re done.
      </p>

      <div className="mt-8">
        <RotatePdfTool />
      </div>
    </main>
  );
}