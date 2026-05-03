import Link from "next/link";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import { categoryHubContent } from "@/lib/category-hub-content";
import { toolCategories } from "@/lib/tool-categories";

type ToolCategoryHubProps = {
  categoryId: string;
};

export default function ToolCategoryHub({ categoryId }: ToolCategoryHubProps) {
  const category = toolCategories.find((entry) => entry.id === categoryId);
  const content = categoryHubContent[categoryId];

  if (!category || !content) {
    return null;
  }

  const otherCategories = toolCategories.filter(
    (entry): entry is (typeof toolCategories)[number] & { path: string } =>
      entry.id !== categoryId && entry.id !== "more" && Boolean(entry.path),
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <ToolBreadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Tools", href: "/tools" },
          { name: category.title },
        ]}
      />

      <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-[-0.02em]">
        {category.icon} {category.title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7" style={{ color: "var(--muted)" }}>
        {category.description}
      </p>

      <div className="mt-6 space-y-4 text-sm leading-7" style={{ color: "var(--muted)" }}>
        {content.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

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

      {content.workflows?.length ? (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Popular Workflow Paths
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {content.workflows.map((workflow) => (
              <article key={workflow.title} className="rounded-2xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{workflow.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{workflow.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {workflow.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-white/20 hover:bg-white/[.05]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          What You Can Do In This Category
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {content.highlights.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[.02] p-5">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Frequently Asked Questions
        </h2>
        <dl className="mt-6 space-y-6">
          {content.faqs.map((item) => (
            <div key={item.q}>
              <dt className="font-semibold text-foreground">{item.q}</dt>
              <dd className="mt-1 text-sm leading-6 text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
          Explore More Categories
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {otherCategories.map((entry) => (
            <Link
              key={entry.id}
              href={entry.path}
              className="rounded-full px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              {entry.icon} {entry.title}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
