import type { Metadata } from "next";
import GrammarCheckerTool from "@/components/grammar-checker-tool-loader";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";

export const metadata: Metadata = {
  title: "Grammar Checker Online Free - Fix Spelling & Grammar Instantly",
  description:
    "Check grammar and spelling online for free with ToolMint. Find and fix spelling mistakes, capitalization errors, repeated words, confused words, and run-on sentences. No signup required.",
  keywords: [
    "grammar checker",
    "grammar checker online free",
    "spell check online",
    "fix grammar online",
    "free grammar checker",
    "spelling and grammar tool",
    "online proofreader",
    "grammar correction tool",
  ],
  alternates: { canonical: "/tools/grammar-checker" },
  openGraph: {
    title: "Grammar Checker Online Free | ToolMint",
    description:
      "Find and fix spelling, capitalization, and grammar errors instantly with fast browser-based checks.",
    url: "/tools/grammar-checker",
  },
};

const steps = [
  { title: "Paste your text", desc: "Type or paste the text you want to proofread." },
  { title: "Click Check Grammar", desc: "The tool scans for spelling, capitalization, repeated-word, and grammar issues." },
  { title: "Review suggestions", desc: "Each issue is highlighted with a suggestion you can accept or skip." },
  { title: "Apply fixes", desc: "Fix issues one by one or apply all suggestions at once, then copy the corrected text." },
];

const faqs = [
  {
    q: "What types of errors does it detect?",
    a: "Spelling mistakes, capitalization errors, repeated words, commonly confused words such as their and there, and run-on sentences.",
  },
  {
    q: "Is this AI-powered?",
    a: "The current version focuses on fast rule-based checks for common writing mistakes. It is best for quick proofreading before you send or publish text.",
  },
  {
    q: "Does it work with non-English text?",
    a: "The rule-based engine currently focuses on English text, so results may be limited for other languages.",
  },
  {
    q: "Can I apply all fixes at once?",
    a: "Yes. Click the Apply All button to accept every suggestion in one step, or review them individually.",
  },
  {
    q: "Is my text sent to a server?",
    a: "No. All grammar and spelling checks run locally in your browser. Your text is never transmitted.",
  },
];

const useCases = [
  {
    title: "Emails and messages",
    desc: "Catch obvious spelling and capitalization mistakes before sending client emails, support replies, or application messages.",
  },
  {
    title: "Essays and assignments",
    desc: "Do a fast pass on student writing to spot repeated words, confused terms, and sentence-level issues before submission.",
  },
  {
    title: "Website copy and captions",
    desc: "Clean up homepage text, product descriptions, blog intros, and social captions without leaving your browser.",
  },
];

export default function GrammarCheckerPage() {
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
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Text Tools", href: "/tools/text-tools" },
            { name: "Grammar Checker" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Grammar Checker - Free Online
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Paste your text and click &ldquo;Check Grammar&rdquo; to instantly find spelling mistakes,
          capitalization errors, repeated words, confused words, and more. Fix issues one by one or
          apply all suggestions at once with ToolMint. The tool is tuned for quick English proofreading
          that helps with emails, school work, blog drafts, and short-form website copy.
        </p>

        <div className="mt-8">
          <GrammarCheckerTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Best Uses for This Grammar Checker
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
            How to Check Grammar Online
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
