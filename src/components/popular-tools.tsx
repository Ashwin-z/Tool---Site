import Link from "next/link";
import { toolCategories } from "@/lib/tool-categories";

const popularTools = [
  { icon: "\u{1F4CA}", name: "Word Counter", desc: "Live word, character and reading-time counter for any text.", tag: "Hot", href: "/tools/word-counter" },
  { icon: "%", name: "Percentage Calculator", desc: "Find percentages, increases, decreases, and differences.", tag: "Popular", href: "/tools/percentage-calculator" },
  { icon: "{ }", name: "JSON Formatter", desc: "Beautify, validate, and minify JSON with one click.", tag: "Hot", href: "/tools/json-formatter" },
  { icon: "\u{1F382}", name: "Age Calculator", desc: "Exact age in years, months, and days from your birth date.", tag: "Popular", href: "/tools/age-calculator" },
  { icon: "\u{1F5BC}\u{FE0F}", name: "Image Compressor", desc: "Compress PNG and JPG without noticeable quality loss.", tag: "Popular", href: "/tools/image-compressor" },
  { icon: "\u{2696}\u{FE0F}", name: "BMI Calculator", desc: "Body Mass Index with metric and imperial support.", tag: "New", href: "/tools/bmi-calculator" },
  { icon: "\u{1F4C4}", name: "Compress PDF", desc: "Reduce PDF size while keeping the best quality possible.", tag: "Popular", href: "/tools/compress-pdf" },
  { icon: "\u{1F9E9}", name: "Merge PDF", desc: "Merge up to 25 PDFs and rearrange them before download.", tag: "New", href: "/tools/merge-pdf" },
  { icon: "\u{2702}\u{FE0F}", name: "Split PDF", desc: "Split one PDF by range, fixed intervals, or selected pages.", tag: "New", href: "/tools/split-pdf" },
  { icon: "\u{1F504}", name: "Rotate PDF", desc: "Rotate PDF pages left or right with a live preview.", tag: "New", href: "/tools/rotate-pdf" },
  { icon: "\u{1F5BC}\u{FE0F}", name: "Image to PDF", desc: "Combine up to 25 image files into a single PDF.", tag: "New", href: "/tools/image-to-pdf" },
  { icon: "\u{1F3E6}", name: "EMI Calculator", desc: "Monthly loan installments with full interest breakdown.", tag: "Hot", href: "/tools/loan-emi-calculator" },
  { icon: "\u{1F511}", name: "Password Generator", desc: "Create strong, secure passwords with custom rules.", tag: "New", href: "/tools/password-generator" },
  { icon: "\u{1F524}", name: "Case Converter", desc: "Switch between UPPER, lower, Title, and camelCase.", tag: "Popular", href: "/tools/text-case-converter" },
  { icon: "\u{1F510}", name: "Base64 Encoder", desc: "Encode and decode Base64 strings instantly.", tag: "Hot", href: "/tools/base64-encoder-decoder" },
  { icon: "\u{270F}\u{FE0F}", name: "Grammar Checker", desc: "Find and fix spelling, grammar, and punctuation errors.", tag: "New", href: "/tools/grammar-checker" },
];

export default function PopularTools() {
  const totalTools = toolCategories.reduce((sum, category) => sum + category.tools.length, 0);

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="font-display text-2xl font-bold">Popular Tools</h2>
        <Link href="/tools" className="text-sm font-medium text-[#8f86ff] transition hover:text-[#aca7ff]">
          View all {totalTools} tools
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {popularTools.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="rounded-xl p-4 transition hover:-translate-y-1"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface-1)",
            }}
          >
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#6c63ff]/15 text-lg text-[#a39cff]">
              {item.icon}
            </div>
            <h3 className="font-display text-base font-bold">{item.name}</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--muted-2)" }}>{item.desc}</p>
            <span
              className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                item.tag === "Hot"
                  ? "bg-rose-400/15 text-rose-300"
                  : item.tag === "Popular"
                    ? "bg-violet-400/15 text-violet-300"
                    : "bg-emerald-400/15 text-emerald-300"
              }`}
            >
              {item.tag}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
