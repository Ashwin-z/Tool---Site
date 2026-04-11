import type { Metadata } from "next";
import Link from "next/link";
import { toolCategories } from "@/lib/tool-categories";

const category = toolCategories.find((c) => c.id === "pdf")!;

export const metadata: Metadata = {
  title: "Free Online PDF Tools — Compress, Merge, Split, Convert & Edit PDFs",
  description:
    "24 free online PDF tools on ToolMint. Compress, merge, split, rotate, edit, sign, redact PDFs and convert between PDF, Word, Excel, PowerPoint, JPG and more. No signup required.",
  keywords: [
    "pdf tools online",
    "free pdf tools",
    "compress pdf online",
    "merge pdf online",
    "split pdf online",
    "pdf to word",
    "word to pdf",
    "pdf editor online free",
    "pdf converter",
  ],
  alternates: { canonical: "/tools/pdf-tools" },
  openGraph: {
    title: "Free Online PDF Tools — Compress, Merge, Convert & Edit | ToolMint",
    description:
      "24 free browser-based PDF tools. Compress, merge, split, convert and edit PDFs with no signup and no watermark.",
    url: "/tools/pdf-tools",
  },
};

export default function PdfToolsPage() {
  const otherCategories = toolCategories.filter((c) => c.id !== "pdf" && c.id !== "more");

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
