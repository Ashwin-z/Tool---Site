import type { Metadata } from "next";
import Link from "next/link";
import FileSizeConverterTool from "@/components/file-size-converter-tool";

export const metadata: Metadata = {
  title: "File Size Converter — Free Online MB to GB, KB to MB Converter",
  description:
    "Free online File Size Converter. Convert between bytes, KB, MB, GB, TB, and more. Supports both decimal (SI) and binary (IEC) units with instant results.",
};

export default function FileSizeConverterPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        File Size Converter
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Convert file sizes between bytes, KB, MB, GB, TB, and PB. Supports both decimal (SI) and
        binary (IEC) units — see the difference between MB and MiB instantly.
      </p>

      <div className="mt-8">
        <FileSizeConverterTool />
      </div>
    </main>
  );
}
