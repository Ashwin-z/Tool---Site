import type { Metadata } from "next";
import Link from "next/link";
import GpaCalculatorTool from "@/components/gpa-calculator-tool";

export const metadata: Metadata = {
  title: "GPA Calculator — Free Online GPA & CGPA Calculator",
  description:
    "Free online GPA Calculator with support for US 4.0, India 10-point CGPA, UK, and 5-point scales. Add courses, credits, and grades to calculate your GPA instantly.",
};

export default function GpaCalculatorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        GPA Calculator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Calculate your GPA or CGPA with support for multiple grading systems — US 4.0, India 10-point,
        UK, and 5-point scales. Add your courses, credits, and grades for instant results.
      </p>

      <div className="mt-8">
        <GpaCalculatorTool />
      </div>
    </main>
  );
}
