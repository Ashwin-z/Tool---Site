import type { Metadata } from "next";
import Link from "next/link";
import ProfitMarginCalculatorTool from "@/components/profit-margin-calculator-tool";

export const metadata: Metadata = {
  title: "Profit Margin Calculator — Free Online Margin & Markup Calculator",
  description:
    "Free online Profit Margin Calculator. Calculate profit margin, markup percentage, gross and net margins. Find the selling price from cost and desired margin instantly.",
};

export default function ProfitMarginCalculatorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Profit Margin Calculator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Calculate profit margin, markup percentage, gross and net margins in one place.
        Find the right selling price based on your cost and desired margin, or compare
        gross vs net profitability for better business decisions.
      </p>

      <div className="mt-8">
        <ProfitMarginCalculatorTool />
      </div>
    </main>
  );
}
