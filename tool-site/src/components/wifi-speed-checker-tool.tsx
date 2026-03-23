"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Types ─── */
type Phase = "idle" | "ping" | "download" | "upload" | "done" | "error";

interface TestResult {
  ping: number;
  jitter: number;
  downloadMbps: number;
  uploadMbps: number;
  ip: string;
  isp: string;
  server: string;
  timestamp: Date;
}

/* ─── Helpers ─── */
const CF_DOWN = "https://speed.cloudflare.com/__down";
const CF_UP = "https://speed.cloudflare.com/__up";
const CF_META = "https://speed.cloudflare.com/meta";

async function fetchIp(): Promise<{ ip: string; isp: string }> {
  try {
    const res = await fetch(CF_META, { cache: "no-store" });
    const data = await res.json();
    return { ip: data.clientIp || "Unknown", isp: data.asOrganization || "" };
  } catch {
    return { ip: "Unknown", isp: "" };
  }
}

async function measurePing(rounds = 5): Promise<{ ping: number; jitter: number }> {
  const times: number[] = [];
  for (let i = 0; i < rounds; i++) {
    const t0 = performance.now();
    try {
      await fetch(`${CF_DOWN}?bytes=0&_=${Date.now()}`, { cache: "no-store" });
    } catch {
      /* still get timing */
    }
    times.push(performance.now() - t0);
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const jitter =
    times.length > 1
      ? times.reduce((sum, t, i) => (i === 0 ? 0 : sum + Math.abs(t - times[i - 1])), 0) /
        (times.length - 1)
      : 0;
  return { ping: Math.round(avg), jitter: Math.round(jitter * 10) / 10 };
}

async function measureDownload(
  onProgress: (mbps: number, pct: number) => void,
): Promise<number> {
  let totalBytes = 0;
  const start = performance.now();
  // Progressive chunk sizes: start small, ramp up to get accurate measurement
  const rounds = [100_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 5_000_000, 10_000_000];

  for (let i = 0; i < rounds.length; i++) {
    try {
      const res = await fetch(
        `${CF_DOWN}?bytes=${rounds[i]}&_=${Date.now()}&i=${i}`,
        { cache: "no-store" },
      );
      if (res.body) {
        const reader = res.body.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          totalBytes += value.byteLength;
          const elapsed = (performance.now() - start) / 1000;
          const mbps = elapsed > 0 ? (totalBytes * 8) / 1_000_000 / elapsed : 0;
          const pct = Math.min(((i + 1) / rounds.length) * 100, 99);
          onProgress(Math.round(mbps * 100) / 100, pct);
        }
      } else {
        const buf = await res.arrayBuffer();
        totalBytes += buf.byteLength;
        const elapsed = (performance.now() - start) / 1000;
        const mbps = elapsed > 0 ? (totalBytes * 8) / 1_000_000 / elapsed : 0;
        onProgress(Math.round(mbps * 100) / 100, ((i + 1) / rounds.length) * 100);
      }
    } catch {
      /* skip round */
    }
  }

  const elapsed = (performance.now() - start) / 1000;
  return elapsed > 0 ? (totalBytes * 8) / 1_000_000 / elapsed : 0;
}

async function measureUpload(
  onProgress: (mbps: number, pct: number) => void,
): Promise<number> {
  // Progressive chunk sizes for upload
  const sizes = [100_000, 256_000, 512_000, 1_000_000, 1_000_000, 2_000_000];

  let totalBytes = 0;
  const start = performance.now();

  for (let i = 0; i < sizes.length; i++) {
    const payload = new Uint8Array(sizes[i]);
    // Fill in 64KB sub-chunks to avoid crypto.getRandomValues limit
    for (let off = 0; off < sizes[i]; off += 65536) {
      crypto.getRandomValues(payload.subarray(off, Math.min(off + 65536, sizes[i])));
    }
    try {
      await fetch(`${CF_UP}?_=${Date.now()}&i=${i}`, {
        method: "POST",
        body: payload.buffer,
        cache: "no-store",
      });
      totalBytes += sizes[i];
      const elapsed = (performance.now() - start) / 1000;
      const mbps = elapsed > 0 ? (totalBytes * 8) / 1_000_000 / elapsed : 0;
      const pct = ((i + 1) / sizes.length) * 100;
      onProgress(Math.round(mbps * 100) / 100, pct);
    } catch {
      /* skip round */
    }
  }

  const elapsed = (performance.now() - start) / 1000;
  return elapsed > 0 ? (totalBytes * 8) / 1_000_000 / elapsed : 0;
}

