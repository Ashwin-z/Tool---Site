import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "All Tools | ToolCraft",
  description: "Browse all available and upcoming tools on ToolCraft.",
};

type ToolEntry = readonly [string, string];

const categorizedTools: { title: string; icon: string; tools: ToolEntry[] }[] = [
  {
    title: "PDF Tools",
    icon: "📄",
    tools: [
      ["PDF Compressor", "/tools/pdf-compressor"],
      ["PDF Merger", "/tools/pdf-merger"],
      ["PDF Splitter", "/tools/pdf-splitter"],
      ["Rotate PDF", "/tools/rotate-pdf"],
      ["Edit PDF", "/tools/edit-pdf"],
      ["Crop PDF", "/tools/crop-pdf"],
      ["Add Page Numbers", "/tools/add-page-numbers"],
      ["Add Watermark", "/tools/add-watermark"],
      ["Protect PDF", "/tools/protect-pdf"],
      ["Unlock PDF", "/tools/unlock-pdf"],
      ["Sign PDF", "/tools/sign-pdf"],
      ["Redact PDF", "/tools/redact-pdf"],
      ["Compare PDF", "/tools/compare-pdf"],
      ["Image to PDF", "/tools/image-to-pdf"],
      ["Word to PDF", "/tools/word-to-pdf"],
      ["PowerPoint to PDF", "/tools/powerpoint-to-pdf"],
      ["Excel to PDF", "/tools/excel-to-pdf"],
      ["HTML to PDF", "/tools/html-to-pdf"],
      ["PDF to JPG", "/tools/pdf-to-jpg"],
      ["PDF to Word", "/tools/pdf-to-word"],
      ["PDF to PowerPoint", "/tools/pdf-to-powerpoint"],
      ["PDF to Excel", "/tools/pdf-to-excel"],
      ["PDF to PDF/A", "/tools/pdf-to-pdfa"],
      ["PDF to Text (OCR)", "/tools/pdf-to-text"],
    ],
  },
  {
    title: "Image Tools",
    icon: "🖼️",
    tools: [
      ["Image Compressor", "/tools/image-compressor"],
      ["Image Resizer", "/tools/image-resizer"],
      ["Image Cropper", "/tools/image-cropper"],
      ["PNG to JPG", "/tools/png-to-jpg"],
      ["JPG to PNG", "/tools/jpg-to-png"],
      ["Image Converter", "/tools/image-converter"],
      ["Image Rotate/Flip", "/tools/image-rotate-flip"],
      ["Image to Text (OCR)", "/tools/image-to-text"],
    ],
  },
  {
    title: "Text Tools",
    icon: "📝",
    tools: [
      ["Word Counter", "/tools/word-counter"],
      ["Text Case Converter", "/tools/text-case-converter"],
      ["Text Compare", "/tools/text-compare"],
      ["Text Reverser", "/tools/text-reverser"],
      ["Whitespace Remover", "/tools/whitespace-remover"],
      ["Number to Words", "/tools/number-to-words"],
      ["Grammar Checker", "/tools/grammar-checker"],
    ],
  },
  {
    title: "Calculators",
    icon: "🔢",
    tools: [
      ["Scientific Calculator", "/tools/scientific-calculator"],
      ["Percentage Calculator", "/tools/percentage-calculator"],
      ["Age Calculator", "/tools/age-calculator"],
      ["BMI Calculator", "/tools/bmi-calculator"],
      ["Loan EMI Calculator", "/tools/loan-emi-calculator"],
      ["Compound Interest Calculator", "/tools/compound-interest-calculator"],
      ["Profit Margin Calculator", "/tools/profit-margin-calculator"],
      ["ROI Calculator", "/tools/roi-calculator"],
      ["GST / Sales Tax Calculator", "/tools/gst-calculator"],
      ["Break-even Calculator", "/tools/breakeven-calculator"],
      ["GPA Calculator", "/tools/gpa-calculator"],
      ["Work Hours Calculator", "/tools/work-hours-calculator"],
      ["Calorie Calculator", "/tools/calorie-calculator"],
    ],
  },
  {
    title: "Developer Tools",
    icon: "💻",
    tools: [
      ["JSON Formatter", "/tools/json-formatter"],
      ["Code Snippet Playground", "/tools/code-snippet"],
      ["Python Code Editor", "/tools/python-code-editor"],
      ["Base64 Encoder/Decoder", "/tools/base64-encoder-decoder"],
      ["URL Encoder/Decoder", "/tools/url-encoder-decoder"],
      ["Password Generator", "/tools/password-generator"],
    ],
  },
  {
    title: "SEO Tools",
    icon: "📊",
    tools: [
      ["Meta Tag Generator", "/tools/meta-tag-generator"],
      ["Meta Title & Description Checker", "/tools/meta-title-description-checker"],
      ["Sitemap Generator", "/tools/sitemap-generator"],
      ["Robots.txt Generator", "/tools/robots-txt-generator"],
      ["Keyword Density", "/tools/keyword-density"],
      ["OG Tag Generator", "/tools/og-tag-generator"],
    ],
  },
  {
    title: "Converters",
    icon: "🔄",
    tools: [
      ["Length Converter", "/tools/length-converter"],
      ["Weight Converter", "/tools/weight-converter"],
      ["Temperature Converter", "/tools/temperature-converter"],
      ["File Size Converter", "/tools/file-size-converter"],
      ["Color Converter", "/tools/color-converter"],
      ["Random Number Generator", "/tools/random-number-generator"],
    ],
  },
  {
    title: "Document Generators",
    icon: "📋",
    tools: [
      ["Invoice", "/tools/invoice-generator"],
      ["Tax Invoice", "/tools/tax-invoice-generator"],
      ["Proforma Invoice", "/tools/proforma-invoice-generator"],
      ["Receipt", "/tools/receipt-generator"],
      ["Sales Receipt", "/tools/sales-receipt-generator"],
      ["Cash Receipt", "/tools/cash-receipt-generator"],
      ["Quote", "/tools/quotation-generator"],
      ["Estimate", "/tools/estimate-generator"],
      ["Credit Note", "/tools/credit-note-generator"],
      ["Purchase Order", "/tools/purchase-order-generator"],
      ["Delivery Note", "/tools/delivery-note-generator"],
    ],
  },
  {
    title: "More Tools",
    icon: "✨",
    tools: [
      ["Stopwatch", "/tools/stopwatch"],
      ["Date Difference", "/tools/date-difference"],
      ["Random Name Picker", "/tools/random-name-picker"],
      ["WiFi Speed Checker", "/tools/wifi-speed-checker"],
      ["YouTube Thumbnail Downloader", "/tools/youtube-thumbnail-downloader"],
      ["QR Code Scanner", "/tools/qr-code-scanner"],
      ["QR Code Generator", "/tools/qr-code-generator"],
    ],
  },
];

const totalTools = categorizedTools.reduce((s, c) => s + c.tools.length, 0);

export default function ToolsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="text-sm transition hover:opacity-80" style={{ color: "var(--muted)" }}>
        ← Back to home
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">All Tools</h1>
      <p className="mt-3 text-sm leading-7" style={{ color: "var(--muted)" }}>
        Browse {totalTools} tools across {categorizedTools.length} categories — PDF, text, calculator, developer, SEO and more.
      </p>

      <div className="mt-8 space-y-8">
        {categorizedTools.map((category) => (
          <section key={category.title} className="rounded-2xl p-5" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <h2 className="font-display text-xl font-bold">{category.title}</h2>
                <span className="text-xs" style={{ color: "var(--muted-2)" }}>{category.tools.length} tools</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {category.tools.map(([name, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition hover:-translate-y-0.5"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                >
                  {name}
                  {category.title === "Document Generators" && (
                    <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                      Soon
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
