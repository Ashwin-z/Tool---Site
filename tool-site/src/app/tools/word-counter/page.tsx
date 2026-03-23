import type { Metadata } from "next";
import Link from "next/link";
import WordCounterTool from "@/components/word-counter-tool";

export const metadata: Metadata = {
  title: "Word Counter Online — Count Words, Characters & Sentences",
  description:
    "Free online Word Counter tool. Instantly count words, characters, sentences and reading time. Fast, accurate, and no signup required.",
};

export default function WordCounterPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Word Counter Online
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Count words, characters, sentences and estimated reading time in real-time. This tool runs completely in your browser.
      </p>

      <div className="mt-8">
        <WordCounterTool />
      </div>
    </main>
  );
}