import type { Metadata } from "next";
import Link from "next/link";
import { toolCategories } from "@/lib/tool-categories";

const category = toolCategories.find((c) => c.id === "converters")!;

export const metadata: Metadata = {
  title: "Free Online Unit Converters — Length, Weight, Temperature, File Size & Color",
  description:
    "6 free online converters on ToolMint. Convert length, weight, temperature, file size, colours and generate random numbers. Instant results, no signup required.",
  keywords: [
    "unit converter online",
    "length converter",
    "weight converter",
    "temperature converter",
    "file size converter",
    "color converter hex rgb",
    "random number generator",
  ],
  alternates: { canonical: "/tools/converters" },
  openGraph: {
    title: "Free Online Converters — Length, Weight, Temp & More | ToolMint",
    description:
      "6 free unit converters. Convert length, weight, temperature, file sizes and colours instantly.",
    url: "/tools/converters",
  },
};

export default function ConvertersPage() {
  const otherCategories = toolCategories.filter((c) => c.id !== "converters" && c.id !== "more");

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
