import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sitemap | ToolMint",
  description: "Browse all key pages and tools on ToolMint.",
};

const links = [
  { label: "Home", href: "/" },
  { label: "All Tools", href: "/tools" },
  { label: "About", href: "/about" },
  { label: "Word Counter", href: "/tools/word-counter" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Contact", href: "/contact" },
  { label: "XML Sitemap", href: "/sitemap.xml" },
  { label: "Disclaimer", href: "/disclaimer" },
];

export default function SiteMapPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 text-foreground">
      <Link href="/" className="text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">Sitemap</h1>
      <p className="mt-3 text-sm leading-7 text-muted">Quick links to important pages on ToolMint.</p>

      <ul className="mt-8 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-accent-light transition hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
