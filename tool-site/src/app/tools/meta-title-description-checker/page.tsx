import type { Metadata } from "next";
import Link from "next/link";
import MetaTitleDescriptionCheckerTool from "@/components/meta-title-description-checker-tool";

export const metadata: Metadata = {
  title: "Meta Title & Description Length Checker — Free SEO Snippet Tool",
  description:
    "Free Meta Title and Description Length Checker. Test title tag and meta description character counts, estimated pixel width, keyword presence, and Google SERP preview.",
};

export default function MetaTitleDescriptionCheckerPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Meta Title & Description Length Checker
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Check whether your SEO title tag and meta description are too short, too long, or in a strong range for search results.
        Includes live character count, estimated pixel width, keyword checks, and a Google-style snippet preview.
      </p>

      <div className="mt-8">
        <MetaTitleDescriptionCheckerTool />
      </div>
    </main>
  );
}
