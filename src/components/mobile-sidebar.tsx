"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useNavShell } from "@/components/nav-shell-context";
import BrandMark from "@/components/brand-mark";

type Tool = { name: string; desc: string; href: string; badge?: "Hot" | "Top" | "New" };
type ToolSection = { heading: string; items: Tool[] };
type Category = {
  id: string;
  icon: string;
  name: string;
  count: number;
  color: string;
  tools: Tool[];
  sections?: ToolSection[];
};

const badgeClass: Record<NonNullable<Tool["badge"]>, string> = {
  Hot: "bg-rose-400/15 text-rose-300",
  Top: "bg-violet-400/15 text-violet-300",
  New: "bg-emerald-400/15 text-emerald-300",
};

const pdfSections: ToolSection[] = [
  {
    heading: "Organize & Compress",
    items: [
      { name: "Compress PDF", desc: "Reduce file size", href: "/tools/compress-pdf", badge: "Hot" },
      { name: "Merge PDF", desc: "Combine multiple PDFs", href: "/tools/merge-pdf", badge: "Top" },
      { name: "Split PDF", desc: "Extract pages", href: "/tools/split-pdf" },
    ],
  },
  {
    heading: "Convert to PDF",
    items: [
      { name: "Image to PDF", desc: "Bundle images into PDF", href: "/tools/image-to-pdf", badge: "New" },
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
      { name: "PDF to Text (OCR)", desc: "Extract text from scanned PDFs", href: "/tools/pdf-to-text", badge: "New" },
    ],
  },
  {
    heading: "Edit PDF",
    items: [
      { name: "Rotate PDF", desc: "Turn pages left or right", href: "/tools/rotate-pdf", badge: "New" },
      { name: "Add Page Numbers", desc: "Number every page", href: "/tools/add-page-numbers-to-pdf", badge: "New" },
      { name: "Add Watermark", desc: "Stamp text or logo", href: "/tools/add-watermark-to-pdf", badge: "New" },
      { name: "Crop PDF", desc: "Trim visible page area", href: "/tools/crop-pdf", badge: "New" },
      { name: "Edit PDF", desc: "Edit text and objects", href: "/tools/edit-pdf", badge: "New" },
    ],
  },
  {
    heading: "PDF Security",
    items: [
      { name: "Protect PDF", desc: "Lock with password", href: "/tools/protect-pdf", badge: "New" },
      { name: "Unlock PDF", desc: "Remove password", href: "/tools/unlock-pdf", badge: "New" },
      { name: "Sign PDF", desc: "Add signatures", href: "/tools/sign-pdf", badge: "New" },
      { name: "Redact PDF", desc: "Hide sensitive content", href: "/tools/redact-pdf", badge: "New" },
      { name: "Compare PDF", desc: "Review differences", href: "/tools/compare-pdf", badge: "New" },
    ],
  },
];

