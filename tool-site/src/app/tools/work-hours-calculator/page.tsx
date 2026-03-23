import type { Metadata } from "next";
import Link from "next/link";
import WorkHoursCalculatorTool from "@/components/work-hours-calculator-tool";

export const metadata: Metadata = {
  title: "Work Hours Calculator — Free Weekly Hours & Pay Tracker",
  description:
    "Free online Work Hours Calculator. Track your weekly work schedule, calculate total hours, break time, and estimated pay with an hourly rate.",
};

export default function WorkHoursCalculatorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Work Hours Calculator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Track your weekly work schedule with start/end times and break durations.
        Calculate total hours, average per day, and estimated weekly & monthly pay.
      </p>

      <div className="mt-8">
        <WorkHoursCalculatorTool />
      </div>
    </main>
  );
}
