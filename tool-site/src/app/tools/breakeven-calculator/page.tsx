import type { Metadata } from "next";
import Link from "next/link";
import BreakevenCalculatorTool from "@/components/breakeven-calculator-tool";

export const metadata: Metadata = {
  title: "Break-even Calculator — Free Online Break-even Analysis Tool",
  description:
    "Free online Break-even Calculator. Calculate your break-even point in units and revenue. See contribution margin, profit/loss projections at different volumes.",
};

export default function BreakevenCalculatorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Break-even Calculator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Calculate your break-even point using fixed costs, variable cost per unit, and selling price.
        See contribution margin, break-even revenue, and profit/loss projections at different sales volumes.
      </p>

      <div className="mt-8">
        <BreakevenCalculatorTool />
      </div>
    </main>
  );
}
