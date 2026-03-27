import type { Metadata } from "next";
import Link from "next/link";
import PythonCodeEditorTool from "@/components/python-code-editor-tool-loader";

export const metadata: Metadata = {
  title: "Python Code Editor - Run Python in Your Browser | ToolCraft",
  description:
    "Free online Python code editor and runner. Write Python, provide input, and execute everything directly in your browser with client-side rendering only.",
};

export default function PythonCodeEditorPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Python Code Editor
      </h1>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-muted md:text-base">
        Write Python, provide standard input, and run code directly in your browser. This tool uses client-side rendering only.
      </p>

      <div className="mt-8">
        <PythonCodeEditorTool />
      </div>
    </main>
  );
}