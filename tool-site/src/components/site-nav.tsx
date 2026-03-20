"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useNavShell } from "@/components/nav-shell-context";

type Tool = { name: string; desc: string; href: string; badge?: "Hot" | "Top" | "New" | "Soon" };

type ToolSection = { heading: string; items: Tool[] };

type Category = {
  id: string;
  icon: string;
  name: string;
  subtitle: string;
  count: number;
  color: string;
  tools: Tool[];
  sections?: ToolSection[];
};

const categories: Category[] = [
  {
    id: "pdf",
    icon: "📄",
    name: "PDF Tools",
    subtitle: "17 free tools — compress, merge, split, crop and edit PDF files",
    count: 17,
    color: "bg-rose-400/15 text-rose-300",
    tools: [
      { name: "PDF Compressor", desc: "Reduce file size", href: "/tools/pdf-compressor", badge: "Hot" },
      { name: "PDF Merger", desc: "Combine multiple PDFs", href: "/tools/pdf-merger", badge: "Top" },
      { name: "PDF Splitter", desc: "Extract pages", href: "/tools/pdf-splitter" },
      { name: "Image to PDF", desc: "Bundle images into PDF", href: "/tools/image-to-pdf", badge: "New" },
      { name: "Word to PDF", desc: "Convert DOCX files", href: "/tools/word-to-pdf", badge: "New" },
      { name: "PowerPoint to PDF", desc: "Convert slides", href: "/tools/powerpoint-to-pdf", badge: "New" },
      { name: "Excel to PDF", desc: "Convert spreadsheets", href: "/tools/excel-to-pdf", badge: "New" },
      { name: "HTML to PDF", desc: "Save webpages as PDF", href: "/tools/html-to-pdf", badge: "New" },
      { name: "PDF to JPG", desc: "Convert pages to images", href: "/tools/pdf-to-jpg", badge: "New" },
      { name: "PDF to Word", desc: "Convert PDF to DOCX", href: "/tools/pdf-to-word", badge: "New" },
      { name: "PDF to PowerPoint", desc: "Convert PDF to PPTX", href: "/tools/pdf-to-powerpoint", badge: "New" },
      { name: "PDF to Excel", desc: "Convert PDF to XLSX", href: "/tools/pdf-to-excel", badge: "New" },
      { name: "PDF to PDF/A", desc: "Archive-ready PDF", href: "/tools/pdf-to-pdfa", badge: "New" },
    ],
    sections: [
      {
        heading: "Convert to PDF",
        items: [
          { name: "Image to PDF", desc: "Bundle images into PDF", href: "/tools/image-to-pdf", badge: "New" },
          { name: "Word to PDF", desc: "Convert DOCX files", href: "/tools/word-to-pdf", badge: "New" },
          { name: "PowerPoint to PDF", desc: "Convert slides", href: "/tools/powerpoint-to-pdf", badge: "New" },
          { name: "Excel to PDF", desc: "Convert spreadsheets", href: "/tools/excel-to-pdf", badge: "New" },
          { name: "HTML to PDF", desc: "Save webpages as PDF", href: "/tools/html-to-pdf", badge: "New" },
        ],
      },
      {
        heading: "Convert from PDF",
        items: [
          { name: "PDF to JPG", desc: "Convert pages to images", href: "/tools/pdf-to-jpg", badge: "New" },
          { name: "PDF to Word", desc: "Convert PDF to DOCX", href: "/tools/pdf-to-word", badge: "New" },
          { name: "PDF to PowerPoint", desc: "Convert PDF to PPTX", href: "/tools/pdf-to-powerpoint", badge: "New" },
          { name: "PDF to Excel", desc: "Convert PDF to XLSX", href: "/tools/pdf-to-excel", badge: "New" },
          { name: "PDF to PDF/A", desc: "Archive-ready PDF", href: "/tools/pdf-to-pdfa", badge: "New" },
        ],
      },
      {
        heading: "Edit PDF",
        items: [
          { name: "Rotate PDF", desc: "Turn pages left or right", href: "/tools/rotate-pdf", badge: "New" },
          { name: "Add page numbers", desc: "Number every page", href: "/tools/add-page-numbers", badge: "New" },
          { name: "Add watermark", desc: "Stamp text or logo", href: "/tools/add-watermark", badge: "New" },
          { name: "Crop PDF", desc: "Trim visible page area", href: "/tools/crop-pdf", badge: "New" },
          { name: "Edit PDF", desc: "Edit text and objects", href: "/tools/edit-pdf", badge: "New" },
        ],
      },
    ],
  },
  {
    id: "img",
    icon: "🖼️",
    name: "Image Tools",
    subtitle: "9 free tools — compress, resize and convert images",
    count: 9,
    color: "bg-sky-400/15 text-sky-300",
    tools: [
      { name: "Image Compressor", desc: "Compress JPG/PNG", href: "/tools/image-compressor", badge: "Hot" },
      { name: "Image Resizer", desc: "Resize to exact pixels", href: "/tools/image-resizer", badge: "Top" },
      { name: "Image Cropper", desc: "Crop by ratio", href: "/tools/image-cropper" },
      { name: "PNG to JPG", desc: "Convert format", href: "/tools/png-to-jpg" },
      { name: "JPG to PNG", desc: "Keep transparency", href: "/tools/jpg-to-png" },
    ],
  },
  {
    id: "txt",
    icon: "📝",
    name: "Text Tools",
    subtitle: "9 free tools for writers, editors and students",
    count: 9,
    color: "bg-emerald-400/15 text-emerald-300",
    tools: [
      { name: "Word Counter", desc: "Words, chars, read time", href: "/tools/word-counter", badge: "Hot" },
      { name: "Text Case Converter", desc: "UPPER / lower / Title", href: "/tools/text-case-converter", badge: "Top" },
      { name: "Text Reverser", desc: "Reverse any string", href: "/tools/text-reverser" },
      { name: "Whitespace Remover", desc: "Strip extra spaces", href: "/tools/whitespace-remover" },
      { name: "Grammar Checker", desc: "Fix spelling & grammar", href: "/tools/grammar-checker", badge: "New" },
      { name: "Plagiarism Checker", desc: "Detect copied content", href: "/tools/plagiarism-checker", badge: "Soon" },
      { name: "AI Content Detector", desc: "Human vs AI text", href: "/tools/ai-content-detector", badge: "Soon" },
    ],
  },
  {
    id: "cal",
    icon: "🔢",
    name: "Calculators",
    subtitle: "9 free calculators for math, health and finance",
    count: 9,
    color: "bg-amber-400/15 text-amber-300",
    tools: [
      { name: "Scientific Calculator", desc: "Full scientific calc", href: "/tools/scientific-calculator", badge: "New" },
      { name: "Percentage Calculator", desc: "X% of Y", href: "/tools/percentage-calculator", badge: "Hot" },
      { name: "Age Calculator", desc: "Exact age from DOB", href: "/tools/age-calculator", badge: "Top" },
      { name: "BMI Calculator", desc: "Metric + imperial", href: "/tools/bmi-calculator" },
      { name: "Loan EMI Calculator", desc: "Monthly payment + interest", href: "/tools/loan-emi-calculator" },
      { name: "Compound Interest Calculator", desc: "Investment growth", href: "/tools/compound-interest-calculator" },
    ],
  },
  {
    id: "dev",
    icon: "💻",
    name: "Developer Tools",
    subtitle: "9 free tools for coders and engineers",
    count: 9,
    color: "bg-violet-400/15 text-violet-300",
    tools: [
      { name: "JSON Formatter", desc: "Beautify & validate", href: "/tools/json-formatter", badge: "Hot" },
      { name: "Base64 Encoder/Decoder", desc: "Encode / decode", href: "/tools/base64-encoder-decoder", badge: "Top" },
      { name: "URL Encoder/Decoder", desc: "Encode URL chars", href: "/tools/url-encoder-decoder" },
      { name: "Password Generator", desc: "Strong passwords", href: "/tools/password-generator" },
    ],
  },
  {
    id: "seo",
    icon: "📊",
    name: "SEO Tools",
    subtitle: "9 free tools to improve search visibility",
    count: 9,
    color: "bg-cyan-400/15 text-cyan-300",
    tools: [
      { name: "Meta Tag Generator", desc: "Title, description, OG tags", href: "/tools/meta-tag-generator", badge: "Hot" },
      { name: "Sitemap Generator", desc: "Generate XML sitemap", href: "/tools/sitemap-generator", badge: "Top" },
      { name: "Robots.txt Generator", desc: "Build robots.txt", href: "/tools/robots-txt-generator" },
      { name: "Keyword Density", desc: "Check keyword %", href: "/tools/keyword-density-checker" },
      { name: "OG Tag Generator", desc: "Social preview tags", href: "/tools/og-tag-generator" },
    ],
  },
  {
    id: "con",
    icon: "🔄",
    name: "Converters",
    subtitle: "Unit and format conversion tools",
    count: 9,
    color: "bg-lime-400/15 text-lime-300",
    tools: [
      { name: "URL Encoder/Decoder", desc: "Encode special chars", href: "/tools/url-encoder-decoder", badge: "Top" },
      { name: "Random Number Generator", desc: "Generate random values", href: "/tools/random-number-generator", badge: "New" },
      { name: "Length Converter", desc: "km, mi, ft, cm", href: "/tools/length-converter" },
      { name: "Weight Converter", desc: "kg, lb, oz", href: "/tools/weight-converter" },
      { name: "Temperature Converter", desc: "°C, °F, Kelvin", href: "/tools/temperature-converter" },
    ],
  },
  {
    id: "mis",
    icon: "✨",
    name: "More Tools",
    subtitle: "Handy utilities for daily tasks",
    count: 6,
    color: "bg-fuchsia-400/15 text-fuchsia-300",
    tools: [
      { name: "Calorie Calculator", desc: "TDEE, BMR, macros", href: "/tools/calorie-calculator", badge: "New" },
      { name: "Stopwatch", desc: "Lap timer and countdown", href: "/tools/stopwatch" },
      { name: "Date Difference", desc: "Days between dates", href: "/tools/date-difference" },
      { name: "Color Converter", desc: "HEX ↔ RGB ↔ HSL", href: "/tools/color-converter" },
    ],
  },
];

