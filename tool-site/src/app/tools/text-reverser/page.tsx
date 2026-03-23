import type { Metadata } from "next";
import Link from "next/link";
import TextReverserTool from "@/components/text-reverser-tool";

export const metadata: Metadata = {
  title: "Text Reverser Online — Reverse Text, Words & Characters",
  description:
    "Free online Text Reverser. Reverse entire text, flip word order, or reverse characters in each word. Includes live word counter.",
};

export default function TextReverserPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Text Reverser
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Reverse your entire text, flip the word order, or reverse the characters in each word.
        Live word, character and sentence counter included.
      </p>

      <div className="mt-8">
        <TextReverserTool />
      </div>
    </main>
  );
}
