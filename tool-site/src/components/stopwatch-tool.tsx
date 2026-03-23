"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Mode = "stopwatch" | "countdown";

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function formatMs(ms: number) {
  const totalMs = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centis = Math.floor((totalMs % 1000) / 10);
  return `${pad2(minutes)}:${pad2(seconds)}.${pad2(centis)}`;
}

export default function StopwatchTool() {
  const [mode, setMode] = useState<Mode>("stopwatch");

  // shared timing
  const rafId = useRef<number | null>(null);
  const startTs = useRef<number>(0);
  const baseElapsed = useRef<number>(0);

  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // stopwatch
  const [laps, setLaps] = useState<number[]>([]);

  // countdown
  const [cdMin, setCdMin] = useState("5");
  const [cdSec, setCdSec] = useState("0");
  const [countdownDone, setCountdownDone] = useState(false);

  const countdownDurationMs = useMemo(() => {
    const m = Math.max(0, Math.min(999, parseInt(cdMin || "0", 10) || 0));
    const s = Math.max(0, Math.min(59, parseInt(cdSec || "0", 10) || 0));
    return (m * 60 + s) * 1000;
  }, [cdMin, cdSec]);

  const remainingMs = mode === "countdown" ? Math.max(0, countdownDurationMs - elapsedMs) : 0;

  const stop = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    setRunning(false);
  }, []);

  const tick = useCallback(() => {
    const now = performance.now();
    const next = baseElapsed.current + (now - startTs.current);
    setElapsedMs(next);

    if (mode === "countdown" && countdownDurationMs > 0 && next >= countdownDurationMs) {
      baseElapsed.current = countdownDurationMs;
      setElapsedMs(countdownDurationMs);
      setCountdownDone(true);
      stop();
      return;
    }

    rafId.current = requestAnimationFrame(tick);
  }, [countdownDurationMs, mode, stop]);

  const start = useCallback(() => {
    if (running) return;
    setCountdownDone(false);
    startTs.current = performance.now();
    setRunning(true);
    rafId.current = requestAnimationFrame(tick);
  }, [running, tick]);

  const reset = useCallback(() => {
    stop();
    baseElapsed.current = 0;
    setElapsedMs(0);
    setLaps([]);
    setCountdownDone(false);
  }, [stop]);

  const lap = useCallback(() => {
    if (!running || mode !== "stopwatch") return;
    setLaps((prev) => [elapsedMs, ...prev]);
  }, [elapsedMs, mode, running]);

  const setModeSafe = (next: Mode) => {
    if (next === mode) return;
    reset();
    setMode(next);
  };

  // keep baseElapsed in sync when pausing
  useEffect(() => {
    if (!running) return;
    return () => {
      // component unmount safety
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [running]);

  const pause = useCallback(() => {
    if (!running) return;
    const now = performance.now();
    baseElapsed.current = baseElapsed.current + (now - startTs.current);
    stop();
  }, [running, stop]);

  const primaryTime = mode === "stopwatch" ? formatMs(elapsedMs) : formatMs(remainingMs);
  const secondaryLabel = mode === "stopwatch" ? "Elapsed" : "Remaining";

  const lapRows = useMemo(() => {
    if (laps.length === 0) return [] as { index: number; splitMs: number; lapMs: number }[];
    const rows: { index: number; splitMs: number; lapMs: number }[] = [];
    for (let i = 0; i < laps.length; i++) {
      const split = laps[i];
      const prevSplit = i === laps.length - 1 ? 0 : laps[i + 1];
      rows.push({ index: laps.length - i, splitMs: split, lapMs: split - prevSplit });
    }
    return rows;
  }, [laps]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div>
            <h2 className="font-display text-sm font-bold tracking-tight text-white">Stopwatch</h2>
            <p className="mt-1 text-xs text-muted">Lap timer + simple countdown mode.</p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-border bg-surface/50 p-1 text-xs">
            <button
              onClick={() => setModeSafe("stopwatch")}
              className={`rounded-full px-3 py-1.5 transition ${mode === "stopwatch" ? "bg-surface-2 text-white" : "text-muted hover:text-foreground"}`}
            >
              Stopwatch
            </button>
            <button
              onClick={() => setModeSafe("countdown")}
              className={`rounded-full px-3 py-1.5 transition ${mode === "countdown" ? "bg-surface-2 text-white" : "text-muted hover:text-foreground"}`}
            >
              Countdown
            </button>
          </div>
        </div>

        <div className="px-5 py-7 text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-2">{secondaryLabel}</div>
          <div className="mt-2 font-mono text-6xl font-extrabold tracking-tight text-white md:text-7xl">
            {primaryTime}
          </div>
          {mode === "countdown" && countdownDone && (
            <div className="mt-3 text-sm font-semibold text-amber-300">Time&apos;s up.</div>
          )}

          {mode === "countdown" && (
            <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Minutes</label>
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={cdMin}
                  onChange={(e) => setCdMin(e.target.value)}
                  disabled={running}
                  className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-[#6c63ff]/50 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">Seconds</label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={cdSec}
                  onChange={(e) => setCdSec(e.target.value)}
                  disabled={running}
                  className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-[#6c63ff]/50 disabled:opacity-60"
                />
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {!running ? (
              <button
                onClick={start}
                className="rounded-lg border border-border bg-surface-2 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-border-strong"
                disabled={mode === "countdown" && countdownDurationMs === 0}
              >
                Start
              </button>
            ) : (
              <button
                onClick={pause}
                className="rounded-lg border border-border bg-surface-2 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-border-strong"
              >
                Pause
              </button>
            )}

            <button
              onClick={reset}
              className="rounded-lg border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-muted transition hover:border-border-strong hover:text-foreground"
            >
              Reset
            </button>

            {mode === "stopwatch" && (
              <button
                onClick={lap}
                disabled={!running}
                className="rounded-lg border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-muted transition hover:border-border-strong hover:text-foreground disabled:opacity-50"
              >
                Lap
              </button>
            )}
          </div>
        </div>
      </div>

      {mode === "stopwatch" && lapRows.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <span className="h-2 w-2 rounded-full bg-[#6c63ff]" />
            <h3 className="font-display text-sm font-bold tracking-tight text-white">Laps</h3>
          </div>
          <div className="divide-y divide-white/5">
            {lapRows.map((r) => (
              <div key={r.index} className="flex items-center justify-between px-5 py-3">
                <div className="text-xs font-semibold text-muted">Lap {r.index}</div>
                <div className="flex items-baseline gap-4 font-mono">
                  <div className="text-sm text-white">{formatMs(r.lapMs)}</div>
                  <div className="text-xs text-muted-2">{formatMs(r.splitMs)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard icon="⏱️" title="Accurate timing" desc="Uses high-resolution timing in your browser." />
        <InfoCard icon="🏁" title="Laps" desc="Track splits while the stopwatch is running." />
        <InfoCard icon="⏳" title="Countdown" desc="Set minutes and seconds for a simple timer." />
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <span className="text-xl">{icon}</span>
      <h4 className="mt-2 text-sm font-semibold text-white">{title}</h4>
      <p className="mt-1 text-xs leading-5 text-muted">{desc}</p>
    </div>
  );
}
