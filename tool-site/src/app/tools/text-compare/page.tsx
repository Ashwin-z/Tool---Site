import type { Metadata } from "next";
import Link from "next/link";
import TextCompareTool from "@/components/text-compare-tool";

export const metadata: Metadata = {
  title: "Text Compare Online Free — Side-by-Side Text Diff Tool",
  description:
    "Compare two texts online for free with ToolMint. Side-by-side diff highlights additions, deletions, and unchanged lines. Ignore case or whitespace. No signup required.",
  keywords: [
    "text compare",
    "text diff online",
    "compare two texts",
    "text comparison tool",
    "diff checker online",
    "online text diff",
    "side by side text compare",
    "find text differences",
  ],
  alternates: { canonical: "/tools/text-compare" },
  openGraph: {
    title: "Text Compare Online Free | ToolMint",
    description:
      "Compare two texts side by side. Highlight additions, deletions, and unchanged lines with optional case and whitespace ignoring.",
    url: "/tools/text-compare",
  },
};

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
    a: "Yes. Toggle the case-insensitive option to treat uppercase and lowercase letters as equal.",
  },
  {
    q: "Can I ignore whitespace differences?",
    a: "Yes. Enable the whitespace-ignore option to focus on meaningful content changes only.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="text-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Text Compare — Free Online Diff Tool
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Compare two texts side by side and see line-by-line differences with ToolMint.
          Additions, deletions, and unchanged content are color-coded for clarity. Optionally
          ignore case or whitespace for a cleaner comparison.
        </p>

        <div className="mt-8">
          <TextCompareTool />
        </div>

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
      </main>
    </>
  );
}
