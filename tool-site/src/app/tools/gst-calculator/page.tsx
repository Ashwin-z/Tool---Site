import type { Metadata } from "next";
import Link from "next/link";
import GSTCalculatorTool from "@/components/gst-calculator-tool";

export const metadata: Metadata = {
  title: "GST / Sales Tax Calculator — Free Online Tax Calculator",
  description:
    "Free online GST and Sales Tax Calculator. Add or remove tax from any price, calculate multi-item invoices with different tax rates, and reverse-find the tax rate applied.",
};

export default function GSTCalculatorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        GST / Sales Tax Calculator
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Add or remove GST/sales tax from any price instantly. Build multi-item invoices
        with different tax rates, or reverse-calculate the tax rate from pre-tax and post-tax amounts.
        Works for GST, VAT, sales tax, and any percentage-based tax.
      </p>

      <div className="mt-8">
        <GSTCalculatorTool />
      </div>
    </main>
  );
}
