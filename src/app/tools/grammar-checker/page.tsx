import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import GrammarCheckerTool from "@/components/grammar-checker-tool-loader";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Free Grammar Checker Online – Fix Spelling & Grammar Instantly",
  description:
    "Check grammar and spelling online for free. Find and fix spelling mistakes, capitalization errors, repeated words, confused words, and run-on sentences. No signup required.",
  keywords: [
    "grammar checker online free",
    "check grammar online",
    "spell check online free",
    "fix grammar mistakes online",
    "free proofreading tool online",
    "grammar correction online",
    "spelling and grammar checker",
    "proofread text online free",
    "online grammar fixer",
    "check spelling without grammarly",
  ],
  alternates: { canonical: "/tools/grammar-checker" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Free Grammar Checker Online – Fix Spelling & Grammar Instantly | ToolMint",
    description:
      "Instantly find and fix spelling, capitalization, and grammar errors. Fast browser-based checks, no signup.",
    url: "/tools/grammar-checker",
  },
  twitter: { card: "summary_large_image" },
};

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

const steps = [
  { title: "Paste your text", desc: "Type or paste the text you want to proofread." },
  { title: "Click Check Grammar", desc: "The tool scans for spelling, capitalization, repeated-word, and grammar issues." },
  { title: "Review suggestions", desc: "Each issue is highlighted with a suggestion you can accept or skip." },
  { title: "Apply fixes", desc: "Fix issues one by one or apply all suggestions at once, then copy the corrected text." },
];

const faqs = [
  {
    q: "What types of errors does it detect?",
    a: "Spelling mistakes, capitalization errors, repeated words, commonly confused words such as 'their' and 'there', and run-on sentences.",
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
      <WebAppSchema slug="grammar-checker" />
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
          Free Grammar Checker – Fix Spelling & Grammar Errors Online
        </h1>

        <ProcessingBadge slug="grammar-checker" />
        <ToolAnalytics slug="grammar-checker" category="text" />

        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Paste your text and click &ldquo;Check Grammar&rdquo; to instantly find spelling mistakes,
          capitalization errors, repeated words, confused words, and more. Fix issues one by one or
          apply all suggestions at once with ToolMint. Tuned for quick English proofreading of
          emails, school work, blog drafts, and short-form website copy — no account needed.
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Most Common Grammar Mistakes in English Writing
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The most frequently flagged issues in English writing fall into a handful of
              recurring patterns. Confused homophones — their/there/they&apos;re, your/you&apos;re,
              its/it&apos;s, affect/effect — account for a large share of errors in casual writing
              because spell-checkers pass them as correctly spelled words. Repeated words occur
              when editing leaves a duplicate term after a cut and paste — &ldquo;the the&rdquo; or
              &ldquo;had had&rdquo; — and are easy to miss in a normal read-through. Capitalization errors are
              common when pasting text from all-caps sources or when proper nouns are left
              lowercase. Run-on sentences join two independent clauses with only a comma instead
              of a conjunction or full stop. Subject-verb agreement errors (&ldquo;the team are&rdquo; vs.
              &ldquo;the team is&rdquo;) appear most often in longer sentences where the subject and verb
              are separated by a relative clause. This tool catches all of these categories in
              a single pass.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Rule-Based Checking vs. AI Grammar Checkers: What Is the Difference?
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Rule-based grammar checkers apply a fixed set of linguistic rules to detect
              specific error patterns. They are fast, predictable, and work entirely in the
              browser without sending your text to any server. The trade-off is that they cannot
              interpret context — a confused homophone that is correctly spelled will pass most
              rule-based checks unless the tool has a curated list of common confusable word pairs.
              AI-based grammar checkers like Grammarly use language models to evaluate meaning and
              suggest rewrites, which catches subtler issues but requires uploading your text to a
              remote server. For quick proofreading of emails, blog posts, and short documents —
              especially when privacy matters — rule-based checking is faster and more suitable.
              For in-depth editing of long-form writing where tone and style matter, an AI tool adds
              more value. This tool is designed for the former use case: fast, private, and free.
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

        <RelatedTools slug="grammar-checker" />
      </main>
    </>
  );
}
