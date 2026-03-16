import type { Metadata } from "next";
import Link from "next/link";
import GrammarCheckerTool from "@/components/grammar-checker-tool";

export const metadata: Metadata = {
  title: "Grammar Checker — Free Online Spelling & Grammar Tool",
  description:
    "Free online Grammar Checker. Instantly find and fix spelling mistakes, capitalization errors, repeated words, confused words, run-on sentences, and more — no sign-up required.",
};

export default function GrammarCheckerPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-[#9b9bb3] transition hover:text-white">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Grammar Checker
      </h1>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <span className="text-lg">🚧</span>
        <div>
          <p className="text-sm font-semibold text-amber-300">Under Construction</p>
          <p className="text-xs text-amber-300/70">
            This tool uses rule-based checks. Advanced AI-powered grammar analysis is coming soon.
          </p>
        </div>
      </div>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9b9bb3] md:text-base">
        Paste your text and click &ldquo;Check Grammar&rdquo; to instantly find spelling mistakes,
        capitalization errors, repeated words, confused words, and more. Fix issues one by one or
        apply all suggestions at once.
      </p>

      <div className="mt-8">
        <GrammarCheckerTool />
      </div>
    </main>
  );
}