const badgeClass: Record<NonNullable<Tool["badge"]>, string> = {
  Hot: "bg-rose-400/15 text-rose-300",
  Top: "bg-violet-400/15 text-violet-300",
  New: "bg-emerald-400/15 text-emerald-300",
  Soon: "bg-amber-400/15 text-amber-300",
};

export default function SiteNav() {
  const pathname = usePathname();
  const { navOpen } = useNavShell();
  const [activeCat, setActiveCat] = useState<string>("txt");
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({ txt: true });

  const categoryHasPath = useCallback(
    (category: Category, targetPath: string) => {
      const matchesTool = category.tools.some(
        (tool) => targetPath === tool.href || targetPath.startsWith(`${tool.href}/`),
      );

      const matchesSection = category.sections?.some((section) =>
        section.items.some(
          (tool) => targetPath === tool.href || targetPath.startsWith(`${tool.href}/`),
        ),
      );

      return matchesTool || matchesSection;
    },
    [],
  );

  const activeCategoryFromPath = useMemo(
    () =>
      categories.find((cat) => categoryHasPath(cat, pathname))?.id,
    [categoryHasPath, pathname],
  );

  const resolvedActiveCat = activeCategoryFromPath ?? activeCat;
  const activeCategory = categories.find((cat) => cat.id === resolvedActiveCat) ?? categories[0];

  return (
    <section
      className={`grid overflow-hidden border-b border-white/10 bg-[#111118] shadow-[0_20px_60px_rgba(0,0,0,.55)] transition-all duration-300 ${
        navOpen
          ? "h-[420px] md:h-[460px] grid-cols-1 lg:grid-cols-[260px_1fr] opacity-100"
          : "h-0 opacity-0"
      }`}
    >
      {/* ── Left sidebar ── */}
      <aside className="h-full overflow-y-auto border-r border-white/10 bg-[#17171f] p-3">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#55556d]">
          Categories
        </div>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isActive = resolvedActiveCat === cat.id;
            const isOpen = openSubmenus[cat.id] || activeCategoryFromPath === cat.id;
            return (
              <div key={cat.id}>
                <button
                  onClick={() => setActiveCat(cat.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${
                    isActive
                      ? "border-l-2 border-[#6c63ff] bg-[#6c63ff]/15 text-white"
                      : "text-[#9b9bb3] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className={`grid h-7 w-7 place-items-center rounded-md ${cat.color}`}>
                    {cat.icon}
                  </span>
                  <span>{cat.name}</span>
                  <span className="ml-auto rounded bg-[#111118] px-1.5 py-0.5 text-[10px] text-[#64647c]">
                    {cat.count}
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenSubmenus((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }));
                    }}
                    className={`rounded p-1 text-xs text-[#64647c] transition ${
                      isOpen ? "rotate-180 text-[#6c63ff]" : ""
                    }`}
                  >
                    ⌄
                  </span>
                </button>

                {isOpen && (
                  <div className="space-y-1 py-1 pl-10 pr-2">
                    {cat.sections ? (
                      cat.sections.map((section) => (
                        <div key={section.heading}>
                          <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#55556d]">
                            {section.heading}
                          </div>
                          {section.items.map((tool) => (
                            <Link
                              key={tool.name}
                              href={tool.href}
                              onClick={() => setActiveCat(cat.id)}
                              className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition ${
                                pathname === tool.href
                                  ? "bg-[#6c63ff]/15 text-[#beb8ff]"
                                  : "text-[#8f8fa8] hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <span className="h-1 w-1 rounded-full bg-current" />
                              {tool.name}
                            </Link>
                          ))}
                        </div>
                      ))
                    ) : (
                      cat.tools.slice(0, 5).map((tool) => (
                        <Link
                          key={tool.name}
                          href={tool.href}
                          onClick={() => setActiveCat(cat.id)}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition ${
                            pathname === tool.href
                              ? "bg-[#6c63ff]/15 text-[#beb8ff]"
                              : "text-[#8f8fa8] hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span className="h-1 w-1 rounded-full bg-current" />
                          {tool.name}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Right tool grid ── */}
      <div className="flex min-h-[280px] flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
          <div className={`grid h-10 w-10 place-items-center rounded-xl ${activeCategory.color}`}>
            {activeCategory.icon}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold tracking-tight">{activeCategory.name}</h3>
            <p className="text-xs text-[#9090aa]">{activeCategory.subtitle}</p>
          </div>
        </div>

        <div className="h-full overflow-y-auto p-4">
          {categories
            .filter((cat) => cat.id === resolvedActiveCat)
            .map((cat) => (
              <div key={cat.id} className="mb-5">
                {cat.sections ? (
                  /* ── Render general tools first, then each section with a heading ── */
                  <>
                    {/* General tools (compressor, merger, splitter — not in any section) */}
                    {(() => {
                      const sectionHrefs = new Set(cat.sections.flatMap((s) => s.items.map((t) => t.href)));
                      const generalTools = cat.tools.filter((t) => !sectionHrefs.has(t.href));
                      return generalTools.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {generalTools.map((tool) => (
                            <Link
                              key={tool.name}
                              href={tool.href}
                              className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition hover:-translate-y-0.5 ${
                                pathname === tool.href
                                  ? "border-[#6c63ff]/40 bg-[#1e1e28]"
                                  : "border-transparent hover:border-white/15 hover:bg-[#1e1e28]"
                              }`}
                            >
                              <span className={`grid h-8 w-8 place-items-center rounded-md ${cat.color}`}>
                                {cat.icon}
                              </span>
                              <div>
                                <div className="text-sm font-medium text-white">{tool.name}</div>
                                <div className="text-xs text-[#8f8fa8]">{tool.desc}</div>
                              </div>
                              {tool.badge && (
                                <span className={`ml-auto rounded px-2 py-0.5 text-[10px] font-bold uppercase ${badgeClass[tool.badge]}`}>
                                  {tool.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      ) : null;
                    })()}
                    {/* Sectioned tools */}
                    {cat.sections.map((section) => (
                      <div key={section.heading} className="mt-4">
                        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#6c63ff]">
                          {section.heading}
                        </h4>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {section.items.map((tool) => (
                            <Link
                              key={tool.name}
                              href={tool.href}
                              className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition hover:-translate-y-0.5 ${
                                pathname === tool.href
                                  ? "border-[#6c63ff]/40 bg-[#1e1e28]"
                                  : "border-transparent hover:border-white/15 hover:bg-[#1e1e28]"
                              }`}
                            >
                              <span className={`grid h-8 w-8 place-items-center rounded-md ${cat.color}`}>
                                {cat.icon}
                              </span>
                              <div>
                                <div className="text-sm font-medium text-white">{tool.name}</div>
                                <div className="text-xs text-[#8f8fa8]">{tool.desc}</div>
                              </div>
                              {tool.badge && (
                                <span className={`ml-auto rounded px-2 py-0.5 text-[10px] font-bold uppercase ${badgeClass[tool.badge]}`}>
                                  {tool.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {cat.tools.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition hover:-translate-y-0.5 ${
                          pathname === tool.href
                            ? "border-[#6c63ff]/40 bg-[#1e1e28]"
                            : "border-transparent hover:border-white/15 hover:bg-[#1e1e28]"
                        }`}
                      >
                        <span className={`grid h-8 w-8 place-items-center rounded-md ${cat.color}`}>
                          {cat.icon}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-white">{tool.name}</div>
                          <div className="text-xs text-[#8f8fa8]">{tool.desc}</div>
                        </div>
                        {tool.badge && (
                          <span
                            className={`ml-auto rounded px-2 py-0.5 text-[10px] font-bold uppercase ${badgeClass[tool.badge]}`}
                          >
                            {tool.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
