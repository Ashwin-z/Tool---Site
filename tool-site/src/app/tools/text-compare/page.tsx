import type { Metadata } from "next";
import Link from "next/link";
import TextCompareTool from "@/components/text-compare-tool";

export const metadata: Metadata = {
  title: "Text Compare — Free Online Text Diff Tool",
  description:
    "Free online Text Compare tool. Compare two texts side by side and see line-by-line differences instantly. Highlight additions, removals, and unchanged lines.",
};

export default function TextComparePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Text Compare
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Compare two texts side by side and see line-by-line differences. Highlights additions,
        removals, and unchanged content with optional case and whitespace ignoring.
      </p>

      <div className="mt-8">
        <TextCompareTool />
      </div>
    </main>
  );
}
