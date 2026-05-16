import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import TextCaseConverterTool from "@/components/text-case-converter-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Text Case Converter – Change to UPPERCASE, lowercase, Title Case & More",
  description:
    "Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case instantly online. Free, browser-based, no signup required.",
  keywords: [
    "text case converter online free",
    "change text to uppercase online",
    "convert to lowercase online",
    "title case converter",
    "sentence case converter",
    "camelcase converter online",
    "snake case converter",
    "kebab case converter",
    "text capitalization tool",
    "change capitalization online",
  ],
  alternates: { canonical: "/tools/text-case-converter" },
  openGraph: {
    title: "Text Case Converter – UPPERCASE, lowercase, Title Case & More | ToolMint",
    description:
      "Instantly convert text to any case: UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case. Free, browser-based.",
    url: "/tools/text-case-converter",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Fixing copied text",
    desc: "Pasted text from a PDF or website is often in ALL CAPS or inconsistent casing. One click normalizes it to sentence or title case instantly.",
  },
  {
    title: "Writing code and variables",
    desc: "Convert a phrase to camelCase, snake_case, or kebab-case when naming variables, CSS classes, or API fields without typing it out.",
  },
  {
    title: "Headline and title formatting",
    desc: "Apply Title Case to blog post headlines, article titles, and email subject lines in one step without manually capitalizing each word.",
  },
];

const steps = [
  { title: "Paste your text", desc: "Type or paste the text you want to convert." },
  { title: "Pick a case", desc: "Click UPPER, lower, Title, Sentence, camelCase, snake_case, or kebab-case." },
  { title: "Preview output", desc: "See the converted text update instantly in real time." },
  { title: "Copy", desc: "Copy the result to your clipboard with one click." },
];

const faqs = [
  {
    q: "What text cases are supported?",
    a: "UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case are all supported.",
  },
  {
    q: "What is the difference between Title Case and Sentence case?",
    a: "Title Case capitalizes the first letter of every major word. Sentence case capitalizes only the first letter of each sentence, leaving all other words lowercase.",
  },
  {
    q: "Can I convert long documents?",
    a: "Yes. There is no character limit. Paste any length of text and the conversion happens instantly in your browser.",
  },
  {
    q: "Does it include a word counter?",
    a: "Yes. A live word, character, and sentence counter is displayed alongside the text as you type or paste.",
  },
  {
    q: "Is my text sent to a server?",
    a: "No. All conversion happens locally in your browser. Your text stays private and is never transmitted anywhere.",
  },
];

export default function TextCaseConverterPage() {
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
      <WebAppSchema slug="text-case-converter" />
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
            { name: "Text Case Converter" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Text Case Converter – Change to UPPERCASE, lowercase, Title Case & More
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase,
          snake_case, and kebab-case with ToolMint. Paste your text, click the case you want,
          and copy the result instantly. Live word, character, and sentence counter included.
        </p>

        <div className="mt-8">
          <TextCaseConverterTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Change Text Case
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
            How to Change Text Case
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
              When to Use Title Case vs. Sentence Case
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Title Case and Sentence case look similar but follow different rules. Title Case
              capitalizes the first letter of every major word — typically used for blog post
              headings, article titles, book titles, email subject lines, and navigation menu
              items. Most style guides (AP, Chicago, APA) capitalize nouns, verbs, adjectives,
              and adverbs but leave articles, prepositions, and short conjunctions lowercase.
              Sentence case capitalizes only the first word of each sentence and any proper nouns
              — this is the standard for body text, product descriptions, social media captions,
              and most conversational contexts. If you are writing a news headline or a page title,
              Title Case is typically expected. For everything else, Sentence case reads more naturally.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              camelCase, snake_case, and kebab-case Explained
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              These three formats are used in programming and web development rather than natural
              language writing. camelCase joins words without spaces and capitalizes each new word
              after the first — for example, <em>myVariableName</em> or <em>getUserData</em>. It is
              commonly used for JavaScript variables, function names, and JSON property keys.
              snake_case joins words with underscores and keeps everything lowercase — for example,
              <em>my_variable_name</em>. It is the convention in Python variables and database column
              names. kebab-case uses hyphens instead of underscores — for example,
              <em>my-variable-name</em>. It is the standard for CSS class names, HTML attributes, and
              URL slugs. Use this tool to quickly convert any phrase into the correct format for your
              project without manually retyping it.
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

        <RelatedTools slug="text-case-converter" />
      </main>
    </>
  );
}
