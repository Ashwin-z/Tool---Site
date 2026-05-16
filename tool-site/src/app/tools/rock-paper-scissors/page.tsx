import type { Metadata } from "next";
import RelatedTools from "@/components/related-tools";
import RockPaperScissorsTool from "@/components/rock-paper-scissors-tool";
import ToolBreadcrumbs from "@/components/tool-breadcrumbs";
import WebAppSchema from "@/components/web-app-schema";

export const metadata: Metadata = {
  title: "Rock Paper Scissors Online Free – Play vs Computer No Install",
  description:
    "Play Rock Paper Scissors online free against the computer. Track win rate, view game history, unlimited rounds. No download, no signup, instant play in browser.",
  keywords: [
    "rock paper scissors online free",
    "play rock paper scissors vs computer",
    "rock paper scissors game online",
    "stone paper scissors online free",
    "rock paper scissors no download",
    "rps game online free",
    "rock paper scissors browser game free",
    "play rock paper scissors free no signup",
  ],
  alternates: { canonical: "/tools/rock-paper-scissors" },
  openGraph: {
    title: "Rock Paper Scissors Online Free – Play vs Computer | ToolMint",
    description:
      "Play unlimited rounds of Rock Paper Scissors against the computer. Track wins, losses, and your overall win rate.",
    url: "/tools/rock-paper-scissors",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

const includedTools = [
  { title: "Play vs Computer", desc: "Challenge a randomized computer opponent in unlimited rounds with no waiting or turn limits." },
  { title: "Score Tracking", desc: "Track wins, losses, draws, and your overall win rate percentage across the session." },
  { title: "Game History", desc: "Review the last 20 rounds with move details and results to spot patterns." },
  { title: "Instant Play", desc: "No downloads or signups — click a move and play instantly from any device." },
];

const useCases = [
  { title: "Quick Decisions", desc: "Use RPS to settle ties, decide who goes first, or make a random choice when two options are equally good." },
  { title: "Boredom Buster", desc: "A fast, mindless game that takes 2 seconds per round — perfect for a micro-break without opening a more involved game." },
  { title: "Probability Learning", desc: "Track win rates over many rounds to understand empirically why the expected win rate against a truly random opponent is 33.3%." },
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
    a: "Yes. The computer uses a random selection each round with no pattern or bias, so there is no strategy that beats it consistently over many rounds.",
  },
  {
    q: "Can I play Rock Paper Scissors with a friend?",
    a: "This version is designed for single player against the computer. For two players, take turns looking away while the other picks — the honor system makes it work.",
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
      <WebAppSchema slug="rock-paper-scissors" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="calc-tool-page mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
        <ToolBreadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Tools", href: "/tools" },
            { name: "Rock Paper Scissors" },
          ]}
        />

        <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          Rock Paper Scissors Online — Play vs Computer Free
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted md:text-base">
          Play the classic Rock Paper Scissors game against the computer. Pick your move, see instant
          results, and track your wins, losses, and overall win rate with a detailed game history.
          Unlimited rounds, no install, no signup.
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
            Why People Play Rock Paper Scissors Online
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

        <section className="mt-16 space-y-10">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              The Probability Behind Rock Paper Scissors – Why You Can&apos;t Beat a Truly Random Opponent
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Rock Paper Scissors is a simultaneous-move game with three outcomes: win, lose, or draw.
              Against a truly random opponent who picks each move independently with equal probability
              (1/3 each), no strategy can give you a long-run win rate above 33.3%. The game theory
              explanation: if your opponent is playing randomly, any bias in your own choices (e.g.,
              playing rock more often) will be exploited as soon as your pattern becomes detectable.
              The only Nash equilibrium strategy is mixed — pick each option with exactly 1/3 probability,
              independently each round. A computer programmed with a true random number generator plays
              exactly this Nash equilibrium, which is why over many rounds your win rate will converge
              to approximately 33.3% regardless of your strategy. However, human RPS is different.
              Research shows humans are terrible at playing randomly — we have biases (rock is the most
              common first move among men; beginners repeat their winning move and switch after losing),
              and we pick predictable sequences. Professional RPS tournaments and academic studies on
              human decision-making use the game to study cognitive biases and pattern recognition.
              Against a human opponent, reading behavior and breaking patterns is a genuine skill.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Rock Paper Scissors Variants and Extensions You May Not Know
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The basic three-move version of Rock Paper Scissors (also called Roshambo in the US, Jan
              Ken Pon in Japan, and Ching Chong Cha in parts of Africa) has spawned numerous extensions
              to reduce the draw rate. The most well-known is Rock Paper Scissors Lizard Spock, introduced
              by internet personality Sam Kass and popularized by the TV show The Big Bang Theory. It adds
              Lizard (beats Paper and Spock) and Spock (beats Rock and Scissors), creating 10 possible
              outcomes instead of 3 and reducing the draw rate from 33.3% to 20%. Each gesture beats
              exactly 2 others and loses to exactly 2 others, maintaining perfect symmetry. Another
              variant is 15-gesture RPS, which extends the same structure mathematically — any odd number
              of gestures can be arranged so each beats exactly half the others and loses to the other half,
              maintaining the balanced structure. The core two-player simultaneous move game structure
              appears in many real-world scenarios including penalty kicks in football (where keepers and
              kickers study each other&apos;s tendencies), auction bidding strategy, and network protocol
              collision avoidance algorithms.
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

        <RelatedTools slug="rock-paper-scissors" />
      </main>
    </>
  );
}
