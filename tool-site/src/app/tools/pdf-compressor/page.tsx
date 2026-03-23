import type { Metadata } from "next";
import Link from "next/link";
import PdfCompressorTool from "@/components/pdf-compressor-tool";

export const metadata: Metadata = {
  title: "Compress PDF — Free Online PDF Compressor",
  description:
    "Free online PDF compressor. Reduce PDF file size with three compression levels using server-side native compression for stronger results and better readability.",
};

export default function PdfCompressorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Compress PDF
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Reduce the file size of your PDF documents. Choose from three compression levels to balance
        quality and size. Compression runs on the server with a native PDF engine for much better
        results than browser-only processing.
      </p>

      <div className="mt-8">
        <PdfCompressorTool />
      </div>
    </main>
  );
}
