import Link from "next/link";

type BreadcrumbItem = {
  name: string;
  href?: string;
};

export default function ToolBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.href ? { item: `https://toolmint.tools${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className="mb-5">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={`${item.name}-${index}`} className="flex items-center gap-2">
                {item.href && !isLast ? (
                  <Link href={item.href} className="transition hover:text-foreground">
                    {item.name}
                  </Link>
                ) : (
                  <span className={isLast ? "text-foreground" : undefined}>{item.name}</span>
                )}
                {!isLast ? <span aria-hidden="true">/</span> : null}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
