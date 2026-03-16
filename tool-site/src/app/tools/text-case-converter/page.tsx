import type { Metadata } from "next";
import Link from "next/link";
import TextCaseConverterTool from "@/components/text-case-converter-tool";

export const metadata: Metadata = {
  title: "Text Case Converter — Change Text to UPPER, lower, Title & More",
  description:
    "Free online Text Case Converter. Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case and kebab-case instantly. Includes live word counter.",
};

export default function TextCaseConverterPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-[#9b9bb3] transition hover:text-white">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Text Case Converter
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9b9bb3] md:text-base">
        Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case and kebab-case.
        Live word, character and sentence counter included.
      </p>

      <div className="mt-8">
        <TextCaseConverterTool />
      </div>
    </main>
  );
}