const categories: Category[] = [
  {
    id: "pdf",
    icon: "\u{1F4C4}",
    name: "PDF Tools",
    count: 24,
    color: "bg-rose-400/15 text-rose-300",
    tools: [],
    sections: pdfSections,
  },
  {
    id: "img",
    icon: "\u{1F5BC}\u{FE0F}",
    name: "Image Tools",
    count: 9,
    color: "bg-sky-400/15 text-sky-300",
    tools: [
      { name: "Image Compressor", desc: "Compress JPG, PNG, and WebP", href: "/tools/image-compressor", badge: "Hot" },
      { name: "Image Resizer", desc: "Resize to exact pixels", href: "/tools/image-resizer", badge: "Top" },
      { name: "Image Cropper", desc: "Crop by ratio", href: "/tools/image-cropper", badge: "New" },
      { name: "JPG to PDF", desc: "Turn JPG images into PDFs", href: "/tools/image-to-pdf", badge: "New" },
      { name: "PNG to JPG", desc: "Convert PNG files to JPEG", href: "/tools/png-to-jpg", badge: "New" },
      { name: "JPG to PNG", desc: "Keep transparency", href: "/tools/jpg-to-png", badge: "New" },
      { name: "Image Converter", desc: "Convert PNG, JPG, WebP, BMP, and GIF", href: "/tools/image-converter", badge: "New" },
      { name: "Image Rotate/Flip", desc: "Rotate and mirror images", href: "/tools/image-rotate-flip", badge: "New" },
      { name: "Image to Text (OCR)", desc: "Extract text from images", href: "/tools/image-to-text", badge: "New" },
    ],
  },
  {
    id: "txt",
    icon: "\u{1F4DD}",
    name: "Text Tools",
    count: 7,
    color: "bg-emerald-400/15 text-emerald-300",
    tools: [
      { name: "Word Counter", desc: "Words, chars, read time", href: "/tools/word-counter", badge: "Hot" },
      { name: "Text Case Converter", desc: "UPPER / lower / Title", href: "/tools/text-case-converter", badge: "Top" },
      { name: "Text Compare", desc: "Diff two texts side by side", href: "/tools/text-compare", badge: "New" },
      { name: "Text Reverser", desc: "Reverse any string", href: "/tools/text-reverser" },
      { name: "Whitespace Remover", desc: "Strip extra spaces", href: "/tools/whitespace-remover" },
      { name: "Number to Words", desc: "Spell out any number", href: "/tools/number-to-words", badge: "New" },
      { name: "Grammar Checker", desc: "Fix spelling and grammar", href: "/tools/grammar-checker", badge: "New" },
    ],
  },
  {
    id: "cal",
    icon: "\u{1F522}",
    name: "Calculators",
    count: 15,
    color: "bg-amber-400/15 text-amber-300",
    tools: [
      { name: "Scientific Calculator", desc: "Full scientific calc", href: "/tools/scientific-calculator", badge: "New" },
      { name: "Percentage Calculator", desc: "X% of Y", href: "/tools/percentage-calculator", badge: "Hot" },
      { name: "Age Calculator", desc: "Exact age from DOB", href: "/tools/age-calculator", badge: "Top" },
      { name: "BMI Calculator", desc: "Metric + imperial", href: "/tools/bmi-calculator" },
      { name: "Loan EMI Calculator", desc: "Monthly payment + interest", href: "/tools/loan-emi-calculator" },
      { name: "Compound Interest Calculator", desc: "Investment growth", href: "/tools/compound-interest-calculator" },
      { name: "Profit Margin Calculator", desc: "Margin, markup, and net profit", href: "/tools/profit-margin-calculator", badge: "New" },
      { name: "ROI Calculator", desc: "Return on investment + CAGR", href: "/tools/roi-calculator", badge: "New" },
      { name: "GST / Sales Tax Calculator", desc: "Add or remove tax instantly", href: "/tools/gst-calculator", badge: "New" },
      { name: "Break-even Calculator", desc: "Units and revenue to break even", href: "/tools/breakeven-calculator", badge: "New" },
      { name: "GPA Calculator", desc: "GPA with custom grading scales", href: "/tools/gpa-calculator", badge: "New" },
      { name: "Work Hours Calculator", desc: "Track weekly hours and pay", href: "/tools/work-hours-calculator", badge: "New" },
      { name: "Calorie Calculator", desc: "TDEE, BMR, and macro estimates", href: "/tools/calorie-calculator", badge: "New" },
      { name: "Tip Calculator", desc: "Split bills and calculate tips", href: "/tools/tip-calculator", badge: "New" },
      { name: "Palworld Breeding Calculator", desc: "Pal breeding results", href: "/tools/palworld-breeding-calculator", badge: "New" },
    ],
  },
  {
    id: "dev",
    icon: "\u{1F4BB}",
    name: "Developer Tools",
    count: 6,
    color: "bg-violet-400/15 text-violet-300",
    tools: [
      { name: "JSON Formatter", desc: "Beautify and validate", href: "/tools/json-formatter", badge: "Hot" },
      { name: "Code Snippet Playground", desc: "Live HTML/CSS/JS preview", href: "/tools/code-snippet", badge: "New" },
      { name: "Python Code Editor", desc: "Run Python in browser", href: "/tools/python-code-editor", badge: "New" },
      { name: "Base64 Encoder/Decoder", desc: "Encode / decode", href: "/tools/base64-encoder-decoder", badge: "Top" },
      { name: "URL Encoder/Decoder", desc: "Encode URL chars", href: "/tools/url-encoder-decoder" },
      { name: "Password Generator", desc: "Strong passwords", href: "/tools/password-generator" },
    ],
  },
  {
    id: "seo",
    icon: "\u{1F4CA}",
    name: "SEO Tools",
    count: 6,
    color: "bg-cyan-400/15 text-cyan-300",
    tools: [
      { name: "Meta Tag Generator", desc: "Title, description, OG tags", href: "/tools/meta-tag-generator", badge: "Hot" },
      { name: "Meta Title & Description Checker", desc: "Check snippet length", href: "/tools/meta-title-description-checker", badge: "New" },
      { name: "Sitemap Generator", desc: "Generate XML sitemap", href: "/tools/sitemap-generator", badge: "Top" },
      { name: "Robots.txt Generator", desc: "Build robots.txt", href: "/tools/robots-txt-generator" },
      { name: "Keyword Density", desc: "Check keyword %", href: "/tools/keyword-density", badge: "New" },
      { name: "OG Tag Generator", desc: "Social preview tags", href: "/tools/og-tag-generator", badge: "New" },
    ],
  },
  {
    id: "con",
    icon: "\u{1F504}",
    name: "Converters",
    count: 6,
    color: "bg-lime-400/15 text-lime-300",
    tools: [
      { name: "Length Converter", desc: "km, mi, ft, cm", href: "/tools/length-converter" },
      { name: "Weight Converter", desc: "kg, lb, oz", href: "/tools/weight-converter" },
      { name: "Temperature Converter", desc: "C, F, and Kelvin", href: "/tools/temperature-converter" },
      { name: "File Size Converter", desc: "MB, GB, TB, and more", href: "/tools/file-size-converter", badge: "New" },
      { name: "Color Converter", desc: "Convert HEX, RGB, and HSL", href: "/tools/color-converter" },
      { name: "Random Number Generator", desc: "Generate random values", href: "/tools/random-number-generator", badge: "New" },
    ],
  },
  {
    id: "mis",
    icon: "\u{2728}",
    name: "More Tools",
    count: 9,
    color: "bg-fuchsia-400/15 text-fuchsia-300",
    tools: [
      { name: "Stopwatch", desc: "Lap timer and countdown", href: "/tools/stopwatch" },
      { name: "Date Difference", desc: "Days between dates", href: "/tools/date-difference" },
      { name: "Random Name Picker", desc: "Pick random names from list", href: "/tools/random-name-picker", badge: "New" },
      { name: "WiFi Speed Checker", desc: "Test download speed and latency", href: "/tools/wifi-speed-checker", badge: "New" },
      { name: "YouTube Thumbnail Downloader", desc: "Grab video thumbnails", href: "/tools/youtube-thumbnail-downloader", badge: "New" },
      { name: "QR Code Scanner", desc: "Scan QR codes via camera or image", href: "/tools/qr-code-scanner", badge: "New" },
      { name: "QR Code Generator", desc: "Create QR codes from text or URL", href: "/tools/qr-code-generator", badge: "New" },
      { name: "Tic Tac Toe", desc: "Play vs AI or 2 player", href: "/tools/tic-tac-toe", badge: "New" },
      { name: "Rock Paper Scissors", desc: "Play vs computer", href: "/tools/rock-paper-scissors", badge: "New" },
    ],
  },
];

