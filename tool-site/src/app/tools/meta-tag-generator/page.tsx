import type { Metadata } from "next";
import Link from "next/link";
import RelatedTools from "@/components/related-tools";
import OgTagGeneratorTool from "@/components/og-tag-generator-tool";

export const metadata: Metadata = {
  title: "Meta Tag Generator — Open Graph, Twitter Cards & Description Tags | ToolMint",
  description:
    "Generate and import SEO meta tags. Build Open Graph, Twitter card, title, and description tags, or auto-import existing tags from any public URL.",
  keywords: [
    "meta tag generator",
    "seo meta tags",
    "open graph generator",
    "twitter card generator",
    "meta description generator",
    "import meta tags from url",
  ],
  alternates: { canonical: "/tools/meta-tag-generator" },
  openGraph: {
    title: "Meta Tag Generator — Open Graph, Twitter Cards & Description Tags | ToolMint",
    description:
      "Create or import meta tags for social and SEO previews. Generate Open Graph and Twitter card tags instantly.",
    url: "/tools/meta-tag-generator",
  },
};

export default function MetaTagGeneratorPage() {
  return (
    <main className="seo-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
        Meta Tag Generator — OG, Twitter, and SEO Tags
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Generate Open Graph, Twitter card, title, and description tags in one place. You can also import
        existing metadata from a public URL to edit and regenerate clean tags quickly.
      </p>

      <div className="mt-8">
        <OgTagGeneratorTool />
      </div>

      <RelatedTools slug="meta-tag-generator" />
    </main>
  );
}
