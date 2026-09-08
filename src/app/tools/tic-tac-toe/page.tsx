import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import TicTacToeTool from "@/components/tic-tac-toe-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Tic Tac Toe Online Free – Play vs AI or 2 Player No Download",
  description:
    "Play Tic Tac Toe online free. Challenge the AI (minimax algorithm, unbeatable on hard) or play 2-player local. Score tracking, no install, no signup.",
  keywords: [
    "tic tac toe online free",
    "play tic tac toe vs computer",
    "tic tac toe 2 player online free",
    "tic tac toe no download",
    "noughts and crosses online free",
    "tic tac toe game browser",
    "play tic tac toe with computer free",
    "tic tac toe unbeatable ai",
  ],
  alternates: { canonical: "/tools/tic-tac-toe" },
  openGraph: {
    title: "Tic Tac Toe Online Free – Play vs AI or 2 Player | ToolMint",
    description:
      "Play Tic Tac Toe against a smart AI or challenge a friend. Free, instant, no download required.",
    url: "/tools/tic-tac-toe",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

const includedTools = [
  { title: "Play vs AI", desc: "Challenge a minimax-powered AI that plays optimally on hard difficulty — the best outcome is a draw." },
  { title: "2-Player Mode", desc: "Take turns with a friend on the same device for classic head-to-head play." },
  { title: "Difficulty Settings", desc: "Choose between easy (makes mistakes) and hard (minimax, unbeatable) AI difficulty levels." },
  { title: "Score Tracking", desc: "Keep track of wins, losses, and draws across multiple rounds in the same session." },
];

const useCases = [
  { title: "Quick Brain Break", desc: "A 30-second Tic Tac Toe game is the perfect micro-break between tasks — no setup, instant results, play as many rounds as you want." },
  { title: "Kids & Learning", desc: "Teach children turn-based strategy and pattern recognition. Easy mode gives them a fair chance to win against the computer." },
  { title: "Strategy Practice", desc: "Try to find the draw against the hard AI. There is exactly one optimal strategy — figuring it out teaches logical thinking." },
];

const steps = [
  { title: "Choose game mode", desc: "Select 'vs AI' to play against the computer or '2 Player' for local multiplayer." },
  { title: "Set difficulty", desc: "If playing against AI, pick easy or hard difficulty." },
  { title: "Make your move", desc: "Click any empty cell to place your mark. X always goes first." },
  { title: "Win or draw", desc: "Get three in a row to win. The scoreboard tracks your results across rounds." },
];

const faqs = [
  {
    q: "How do I play Tic Tac Toe?",
    a: "Players take turns placing X or O on a 3×3 grid. The first player to get three of their marks in a horizontal, vertical, or diagonal row wins the game.",
  },
  {
    q: "Can I beat the AI on hard mode?",
    a: "No. The hard AI uses the minimax algorithm and plays perfectly. The best outcome you can achieve against it is a draw. Easy mode makes intentional mistakes so you can win.",
  },
  {
    q: "Can two people play on the same device?",
    a: "Yes. Switch to 2-Player mode and take turns clicking on the board. Each player places their mark when it is their turn.",
  },
  {
    q: "Does the game track scores?",
    a: "Yes. The scoreboard tracks wins for X, wins for O, and draws across multiple rounds in the same session.",
  },
  {
    q: "Is this Tic Tac Toe game free?",
    a: "Yes. It is completely free and runs entirely in your browser with no downloads, no ads, and no signups.",
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
      <WebAppSchema slug="tic-tac-toe" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Tic Tac Toe" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Tic Tac Toe Online — Play vs AI or 2 Player Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Play the classic Tic Tac Toe game right in your browser. Challenge a smart AI opponent on easy
          or hard difficulty, or switch to 2-player mode for local multiplayer. Score tracking keeps the
          competition going across multiple rounds. No download, no signup.
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
            Who Plays Tic Tac Toe Online
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {useCases.map((u) => (
              <div key={u.title} className="rounded-xl border border-white/10 bg-white/[.02] p-5">
                <h3 className="font-semibold text-foreground">{u.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{u.desc}</p>
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              The Minimax Algorithm – Why the Hard AI Is Unbeatable
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The hard AI in this game uses the minimax algorithm, a decision-making technique from game
              theory that was formalized by John von Neumann in 1928 and is the foundation of classical
              AI for two-player zero-sum games. Minimax works by simulating every possible sequence of
              moves until the game ends, then assigning a score to each terminal state: +1 for a win, −1
              for a loss, 0 for a draw. The AI then chooses the move that maximizes its score while
              assuming the opponent will make moves that minimize it (hence &quot;minimax&quot;). For Tic Tac Toe,
              the game tree is small enough to compute exhaustively — there are only 255,168 possible games
              (or 26,830 considering rotational symmetry). This means the AI can always find the perfect
              move with certainty. Against a perfect minimax player, the best a human can achieve is a
              draw by also playing perfectly. The easy mode intentionally makes suboptimal moves to give
              players a chance to win. Both modes use the same underlying board state and win detection —
              only the AI move selection differs.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Tic Tac Toe Strategy – How to Always Draw Against the Hard AI
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              If you want to achieve a draw against the unbeatable AI (which is the best possible outcome),
              there are a few key strategic principles. First, if you go first as X, always start with a
              corner. Corner openings give you the most winning opportunities. If the AI plays the center
              in response, you must play the opposite corner — not an adjacent corner, which creates a
              fork opportunity for you but also leaves you vulnerable. Second, if the AI goes first (as X)
              and plays the center, you must play a corner, not an edge — an edge response allows the AI
              to force a win in only a few moves. Third, always prioritize: (1) winning if you have two in
              a row, (2) blocking if the AI has two in a row, (3) creating a fork (two ways to win). The
              most dangerous AI move is creating a fork — two lines of two where you can only block one.
              Preventing forks is the most important non-obvious skill in Tic Tac Toe at intermediate level.
              With perfect play from both sides, the game always ends in a draw — which is why experienced
              players consider the game &quot;solved.&quot;
            </p>
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

        <RelatedTools slug="tic-tac-toe" />
      </main>
    </>
  );
}
