import Link from "next/link";
import BrandMark from "@/components/brand-mark";

const footerColumns = [
  {
    title: "PDF Tools",
    links: [
      { label: "Compress PDF", href: "/tools/compress-pdf" },
      { label: "Merge PDF", href: "/tools/merge-pdf" },
      { label: "Split PDF", href: "/tools/split-pdf" },
      { label: "Protect PDF", href: "/tools/protect-pdf" },
      { label: "Unlock PDF", href: "/tools/unlock-pdf" },
      { label: "Redact PDF", href: "/tools/redact-pdf" },
      { label: "Compare PDF", href: "/tools/compare-pdf" },
      { label: "Image to PDF", href: "/tools/image-to-pdf" },
      { label: "Word to PDF", href: "/tools/word-to-pdf" },
      { label: "PowerPoint to PDF", href: "/tools/powerpoint-to-pdf" },
      { label: "Excel to PDF", href: "/tools/excel-to-pdf" },
      { label: "HTML to PDF", href: "/tools/html-to-pdf" },
      { label: "PDF to Text (OCR)", href: "/tools/pdf-to-text" },
    ],
  },
  {
    title: "Image Tools",
    links: [
      { label: "Image Compressor", href: "/tools/image-compressor" },
      { label: "Image Resizer", href: "/tools/image-resizer" },
      { label: "Image Converter", href: "/tools/image-converter" },
      { label: "Image to Text", href: "/tools/image-to-text" },
      { label: "PNG to JPG", href: "/tools/png-to-jpg" },
    ],
  },
  {
    title: "Calculators",
    links: [
      { label: "Percentage Calc", href: "/tools/percentage-calculator" },
      { label: "Age Calculator", href: "/tools/age-calculator" },
      { label: "BMI Calculator", href: "/tools/bmi-calculator" },
      { label: "EMI Calculator", href: "/tools/loan-emi-calculator" },
      { label: "Profit Margin", href: "/tools/profit-margin-calculator" },
      { label: "ROI Calculator", href: "/tools/roi-calculator" },
      { label: "GST / Tax Calc", href: "/tools/gst-calculator" },
      { label: "Calorie Calc", href: "/tools/calorie-calculator" },
      { label: "Palworld Breeding", href: "/tools/palworld-breeding-calculator" },
    ],
  },
  {
    title: "Text Tools",
    links: [
      { label: "Word Counter", href: "/tools/word-counter" },
      { label: "Case Converter", href: "/tools/text-case-converter" },
      { label: "Text Compare", href: "/tools/text-compare" },
      { label: "Text Reverser", href: "/tools/text-reverser" },
      { label: "Whitespace Remover", href: "/tools/whitespace-remover" },
      { label: "Grammar Checker", href: "/tools/grammar-checker" },
    ],
  },
  {
    title: "Dev Tools",
    links: [
      { label: "JSON Formatter", href: "/tools/json-formatter" },
      { label: "Code Snippet", href: "/tools/code-snippet" },
      { label: "Python Editor", href: "/tools/python-code-editor" },
      { label: "Base64 Encoder", href: "/tools/base64-encoder-decoder" },
      { label: "Password Gen", href: "/tools/password-generator" },
      { label: "URL Encoder", href: "/tools/url-encoder-decoder" },
    ],
  },
  {
    title: "SEO Tools",
    links: [
      { label: "Meta Tag Gen", href: "/tools/meta-tag-generator" },
      { label: "Meta Length Check", href: "/tools/meta-title-description-checker" },
      { label: "Sitemap Gen", href: "/tools/sitemap-generator" },
      { label: "Robots.txt", href: "/tools/robots-txt-generator" },
      { label: "Keyword Density", href: "/tools/keyword-density" },
      { label: "OG Generator", href: "/tools/og-tag-generator" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-16" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-4 pt-10 sm:px-6">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="mb-3 inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight">
              <BrandMark size={32} className="shrink-0" />
              Tool<span className="text-[#6c63ff]">Mint</span>
            </Link>
            <p className="max-w-xs text-sm leading-7" style={{ color: "var(--muted)" }}>
              Free online tools for practical daily work, from PDF cleanup to quick calculators and browser-based utilities.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--muted-3)" }}>
                {column.title}
              </h4>
              <div className="space-y-2 text-sm" style={{ color: "var(--muted)" }}>
                {column.links.map((link) => (
                  <Link key={link.label} href={link.href} className="block transition" style={{ color: "var(--muted)" }}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm" style={{ borderTop: "1px solid var(--border)", color: "var(--muted-3)" }}>
          <span>&copy; {new Date().getFullYear()} ToolMint. All rights reserved.</span>
          <div className="flex max-w-full flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end">
            <Link href="/privacy" className="transition hover:opacity-80">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:opacity-80">
              Terms
            </Link>
            <Link href="/cookie-policy" className="transition hover:opacity-80">
              Cookies
            </Link>
            <Link href="/disclaimer" className="transition hover:opacity-80">
              Disclaimer
            </Link>
            <Link href="/about" className="transition hover:opacity-80">
              About
            </Link>
            <Link href="/contact" className="transition hover:opacity-80">
              Contact
            </Link>
            <Link href="/site-map" className="transition hover:opacity-80">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
