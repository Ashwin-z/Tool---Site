import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "All Tools | ToolCraft",
  description: "Browse all available and upcoming tools on ToolCraft.",
};

const tools = [
  ["Word Counter", "/tools/word-counter"],
  ["Scientific Calculator", "/tools/scientific-calculator"],
  ["Percentage Calculator", "/tools/percentage-calculator"],
  ["Age Calculator", "/tools/age-calculator"],
  ["JSON Formatter", "/tools/json-formatter"],
  ["Text Case Converter", "/tools/text-case-converter"],
  ["Text Reverser", "/tools/text-reverser"],
  ["Whitespace Remover", "/tools/whitespace-remover"],
  ["Grammar Checker", "/tools/grammar-checker"],
  ["BMI Calculator", "/tools/bmi-calculator"],
  ["Loan EMI Calculator", "/tools/loan-emi-calculator"],
  ["Password Generator", "/tools/password-generator"],
  ["Base64 Encoder/Decoder", "/tools/base64-encoder-decoder"],
  ["Image Compressor", "/tools/image-compressor"],
  ["Calorie Calculator", "/tools/calorie-calculator"],
  ["URL Encoder/Decoder", "/tools/url-encoder-decoder"],
  ["Random Number Generator", "/tools/random-number-generator"],
  ["Meta Tag Generator", "/tools/meta-tag-generator"],
  ["Compound Interest Calculator", "/tools/compound-interest-calculator"],
] as const;

export default function ToolsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12 text-[#eeeef5]">
      <Link href="/" className="text-sm text-[#9b9bb3] transition hover:text-white">
        ← Back to home
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">All Tools</h1>
      <p className="mt-3 text-sm leading-7 text-[#9b9bb3]">These are your planned tools. Word Counter is live, others can be launched next.</p>

      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {tools.map(([name, href]) => (
          <Link key={href} href={href} className="rounded-xl border border-white/10 bg-[#111118] p-4 text-sm transition hover:border-[#6c63ff]/40 hover:bg-[#17171f]">
            {name}
          </Link>
        ))}
      </div>
    </main>
  );
}
