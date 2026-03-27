import type { Metadata } from "next";
import Link from "next/link";
import CodeSnippetTool from "@/components/code-snippet-tool";

export const metadata: Metadata = {
  title: "Code Snippet Playground — Live HTML, CSS & JS Preview | ToolCraft",
  description:
    "Free online code snippet playground. Write HTML, CSS, and JavaScript and see an instant live preview in your browser.",
};

export default function CodeSnippetPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Code Snippet Playground
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
        Paste or write HTML, CSS, and JavaScript in separate editors and view the rendered output instantly.
      </p>

      <div className="mt-8">
        <CodeSnippetTool />
      </div>
    </main>
  );
}