export default function MobileSidebar() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useNavShell();
  const pathname = usePathname();
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname, setMobileSidebarOpen]);

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  const toggleCat = (id: string) =>
    setOpenCats((prev) => ({ ...prev, [id]: !prev[id] }));

  const close = () => setMobileSidebarOpen(false);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={close}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
        style={{
          opacity: mobileSidebarOpen ? 1 : 0,
          pointerEvents: mobileSidebarOpen ? "auto" : "none",
        }}
      />

      {/* Drawer */}
      <aside
        aria-label="Mobile navigation"
        aria-hidden={!mobileSidebarOpen}
        className="fixed inset-y-0 left-0 z-50 flex w-[300px] max-w-[85vw] flex-col transition-transform duration-300 ease-in-out lg:hidden"
        style={{
          transform: mobileSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          background: "var(--surface-1)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between px-4 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <Link
            href="/"
            onClick={close}
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            <BrandMark size={26} className="shrink-0" />
            Tool<span className="text-[#6c63ff]">Mint</span>
          </Link>
          <button
            onClick={close}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-full border transition hover:opacity-70"
            style={{ borderColor: "var(--border-strong)", color: "var(--muted)" }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable nav */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="space-y-0.5">
            {categories.map((cat) => {
              const isOpen = !!openCats[cat.id];
              return (
                <div key={cat.id}>
                  {/* Category row */}
                  <button
                    onClick={() => toggleCat(cat.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition"
                    style={{
                      background: isOpen ? "rgba(108,99,255,0.1)" : "transparent",
                    }}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm ${cat.color}`}
                    >
                      {cat.icon}
                    </span>
                    <span
                      className="flex-1 text-sm font-semibold"
                      style={{ color: isOpen ? "var(--foreground)" : "var(--muted)" }}
                    >
                      {cat.name}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ background: "var(--surface-2)", color: "var(--muted-3)" }}
                    >
                      {cat.count}
                    </span>
                    <svg
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: isOpen ? "var(--accent-light)" : "var(--muted-3)" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Tools dropdown */}
                  {isOpen && (
                    <div
                      className="mb-1 ml-2 mr-1 overflow-hidden rounded-xl border"
                      style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
                    >
                      {cat.sections ? (
                        cat.sections.map((section) => (
                          <div key={section.heading}>
                            <div
                              className="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-widest"
                              style={{
                                color: "var(--accent-light)",
                                borderBottom: "1px solid var(--border)",
                              }}
                            >
                              {section.heading}
                            </div>
                            {section.items.map((tool) => (
                              <Link
                                key={tool.name}
                                href={tool.href}
                                onClick={close}
                                className="flex items-center gap-2.5 border-b px-3 py-2.5 text-sm transition last:border-0 hover:opacity-90"
                                style={{
                                  borderColor: "var(--border)",
                                  color:
                                    pathname === tool.href
                                      ? "var(--accent-light)"
                                      : "var(--muted)",
                                  background:
                                    pathname === tool.href
                                      ? "rgba(108,99,255,0.1)"
                                      : "transparent",
                                }}
                              >
                                <span
                                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                                  style={{
                                    background:
                                      pathname === tool.href
                                        ? "var(--accent)"
                                        : "var(--muted-3)",
                                  }}
                                />
                                <span className="flex-1 leading-5">{tool.name}</span>
                                {tool.badge && (
                                  <span
                                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${badgeClass[tool.badge]}`}
                                  >
                                    {tool.badge}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        ))
                      ) : (
                        cat.tools.map((tool) => (
                          <Link
                            key={tool.name}
                            href={tool.href}
                            onClick={close}
                            className="flex items-center gap-2.5 border-b px-3 py-2.5 text-sm transition last:border-0 hover:opacity-90"
                            style={{
                              borderColor: "var(--border)",
                              color:
                                pathname === tool.href ? "var(--accent-light)" : "var(--muted)",
                              background:
                                pathname === tool.href
                                  ? "rgba(108,99,255,0.1)"
                                  : "transparent",
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{
                                background:
                                  pathname === tool.href ? "var(--accent)" : "var(--muted-3)",
                              }}
                            />
                            <span className="flex-1 leading-5">{tool.name}</span>
                            {tool.badge && (
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${badgeClass[tool.badge]}`}
                              >
                                {tool.badge}
                              </span>
                            )}
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className="shrink-0 px-4 py-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <Link
            href="/blog"
            onClick={close}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:opacity-80"
            style={{ color: "var(--muted)", background: "var(--surface-2)" }}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            Blog
          </Link>
        </div>
      </aside>
    </>
  );
}
