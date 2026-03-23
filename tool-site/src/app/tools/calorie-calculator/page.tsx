import type { Metadata } from "next";
import Link from "next/link";
import CalorieCalculatorTool from "@/components/calorie-calculator-tool";

export const metadata: Metadata = {
  title: "Calorie Calculator — BMR & TDEE with Macros | ToolCraft",
  description:
    "Free Calorie Calculator to estimate BMR and TDEE (daily maintenance calories) with a simple macro split. Fast, private, and easy to use.",
};

export default function CalorieCalculatorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Calorie Calculator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Estimate your BMR and daily calorie needs (TDEE) based on your body stats and activity level.
        Includes a simple macro preset to help plan meals.
      </p>

      <div className="mt-8">
        <CalorieCalculatorTool />
      </div>
    </main>
  );
}
