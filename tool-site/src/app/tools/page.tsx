import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Online Tools - PDF, Image, Text, SEO, Calculator & More",
  description:
    "Browse 80+ free online tools on ToolMint. Compress, merge, split and convert PDFs, edit images, format code, calculate finances, check SEO, and more. No signup required.",
  keywords: [
    "free online tools",
    "pdf tools online",
    "image tools",
    "text tools",
    "online calculators",
    "seo tools",
    "developer tools",
    "toolmint",
  ],
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "Free Online Tools - PDF, Image, Text, SEO & Calculators | ToolMint",
    description:
      "80+ free browser-based tools for PDFs, images, text, code, SEO, and calculators. No signup, no watermark.",
    url: "/tools",
  },
};

type ToolEntry = readonly [string, string];

const categorizedTools: { title: string; icon: string; path?: string; summary: string; tools: ToolEntry[] }[] = [
  {
    title: "PDF Tools",
    icon: "\u{1F4C4}",
    path: "/tools/pdf-tools",
    summary: "Compress, merge, split, secure, and convert document files.",
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
    icon: "\u{1F5BC}\u{FE0F}",
    path: "/tools/image-tools",
    summary: "Optimize, resize, crop, convert, and OCR image files.",
    tools: [
      ["Image Compressor", "/tools/image-compressor"],
      ["Image Resizer", "/tools/image-resizer"],
      ["Image Cropper", "/tools/image-cropper"],
      ["JPG to PDF", "/tools/image-to-pdf"],
      ["PNG to JPG", "/tools/png-to-jpg"],
      ["JPG to PNG", "/tools/jpg-to-png"],
      ["Image Converter", "/tools/image-converter"],
      ["Image Rotate/Flip", "/tools/image-rotate-flip"],
      ["Image to Text (OCR)", "/tools/image-to-text"],
    ],
  },
  {
    title: "Text Tools",
    icon: "\u{1F4DD}",
    path: "/tools/text-tools",
    summary: "Count, compare, clean, and transform text online.",
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
    icon: "\u{1F522}",
    path: "/tools/calculators",
    summary: "Practical calculators for finance, study, health, and daily math.",
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
      ["Tip Calculator", "/tools/tip-calculator"],
      ["Palworld Breeding Calculator", "/tools/palworld-breeding-calculator"],
    ],
  },
  {
    title: "Developer Tools",
    icon: "\u{1F4BB}",
    path: "/tools/developer-tools",
    summary: "Quick browser-based helpers for code, JSON, passwords, and encoding.",
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
    icon: "\u{1F4CA}",
    path: "/tools/seo-tools",
    summary: "Metadata, crawl, and publishing support for site owners.",
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
    icon: "\u{1F504}",
    path: "/tools/converters",
    summary: "Fast unit, file-size, color, and randomization utilities.",
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
    title: "More Tools",
    icon: "\u{2728}",
    summary: "Extra utilities for QR codes, thumbnails, timers, and quick checks.",
    tools: [
      ["Stopwatch", "/tools/stopwatch"],
      ["Date Difference", "/tools/date-difference"],
      ["Random Name Picker", "/tools/random-name-picker"],
      ["WiFi Speed Checker", "/tools/wifi-speed-checker"],
      ["YouTube Thumbnail Downloader", "/tools/youtube-thumbnail-downloader"],
      ["QR Code Scanner", "/tools/qr-code-scanner"],
      ["QR Code Generator", "/tools/qr-code-generator"],
      ["Tic Tac Toe", "/tools/tic-tac-toe"],
      ["Rock Paper Scissors", "/tools/rock-paper-scissors"],
    ],
  },
];

const totalTools = categorizedTools.reduce((sum, category) => sum + category.tools.length, 0);

const selectionGuides = [
  {
    title: "Need to work with files?",
    desc: "Start in PDF Tools or Image Tools if your task involves compressing, converting, annotating, or extracting content from uploaded files.",
  },
  {
    title: "Working with writing or copy?",
    desc: "Text Tools cover word counts, cleanup, comparisons, and grammar-focused utilities for drafting and editing workflows.",
  },
  {
    title: "Publishing a website?",
    desc: "SEO Tools help with metadata, sitemaps, robots.txt files, and small checks that support search visibility.",
  },
  {
    title: "Need a fast answer or estimate?",
    desc: "Calculators and Converters are built for quick utility work when you want a usable result without extra clutter.",
  },
];

const qualityNotes = [
  {
    title: "Live tools only",
    desc: "This library is focused on tools that are available today, so visitors are not sent into unfinished or placeholder pages.",
  },
  {
    title: "Task-first structure",
    desc: "Categories are organized by the job a visitor wants to complete, not by vague labels or thin landing pages.",
  },
  {
    title: "Browser-friendly workflows",
    desc: "Many tools work directly in the browser, which reduces friction and makes privacy expectations easier to understand.",
  },
  {
    title: "Supporting content matters",
    desc: "Tool pages are paired with instructions, FAQs, and related links so visitors get context instead of a bare utility box.",
  },
];

