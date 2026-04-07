import type { Metadata } from "next";
import Link from "next/link";
import RockPaperScissorsTool from "@/components/rock-paper-scissors-tool";

export const metadata: Metadata = {
  title: "Rock Paper Scissors Online Free - Play vs Computer | Browser Game",
  description:
    "Play Rock Paper Scissors online for free on ToolMint. Challenge the computer, track your win rate, view game history, and play unlimited rounds instantly in your browser.",
  keywords: [
    "rock paper scissors",
    "rock paper scissors online",
    "rock paper scissors game",
    "play rock paper scissors free",
    "rock paper scissors vs computer",
    "rps game online",
    "stone paper scissors game",
    "rock paper scissors browser game",
  ],
  alternates: { canonical: "/tools/rock-paper-scissors" },
  openGraph: {
    title: "Rock Paper Scissors Online Free — Play vs Computer | ToolMint",
    description:
      "Play unlimited rounds of Rock Paper Scissors against the computer. Track wins, losses, and your overall win rate.",
    url: "/tools/rock-paper-scissors",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rock Paper Scissors Online Free — Play vs Computer | ToolMint",
    description:
      "Play unlimited rounds of Rock Paper Scissors against the computer. Track wins, losses, and your overall win rate.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const includedTools = [
  { title: "Play vs Computer", desc: "Challenge a randomized computer opponent in unlimited rounds." },
  { title: "Score Tracking", desc: "Track wins, losses, draws, and your overall win rate percentage." },
  { title: "Game History", desc: "Review the last 20 rounds with move details and results." },
  { title: "Instant Play", desc: "No downloads or signups — click a move and play instantly." },
];

const steps = [
  { title: "Pick your move", desc: "Choose rock, paper, or scissors by clicking one of the three buttons." },
  { title: "See the result", desc: "The computer picks randomly and the winner is shown instantly." },
  { title: "Track your stats", desc: "View wins, losses, draws, and your win rate in the scoreboard." },
  { title: "Review history", desc: "Scroll through your recent games to spot patterns and improve." },
];

const faqs = [
  {
    q: "How does Rock Paper Scissors work?",
    a: "Rock beats scissors, scissors beats paper, and paper beats rock. If both players choose the same move, it is a draw.",
  },
  {
    q: "Is the computer choice truly random?",
    a: "Yes. The computer uses a random selection each round with no pattern or bias.",
  },
  {
    q: "Can I play Rock Paper Scissors with a friend?",
    a: "This version is designed for single player against the computer. For two players, take turns looking away while the other picks!",
  },
  {
    q: "Does it track my game history?",
    a: "Yes. The tool keeps a history of up to 20 recent rounds showing each move and result.",
  },
  {
    q: "Is this game free to play?",
    a: "Yes. It is completely free and works instantly in your browser with no signup or download.",
  },
];

export default function RockPaperScissorsPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <Link href="/" className="mb-5 inline-block text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Rock Paper Scissors Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Play the classic Rock Paper Scissors game against the computer on ToolMint. Pick your move,
          see instant results, and track your wins, losses, and overall win rate with a detailed game history.
        </p>

        <div className="mt-8">
          <RockPaperScissorsTool />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Game Features
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
            How to Play Rock Paper Scissors Online
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <span className="font-display text-2xl font-bold text-[#6c63ff]">{index + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((faq, index) => (
              <div key={index}>
                <dt className="font-semibold text-foreground">{faq.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </>
  );
}
