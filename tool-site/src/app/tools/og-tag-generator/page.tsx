import type { Metadata } from "next";
import OgTagGeneratorTool from "@/components/og-tag-generator-tool";

export const metadata: Metadata = {
  title: "OG Tag Generator – Generate Open Graph & Twitter Meta Tags | ToolCraft",
  description:
    "Free OG tag generator. Create Open Graph and Twitter Card meta tags with a live social media preview. Copy-paste ready HTML for perfect link previews.",
};

export default function OgTagGeneratorPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          OG Tag Generator
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
          Generate Open Graph &amp; Twitter Card meta tags with a live social preview.
        </p>
      </div>
      <OgTagGeneratorTool />
    </main>
  );
}
