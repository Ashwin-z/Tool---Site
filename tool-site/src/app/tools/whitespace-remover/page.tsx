import type { Metadata } from "next";
import Link from "next/link";
import WhitespaceRemoverTool from "@/components/whitespace-remover-tool";

export const metadata: Metadata = {
  title: "Whitespace Remover — Remove Extra Spaces, Blank Lines & Tabs",
  description:
    "Free online Whitespace Remover. Trim leading/trailing spaces, collapse extra spaces, remove blank lines, convert tabs and more. Includes live word counter.",
};

export default function WhitespaceRemoverPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="mb-5 inline-block text-sm text-[#9b9bb3] transition hover:text-white">
        ← Back to home
      </Link>

      <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-white md:text-5xl">
        Whitespace Remover
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9b9bb3] md:text-base">
        Remove extra spaces, trim whitespace, delete blank lines, and convert tabs to spaces.
        Toggle multiple cleanup modes at once. Live character and word counter included.
      </p>

      <div className="mt-8">
        <WhitespaceRemoverTool />
      </div>
    </main>
  );
}
