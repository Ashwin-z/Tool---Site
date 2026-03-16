import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sitemap | ToolCraft",
  description: "Browse all key pages and tools on ToolCraft.",
};

const links = [
  { label: "Home", href: "/" },
  { label: "All Tools", href: "/tools" },
  { label: "Word Counter", href: "/tools/word-counter" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact", href: "/contact" },
  { label: "XML Sitemap", href: "/sitemap.xml" },
];

export default function SiteMapPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 text-[#eeeef5]">
      <Link href="/" className="text-sm text-[#9b9bb3] transition hover:text-white">
        ← Back to home
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">Sitemap</h1>
      <p className="mt-3 text-sm leading-7 text-[#9b9bb3]">Quick links to important pages on ToolCraft.</p>

      <ul className="mt-8 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-[#b3adff] transition hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
