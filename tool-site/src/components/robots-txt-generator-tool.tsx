"use client";

import { useEffect, useMemo, useState } from "react";

type DetectionResult = {
  normalizedBase: string;
  host: string;
  platform: "wordpress" | "shopify" | "opencart" | "generic";
  sitemapUrl: string;
  robotsTxt: string;
  detectedPaths: string[];
  notes: string[];
  existingRobotsFound: boolean;
};

export default function RobotsTxtGeneratorTool() {
  const [websiteUrl, setWebsiteUrl] = useState("https://example.com");
  const [generated, setGenerated] = useState<DetectionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const [phase, setPhase] = useState<
    "idle" | "starting" | "fetching" | "detecting" | "building"
  >("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      return;
    }

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        if (prev < 20) return prev + 8;
        if (prev < 50) return prev + 5;
        if (prev < 75) return prev + 2;
        return prev + 1;
      });
    }, 350);

    return () => window.clearInterval(interval);
  }, [isGenerating]);

  const stats = useMemo(() => {
    return {
      platform: generated?.platform || "Pending",
      sitemap: generated?.sitemapUrl ? "Ready" : "Missing",
      detectedPaths: generated?.detectedPaths.length || 0,
      robotsFound: generated?.existingRobotsFound ? "Yes" : "No",
    };
  }, [generated]);

  function getStatusText() {
    if (!isGenerating) return "";
    if (phase === "starting") return "Starting analysis...";
    if (phase === "fetching") return "Fetching homepage, robots.txt, and sitemap...";
    if (phase === "detecting") return "Detecting platform and sensitive paths...";
    if (phase === "building") return "Building recommended robots.txt...";
    return "Processing...";
  }

  async function handleGenerate() {
    if (!websiteUrl.trim()) {
      setError("Please enter a website URL first.");
      return;
    }

    setGenerated(null);
    setCopied(false);
    setError("");
    setIsGenerating(true);
    setPhase("starting");
    setProgress(5);

    try {
      setPhase("fetching");

      const response = await fetch("/api/tools/robots-txt-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: websiteUrl,
        }),
      });

      setPhase("detecting");

      const rawText = await response.text();

      let payload: DetectionResult | { error?: string } | null = null;
      try {
        payload = JSON.parse(rawText);
      } catch {
        throw new Error(`Server returned non-JSON response: ${rawText.slice(0, 180)}`);
      }

      if (!response.ok) {
        throw new Error(
          (payload as { error?: string })?.error ||
            "Failed to generate robots.txt."
        );
      }

      setPhase("building");
      setProgress(96);

      setGenerated(payload as DetectionResult);

      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate robots.txt.");
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setPhase("idle");
      }, 300);
    }
  }

  async function copyOutput() {
    if (!generated?.robotsTxt) return;
    await navigator.clipboard.writeText(generated.robotsTxt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function downloadOutput() {
    if (!generated?.robotsTxt) return;

    const blob = new Blob([generated.robotsTxt], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "robots.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function loadExample(url: string) {
    setWebsiteUrl(url);
    setGenerated(null);
    setError("");
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="border-b border-border px-5 py-3">
          <h2 className="font-display text-sm font-bold tracking-tight text-white">
            Auto Generate robots.txt
          </h2>
          <p className="mt-0.5 text-[11px] text-muted">
            Enter a website URL and let the tool automatically detect a recommended robots.txt for that website.
          </p>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr,220px]">
            <InputField
              label="Website URL"
              value={websiteUrl}
              onChange={setWebsiteUrl}
              placeholder="https://example.com"
            />

            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full rounded-xl bg-[#6c63ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5b53ee] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? "Generating..." : "Start"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => loadExample("https://example.com")}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground/85 transition hover:text-foreground"
            >
              Test: example.com
            </button>
            <button
              onClick={() => loadExample("https://wordpress.org")}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground/85 transition hover:text-foreground"
            >
              Test: wordpress.org
            </button>
            <button
              onClick={() => loadExample("https://demo.opencart.com")}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground/85 transition hover:text-foreground"
            >
              Test: demo.opencart.com
            </button>
          </div>

          {isGenerating && (
            <div className="rounded-2xl border border-[#6c63ff]/20 bg-surface p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-foreground/85">
                  {getStatusText()}
                </span>
                <span className="text-xs text-muted">{progress}%</span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6c63ff] via-[#8b7bff] to-[#38d9a9] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Platform" value={String(stats.platform)} accent="#6c63ff" />
        <StatCard label="Sitemap" value={String(stats.sitemap)} accent="#38d9a9" />
        <StatCard label="Detected Paths" value={String(stats.detectedPaths)} accent="#ff6584" />
        <StatCard label="Existing robots.txt" value={String(stats.robotsFound)} accent="#ffa640" />
      </div>

      {generated?.notes?.length ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-4">
          <h3 className="font-display text-sm font-bold text-emerald-300">
            Detection notes
          </h3>
          <div className="mt-2 space-y-2 text-sm text-emerald-100">
            {generated.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </div>
      ) : null}

      {generated?.detectedPaths?.length ? (
        <div className="rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-3">
            <h3 className="font-display text-sm font-bold text-white">
              Auto-detected sensitive paths
            </h3>
          </div>
          <div className="max-h-[220px] space-y-2 overflow-auto px-5 py-5">
            {generated.detectedPaths.map((path, index) => (
              <div
                key={`${path}-${index}`}
                className="break-all rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground/85"
              >
                {path}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="font-display text-sm font-bold text-white">
            Generated robots.txt
          </h3>

          <div className="flex gap-2">
            <button
              onClick={copyOutput}
              disabled={!generated?.robotsTxt}
              className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copied ? "Copied" : "Copy"}
            </button>

            <button
              onClick={downloadOutput}
              disabled={!generated?.robotsTxt}
              className="rounded-lg bg-[#6c63ff] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#5b53ee] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Download
            </button>
          </div>
        </div>

        <div className="px-5 py-5">
          <pre className="max-h-[560px] overflow-auto rounded-xl border border-border bg-surface-2 p-4 text-xs leading-6 text-foreground/85">
            {generated?.robotsTxt || "Enter a website URL and click Start to generate robots.txt automatically."}
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard
          icon="🤖"
          title="Automatic detection"
          desc="Finds existing robots.txt, sitemap references, and likely platform rules automatically."
        />
        <InfoCard
          icon="⚡"
          title="One-click workflow"
          desc="Just enter the site URL and generate a recommended robots.txt without manual setup."
        />
        <InfoCard
          icon="🗂️"
          title="Ready to use"
          desc="Copy or download the generated robots.txt file instantly."
        />
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-2">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border-strong bg-surface-2 px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted-3 focus:border-[#6c63ff]/60"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="h-[2px]" style={{ backgroundColor: accent }} />
      <div className="px-4 py-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">
          {label}
        </div>
        <div className="mt-1 break-words font-display text-2xl font-bold capitalize text-white">
          {value}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <span className="text-xl">{icon}</span>
      <h4 className="mt-2 text-sm font-semibold text-white">{title}</h4>
      <p className="mt-1 text-xs leading-5 text-muted">{desc}</p>
    </div>
  );
}