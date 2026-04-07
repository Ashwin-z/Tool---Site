import type { Metadata } from "next";
import Link from "next/link";
import TextReverserTool from "@/components/text-reverser-tool";

export const metadata: Metadata = {
  title: "Text Reverser Online Free — Reverse Text, Words & Characters",
  description:
    "Reverse text online for free with ToolMint. Reverse entire text, flip word order, or reverse characters in each word. Includes a live word counter.",
  keywords: [
    "reverse text",
    "text reverser online",
    "reverse string online",
    "flip text",
    "reverse words",
    "backwards text generator",
    "reverse characters online",
    "text flipper",
  ],
  alternates: { canonical: "/tools/text-reverser" },
  openGraph: {
    title: "Text Reverser Online Free | ToolMint",
    description:
      "Reverse entire text, flip word order, or reverse characters in each word. Instant, browser-based.",
    url: "/tools/text-reverser",
  },
};

const steps = [
  { title: "Paste your text", desc: "Type or paste the text you want to reverse." },
  { title: "Choose reversal mode", desc: "Reverse the full text, flip word order, or reverse characters within each word." },
  { title: "Preview", desc: "See the reversed result update instantly as you edit." },
  { title: "Copy", desc: "Copy the reversed text to your clipboard with one click." },
];

const faqs = [
  {
    q: "What reversal modes are available?",
    a: "Full text reverse (mirror the entire string), reverse word order (last word first), and reverse characters in each word while keeping word order.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="text-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Text Reverser — Free Online
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Reverse your entire text, flip the word order, or reverse the characters in each
          word using ToolMint. Live word, character, and sentence counter included.
        </p>

        <div className="mt-8">
          <TextReverserTool />
        </div>

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
