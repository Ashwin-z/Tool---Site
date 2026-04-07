import type { Metadata } from "next";
import Link from "next/link";
import TicTacToeTool from "@/components/tic-tac-toe-tool";

export const metadata: Metadata = {
  title: "Tic Tac Toe Online Free - Play vs AI or 2 Player | Browser Game",
  description:
    "Play Tic Tac Toe online for free on ToolMint. Challenge an unbeatable AI or play with a friend in 2-player mode. Track scores, choose difficulty, and play instantly in your browser.",
  keywords: [
    "tic tac toe",
    "tic tac toe online",
    "tic tac toe game",
    "play tic tac toe free",
    "tic tac toe vs ai",
    "tic tac toe 2 player",
    "noughts and crosses online",
    "tic tac toe browser game",
  ],
  alternates: { canonical: "/tools/tic-tac-toe" },
  openGraph: {
    title: "Tic Tac Toe Online Free — Play vs AI or 2 Player | ToolMint",
    description:
      "Play Tic Tac Toe against a smart AI or challenge a friend. Free, instant, no download required.",
    url: "/tools/tic-tac-toe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tic Tac Toe Online Free — Play vs AI or 2 Player | ToolMint",
    description:
      "Play Tic Tac Toe against a smart AI or challenge a friend. Free, instant, no download required.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const includedTools = [
  { title: "Play vs AI", desc: "Challenge a minimax-powered AI that plays optimally on hard difficulty." },
  { title: "2-Player Mode", desc: "Take turns with a friend on the same device for classic head-to-head play." },
  { title: "Difficulty Settings", desc: "Choose between easy and hard AI difficulty levels." },
  { title: "Score Tracking", desc: "Keep track of wins, losses, and draws across multiple rounds." },
];

const steps = [
  { title: "Choose game mode", desc: "Select 'vs AI' to play against the computer or '2 Player' for local multiplayer." },
  { title: "Set difficulty", desc: "If playing against AI, pick easy or hard difficulty." },
  { title: "Make your move", desc: "Click any empty cell to place your mark. X always goes first." },
  { title: "Win or draw", desc: "Get three in a row to win. The scoreboard tracks your results." },
];

const faqs = [
  {
    q: "How do I play Tic Tac Toe?",
    a: "Players take turns placing X or O on a 3×3 grid. The first player to get three of their marks in a horizontal, vertical, or diagonal row wins the game.",
  },
  {
    q: "Can I beat the AI on hard mode?",
    a: "The hard AI uses the minimax algorithm and plays optimally. The best you can achieve against it is a draw. Easy mode gives you a better chance of winning.",
  },
  {
    q: "Can two people play on the same device?",
    a: "Yes. Switch to 2-Player mode and take turns clicking on the board.",
  },
  {
    q: "Does the game track scores?",
    a: "Yes. The scoreboard tracks wins for X, wins for O, and draws across multiple rounds.",
  },
  {
    q: "Is this Tic Tac Toe game free?",
    a: "Yes. It is completely free and runs entirely in your browser with no downloads or signups.",
  },
];

export default function TicTacToePage() {
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
          Tic Tac Toe Online for Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Play the classic Tic Tac Toe game right in your browser. Challenge a smart AI opponent on easy
          or hard difficulty, or switch to 2-player mode for local multiplayer. Score tracking keeps the
          competition going across multiple rounds.
        </p>

        <div className="mt-8">
          <TicTacToeTool />
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
            How to Play Tic Tac Toe Online
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
