import type { Metadata } from "next";
import Link from "next/link";
import CompoundInterestCalculatorTool from "@/components/compound-interest-calculator-tool";

export const metadata: Metadata = {
  title: "Compound Interest Calculator — Free Online CI Calculator",
  description:
    "Free online Compound Interest Calculator. Calculate compound interest with flexible compounding frequencies. See year-by-year growth, compare with simple interest, and visualize your returns.",
};

export default function CompoundInterestCalculatorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-[#9b9bb3] transition hover:text-white">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Compound Interest Calculator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9b9bb3] md:text-base">
        Calculate compound interest on your investments with support for monthly, quarterly, semi-annual, annual, and daily compounding.
        See a year-by-year growth chart and compare against simple interest.
      </p>

      <div className="mt-8">
        <CompoundInterestCalculatorTool />
      </div>
    </main>
  );
}
