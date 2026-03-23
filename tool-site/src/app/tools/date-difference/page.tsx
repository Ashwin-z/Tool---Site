import type { Metadata } from "next";
import Link from "next/link";
import DateDifferenceTool from "@/components/date-difference-tool";

export const metadata: Metadata = {
  title: "Date Difference Calculator — Days Between Dates | ToolCraft",
  description:
    "Free Date Difference Calculator. Find the number of days, hours, and minutes between two dates instantly.",
};

export default function DateDifferencePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Date Difference
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Pick a start and end date to calculate the exact difference in days.
      </p>

      <div className="mt-8">
        <DateDifferenceTool />
      </div>
    </main>
  );
}
