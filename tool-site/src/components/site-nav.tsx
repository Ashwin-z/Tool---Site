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

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7.5 10 12.5 15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const categories: Category[] = [
  {
    id: "pdf",
    icon: "📄",
    name: "PDF Tools",
    subtitle: "22 PDF tools — edit, convert, compress and secure your PDF files",
    count: 22,
    color: "bg-rose-400/15 text-rose-300",
    tools: [
      { name: "PDF Compressor", desc: "Reduce file size", href: "/tools/pdf-compressor", badge: "Hot" },
      { name: "PDF Merger", desc: "Combine multiple PDFs", href: "/tools/pdf-merger", badge: "Top" },
      { name: "PDF Splitter", desc: "Extract pages", href: "/tools/pdf-splitter" },
      { name: "Protect PDF", desc: "Lock a PDF with password", href: "/tools/protect-pdf", badge: "New" },
      { name: "Unlock PDF", desc: "Remove PDF password", href: "/tools/unlock-pdf", badge: "New" },
      { name: "Sign PDF", desc: "Add signatures", href: "/tools/sign-pdf", badge: "New" },
      { name: "Redact PDF", desc: "Black out sensitive text", href: "/tools/redact-pdf", badge: "New" },
      { name: "Compare PDF", desc: "Find document differences", href: "/tools/compare-pdf", badge: "New" },
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
        heading: "Organize & Compress",
        items: [
          { name: "PDF Compressor", desc: "Reduce file size", href: "/tools/pdf-compressor", badge: "Hot" },
          { name: "PDF Merger", desc: "Combine multiple PDFs", href: "/tools/pdf-merger", badge: "Top" },
          { name: "PDF Splitter", desc: "Extract pages", href: "/tools/pdf-splitter" },
        ],
      },
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
          { name: "PDF to Text (OCR)", desc: "Extract text from scanned PDFs", href: "/tools/pdf-to-text", badge: "New" },
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
    ],
  },
  {
    id: "img",
    icon: "🖼️",
    name: "Image Tools",
    subtitle: "10 free tools — compress, resize, convert and OCR images",
    count: 10,
    color: "bg-sky-400/15 text-sky-300",
    tools: [
      { name: "Image Compressor", desc: "Compress JPG/PNG/WebP", href: "/tools/image-compressor", badge: "Hot" },
      { name: "Image Resizer", desc: "Resize to exact pixels", href: "/tools/image-resizer", badge: "Top" },
      { name: "Image Cropper", desc: "Crop by ratio", href: "/tools/image-cropper", badge: "New" },
      { name: "PNG to JPG", desc: "Any image → JPEG", href: "/tools/png-to-jpg", badge: "New" },
      { name: "JPG to PNG", desc: "Keep transparency", href: "/tools/jpg-to-png", badge: "New" },
      { name: "Image Converter", desc: "PNG, JPG, WebP, BMP, GIF ↔ any format", href: "/tools/image-converter", badge: "New" },
      { name: "Image Rotate/Flip", desc: "Rotate & mirror images", href: "/tools/image-rotate-flip", badge: "New" },
      { name: "Image to Text (OCR)", desc: "Extract text from images", href: "/tools/image-to-text", badge: "New" },
      { name: "Image Watermark", desc: "Stamp text or logo", href: "/tools/image-watermark", badge: "Soon" },
      { name: "Background Remover", desc: "Remove image background", href: "/tools/background-remover", badge: "Soon" },
    ],
  },
  {
    id: "txt",
    icon: "📝",
    name: "Text Tools",
    subtitle: "11 free tools for writers, editors and students",
    count: 11,
    color: "bg-emerald-400/15 text-emerald-300",
    tools: [
      { name: "Word Counter", desc: "Words, chars, read time", href: "/tools/word-counter", badge: "Hot" },
      { name: "Text Case Converter", desc: "UPPER / lower / Title", href: "/tools/text-case-converter", badge: "Top" },
      { name: "Text Compare", desc: "Diff two texts side by side", href: "/tools/text-compare", badge: "New" },
      { name: "Text Reverser", desc: "Reverse any string", href: "/tools/text-reverser" },
      { name: "Whitespace Remover", desc: "Strip extra spaces", href: "/tools/whitespace-remover" },
      { name: "Number to Words", desc: "Spell out any number", href: "/tools/number-to-words", badge: "New" },
      { name: "Grammar Checker", desc: "Fix spelling & grammar", href: "/tools/grammar-checker", badge: "New" },
      { name: "Plagiarism Checker", desc: "Detect copied content", href: "/tools/plagiarism-checker", badge: "Soon" },
      { name: "AI Content Detector", desc: "Human vs AI text", href: "/tools/ai-content-detector", badge: "Soon" },
    ],
  },
  {
    id: "cal",
    icon: "🔢",
    name: "Calculators",
    subtitle: "16 free calculators for math, health and finance",
    count: 16,
    color: "bg-amber-400/15 text-amber-300",
    tools: [
      { name: "Scientific Calculator", desc: "Full scientific calc", href: "/tools/scientific-calculator", badge: "New" },
      { name: "Percentage Calculator", desc: "X% of Y", href: "/tools/percentage-calculator", badge: "Hot" },
      { name: "Age Calculator", desc: "Exact age from DOB", href: "/tools/age-calculator", badge: "Top" },
      { name: "BMI Calculator", desc: "Metric + imperial", href: "/tools/bmi-calculator" },
      { name: "Loan EMI Calculator", desc: "Monthly payment + interest", href: "/tools/loan-emi-calculator" },
      { name: "Compound Interest Calculator", desc: "Investment growth", href: "/tools/compound-interest-calculator" },
      { name: "Profit Margin Calculator", desc: "Margin, markup & net profit", href: "/tools/profit-margin-calculator", badge: "New" },
      { name: "ROI Calculator", desc: "Return on investment + CAGR", href: "/tools/roi-calculator", badge: "New" },
      { name: "GST / Sales Tax Calculator", desc: "Add or remove tax instantly", href: "/tools/gst-calculator", badge: "New" },
      { name: "Break-even Calculator", desc: "Units & revenue to break even", href: "/tools/breakeven-calculator", badge: "New" },
      { name: "GPA Calculator", desc: "GPA with custom grading scales", href: "/tools/gpa-calculator", badge: "New" },
      { name: "Work Hours Calculator", desc: "Track weekly hours & pay", href: "/tools/work-hours-calculator", badge: "New" },
      { name: "Tip Calculator", desc: "Split bills & calculate tips", href: "/tools/tip-calculator", badge: "New" },
    ],
  },
  {
    id: "dev",
    icon: "💻",
    name: "Developer Tools",
    subtitle: "6 free tools for coders and engineers",
    count: 6,
    color: "bg-violet-400/15 text-violet-300",
    tools: [
      { name: "JSON Formatter", desc: "Beautify & validate", href: "/tools/json-formatter", badge: "Hot" },
      { name: "Code Snippet Playground", desc: "Live HTML/CSS/JS preview", href: "/tools/code-snippet", badge: "New" },
      { name: "Python Code Editor", desc: "Run Python in browser", href: "/tools/python-code-editor", badge: "New" },
      { name: "Base64 Encoder/Decoder", desc: "Encode / decode", href: "/tools/base64-encoder-decoder", badge: "Top" },
      { name: "URL Encoder/Decoder", desc: "Encode URL chars", href: "/tools/url-encoder-decoder" },
      { name: "Password Generator", desc: "Strong passwords", href: "/tools/password-generator" },
    ],
  },
  {
    id: "seo",
    icon: "📊",
    name: "SEO Tools",
    subtitle: "6 free tools to improve search visibility",
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
    icon: "🔄",
    name: "Converters",
    subtitle: "Unit and format conversion tools",
    count: 7,
    color: "bg-lime-400/15 text-lime-300",
    tools: [
      { name: "Length Converter", desc: "km, mi, ft, cm", href: "/tools/length-converter" },
      { name: "Weight Converter", desc: "kg, lb, oz", href: "/tools/weight-converter" },
      { name: "Temperature Converter", desc: "°C, °F, Kelvin", href: "/tools/temperature-converter" },
      { name: "File Size Converter", desc: "MB, GB, TB & more", href: "/tools/file-size-converter", badge: "New" },
      { name: "Color Converter", desc: "HEX ↔ RGB ↔ HSL", href: "/tools/color-converter" },
      { name: "Random Number Generator", desc: "Generate random values", href: "/tools/random-number-generator", badge: "New" },
    ],
  },
  {
    id: "doc",
    icon: "📋",
    name: "Document Generators",
    subtitle: "Generate invoices, receipts, quotes and business documents",
    count: 11,
    color: "bg-orange-400/15 text-orange-300",
    tools: [
      { name: "Invoice", desc: "Create professional invoices", href: "/tools/invoice-generator", badge: "Soon" },
      { name: "Tax Invoice", desc: "GST / tax-compliant invoices", href: "/tools/tax-invoice-generator", badge: "Soon" },
      { name: "Proforma Invoice", desc: "Pre-shipment invoice", href: "/tools/proforma-invoice-generator", badge: "Soon" },
      { name: "Receipt", desc: "Payment confirmation receipt", href: "/tools/receipt-generator", badge: "Soon" },
      { name: "Sales Receipt", desc: "Point-of-sale receipt", href: "/tools/sales-receipt-generator", badge: "Soon" },
      { name: "Cash Receipt", desc: "Cash payment receipt", href: "/tools/cash-receipt-generator", badge: "Soon" },
      { name: "Quote", desc: "Business price quotation", href: "/tools/quotation-generator", badge: "Soon" },
      { name: "Estimate", desc: "Project cost estimate", href: "/tools/estimate-generator", badge: "Soon" },
      { name: "Credit Note", desc: "Refund or credit memo", href: "/tools/credit-note-generator", badge: "Soon" },
      { name: "Purchase Order", desc: "Vendor purchase order", href: "/tools/purchase-order-generator", badge: "Soon" },
      { name: "Delivery Note", desc: "Shipment delivery note", href: "/tools/delivery-note-generator", badge: "Soon" },
    ],
  },
  {
    id: "mis",
    icon: "✨",
    name: "More Tools",
    subtitle: "Handy utilities for daily tasks",
    count: 12,
    color: "bg-fuchsia-400/15 text-fuchsia-300",
    tools: [
      { name: "Calorie Calculator", desc: "TDEE, BMR, macros", href: "/tools/calorie-calculator", badge: "New" },
      { name: "Stopwatch", desc: "Lap timer and countdown", href: "/tools/stopwatch" },
      { name: "Date Difference", desc: "Days between dates", href: "/tools/date-difference" },
      { name: "Random Name Picker", desc: "Pick random names from list", href: "/tools/random-name-picker", badge: "New" },
      { name: "WiFi Speed Checker", desc: "Test download speed & latency", href: "/tools/wifi-speed-checker", badge: "New" },
      { name: "YouTube Thumbnail Downloader", desc: "Grab video thumbnails", href: "/tools/youtube-thumbnail-downloader", badge: "New" },
      { name: "QR Code Scanner", desc: "Scan QR codes via camera or image", href: "/tools/qr-code-scanner", badge: "New" },
      { name: "QR Code Generator", desc: "Create QR codes from text or URL", href: "/tools/qr-code-generator", badge: "New" },
      { name: "Tic Tac Toe", desc: "Play vs AI or 2 player", href: "/tools/tic-tac-toe", badge: "New" },
      { name: "Rock Paper Scissors", desc: "Play vs computer", href: "/tools/rock-paper-scissors", badge: "New" },
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

  const toggleCategory = useCallback(
    (categoryId: string) => {
      setActiveCat(categoryId);
      setOpenSubmenus((prev) => ({
        ...prev,
        [categoryId]: !(prev[categoryId] ?? (activeCategoryFromPath === categoryId)),
      }));
    },
    [activeCategoryFromPath],
  );

  return (
    <section
      className={`grid overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,.25)] transition-all duration-300 ${
        navOpen
          ? "h-[420px] md:h-[460px] grid-cols-1 lg:grid-cols-[260px_1fr] opacity-100"
          : "h-0 opacity-0"
      }`}
      style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-1)" }}
    >
      {/* ── Left sidebar ── */}
      <aside className="h-full overflow-y-auto p-3" style={{ borderRight: "1px solid var(--border)", background: "var(--surface-2)" }}>
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted-3)" }}>
          Categories
        </div>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isActive = resolvedActiveCat === cat.id;
            const isOpen = openSubmenus[cat.id] ?? (activeCategoryFromPath === cat.id);
            return (
              <div key={cat.id}>
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${
                    isActive
                      ? "border-l-2 border-[#6c63ff]"
                      : "hover:opacity-80"
                  }`}
                  style={{
                    color: isActive ? "var(--foreground)" : "var(--muted)",
                    background: isActive ? "rgba(108,99,255,0.15)" : "transparent",
                  }}
                >
                  <span className={`grid h-7 w-7 place-items-center rounded-md ${cat.color}`}>
                    {cat.icon}
                  </span>
                  <span>{cat.name}</span>
                  <span className="ml-auto rounded px-1.5 py-0.5 text-[10px]" style={{ background: "var(--surface-1)", color: "var(--muted-3)" }}>
                    {cat.count}
                  </span>
                  <span
                    className="rounded p-1"
                    style={{ color: isOpen ? "var(--accent)" : "var(--muted-3)" }}
                  >
                    <ChevronDownIcon open={isOpen} />
                  </span>
                </button>

                {isOpen && (
                  <div className="space-y-1 py-1 pl-10 pr-2">
                    {cat.sections ? (
                      cat.sections.map((section) => (
                        <div key={section.heading}>
                          <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted-3)" }}>
                            {section.heading}
                          </div>
                          {section.items.map((tool) => (
                            <Link
                              key={tool.name}
                              href={tool.href}
                              onClick={() => setActiveCat(cat.id)}
                              className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition ${
                                pathname === tool.href
                                  ? ""
                                  : "hover:opacity-80"
                              }`}
                              style={{
                                color: pathname === tool.href ? "var(--accent-light)" : "var(--muted-2)",
                                background: pathname === tool.href ? "rgba(108,99,255,0.15)" : "transparent",
                              }}
                            >
                              <span className="h-1 w-1 rounded-full bg-current" />
                              {tool.name}
                            </Link>
                          ))}
                        </div>
                      ))
                    ) : (
                      cat.tools.map((tool) => (
                        <Link
                          key={tool.name}
                          href={tool.href}
                          onClick={() => setActiveCat(cat.id)}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition ${
                            pathname === tool.href
                              ? ""
                              : "hover:opacity-80"
                          }`}
                          style={{
                            color: pathname === tool.href ? "var(--accent-light)" : "var(--muted-2)",
                            background: pathname === tool.href ? "rgba(108,99,255,0.15)" : "transparent",
                          }}
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
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className={`grid h-10 w-10 place-items-center rounded-xl ${activeCategory.color}`}>
            {activeCategory.icon}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold tracking-tight">{activeCategory.name}</h3>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{activeCategory.subtitle}</p>
          </div>
        </div>

        <div className="h-full overflow-y-auto p-4">
          {categories
            .filter((cat) => cat.id === resolvedActiveCat)
            .map((cat) => (
              <div key={cat.id} className="mb-5">
                {cat.id === "pdf" && cat.sections ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {cat.sections.map((section) => (
                      <div
                        key={section.heading}
                        className="rounded-xl border p-3"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--surface-2)",
                        }}
                      >
                        <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                          {section.heading}
                        </h4>
                        <div className="space-y-2">
                          {section.items.map((tool) => (
                            <Link
                              key={tool.name}
                              href={tool.href}
                              className="flex items-center gap-3 rounded-lg border px-3 py-2 transition hover:-translate-y-0.5"
                              style={{
                                borderColor: pathname === tool.href ? "rgba(108,99,255,0.4)" : "transparent",
                                background: pathname === tool.href ? "var(--surface-3)" : "transparent",
                              }}
                            >
                              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${cat.color}`}>
                                {cat.icon}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{tool.name}</div>
                                <div className="text-xs" style={{ color: "var(--muted-2)" }}>{tool.desc}</div>
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
                  </div>
                ) : cat.sections ? (
                  <>
                    {(() => {
                      const sectionHrefs = new Set(cat.sections.flatMap((s) => s.items.map((t) => t.href)));
                      const generalTools = cat.tools.filter((t) => !sectionHrefs.has(t.href));
                      return generalTools.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {generalTools.map((tool) => (
                            <Link
                              key={tool.name}
                              href={tool.href}
                              className="flex items-center gap-3 rounded-lg border px-3 py-2 transition hover:-translate-y-0.5"
                              style={{
                                borderColor: pathname === tool.href ? "rgba(108,99,255,0.4)" : "transparent",
                                background: pathname === tool.href ? "var(--surface-3)" : "transparent",
                              }}
                            >
                              <span className={`grid h-8 w-8 place-items-center rounded-md ${cat.color}`}>
                                {cat.icon}
                              </span>
                              <div>
                                <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{tool.name}</div>
                                <div className="text-xs" style={{ color: "var(--muted-2)" }}>{tool.desc}</div>
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
                    {cat.sections.map((section) => (
                      <div key={section.heading} className="mt-4">
                        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                          {section.heading}
                        </h4>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {section.items.map((tool) => (
                            <Link
                              key={tool.name}
                              href={tool.href}
                              className="flex items-center gap-3 rounded-lg border px-3 py-2 transition hover:-translate-y-0.5"
                              style={{
                                borderColor: pathname === tool.href ? "rgba(108,99,255,0.4)" : "transparent",
                                background: pathname === tool.href ? "var(--surface-3)" : "transparent",
                              }}
                            >
                              <span className={`grid h-8 w-8 place-items-center rounded-md ${cat.color}`}>
                                {cat.icon}
                              </span>
                              <div>
                                <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{tool.name}</div>
                                <div className="text-xs" style={{ color: "var(--muted-2)" }}>{tool.desc}</div>
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
                        className="flex items-center gap-3 rounded-lg border px-3 py-2 transition hover:-translate-y-0.5"
                        style={{
                          borderColor: pathname === tool.href ? "rgba(108,99,255,0.4)" : "transparent",
                          background: pathname === tool.href ? "var(--surface-3)" : "transparent",
                        }}
                      >
                        <span className={`grid h-8 w-8 place-items-center rounded-md ${cat.color}`}>
                          {cat.icon}
                        </span>
                        <div>
                          <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{tool.name}</div>
                          <div className="text-xs" style={{ color: "var(--muted-2)" }}>{tool.desc}</div>
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
