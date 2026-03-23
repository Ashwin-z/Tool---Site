import type { Metadata } from "next";
import Link from "next/link";
import WeightConverterTool from "@/components/weight-converter-tool";

export const metadata: Metadata = {
  title: "Weight Converter — kg, lb, oz, stone, tons & more | ToolCraft",
  description:
    "Free online Weight Converter. Convert between kilograms, pounds, ounces, stones, metric tons, carats, and more. Instant results with all-unit comparison table.",
};

export default function WeightConverterPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Weight Converter
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Convert between 11 weight units — kilograms, pounds, ounces, stones, metric tons, carats, and more.
        See the result in all units at once.
      </p>

      <div className="mt-8">
        <WeightConverterTool />
      </div>
    </main>
  );
}
