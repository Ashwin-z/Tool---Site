import type { Metadata } from "next";
import Link from "next/link";
import PercentageCalculatorTool from "@/components/percentage-calculator-tool";

export const metadata: Metadata = {
  title: "Percentage Calculator — Free Online Percent Calculator",
  description:
    "Free online Percentage Calculator. Find percentages, percentage differences, percentage changes, and solve common percentage problems instantly.",
};

export default function PercentageCalculatorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-[#9b9bb3] transition hover:text-white">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Percentage Calculator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9b9bb3] md:text-base">
        Calculate percentages instantly. Find X% of Y, figure out what percentage one number
        is of another, calculate percentage differences, and determine percentage increases
        or decreases — all in one place.
      </p>

      <div className="mt-8">
        <PercentageCalculatorTool />
      </div>
    </main>
  );
}
