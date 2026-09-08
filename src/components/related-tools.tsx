import Link from "next/link";
import { getCategoryForSlug, getRelatedTools } from "@/lib/tool-categories";

export default function RelatedTools({ slug }: { slug: string }) {
  const related = getRelatedTools(slug, 5);
  const category = getCategoryForSlug(slug);

  if (related.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Related Tools
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="rounded-xl border border-white/10 bg-white/[.02] p-4 transition hover:-translate-y-0.5 hover:border-white/20"
          >
            <h3 className="font-semibold text-foreground">{tool.name}</h3>
            <p className="mt-1 text-xs leading-5 text-muted">{tool.desc}</p>
          </Link>
        ))}
      </div>
      {category?.path ? (
        <div className="mt-4">
          <Link
            href={category.path}
            className="text-sm font-medium text-[#6c63ff] transition hover:underline"
          >
            View all {category.title} →
          </Link>
        </div>
      ) : null}
    </section>
  );
}
