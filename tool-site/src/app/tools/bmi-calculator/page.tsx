import type { Metadata } from "next";
import Link from "next/link";
import BmiCalculatorTool from "@/components/bmi-calculator-tool";

export const metadata: Metadata = {
  title: "BMI Calculator — Free Online Body Mass Index Calculator",
  description:
    "Free online BMI Calculator. Calculate your Body Mass Index with metric or imperial units. See your BMI category, healthy weight range, and BMI Prime score instantly.",
};

export default function BmiCalculatorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-[#9b9bb3] transition hover:text-white">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        BMI Calculator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9b9bb3] md:text-base">
        Calculate your Body Mass Index (BMI) using your weight and height.
        Supports both metric (kg / cm) and imperial (lbs / ft-in) units with instant category classification.
      </p>

      <div className="mt-8">
        <BmiCalculatorTool />
      </div>
    </main>
  );
}
