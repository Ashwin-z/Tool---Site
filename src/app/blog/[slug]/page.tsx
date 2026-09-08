import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/lib/blog-posts";
import { getToolBySlug } from "@/lib/tool-categories";
import { clampDescription, stripBrand, withBrand } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  // Some metaTitle values already end in "| ToolMint"; the layout template
  // appends it too, so strip it here and let exactly one suffix through.
  const headline = stripBrand(post.metaTitle ?? post.title);
  const description = clampDescription(post.description);

  return {
    title: headline,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
    images: ["/opengraph-image"],
      title: withBrand(headline),
      description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const relatedTools = post.relatedToolSlugs
    .map((s) => getToolBySlug(s))
    .filter(Boolean) as NonNullable<ReturnType<typeof getToolBySlug>>[];

  const relatedPosts = (post.relatedPostSlugs ?? [])
    .map((s) => getBlogPost(s))
    .filter(Boolean) as NonNullable<ReturnType<typeof getBlogPost>>[];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { "@type": "Organization", name: "ToolMint", url: "https://toolmint.tools" },
    publisher: { "@type": "Organization", name: "ToolMint", url: "https://toolmint.tools" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://toolmint.tools/blog/${post.slug}` },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
        <nav className="text-xs" style={{ color: "var(--muted)" }}>
          <Link href="/" className="transition hover:opacity-80">Home</Link>
          <span className="mx-2 opacity-40">/</span>
          <Link href="/blog" className="transition hover:opacity-80">Blog</Link>
          <span className="mx-2 opacity-40">/</span>
          <span className="truncate">{post.title}</span>
        </nav>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#6c63ff]/15 px-2.5 py-0.5 text-xs font-medium text-[#bdb8ff]">
            {post.category}
          </span>
          <span className="text-xs" style={{ color: "var(--muted-2)" }}>
            {post.readTime} min read
          </span>
          <span className="text-xs" style={{ color: "var(--muted-2)" }}>
            {formatDate(post.publishedAt)}
          </span>
        </div>

        <h1 className="font-display mt-4 text-3xl font-bold leading-[1.15] tracking-[-0.02em] sm:text-4xl">
          {post.title}
        </h1>

        <p className="mt-4 text-base leading-7" style={{ color: "var(--muted)" }}>
          {post.intro}
        </p>

        <article className="mt-8 space-y-8">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                {section.heading}
              </h2>
              <p className="mt-3 text-sm leading-7" style={{ color: "var(--muted)" }}>
                {section.body}
              </p>
              {section.list && section.list.length > 0 ? (
                <ul className="mt-3 space-y-1.5 text-sm" style={{ color: "var(--muted)" }}>
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6c63ff]" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>

        {relatedTools.length > 0 ? (
          <section className="mt-12 rounded-2xl p-5" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <h2 className="font-display text-lg font-bold text-foreground">
              Try the tools mentioned in this guide
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="rounded-xl px-4 py-3 text-sm font-medium transition hover:-translate-y-0.5"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                >
                  <span className="font-semibold">{tool.name}</span>
                  <span className="mt-0.5 block text-xs" style={{ color: "var(--muted)" }}>{tool.desc}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <dl className="mt-5 space-y-5">
            {post.faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl p-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
                <dt className="font-semibold text-foreground">{faq.q}</dt>
                <dd className="mt-2 text-sm leading-6" style={{ color: "var(--muted)" }}>{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {relatedPosts.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              Related Guides
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group rounded-xl p-4 transition hover:-translate-y-0.5"
                  style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
                >
                  <h3 className="text-sm font-semibold text-foreground transition group-hover:text-[#8f86ff]">
                    {related.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5" style={{ color: "var(--muted)" }}>
                    {related.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="rounded-xl px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            All guides
          </Link>
          <Link
            href="/tools"
            className="rounded-xl px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            Browse all tools
          </Link>
        </div>
      </main>
    </>
  );
}