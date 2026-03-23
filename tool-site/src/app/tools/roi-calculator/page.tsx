import type { Metadata } from "next";
import Link from "next/link";
import ROICalculatorTool from "@/components/roi-calculator-tool";

export const metadata: Metadata = {
  title: "ROI Calculator — Free Online Return on Investment Calculator",
  description:
    "Free online ROI Calculator. Calculate simple ROI, annualized ROI (CAGR), project investment growth with monthly contributions, and find your break-even point.",
};

export default function ROICalculatorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        ROI Calculator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Calculate your return on investment instantly. Find simple ROI, annualized ROI (CAGR),
        project growth with recurring contributions, and determine your break-even point —
        all in one place for smarter financial decisions.
      </p>

      <div className="mt-8">
        <ROICalculatorTool />
      </div>
    </main>
  );
}
