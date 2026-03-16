import Link from "next/link";

const footerColumns = [
  {
    title: "PDF Tools",
    links: [
      { label: "PDF Compressor", href: "/tools/pdf-compressor" },
      { label: "PDF Merger", href: "/tools/pdf-merger" },
      { label: "PDF Splitter", href: "/tools/pdf-splitter" },
      { label: "PDF to Word", href: "/tools/pdf-to-word" },
      { label: "Rotate PDF", href: "/tools/rotate-pdf" },
    ],
  },
  {
    title: "Calculators",
    links: [
      { label: "Percentage Calc", href: "/tools/percentage-calculator" },
      { label: "Age Calculator", href: "/tools/age-calculator" },
      { label: "BMI Calculator", href: "/tools/bmi-calculator" },
      { label: "EMI Calculator", href: "/tools/loan-emi-calculator" },
      { label: "Calorie Calc", href: "/tools/calorie-calculator" },
    ],
  },
  {
    title: "Text Tools",
    links: [
      { label: "Word Counter", href: "/tools/word-counter" },
      { label: "Case Converter", href: "/tools/text-case-converter" },
      { label: "Text Reverser", href: "/tools/text-reverser" },
      { label: "Whitespace Remover", href: "/tools/whitespace-remover" },
      { label: "Grammar Checker", href: "/tools/grammar-checker" },
    ],
  },
  {
    title: "Dev Tools",
    links: [
      { label: "JSON Formatter", href: "/tools/json-formatter" },
      { label: "Base64 Encoder", href: "/tools/base64-encoder-decoder" },
      { label: "Password Gen", href: "/tools/password-generator" },
      { label: "URL Encoder", href: "/tools/url-encoder-decoder" },
      { label: "Regex Tester", href: "/tools/regex-tester" },
    ],
  },
  {
    title: "SEO Tools",
    links: [
      { label: "Meta Tag Gen", href: "/tools/meta-tag-generator" },
      { label: "Sitemap Gen", href: "/tools/sitemap-generator" },
      { label: "Robots.txt", href: "/tools/robots-txt-generator" },
      { label: "Keyword Density", href: "/tools/keyword-density-checker" },
      { label: "OG Generator", href: "/tools/og-tag-generator" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto max-w-[1400px] px-6 pb-4 pt-10">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="mb-3 inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-linear-to-br from-[#6c63ff] to-[#a78bff] text-xs">⚡</span>
              Tool<span className="text-[#6c63ff]">Craft</span>
            </Link>
            <p className="max-w-xs text-sm leading-7 text-[#9b9bb3]">100% free online tools. No account needed. Built with ❤️ for the web.</p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#61617a]">{column.title}</h4>
              <div className="space-y-2 text-sm text-[#9b9bb3]">
                {column.links.map((link) => (
                  <Link key={link.label} href={link.href} className="block transition hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-4 text-sm text-[#61617a]">
          <span>© 2026 ToolCraft — All tools are free, forever.</span>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link href="/contact" className="transition hover:text-white">
              Contact
            </Link>
            <Link href="/site-map" className="transition hover:text-white">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
