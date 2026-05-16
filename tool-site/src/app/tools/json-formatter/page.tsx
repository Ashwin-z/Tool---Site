import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import JsonFormatterTool from "@/components/json-formatter-tool-loader";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "JSON Formatter – Beautify, Validate, Minify & Convert JSON Online Free",
  description:
    "Format and validate JSON online for free. Beautify with custom indentation, minify for production, convert to XML, CSV, or YAML — all in a side-by-side browser workspace. No signup.",
  keywords: [
    "json formatter online free",
    "how to validate json online",
    "json beautifier free",
    "json to csv converter online",
    "json minifier online",
    "format json without installing anything",
    "json validator with error line number",
    "json to yaml converter online",
  ],
  alternates: { canonical: "/tools/json-formatter" },
  openGraph: {
    title: "JSON Formatter – Beautify, Validate, Minify & Convert JSON | ToolMint",
    description:
      "Beautify, validate, minify, and convert JSON to XML, CSV, or YAML in a side-by-side browser workspace.",
    url: "/tools/json-formatter",
  },
  twitter: { card: "summary_large_image" },
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
  { title: "Paste or upload JSON", desc: "Drop your JSON into the left panel or use the upload button to load a .json file." },
  { title: "Choose an action", desc: "Click Format to beautify, Minify to compact, or select XML, CSV, or YAML conversion." },
  { title: "Review and validate", desc: "The workspace shows parse status, error location, root type, and character counts." },
  { title: "Copy or download", desc: "Copy the result from the output panel or download it in the matching file format." },
];

const faqs = [
  {
    q: "Can I convert JSON to XML, CSV, and YAML?",
    a: "Yes. ToolMint's JSON Formatter includes a one-click converter for all three formats, and you can switch between them without re-pasting your JSON.",
  },
  {
    q: "What happens when JSON has a syntax error?",
    a: "The tool shows a clear error badge with the exact line number and column of the first parse failure so you can fix the problem fast.",
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

const commonWorkflows = [
  {
    title: "API response debugging",
    desc: "Format raw JSON from REST or GraphQL requests so nested objects, arrays, and error payloads are easier to inspect.",
  },
  {
    title: "Config file cleanup",
    desc: "Validate copied config snippets before moving them into apps, CI files, seed data, or deployment scripts.",
  },
  {
    title: "Data export conversion",
    desc: "Turn JSON arrays into CSV or YAML when a spreadsheet, report, or human-readable config format is easier to work with.",
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
      <WebAppSchema slug="json-formatter" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="dev-tool-page mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Developer Tools", href: "/tools/developer-tools" },
            { name: "JSON Formatter" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          JSON Formatter – Beautify, Validate, Minify & Convert Online Free
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted md:text-base">
          A full-featured JSON workspace: beautify and validate JSON in seconds, minify it for
          production, or convert it to XML, CSV, or YAML in a side-by-side editor that runs in
          your browser. No server upload and no account required.
        </p>

        <div className="mt-8">
          <JsonFormatterTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Common JSON Formatting Workflows
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {commonWorkflows.map((workflow) => (
              <article key={workflow.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{workflow.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{workflow.desc}</p>
              </article>
            ))}
          </div>
        </section>

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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              How to Read JSON Validation Errors
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              JSON has strict syntax rules. The most common errors are: missing or extra commas
              (trailing commas are valid in JavaScript objects but illegal in JSON), single-quoted
              strings instead of double-quoted strings, unquoted property names, and mismatched
              brackets or braces. When JSON.parse fails, the error message names the line and
              column of the first problem — not always where the logical mistake is. For example,
              a missing closing brace at line 5 may only surface as a parse error at line 50 when
              the parser reaches the end of the file. The most reliable debugging approach is to
              check for unmatched brackets first (count <code className="rounded bg-white/10 px-1 text-xs">{`{`}</code> vs
              <code className="rounded bg-white/10 px-1 text-xs">{`}`}</code> and <code className="rounded bg-white/10 px-1 text-xs">[</code> vs
              <code className="rounded bg-white/10 px-1 text-xs">]</code>), then look at the line before the reported error
              for a missing comma, and finally scan for single-quoted strings or bare property names.
              The formatter here shows the exact error position so you can jump directly to the issue.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              When to Minify JSON (and When Not To)
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Minified JSON removes all whitespace, newlines, and indentation — reducing file size
              by 20–40% for typical payloads. This matters for API responses where every byte
              affects page load time and bandwidth costs. Minify JSON when: sending API responses
              in production, embedding JSON in HTML as data attributes, storing JSON in a
              database column where human readability is not needed, and generating config files
              that are only read by machines. Keep JSON formatted (beautified) when: storing it in
              version control where diffs should be readable, writing config files that humans
              edit by hand, debugging API responses, and generating documentation or data samples.
              Minification is lossless — you can always re-beautify minified JSON without losing
              any data. Use this formatter&apos;s minify button for production output and the beautify
              button for anything you or your team will read.
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

        <RelatedTools slug="json-formatter" />
      </main>
    </>
  );
}