/* ─── Gauge SVG ─── */
function SpeedGauge({ value, max, phase }: { value: number; max: number; phase: Phase }) {
  const pct = Math.min(value / max, 1);
  const radius = 120;
  const stroke = 12;
  // 270-degree arc
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270deg
  const offset = arcLength * (1 - pct);

  // Tick marks
  const ticks = [0, 10, 25, 50, 100, 250, 500];
  const maxTick = ticks[ticks.length - 1];

  return (
    <div className="relative mx-auto h-[280px] w-[280px]">
      <svg viewBox="0 0 280 280" className="h-full w-full">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1ce4b5" />
            <stop offset="50%" stopColor="#6c63ff" />
            <stop offset="100%" stopColor="#ff6584" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeLinecap="round"
          transform="rotate(135 140 140)"
        />

        {/* Active arc */}
        <circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(135 140 140)"
          filter="url(#glow)"
          className="transition-all duration-500 ease-out"
        />

        {/* Tick labels */}
        {ticks.map((tick) => {
          const angle = 135 + (tick / maxTick) * 270;
          const rad = (angle * Math.PI) / 180;
          const tx = 140 + (radius + 20) * Math.cos(rad);
          const ty = 140 + (radius + 20) * Math.sin(rad);
          return (
            <text
              key={tick}
              x={tx}
              y={ty}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[#57576f] text-[9px]"
            >
              {tick}
            </text>
          );
        })}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
        <div className="font-mono text-5xl font-bold text-white">
          {value > 0 ? value.toFixed(1) : "—"}
        </div>
        <div className="mt-1 text-sm text-muted">Mbps</div>
        <div className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-[#6c63ff]">
          {phase === "idle"
            ? ""
            : phase === "ping"
            ? "Measuring Ping…"
            : phase === "download"
            ? "↓ Download"
            : phase === "upload"
            ? "↑ Upload"
            : phase === "done"
            ? "Complete"
            : "Error"}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function WifiSpeedCheckerTool() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<TestResult | null>(null);
  const [liveSpeed, setLiveSpeed] = useState(0);
  const [livePct, setLivePct] = useState(0);
  const [ipInfo, setIpInfo] = useState({ ip: "—", isp: "—" });
  const [serverHost, setServerHost] = useState("—");
  const abortRef = useRef(false);

  // Fetch IP on mount
  useEffect(() => {
    fetchIp().then(setIpInfo);
    setServerHost("Cloudflare");
  }, []);

  const runTest = useCallback(async () => {
    abortRef.current = false;
    setResult(null);
    setLiveSpeed(0);
    setLivePct(0);

    let ping = 0;
    let jitter = 0;
    let dlRounded = 0;
    let ulRounded = 0;

    // Phase 1: Ping
    setPhase("ping");
    try {
      const res = await measurePing();
      ping = res.ping;
      jitter = res.jitter;
    } catch {
      /* continue with 0 */
    }
    if (abortRef.current) return;

    // Phase 2: Download
    setPhase("download");
    setLiveSpeed(0);
    setLivePct(0);
    try {
      const downloadMbps = await measureDownload((mbps, pct) => {
        if (!abortRef.current) {
          setLiveSpeed(mbps);
          setLivePct(pct);
        }
      });
      dlRounded = Math.round(downloadMbps * 100) / 100;
    } catch {
      /* continue with 0 */
    }
    if (abortRef.current) return;

    // Phase 3: Upload
    setPhase("upload");
    setLiveSpeed(0);
    setLivePct(0);
    try {
      const uploadMbps = await measureUpload((mbps, pct) => {
        if (!abortRef.current) {
          setLiveSpeed(mbps);
          setLivePct(pct);
        }
      });
      ulRounded = Math.round(uploadMbps * 100) / 100;
    } catch {
      /* continue with 0 */
    }
    if (abortRef.current) return;

    // Refresh IP
    let freshIp = ipInfo;
    try {
      freshIp = await fetchIp();
      setIpInfo(freshIp);
    } catch {
      /* keep existing */
    }

    setResult({
      ping,
      jitter,
      downloadMbps: dlRounded,
      uploadMbps: ulRounded,
      ip: freshIp.ip,
      isp: freshIp.isp || "Your ISP",
      server: "Cloudflare",
      timestamp: new Date(),
    });
    setPhase("done");
    setLiveSpeed(0);
  }, []);

  const gaugeMax = 500;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-[#0a0a12] shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#1ce4b5] via-[#6c63ff] to-[#ff6584]" />

        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div>
            <h2 className="font-display text-sm font-bold tracking-tight text-white">
              Internet Speed Test
            </h2>
            <p className="mt-0.5 text-xs text-muted">Download · Upload · Ping · Jitter</p>
          </div>
          {phase !== "idle" && phase !== "done" && phase !== "error" && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1ce4b5] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1ce4b5]" />
              </span>
              <span className="text-xs text-[#1ce4b5]">Testing</span>
            </div>
          )}
        </div>

        {/* Main gauge area */}
        <div className="flex flex-col items-center px-5 py-8">
          <SpeedGauge
            value={phase === "done" ? (result?.downloadMbps ?? 0) : liveSpeed}
            max={gaugeMax}
            phase={phase}
          />

          {/* GO / Re-test button */}
          {(phase === "idle" || phase === "done" || phase === "error") && (
            <button
              onClick={runTest}
              className="group relative mt-2 flex h-[88px] w-[88px] items-center justify-center rounded-full border-2 border-[#1ce4b5]/40 transition-all hover:border-[#1ce4b5] hover:shadow-[0_0_30px_rgba(28,228,181,.15)]"
            >
              <span className="text-xl font-bold tracking-wider text-[#1ce4b5] transition group-hover:scale-105">
                {phase === "done" ? "REDO" : "GO"}
              </span>
            </button>
          )}

          {/* Live phase mini-stats while testing */}
          {(phase === "ping" || phase === "download" || phase === "upload") && (
            <div className="mt-4 flex items-center gap-6 text-center">
              <MiniStat label="Progress" value={`${Math.round(livePct)}%`} />
              <MiniStat
                label={phase === "download" ? "Download" : phase === "upload" ? "Upload" : "Ping"}
                value={phase === "ping" ? "…" : `${liveSpeed.toFixed(1)} Mbps`}
              />
            </div>
          )}
        </div>

        {/* Result cards */}
        {result && (
          <div className="border-t border-border px-5 py-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon="↓"
                iconColor="text-[#1ce4b5]"
                label="Download"
                value={`${result.downloadMbps}`}
                unit="Mbps"
              />
              <StatCard
                icon="↑"
                iconColor="text-[#6c63ff]"
                label="Upload"
                value={`${result.uploadMbps}`}
                unit="Mbps"
              />
              <StatCard
                icon="⏱"
                iconColor="text-[#ff6584]"
                label="Ping"
                value={`${result.ping}`}
                unit="ms"
              />
              <StatCard
                icon="〰"
                iconColor="text-amber-400"
                label="Jitter"
                value={`${result.jitter}`}
                unit="ms"
              />
            </div>

            {/* Connection info */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 rounded-xl border border-border bg-white/[0.02] px-4 py-3 text-xs">
              <ConnInfo icon="👤" label="Your IP" value={result.ip} />
              <ConnInfo icon="🌐" label="Server" value={result.server} />
              <ConnInfo icon="🕐" label="Tested" value={result.timestamp.toLocaleTimeString()} />
            </div>
          </div>
        )}

        {/* IP info bar (always visible) */}
        {!result && (
          <div className="border-t border-border px-5 py-4">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs">
              <ConnInfo icon="👤" label="Your IP" value={ipInfo.ip} />
              <ConnInfo icon="🌐" label="Server" value={serverHost} />
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="border-t border-border px-5 py-4 text-center text-sm text-red-400">
            Speed test failed. Check your connection and try again.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <InfoCard icon="📡" title="Download" desc="Measures how fast data reaches your device from the internet." />
        <InfoCard icon="📤" title="Upload" desc="Measures how fast your device sends data to the internet." />
        <InfoCard icon="⏱️" title="Ping" desc="Round-trip latency — lower is better for gaming & calls." />
        <InfoCard icon="🔒" title="Privacy" desc="Runs entirely in your browser. Nothing is stored or shared." />
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className="font-mono text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function StatCard({
  icon,
  iconColor,
  label,
  value,
  unit,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 text-center">
      <span className={`text-lg ${iconColor}`}>{icon}</span>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className="mt-1">
        <span className="font-mono text-2xl font-bold text-white">{value}</span>
        <span className="ml-1 text-xs text-muted">{unit}</span>
      </div>
    </div>
  );
}

function ConnInfo({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span>{icon}</span>
      <span className="text-muted-2">{label}</span>
      <span className="font-mono font-semibold text-white">{value}</span>
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
