import type { Metadata } from "next";
import Link from "next/link";
import StopwatchTool from "@/components/stopwatch-tool";

export const metadata: Metadata = {
  title: "Stopwatch — Lap Timer & Countdown | ToolCraft",
  description:
    "Free online Stopwatch with lap splits and a simple countdown timer. Fast, accurate, and works in your browser.",
};

export default function StopwatchPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Stopwatch
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Use a clean stopwatch with lap splits, or switch to countdown mode for a quick timer.
      </p>

      <div className="mt-8">
        <StopwatchTool />
      </div>
    </main>
  );
}
