"use client";

import Link from "next/link";

const popularTools = [
  { icon: "📊", name: "Word Counter", desc: "Live word, character & reading time counter for any text.", tag: "Hot", href: "/tools/word-counter" },
  { icon: "%", name: "Percentage Calculator", desc: "Find percentages, increases, decreases and differences.", tag: "Popular", href: "/tools/percentage-calculator" },
  { icon: "{ }", name: "JSON Formatter", desc: "Beautify, validate and minify JSON with one click.", tag: "Hot", href: "/tools/json-formatter" },
  { icon: "🎂", name: "Age Calculator", desc: "Exact age in years, months, days from your date of birth.", tag: "Popular", href: "/tools/age-calculator" },
  { icon: "🗜️", name: "Image Compressor", desc: "Compress PNG and JPG without noticeable quality loss.", tag: "Popular", href: "/tools/image-compressor" },
  { icon: "⚖️", name: "BMI Calculator", desc: "Body Mass Index with metric and imperial support.", tag: "New", href: "/tools/bmi-calculator" },
  { icon: "📄", name: "PDF Compressor", desc: "Reduce PDF size while keeping the best quality possible.", tag: "Popular", href: "/tools/pdf-compressor" },
  { icon: "🧩", name: "PDF Merger", desc: "Merge up to 25 PDFs and rearrange them before download.", tag: "New", href: "/tools/pdf-merger" },
  { icon: "✂️", name: "PDF Splitter", desc: "Split one PDF by range, fixed intervals, or selected pages.", tag: "New", href: "/tools/pdf-splitter" },
  { icon: "🔄", name: "Rotate PDF", desc: "Rotate PDF pages left or right with a live preview.", tag: "New", href: "/tools/rotate-pdf" },
  { icon: "🖼️", name: "Image to PDF", desc: "Combine up to 25 image files into a single PDF.", tag: "New", href: "/tools/image-to-pdf" },
  { icon: "📝", name: "Word to PDF", desc: "Convert DOCX files to PDF in your browser.", tag: "New", href: "/tools/word-to-pdf" },
  { icon: "🏦", name: "EMI Calculator", desc: "Monthly loan installments with full interest breakdown.", tag: "Hot", href: "/tools/loan-emi-calculator" },
  { icon: "🔑", name: "Password Generator", desc: "Create strong, secure passwords with custom rules.", tag: "New", href: "/tools/password-generator" },
  { icon: "🔤", name: "Case Converter", desc: "Switch between UPPER, lower, Title and camelCase.", tag: "Popular", href: "/tools/text-case-converter" },
  { icon: "🔐", name: "Base64 Encoder", desc: "Encode and decode Base64 strings instantly.", tag: "Hot", href: "/tools/base64-encoder-decoder" },
  { icon: "✏️", name: "Grammar Checker", desc: "Find and fix spelling, grammar & punctuation errors.", tag: "New", href: "/tools/grammar-checker" },
];

export default function PopularTools() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="font-display text-2xl font-bold">🔥 Most Popular Tools</h2>
        <Link href="/tools" className="text-sm font-medium text-[#8f86ff] transition hover:text-[#aca7ff]">
          View all 64 →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {popularTools.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="rounded-xl border border-white/10 bg-[#111118] p-4 transition hover:-translate-y-1 hover:border-[#6c63ff]/40 hover:bg-[#17171f]"
          >
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#6c63ff]/15 text-lg text-[#a39cff]">
              {item.icon}
            </div>
            <h3 className="font-display text-base font-bold">{item.name}</h3>
            <p className="mt-1 text-sm text-[#8f8fa8]">{item.desc}</p>
            <span
              className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                item.tag === "Hot"
                  ? "bg-rose-400/15 text-rose-300"
                  : item.tag === "Popular"
                    ? "bg-violet-400/15 text-violet-300"
                    : "bg-emerald-400/15 text-emerald-300"
              }`}
            >
              {item.tag === "Hot" ? "🔥 Hot" : item.tag === "Popular" ? "⭐ Popular" : "✨ New"}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
