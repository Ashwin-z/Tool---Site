import type { Metadata } from "next";
import Link from "next/link";
import { toolCategories } from "@/lib/tool-categories";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Browse important pages, categories, and featured tools on ToolMint.",
};

const coreLinks = [
  { label: "Home", href: "/" },
  { label: "All Tools", href: "/tools" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "XML Sitemap", href: "/sitemap.xml" },
];

export default function SiteMapPage() {
  const categoryLinks = toolCategories.filter((category) => category.path);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12 text-foreground">
      <Link href="/" className="text-sm text-muted transition hover:text-foreground">
        â† Back to home
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">Sitemap</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
        Quick links to the main sections of ToolMint, including policy pages, category hubs, and a selection of live tools.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Core Pages</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {coreLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-accent-light transition hover:text-foreground">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Tool Categories</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categoryLinks.map((category) => (
            <div key={category.id} className="rounded-2xl border border-white/10 bg-white/[.02] p-5">
              <Link href={category.path!} className="font-semibold text-foreground transition hover:text-accent-light">
                {category.icon} {category.title}
              </Link>
              <p className="mt-2 text-sm leading-6 text-muted">{category.description}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {category.tools.slice(0, 4).map((tool) => (
                  <li key={tool.slug}>
                    <Link href={`/tools/${tool.slug}`} className="text-accent-light transition hover:text-foreground">
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
