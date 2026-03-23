import type { Metadata } from "next";
import Link from "next/link";
import JsonFormatterTool from "../../../components/json-formatter-tool";

export const metadata: Metadata = {
  title: "JSON Formatter — Beautify, Validate, Minify & Convert JSON | ToolCraft",
  description:
    "Free online JSON Formatter. Beautify, validate, minify, and convert JSON to XML, CSV, or YAML instantly in your browser.",
};

export default function JsonFormatterPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        JSON Formatter
      </h1>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-muted md:text-base">
        Beautify, validate, minify, and convert JSON with a responsive side-by-side workspace. Paste JSON, upload a file,
        adjust indentation, and export the formatted result in seconds.
      </p>

      <div className="mt-8">
        <JsonFormatterTool />
      </div>
    </main>
  );
}
