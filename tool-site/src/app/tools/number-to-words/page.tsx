import type { Metadata } from "next";
import Link from "next/link";
import NumberToWordsTool from "@/components/number-to-words-tool";

export const metadata: Metadata = {
  title: "Number to Words Converter — Free Online Number Spelling Tool",
  description:
    "Free online Number to Words Converter. Convert any number to its English word form. Supports Western and Indian numbering, ordinals, and currency formats.",
};

export default function NumberToWordsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Number to Words Converter
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Convert any number to its English word form. Supports Western and Indian numbering systems,
        ordinal numbers, and currency formatting for USD, EUR, GBP, INR, and JPY.
      </p>

      <div className="mt-8">
        <NumberToWordsTool />
      </div>
    </main>
  );
}
