import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Plagiarism Checker Online Free — Detect Duplicate Content Instantly",
  description:
    "Check text for plagiarism online for free with ToolMint. Scan your writing against billions of web pages to find duplicate content. Coming soon — no signup required.",
  keywords: [
    "plagiarism checker",
    "plagiarism checker online free",
    "duplicate content checker",
    "plagiarism detection tool",
    "free plagiarism scanner",
    "check for plagiarism",
    "text originality checker",
    "online plagiarism detector",
  ],
  alternates: { canonical: "/tools/plagiarism-checker" },
  openGraph: {
    title: "Plagiarism Checker Online Free | ToolMint",
    description:
      "Scan your text against billions of web pages. Detect duplicate content instantly — coming soon.",
    url: "/tools/plagiarism-checker",
  },
};

const steps = [
  { title: "Paste your text", desc: "Type or paste the content you want to check for originality." },
  { title: "Click Scan", desc: "The tool searches billions of web pages for matching phrases and sentences." },
  { title: "Review matches", desc: "Highlighted passages show which parts appear elsewhere, with source links." },
  { title: "Revise or cite", desc: "Rewrite flagged sections or add proper citations before publishing." },
];

const faqs = [
  {
    q: "How does the plagiarism checker work?",
    a: "It compares your text against a large index of web pages and publications, highlighting passages that appear elsewhere along with their sources.",
  },
  {
    q: "Is there a word limit?",
    a: "The free tier will support generous word limits per scan. Exact limits will be announced at launch.",
  },
  {
    q: "Will it detect paraphrased content?",
    a: "Yes. The detection engine uses semantic similarity, not just exact matching, so lightly paraphrased text is also flagged.",
  },
  {
    q: "Is my text stored after scanning?",
    a: "No. Your text is processed for the scan only and is not stored or shared.",
  },
  {
    q: "When will this tool be available?",
    a: "The plagiarism checker is currently in development. Sign up for updates on the homepage to be notified at launch.",
  },
];

export default function PlagiarismCheckerPage() {
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
          Plagiarism Checker — Free Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Detect duplicate content and check your text against billions of web pages.
          ToolMint&apos;s plagiarism checker highlights matching passages and links back
          to original sources so you can revise or cite properly.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 py-20 text-center shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="mb-4 text-6xl">🔍</div>
          <h2 className="font-display text-2xl font-bold text-white">Coming Soon</h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-muted">
            We&apos;re building a powerful plagiarism detection engine. This tool requires advanced
            web-crawling and text-matching infrastructure that we&apos;re currently setting up.
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
            In Development
          </div>
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How to Check for Plagiarism Online
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