const faqs = [
  {
    q: "How many live tools are available on ToolMint right now?",
    a: `There are currently ${totalTools} live tools listed in the public library, spanning PDFs, images, text, calculators, developer tasks, SEO, and more.`,
  },
  {
    q: "Does ToolMint require signup or account creation?",
    a: "No. The site is designed around low-friction utility use, so visitors can open a tool, complete a task, and leave without creating an account.",
  },
  {
    q: "Are all tools handled the same way behind the scenes?",
    a: "No. Some tools run locally in the browser, while heavier operations may use server-side processing when the task requires it. Individual tool pages explain that when relevant.",
  },
  {
    q: "Why does the main library page include extra explanatory content?",
    a: "Because a useful tool site should help visitors choose the right tool and understand the workflow, not just act as a bare directory of links.",
  },
];

type SearchParams = Promise<{ q?: string }>;

export default async function ToolsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = resolvedSearchParams?.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();

  const visibleCategories = normalizedQuery
    ? categorizedTools
        .map((category) => ({
          ...category,
          tools: category.tools.filter(([name]) => {
            const haystack = `${name} ${category.title} ${category.summary}`.toLowerCase();
            return haystack.includes(normalizedQuery);
          }),
        }))
        .filter((category) => category.tools.length > 0)
    : categorizedTools;

  const matchedTools = visibleCategories.reduce((sum, category) => sum + category.tools.length, 0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <Link href="/" className="text-sm transition hover:opacity-80" style={{ color: "var(--muted)" }}>
        Back to home
      </Link>

      <h1 className="font-display mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em]">All Tools</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7" style={{ color: "var(--muted)" }}>
        Browse {totalTools} live tools across {categorizedTools.length} categories. ToolMint focuses on practical online work:
        documents, images, writing, lightweight developer tasks, publishing helpers, and everyday calculations.
      </p>

      {query ? (
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.02] p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              Search results for "{query}"
            </h2>
            <span className="rounded-full bg-[#6c63ff]/15 px-3 py-1 text-xs font-medium text-[#bdb8ff]">
              {matchedTools} match{matchedTools === 1 ? "" : "es"}
            </span>
            <Link href="/tools" className="text-sm font-medium text-[#8f86ff] transition hover:underline">
              Clear search
            </Link>
          </div>
        </section>
      ) : null}

      {!query ? (
        <>
          <div className="mt-6 space-y-4 text-sm leading-7" style={{ color: "var(--muted)" }}>
            <p>
              This page is designed as a real navigation hub, not just a list of routes. Each collection groups related tasks so
              visitors can quickly understand where to go next instead of bouncing between disconnected utility pages.
            </p>
            <p>
              If you are compressing files, checking draft copy, generating metadata, or running quick calculations, the sections
              below are the fastest way to find the right workflow.
            </p>
          </div>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Choose The Right Tool Category
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {selectionGuides.map((guide) => (
                <article key={guide.title} className="rounded-2xl border border-white/10 bg-white/[.02] p-5">
                  <h3 className="font-semibold text-foreground">{guide.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{guide.desc}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {visibleCategories.length ? (
        <div className="mt-12 space-y-8">
          {visibleCategories.map((category) => (
            <section key={category.title} className="rounded-2xl p-5" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h2 className="font-display text-xl font-bold">{category.title}</h2>
                  <p className="text-xs leading-5" style={{ color: "var(--muted-2)" }}>
                    {category.summary}
                  </p>
                  <span className="text-xs" style={{ color: "var(--muted-2)" }}>
                    {category.tools.length} tool{category.tools.length === 1 ? "" : "s"}
                  </span>
                </div>
                {category.path && !query ? (
                  <Link href={category.path} className="ml-auto text-xs font-medium text-[#6c63ff] transition hover:underline">
                    View all
                  </Link>
                ) : null}
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
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="mt-12 rounded-2xl border border-white/10 bg-white/[.02] p-6">
          <h2 className="font-display text-2xl font-bold text-foreground">No matching tools found</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Try a different name like "pdf", "json", "counter", "calculator", or "image", or browse the full catalog again.
          </p>
          <div className="mt-4">
            <Link href="/tools" className="text-sm font-medium text-[#8f86ff] transition hover:underline">
              Browse all tools
            </Link>
          </div>
        </section>
      )}

      {!query ? (
        <>
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              What Makes This Library More Useful
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {qualityNotes.map((note) => (
                <article key={note.title} className="rounded-2xl border border-white/10 bg-white/[.02] p-5">
                  <h3 className="font-semibold text-foreground">{note.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{note.desc}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Frequently Asked Questions
            </h2>
            <dl className="mt-6 space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <dt className="font-semibold text-foreground">{faq.q}</dt>
                  <dd className="mt-1 text-sm leading-6 text-muted">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : null}
    </main>
  );
}
