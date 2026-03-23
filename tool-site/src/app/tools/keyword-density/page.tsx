import type { Metadata } from "next";
import Link from "next/link";
import KeywordDensityTool from "@/components/keyword-density-tool";

export const metadata: Metadata = {
  title: "Keyword Density Checker — Analyze Keyword Frequency | ToolCraft",
  description:
    "Free Keyword Density Checker. Analyze keyword frequency, density percentages, and n-gram phrases in any text or article.",
};

export default function KeywordDensityPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Keyword Density Checker
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Paste your content and instantly see keyword frequency, density percentages, and multi-word phrase analysis.
      </p>

      <div className="mt-8">
        <KeywordDensityTool />
      </div>
    </main>
  );
}
