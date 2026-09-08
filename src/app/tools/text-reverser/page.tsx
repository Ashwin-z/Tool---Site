import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import TextReverserTool from "@/components/text-reverser-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";
import ProcessingBadge from "@/components/processing-badge";
import ToolAnalytics from "@/components/tool-analytics";

export const metadata: Metadata = {
  title: "Text Reverser Online – Reverse Text, Words & Characters Free",
  description:
    "Reverse text online for free. Mirror the entire string, flip word order, or reverse characters in each word. Instant browser-based processing. No signup required.",
  keywords: [
    "reverse text online free",
    "text reverser tool",
    "flip text online",
    "reverse string online",
    "backwards text generator",
    "reverse word order online",
    "mirror text online",
    "reverse characters in text",
    "reversed text tool",
    "text flipper online",
  ],
  alternates: { canonical: "/tools/text-reverser" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Text Reverser Online – Reverse Text, Words & Characters | ToolMint",
    description:
      "Reverse entire text, flip word order, or reverse characters in each word. Instant, browser-based, free.",
    url: "/tools/text-reverser",
  },
  twitter: { card: "summary_large_image" },
};

const useCases = [
  {
    title: "Fun and social content",
    desc: "Generate mirrored or backwards text for creative social posts, usernames, puzzles, and novelty captions.",
  },
  {
    title: "Coding and testing",
    desc: "Quickly flip a string to test string-reversal logic, debug parsing code, or verify palindrome detection.",
  },
  {
    title: "Word puzzles and games",
    desc: "Create reversed word lists for quizzes, word games, and classroom activities without doing it by hand.",
  },
];

const steps = [
  { title: "Paste your text", desc: "Type or paste the text you want to reverse." },
  { title: "Choose reversal mode", desc: "Reverse the full text, flip word order, or reverse characters within each word." },
  { title: "Preview", desc: "See the reversed result update instantly as you edit." },
  { title: "Copy", desc: "Copy the reversed text to your clipboard with one click." },
];

const faqs = [
  {
    q: "What reversal modes are available?",
    a: "Full text reverse (mirror the entire string), reverse word order (last word first), and reverse characters in each word while keeping word order intact.",
  },
  {
    q: "Can I reverse text with emojis or Unicode?",
    a: "Yes. The reverser handles Unicode characters including emojis, accented letters, and CJK scripts.",
  },
  {
    q: "Is there a character limit?",
    a: "No fixed limit. Even very long texts are processed instantly in your browser.",
  },
  {
    q: "Does it include a word counter?",
    a: "Yes. A live word, character, and sentence counter is displayed below the text area.",
  },
  {
    q: "Is my text sent to a server?",
    a: "No. All processing runs locally in your browser. Your text is never transmitted.",
  },
];

export default function TextReverserPage() {
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
      <WebAppSchema slug="text-reverser" />
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
            { name: "Text Reverser" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Text Reverser – Reverse Text, Words & Characters Online Free
        </h1>

        <ProcessingBadge slug="text-reverser" />
        <ToolAnalytics slug="text-reverser" category="text" />
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Reverse your entire text, flip the word order, or reverse the characters in each
          word with ToolMint. Choose the reversal mode that fits your need and copy the
          result instantly. Live word, character, and sentence counter included.
        </p>

        <div className="mt-8">
          <TextReverserTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            When to Reverse Text
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
            How to Reverse Text
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
              Understanding the Three Reversal Modes
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The full text reverse mode treats the entire input as a single character sequence and
              flips it end to end. The result reads right-to-left and mirrors the original completely —
              useful for decorative text, puzzles, and novelty content. The reverse word order mode
              keeps each word intact but rearranges their position so the last word comes first and
              the first word comes last. This is different from mirroring because individual words
              remain readable; only the sentence structure is inverted. The reverse characters per
              word mode keeps words in their original order but flips the character sequence within
              each individual word — so &ldquo;hello world&rdquo; becomes &ldquo;olleh dlrow&rdquo;.
              This is useful for certain cipher-like encoding tasks and word game variants.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Using Reversed Text for Fun and Puzzles
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Reversed text is a common element in puzzles, riddles, and creative content. Mirror
              writing — where text reads normally when reflected — was famously used by Leonardo da
              Vinci in his notebooks. Backwards text appears in brainteasers where solving the puzzle
              requires reading a reversed phrase. For social media, reversed text in bio fields or
              captions creates an unusual visual that stands out in a feed. In education, reversing
              word lists helps students practice identifying words in both normal and scrambled form.
              This tool supports all these use cases with no character limit and instant output — paste
              any length of text and the reversed result is available to copy in under a second.
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

        <RelatedTools slug="text-reverser" />
      </main>
    </>
  );
}
