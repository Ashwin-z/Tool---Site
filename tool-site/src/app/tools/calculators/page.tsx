import type { Metadata } from "next";
import Link from "next/link";
import { toolCategories } from "@/lib/tool-categories";

const category = toolCategories.find((c) => c.id === "calculators")!;

export const metadata: Metadata = {
  title: "Free Online Calculators — EMI, BMI, Compound Interest, GPA & More",
  description:
    "14 free online calculators on ToolMint. Calculate loan EMI, BMI, compound interest, percentages, profit margins, ROI, GST, GPA and more. No signup required.",
  keywords: [
    "online calculator",
    "emi calculator",
    "bmi calculator",
    "compound interest calculator",
    "percentage calculator",
    "scientific calculator online",
    "gpa calculator",
    "roi calculator",
  ],
  alternates: { canonical: "/tools/calculators" },
  openGraph: {
    title: "Free Online Calculators — EMI, BMI, Interest & More | ToolMint",
    description:
      "14 free calculators for finance, health, math and everyday calculations. No signup required.",
    url: "/tools/calculators",
  },
};

export default function CalculatorsPage() {
  const otherCategories = toolCategories.filter((c) => c.id !== "calculators" && c.id !== "more");

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/tools" className="text-sm transition hover:opacity-80" style={{ color: "var(--muted)" }}>
        ← All tools
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">
        {category.icon} {category.title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7" style={{ color: "var(--muted)" }}>
        {category.description}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {category.tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="rounded-xl border border-white/10 bg-white/[.02] p-4 transition hover:-translate-y-0.5 hover:border-white/20"
          >
            <h2 className="font-semibold text-foreground">{tool.name}</h2>
            <p className="mt-1 text-xs leading-5 text-muted">{tool.desc}</p>
          </Link>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
          Explore More Categories
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {otherCategories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.path}
              className="rounded-full px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            >
              {cat.icon} {cat.title}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
