import type { Metadata } from "next";
import Link from "next/link";
import WhitespaceRemoverTool from "@/components/whitespace-remover-tool";

export const metadata: Metadata = {
  title: "Whitespace Remover Online Free — Strip Extra Spaces, Tabs & Blank Lines",
  description:
    "Remove extra whitespace online for free with ToolMint. Trim leading and trailing spaces, collapse double spaces, delete blank lines, and convert tabs. Live counter included.",
  keywords: [
    "whitespace remover",
    "remove extra spaces",
    "strip whitespace online",
    "remove blank lines",
    "trim spaces online",
    "remove tabs from text",
    "clean up text whitespace",
    "space remover tool",
  ],
  alternates: { canonical: "/tools/whitespace-remover" },
  openGraph: {
    title: "Whitespace Remover Online Free | ToolMint",
    description:
      "Strip extra spaces, tabs, and blank lines from text. Toggle multiple cleanup modes at once — free, browser-based.",
    url: "/tools/whitespace-remover",
  },
};

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
    a: "By default, yes. Only enable the \u201cremove blank lines\u201d option if you want to strip empty lines.",
  },
  {
    q: "Does it include a character counter?",
    a: "Yes. A live word, character, and line counter is shown so you can see the effect of each cleanup.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="text-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Whitespace Remover — Free Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Remove extra spaces, trim whitespace, delete blank lines, and convert tabs to spaces
          with ToolMint. Toggle multiple cleanup modes at once and see the result update in
          real time. Live character and word counter included.
        </p>

        <div className="mt-8">
          <WhitespaceRemoverTool />
        </div>

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
