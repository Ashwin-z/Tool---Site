import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import TextCompareTool from "@/components/text-compare-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Text Compare Online – Find Differences Between Two Texts Free",
  description:
    "Compare two texts online for free and see line-by-line differences highlighted in color. Find additions, deletions, and unchanged lines instantly. Ignore case or whitespace. No signup required.",
  keywords: [
    "text compare online free",
    "compare two texts online",
    "find differences between two texts",
    "text diff tool online",
    "diff checker online",
    "side by side text compare",
    "online text comparison",
    "text difference finder",
    "compare paragraphs online",
    "spot changes in text",
  ],
  alternates: { canonical: "/tools/text-compare" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Text Compare Online – Find Differences Between Two Texts | ToolMint",
    description:
      "Compare two texts side by side. Additions, deletions, and unchanged lines highlighted in color. Free, browser-based.",
    url: "/tools/text-compare",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Reviewing document edits",
    desc: "Paste the original and revised version of a document to instantly see what changed, was added, or was removed between drafts.",
  },
  {
    title: "Checking code or config changes",
    desc: "Compare two versions of a config file, script, or snippet to spot unintended edits without switching to a code editor.",
  },
  {
    title: "Proofreading translated text",
    desc: "Check that a translated or paraphrased passage matches the original structure and hasn't dropped or altered sentences.",
  },
];

const steps = [
  { title: "Paste original text", desc: "Enter or paste the first text into the left panel." },
  { title: "Paste modified text", desc: "Enter or paste the second text into the right panel." },
  { title: "Compare", desc: "See additions, deletions, and unchanged lines highlighted side by side." },
  { title: "Adjust options", desc: "Toggle case sensitivity and whitespace ignoring for a more precise diff." },
];

const faqs = [
  {
    q: "What types of differences does it detect?",
    a: "The tool highlights line-by-line additions (new text), deletions (removed text), and unchanged content between the two inputs.",
  },
  {
    q: "Can I ignore case differences?",
    a: "Yes. Toggle the case-insensitive option to treat uppercase and lowercase letters as equal when comparing.",
  },
  {
    q: "Can I ignore whitespace differences?",
    a: "Yes. Enable the whitespace-ignore option to focus only on meaningful content changes, not formatting differences.",
  },
  {
    q: "Is there a character or length limit?",
    a: "There is no hard limit. Very large texts may take a moment to process, but there is no capped length.",
  },
  {
    q: "Is my text sent to a server?",
    a: "No. All comparison runs locally in your browser. Your text is never transmitted anywhere.",
  },
];

export default function TextComparePage() {
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
      <WebAppSchema slug="text-compare" />
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
            { name: "Text Compare" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Text Compare – Find Differences Between Two Texts Online
        </h1>

        <ProcessingBadge slug="text-compare" />
        <ToolAnalytics slug="text-compare" category="text" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Paste two versions of any text and instantly see what changed. Additions are highlighted
          in green, deletions in red, and unchanged lines stay neutral. Toggle case-insensitive
          and whitespace-ignore modes for cleaner results. Everything runs in your browser — no
          files are uploaded or stored.
        </p>

        <div className="mt-8">
          <TextCompareTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Use a Text Diff Tool
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
            How to Compare Two Texts
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
              How Line-by-Line Diff Works
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              A diff tool compares two text inputs and identifies which lines are identical, which
              are new, and which have been removed. The algorithm used here is based on the
              longest common subsequence approach — it finds the maximum set of lines that exist
              in both texts in the same order, then marks everything else as either added or
              deleted. This is the same underlying logic used by version control systems like Git
              when showing a commit diff. Color-coding makes it easy to scan: green lines exist
              only in the second (modified) text, red lines exist only in the first (original)
              text, and neutral lines are present in both. No line numbers or file headers are
              required — just paste two blocks of text and the result is instant.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              When to Use "Ignore Whitespace" and "Ignore Case"
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The ignore-whitespace option removes differences caused by extra spaces, tabs, or
              indentation changes. This is useful when comparing text that has been reformatted
              without any real content changes — for example, a document copied from a PDF with
              irregular line breaks, or a configuration file where indentation was adjusted.
              The ignore-case option treats uppercase and lowercase as equivalent. Use this when
              you care about content changes but not capitalization — for example, comparing a
              draft with a proofreading pass where only spelling was corrected. Using both
              options together gives a minimal diff that only flags actual word-level changes,
              which is often cleaner when reviewing long documents.
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

        <RelatedTools slug="text-compare" />
      </main>
    </>
  );
}
