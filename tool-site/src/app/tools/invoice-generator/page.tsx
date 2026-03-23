import type { Metadata } from "next";
import Link from "next/link";
import InvoiceGeneratorTool from "@/components/invoice-generator-tool";

export const metadata: Metadata = {
  title: "Invoice Generator — Create Professional Invoices Free Online",
  description:
    "Create professional invoices online for free. Add line items, tax, discounts and print or save as PDF. No sign-up required.",
};

export default function InvoiceGeneratorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link
        href="/"
        className="mb-5 inline-block text-sm transition hover:opacity-80"
        style={{ color: "var(--muted)" }}
      >
        ← Back to home
      </Link>

      <h1
        className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] md:text-5xl"
        style={{ color: "var(--foreground)" }}
      >
        Invoice Generator
      </h1>
      <p
        className="mt-3 max-w-3xl text-sm leading-7 md:text-base"
        style={{ color: "var(--muted)" }}
      >
        Create professional invoices in seconds. Add your business details, line items, tax and
        discounts — then print or save as PDF.
      </p>

      <div className="mt-8">
        <InvoiceGeneratorTool />
      </div>
    </main>
  );
}
