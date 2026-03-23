import type { Metadata } from "next";
import Link from "next/link";
import LoanEmiCalculatorTool from "@/components/loan-emi-calculator-tool";

export const metadata: Metadata = {
  title: "Loan EMI Calculator — Free Online EMI Calculator",
  description:
    "Free online Loan EMI Calculator. Calculate your monthly EMI, total interest payable, and view a full amortization schedule for home, car, or personal loans.",
};

export default function LoanEmiCalculatorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Loan EMI Calculator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Calculate your Equated Monthly Installment (EMI) for any loan.
        Enter your loan amount, interest rate, and tenure to see the monthly EMI, total interest, and a detailed amortization schedule.
      </p>

      <div className="mt-8">
        <LoanEmiCalculatorTool />
      </div>
    </main>
  );
}
