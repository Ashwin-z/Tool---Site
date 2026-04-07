"use client";

import { useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   TIC TAC TOE — Play vs AI or 2-player mode
   ═══════════════════════════════════════════════════════ */

type CellValue = "X" | "O" | null;
type GameMode = "ai" | "2player";
type Difficulty = "easy" | "hard";

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

function checkWinner(board: CellValue[]): { winner: "X" | "O"; line: number[] } | null {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a]!, line: combo };
    }
  }
  return null;
}

function isDraw(board: CellValue[]): boolean {
  return board.every((cell) => cell !== null);
}

function minimax(board: CellValue[], isMaximizing: boolean): number {
  const result = checkWinner(board);
  if (result?.winner === "O") return 10;
  if (result?.winner === "X") return -10;
  if (isDraw(board)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "O";
        best = Math.max(best, minimax(board, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "X";
        best = Math.min(best, minimax(board, true));
        board[i] = null;
      }
    }
    return best;
  }
}

function getAiMove(board: CellValue[], difficulty: Difficulty): number {
  const empty = board.map((c, i) => (c === null ? i : -1)).filter((i) => i !== -1);
  if (empty.length === 0) return -1;

  if (difficulty === "easy") {
    // 40% chance of random move, 60% optimal
    if (Math.random() < 0.4) {
      return empty[Math.floor(Math.random() * empty.length)];
    }
  }

  // Hard: minimax
  let bestScore = -Infinity;
  let bestMove = empty[0];
  for (const i of empty) {
    board[i] = "O";
    const score = minimax(board, false);
    board[i] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }
  return bestMove;
}

export default function TicTacToeTool() {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [mode, setMode] = useState<GameMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [scores, setScores] = useState({ x: 0, o: 0, draws: 0 });

  const winResult = checkWinner(board);
  const draw = !winResult && isDraw(board);
  const gameOver = !!winResult || draw;

  const handleClick = useCallback(
    (index: number) => {
      if (board[index] || gameOver) return;
      if (mode === "ai" && !isXTurn) return; // AI's turn

      const newBoard = [...board];
      newBoard[index] = isXTurn ? "X" : "O";

      const result = checkWinner(newBoard);
      if (result) {
        setBoard(newBoard);
        setScores((s) => ({ ...s, [result.winner.toLowerCase()]: s[result.winner === "X" ? "x" : "o"] + 1 }));
        return;
      }
      if (isDraw(newBoard)) {
        setBoard(newBoard);
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
        return;
      }

      if (mode === "ai") {
        // Player placed X, now AI places O
        const aiMove = getAiMove([...newBoard], difficulty);
        if (aiMove >= 0) {
          newBoard[aiMove] = "O";
          const aiResult = checkWinner(newBoard);
          if (aiResult) {
            setBoard(newBoard);
            setScores((s) => ({ ...s, o: s.o + 1 }));
            return;
          }
          if (isDraw(newBoard)) {
            setBoard(newBoard);
            setScores((s) => ({ ...s, draws: s.draws + 1 }));
            return;
          }
        }
        setBoard(newBoard);
        setIsXTurn(true);
      } else {
        setBoard(newBoard);
        setIsXTurn(!isXTurn);
      }
    },
    [board, gameOver, isXTurn, mode, difficulty],
  );

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
  };

  const resetAll = () => {
    resetGame();
    setScores({ x: 0, o: 0, draws: 0 });
  };

  const statusText = winResult
    ? `${winResult.winner} wins! 🎉`
    : draw
      ? "It's a draw!"
      : mode === "ai"
        ? "Your turn (X)"
        : `${isXTurn ? "X" : "O"}'s turn`;

  return (
    <div className="space-y-4">
      {/* Settings card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">Tic Tac Toe</h2>
          <div className="flex gap-2">
            <div className="flex rounded-lg border border-border bg-surface-2 p-0.5 text-xs">
              <button
                onClick={() => { setMode("ai"); resetGame(); }}
                className={`rounded-md px-3 py-1.5 font-semibold transition ${mode === "ai" ? "bg-[#6c63ff] text-white" : "text-muted hover:text-foreground"}`}
              >
                vs AI
              </button>
              <button
                onClick={() => { setMode("2player"); resetGame(); }}
                className={`rounded-md px-3 py-1.5 font-semibold transition ${mode === "2player" ? "bg-[#6c63ff] text-white" : "text-muted hover:text-foreground"}`}
              >
                2 Player
              </button>
            </div>
            {mode === "ai" && (
              <div className="flex rounded-lg border border-border bg-surface-2 p-0.5 text-xs">
                <button
                  onClick={() => { setDifficulty("easy"); resetGame(); }}
                  className={`rounded-md px-3 py-1.5 font-semibold transition ${difficulty === "easy" ? "bg-[#38d9a9] text-white" : "text-muted hover:text-foreground"}`}
                >
                  Easy
                </button>
                <button
                  onClick={() => { setDifficulty("hard"); resetGame(); }}
                  className={`rounded-md px-3 py-1.5 font-semibold transition ${difficulty === "hard" ? "bg-[#38d9a9] text-white" : "text-muted hover:text-foreground"}`}
                >
                  Hard
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Game board */}
        <div className="flex flex-col items-center px-5 py-6">
          <div className={`mb-4 text-lg font-semibold ${winResult ? "text-[#38d9a9]" : draw ? "text-amber-400" : "text-white"}`}>
            {statusText}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {board.map((cell, i) => {
              const isWinCell = winResult?.line.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => handleClick(i)}
                  disabled={!!cell || gameOver}
                  className={`flex h-20 w-20 items-center justify-center rounded-xl border text-3xl font-bold transition sm:h-24 sm:w-24 sm:text-4xl ${
                    isWinCell
                      ? "border-[#38d9a9]/60 bg-[#38d9a9]/15 text-[#38d9a9]"
                      : cell
                        ? "border-border bg-surface-2 text-white"
                        : "border-border bg-surface-2 text-transparent hover:border-[#6c63ff]/40 hover:bg-surface-3"
                  } ${!cell && !gameOver ? "cursor-pointer" : "cursor-default"}`}
                >
                  {cell === "X" ? "✕" : cell === "O" ? "○" : "·"}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={resetGame}
              className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-white transition hover:bg-surface-3"
            >
              New Game
            </button>
            <button
              onClick={resetAll}
              className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-muted transition hover:text-white"
            >
              Reset Scores
            </button>
          </div>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <span className="h-2 w-2 rounded-full bg-[#ff6584]" />
          <h3 className="font-display text-sm font-bold tracking-tight text-white">Scoreboard</h3>
        </div>
        <div className="grid grid-cols-3 divide-x divide-white/5">
          <ScoreItem label={mode === "ai" ? "You (X)" : "Player X"} value={scores.x} color="text-[#6c63ff]" />
          <ScoreItem label="Draws" value={scores.draws} color="text-amber-400" />
          <ScoreItem label={mode === "ai" ? "AI (O)" : "Player O"} value={scores.o} color="text-[#ff6584]" />
        </div>
      </div>
    </div>
  );
}

function ScoreItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="px-5 py-4 text-center">
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className={`mt-1 font-mono text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
