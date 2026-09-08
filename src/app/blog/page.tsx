import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: { absolute: "Free Online Tool Guides, Tips & How-Tos – ToolMint Blog" },
  description:
    "Step-by-step guides for PDF tools, image editing, calculators, SEO, developer utilities, converters, and more. Written for people who need a clear answer fast.",
  keywords: [
    "free online tool guides",
    "pdf tips and tricks",
    "how to compress pdf",
    "image editing tutorials",
    "calculator how to guides",
    "seo tools guide",
    "developer tools tutorials",
    "toolmint blog",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Free Online Tool Guides, Tips & How-Tos | ToolMint Blog",
    description:
      "Step-by-step guides for PDF tools, image editing, calculators, SEO, developer utilities, and more. No fluff — clear answers fast.",
    url: "/blog",
  },
};

const categoryColors: Record<string, string> = {
  "PDF Tools": "bg-[#6c63ff]/15 text-[#bdb8ff]",
  "Image Tools": "bg-emerald-500/15 text-emerald-300",
  "Text Tools": "bg-amber-500/15 text-amber-300",
  "text-tools": "bg-amber-500/15 text-amber-300",
  Calculators: "bg-sky-500/15 text-sky-300",
  "Developer Tools": "bg-rose-500/15 text-rose-300",
  "SEO Tools": "bg-orange-500/15 text-orange-300",
  converters: "bg-lime-500/15 text-lime-300",
  more: "bg-fuchsia-500/15 text-fuchsia-300",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndexPage() {
  const sorted = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "ToolMint Blog",
    description: "Step-by-step guides for PDF tools, image editing, calculators, SEO, developer utilities, converters, and more.",
    url: "https://toolmint.tools/blog",
    blogPost: sorted.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `https://toolmint.tools/blog/${post.slug}`,
      datePublished: post.publishedAt,
      description: post.description,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />
      <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <nav className="text-xs" style={{ color: "var(--muted)" }}>
          <Link href="/" className="transition hover:opacity-80">Home</Link>
          <span className="mx-2 opacity-40">/</span>
          <span>Blog</span>
        </nav>

        <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">
          Free Online Tool Guides &amp; How-Tos
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7" style={{ color: "var(--muted)" }}>
          Step-by-step guides for PDF tools, image editing, calculators, SEO, developer utilities,
          converters, and more. Written for people who need a clear answer fast.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((post) => {
            const colorClass = categoryColors[post.category] ?? "bg-white/10 text-white/60";
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl p-5 transition hover:-translate-y-0.5"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
                    {post.category}
                  </span>
                  <span className="text-xs" style={{ color: "var(--muted-2)" }}>
                    {post.readTime} min read
                  </span>
                </div>
                <h2 className="font-display mt-3 text-base font-bold leading-snug tracking-tight text-foreground transition group-hover:text-[#8f86ff]">
                  {post.title}
                </h2>
                <p className="mt-2 flex-1 text-xs leading-5" style={{ color: "var(--muted)" }}>
                  {post.excerpt}
                </p>
                <p className="mt-4 text-xs" style={{ color: "var(--muted-2)" }}>
                  {formatDate(post.publishedAt)}
                </p>
              </Link>
            );
          })}
        </div>

        <section className="mt-16 rounded-2xl p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <h2 className="font-display text-xl font-bold text-foreground">
            Looking for a tool, not a guide?
          </h2>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--muted)" }}>
            Every article links directly to the relevant tool so you can go from reading to doing in one click.
          </p>
          <Link
            href="/tools"
            className="mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            style={{ background: "var(--accent)" }}
          >
            Browse all tools
          </Link>
        </section>
      </main>
    </>
  );
}