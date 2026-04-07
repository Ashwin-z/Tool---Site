import type { Metadata } from "next";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
};

const titleFromSlug = (slug: string) =>
  slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${titleFromSlug(slug)} | ToolMint`,
    description: `${titleFromSlug(slug)} is coming soon on ToolMint.`,
  };
}

export default async function ToolPlaceholderPage({ params }: Props) {
  const { slug } = await params;
  const toolName = titleFromSlug(slug);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 text-foreground">
      <Link href="/tools" className="text-sm text-muted transition hover:text-foreground">
        ← Back to tools
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">{toolName}</h1>
      <p className="mt-3 text-sm leading-7 text-muted">This tool page is ready and will be fully implemented soon.</p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6 text-sm text-foreground/75">
        <p>✅ Route created</p>
        <p>✅ SEO metadata attached</p>
        <p>⏳ Tool logic is coming in the next build step.</p>
      </div>
    </main>
  );
}
