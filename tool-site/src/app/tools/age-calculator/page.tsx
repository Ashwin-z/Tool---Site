import type { Metadata } from "next";
import Link from "next/link";
import AgeCalculatorTool from "@/components/age-calculator-tool";

export const metadata: Metadata = {
  title: "Age Calculator — Free Online Exact Age Calculator",
  description:
    "Free online Age Calculator. Find your exact age in years, months, days, hours, minutes and seconds. Includes zodiac sign, generation, milestones, and next birthday countdown.",
};

export default function AgeCalculatorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-[#9b9bb3] transition hover:text-white">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Age Calculator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9b9bb3] md:text-base">
        Enter your date of birth to find your exact age in years, months, and days.
        Plus fun facts like your zodiac sign, generation, heartbeats, milestones, and more.
      </p>

      <div className="mt-8">
        <AgeCalculatorTool />
      </div>
    </main>
  );
}
