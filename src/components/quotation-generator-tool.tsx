"use client";

export default function QuotationGeneratorTool() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl px-6 py-20 text-center"
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
      }}
    >
      <span className="mb-4 text-5xl">📋</span>
      <h2 className="font-display text-2xl font-bold">Coming Soon</h2>
      <p
        className="mt-2 max-w-md text-sm leading-7"
        style={{ color: "var(--muted)" }}
      >
        We&apos;re building a Quotation Generator that will let you create
        professional business quotes, add line items, terms and download as
        PDF &mdash; all for free.
      </p>
      <span
        className="mt-6 inline-flex rounded-full bg-amber-400/15 px-4 py-1.5 text-xs font-semibold text-amber-300"
      >
        🚧 Under Development
      </span>
    </div>
  );
}
