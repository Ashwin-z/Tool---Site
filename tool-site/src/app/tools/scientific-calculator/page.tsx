import type { Metadata } from "next";
import Link from "next/link";
import ScientificCalculatorTool from "@/components/scientific-calculator-tool";

export const metadata: Metadata = {
  title: "Scientific Calculator — Free Online Advanced Calculator",
  description:
    "Free online Scientific Calculator with trigonometric, logarithmic, exponential, factorial, and power functions. Includes DEG/RAD modes, memory, and calculation history.",
};

export default function ScientificCalculatorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-[#9b9bb3] transition hover:text-white">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Scientific Calculator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9b9bb3] md:text-base">
        A full-featured scientific calculator with trigonometric, logarithmic, exponential,
        and factorial functions. Switch between DEG and RAD modes, use memory registers,
        and browse your calculation history — all in one place.
      </p>

      <div className="mt-8">
        <ScientificCalculatorTool />
      </div>
    </main>
  );
}
