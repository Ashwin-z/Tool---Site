import type { Metadata } from "next";
import Link from "next/link";
import RelatedTools from "@/components/related-tools";
import JsonFormatterTool from "../../../components/json-formatter-tool";

export const metadata: Metadata = {
  title: "JSON Formatter — Beautify, Minify, Validate & Convert to XML, CSV & YAML | ToolMint",
  description:
    "Free online JSON Formatter. Beautify, validate, minify, and convert JSON to XML, CSV, or YAML instantly in your browser. Side-by-side workspace with file upload and one-click download.",
  keywords: [
    "json formatter",
    "json beautifier",
    "json validator",
    "json minifier",
    "format json online",
    "json to xml converter",
    "json to csv converter",
    "json to yaml converter",
    "online json tool",
    "json pretty print",
    "json parser online",
    "minify json",
    "validate json",
    "free json formatter",
  ],
  alternates: { canonical: "/tools/json-formatter" },
  openGraph: {
    title: "JSON Formatter — Beautify, Minify, Validate & Convert JSON Online | ToolMint",
    description:
      "Beautify, validate, minify, and convert JSON to XML, CSV, or YAML — side-by-side workspace in your browser. No upload, no signup.",
    url: "/tools/json-formatter",
  },
};

const includedTools = [
  { title: "Beautify & Format", desc: "Pretty-print JSON with 2, 3, 4 spaces or tab indentation." },
  { title: "Minify / Compact", desc: "Strip all whitespace to produce compact, transfer-ready JSON." },
  { title: "Validate JSON", desc: "Parse-time validation with inline error showing exact line number and column." },
  { title: "Convert to XML", desc: "Transform JSON to well-formed XML with automatic root element wrapping." },
  { title: "Convert to CSV", desc: "Flatten JSON arrays to CSV with dot-notation for nested keys." },
  { title: "Convert to YAML", desc: "Convert JSON to YAML format suitable for config files and CI pipelines." },
];

const steps = [
  { title: "Paste or upload JSON", desc: "Drop your JSON into the left panel or click the file upload button to load a .json file." },
  { title: "Choose an action", desc: "Click Format to beautify, Minify to compact, or select a Convert target — XML, CSV, or YAML." },
  { title: "Review & validate", desc: "The status bar shows parse status, error location, root type, and character counts so you can fix issues instantly." },
  { title: "Copy or download", desc: "Copy the result from the output panel or download it in the matching file format (.json, .xml, .csv, .yaml)." },
];

const faqs = [
  {
    q: "Can I convert JSON to XML, CSV, and YAML?",
    a: "Yes. ToolMint's JSON Formatter includes a one-click converter for all three formats. Switch between conversions without re-pasting your JSON.",
  },
  {
    q: "What happens when JSON has a syntax error?",
    a: "The tool shows a red error badge with the exact line number and column of the first parse failure, so you can locate and fix the problem fast.",
  },
  {
    q: "Can I upload a JSON file instead of pasting?",
    a: "Yes. Click the upload button to load any .json file directly into the input panel. The tool processes it entirely in your browser.",
  },
  {
    q: "Does this tool work with large JSON files?",
    a: "Yes. All processing runs client-side using the browser's native JSON.parse and stringify APIs, so performance scales with your device.",
  },
  {
    q: "What indentation options are available?",
    a: "You can choose 2 spaces, 3 spaces, 4 spaces, or tab indentation before formatting.",
  },
];

export default function JsonFormatterPage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="dev-tool-page mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          JSON Formatter — Beautify, Minify & Convert
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted md:text-base">
          A full-featured JSON workspace: beautify and validate JSON in seconds, minify it for production, or
          convert it to XML, CSV, or YAML — all in a side-by-side editor that runs entirely in your browser.
          No file upload to any server. No account required.
        </p>

        <div className="mt-8">
          <JsonFormatterTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Included JSON Tools
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {includedTools.map((tool) => (
              <div key={tool.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{tool.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{tool.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Use the JSON Formatter
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

        <RelatedTools slug="json-formatter" />
      </main>
    </>
  );
}
