import type { Metadata } from "next";
import Link from "next/link";
import RandomNumberGeneratorTool from "@/components/random-number-generator-tool";

export const metadata: Metadata = {
  title: "Random Number Generator — Integers, Decimals, Dice & Coin Flip | ToolCraft",
  description:
    "Free online Random Number Generator. Generate cryptographically secure random integers, decimals, dice rolls, coin flips, or pick from a custom list. 100% client-side.",
};

export default function RandomNumberGeneratorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Random Number Generator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Generate cryptographically secure random integers, decimals, dice rolls, coin flips,
        or pick items from a custom list — all in your browser.
      </p>

      <div className="mt-8">
        <RandomNumberGeneratorTool />
      </div>
    </main>
  );
}
