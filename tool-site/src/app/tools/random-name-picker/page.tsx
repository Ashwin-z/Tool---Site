import type { Metadata } from "next";
import Link from "next/link";
import RandomNamePickerTool from "@/components/random-name-picker-tool";

export const metadata: Metadata = {
  title: "Random Name Picker — Free Online Random Selector",
  description:
    "Free online Random Name Picker. Enter a list of names and randomly pick one or more winners instantly. Perfect for raffles, giveaways, and group selection.",
};

export default function RandomNamePickerPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Random Name Picker
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Enter a list of names and randomly pick one or more. Perfect for raffles, giveaways,
        classroom picks, and team assignments. Tracks pick history.
      </p>

      <div className="mt-8">
        <RandomNamePickerTool />
      </div>
    </main>
  );
}
