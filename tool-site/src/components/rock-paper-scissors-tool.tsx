"use client";

import { useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   ROCK PAPER SCISSORS — Play vs Computer
   ═══════════════════════════════════════════════════════ */

type Choice = "rock" | "paper" | "scissors";
type RoundResult = "win" | "lose" | "draw";

interface Round {
  player: Choice;
  computer: Choice;
  result: RoundResult;
}

const CHOICES: { id: Choice; emoji: string; label: string }[] = [
  { id: "rock", emoji: "🪨", label: "Rock" },
  { id: "paper", emoji: "📄", label: "Paper" },
  { id: "scissors", emoji: "✂️", label: "Scissors" },
];

const BEATS: Record<Choice, Choice> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

function getResult(player: Choice, computer: Choice): RoundResult {
  if (player === computer) return "draw";
  return BEATS[player] === computer ? "win" : "lose";
}

function getRandomChoice(): Choice {
  const choices: Choice[] = ["rock", "paper", "scissors"];
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function RockPaperScissorsTool() {
  const [scores, setScores] = useState({ wins: 0, losses: 0, draws: 0 });
  const [history, setHistory] = useState<Round[]>([]);
  const [lastRound, setLastRound] = useState<Round | null>(null);
  const [animating, setAnimating] = useState(false);

  const play = useCallback(
    (playerChoice: Choice) => {
      if (animating) return;
      setAnimating(true);

      // Brief delay for visual feedback
      setTimeout(() => {
        const computerChoice = getRandomChoice();
        const result = getResult(playerChoice, computerChoice);
        const round: Round = { player: playerChoice, computer: computerChoice, result };

        setLastRound(round);
        setHistory((h) => [round, ...h].slice(0, 20));
        setScores((s) => ({
          wins: s.wins + (result === "win" ? 1 : 0),
          losses: s.losses + (result === "lose" ? 1 : 0),
          draws: s.draws + (result === "draw" ? 1 : 0),
        }));
        setAnimating(false);
      }, 300);
    },
    [animating],
  );

  const resetAll = () => {
    setScores({ wins: 0, losses: 0, draws: 0 });
    setHistory([]);
    setLastRound(null);
  };

  const totalGames = scores.wins + scores.losses + scores.draws;
  const winRate = totalGames > 0 ? ((scores.wins / totalGames) * 100).toFixed(1) : "0.0";

  const resultColor = lastRound?.result === "win" ? "text-[#38d9a9]" : lastRound?.result === "lose" ? "text-[#ff6584]" : "text-amber-400";
  const resultText = lastRound?.result === "win" ? "You Win! 🎉" : lastRound?.result === "lose" ? "You Lose! 😔" : "It's a Draw!";

  return (
    <div className="space-y-4">
      {/* Game card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Rock Paper Scissors</h2>
          <button
            onClick={resetAll}
            className="text-xs font-semibold text-muted transition hover:text-white"
          >
            Reset
          </button>
        </div>

        {/* Result display */}
        <div className="flex flex-col items-center px-5 py-6">
          {lastRound ? (
            <>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-5xl">{CHOICES.find((c) => c.id === lastRound.player)?.emoji}</div>
                  <div className="mt-2 text-xs font-semibold text-muted">You</div>
                </div>
                <div className="font-display text-2xl font-bold text-muted">vs</div>
                <div className="text-center">
                  <div className="text-5xl">{CHOICES.find((c) => c.id === lastRound.computer)?.emoji}</div>
                  <div className="mt-2 text-xs font-semibold text-muted">Computer</div>
                </div>
              </div>
              <div className={`mt-4 text-xl font-bold ${resultColor}`}>{resultText}</div>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="text-4xl">🪨 📄 ✂️</div>
              <p className="mt-3 text-sm text-muted">Choose your move to start playing!</p>
            </div>
          )}

          {/* Choice buttons */}
          <div className="mt-6 flex gap-3">
            {CHOICES.map((choice) => (
              <button
                key={choice.id}
                onClick={() => play(choice.id)}
                disabled={animating}
                className={`flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-2 px-6 py-4 transition hover:-translate-y-1 hover:border-[#6c63ff]/40 hover:bg-surface-3 ${
                  animating ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <span className="text-3xl">{choice.emoji}</span>
                <span className="text-xs font-semibold text-white">{choice.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <ScoreCard label="Wins" value={scores.wins} color="text-[#38d9a9]" accent="bg-[#38d9a9]" />
        <ScoreCard label="Losses" value={scores.losses} color="text-[#ff6584]" accent="bg-[#ff6584]" />
        <ScoreCard label="Draws" value={scores.draws} color="text-amber-400" accent="bg-amber-400" />
        <ScoreCard label="Win Rate" value={`${winRate}%`} color="text-[#6c63ff]" accent="bg-[#6c63ff]" />
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <span className="h-2 w-2 rounded-full bg-[#6c63ff]" />
            <h3 className="font-display text-sm font-bold tracking-tight text-white">Game History</h3>
            <span className="ml-auto text-xs text-muted">{totalGames} games</span>
          </div>
          <div className="max-h-64 divide-y divide-white/5 overflow-y-auto">
            {history.map((round, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-2.5 text-sm">
                <span className="text-lg">{CHOICES.find((c) => c.id === round.player)?.emoji}</span>
                <span className="text-xs text-muted">vs</span>
                <span className="text-lg">{CHOICES.find((c) => c.id === round.computer)?.emoji}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    round.result === "win"
                      ? "bg-[#38d9a9]/15 text-[#38d9a9]"
                      : round.result === "lose"
                        ? "bg-[#ff6584]/15 text-[#ff6584]"
                        : "bg-amber-400/15 text-amber-400"
                  }`}
                >
                  {round.result === "win" ? "Won" : round.result === "lose" ? "Lost" : "Draw"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, value, color, accent }: { label: string; value: number | string; color: string; accent: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <span className={`h-2 w-2 rounded-full ${accent}`} />
        <span className="text-xs font-semibold text-muted">{label}</span>
      </div>
      <div className="px-4 py-4 text-center">
        <div className={`font-mono text-3xl font-bold ${color}`}>{value}</div>
      </div>
    </div>
  );
}
