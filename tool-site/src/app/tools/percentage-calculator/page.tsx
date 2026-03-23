import type { Metadata } from "next";
import Link from "next/link";
import PercentageCalculatorTool from "@/components/percentage-calculator-tool";

export const metadata: Metadata = {
  title: "Percentage Calculator — Free Online Percent Calculator",
  description:
    "Free online Percentage Calculator. Calculate percentage increase, decrease, difference, change, and reverse percentage. Solve common percentage problems instantly.",
};

export default function PercentageCalculatorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Percentage Calculator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Calculate percentages instantly. Find X% of Y, percentage increase, percentage decrease,
        percentage difference, percentage change, and reverse percentage — all in one place.
      </p>

      <div className="mt-8">
        <PercentageCalculatorTool />
      </div>
    </main>
  );
}
