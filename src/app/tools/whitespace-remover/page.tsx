import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import WhitespaceRemoverTool from "@/components/whitespace-remover-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Whitespace Remover – Strip Extra Spaces, Tabs & Blank Lines Online Free",
  description:
    "Remove extra whitespace from text online for free. Trim leading and trailing spaces, collapse double spaces, delete blank lines, and convert tabs. Live preview, no signup required.",
  keywords: [
    "whitespace remover online free",
    "remove extra spaces from text",
    "strip whitespace online",
    "remove blank lines from text",
    "trim spaces online",
    "remove tabs from text online",
    "clean up text spaces",
    "remove double spaces online",
    "text cleanup tool",
    "normalize whitespace online",
  ],
  alternates: { canonical: "/tools/whitespace-remover" },
  openGraph: {
    title: "Whitespace Remover – Strip Extra Spaces, Tabs & Blank Lines | ToolMint",
    description:
      "Remove extra spaces, blank lines, and tabs from text instantly. Multiple cleanup modes, live preview. Free, browser-based.",
    url: "/tools/whitespace-remover",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Cleaning copied text",
    desc: "Text pasted from PDFs, Word documents, or websites often carries irregular spacing and blank lines. Strip it clean in one pass.",
  },
  {
    title: "Preparing data for spreadsheets",
    desc: "Extra spaces in cells cause mismatches and failed lookups. Clean text before pasting into Excel or Google Sheets.",
  },
  {
    title: "Formatting code snippets",
    desc: "Normalize indentation and remove trailing whitespace from config files, SQL queries, and code snippets before sharing.",
  },
];

const steps = [
  { title: "Paste your text", desc: "Type or paste text that contains unwanted whitespace." },
  { title: "Toggle cleanup modes", desc: "Enable trim edges, collapse spaces, remove blank lines, convert tabs, and more." },
  { title: "Preview cleaned text", desc: "See the cleaned output update in real time as you toggle each option." },
  { title: "Copy", desc: "Copy the cleaned text to your clipboard with one click." },
];

const faqs = [
  {
    q: "What cleanup modes are available?",
    a: "Trim leading/trailing spaces, collapse multiple spaces to one, remove blank lines, convert tabs to spaces, and strip all whitespace entirely.",
  },
  {
    q: "Can I use multiple modes at once?",
    a: "Yes. Toggle any combination of modes and the cleaned text updates in real time.",
  },
  {
    q: "Does it preserve line breaks?",
    a: "By default, yes. Only enable the 'remove blank lines' option if you want to strip empty lines.",
  },
  {
    q: "Does it include a character counter?",
    a: "Yes. A live word, character, and line counter is shown so you can see the effect of each cleanup mode.",
  },
  {
    q: "Is my text stored anywhere?",
    a: "No. All processing runs in your browser. Your text is never sent to a server.",
  },
];

export default function WhitespaceRemoverPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <WebAppSchema slug="whitespace-remover" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="text-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Text Tools", href: "/tools/text-tools" },
            { name: "Whitespace Remover" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Whitespace Remover – Strip Extra Spaces, Tabs & Blank Lines Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Remove extra spaces, trim whitespace, delete blank lines, and convert tabs to spaces
          with ToolMint. Toggle multiple cleanup modes at once and see the result update in
          real time. Live character and word counter included. 100% browser-based.
        </p>

        <div className="mt-8">
          <WhitespaceRemoverTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Remove Whitespace
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (
              <article key={item.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Remove Whitespace
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{i + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Why Text Copied from PDFs and Websites Has Messy Whitespace
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              When you copy text from a PDF, every line break in the original document is converted
              to a newline or carriage return in the pasted output — even mid-sentence. A paragraph
              that flows normally in the PDF becomes a series of fragmented lines. Similarly, HTML
              pages often include non-breaking spaces, multiple consecutive spaces, and invisible
              formatting characters that are not visible in the browser but show up when the text is
              pasted into a plain-text editor or spreadsheet. Column-based content like tables and
              forms can produce tab characters that separate values. Whitespace problems also appear
              in text exported from legacy databases, extracted by OCR tools, and copied from email
              clients with rich formatting. The cleanup modes here handle all of these cases — trim
              edges, collapse spaces, remove blank lines, and convert tabs can be used individually
              or in combination depending on what the source text contains.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Why Extra Spaces Break Data Matching
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Extra whitespace is one of the most common causes of silent failures in data
              pipelines. In a spreadsheet VLOOKUP or SQL JOIN, a value like &ldquo;John Smith&rdquo; with
              a trailing space will not match &ldquo;John Smith&rdquo; without one — even though they look
              identical on screen. In programming, string comparisons are character-exact, so any
              leading or trailing space creates a mismatch that is difficult to debug without a
              whitespace visualization tool. In email templates and mail merge systems, extra spaces
              in name fields lead to awkward formatting. Normalizing whitespace before pasting
              data into any system that does string matching — spreadsheets, databases, CRMs, or
              form submissions — avoids these problems entirely. The trim and collapse modes here
              handle the most common cases with a single toggle.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((f, i) => (
              <div key={i}>
                <dt className="font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <RelatedTools slug="whitespace-remover" />
      </main>
    </>
  );
}
