"use client";

import { useCallback, useMemo, useState } from "react";

type Mode = "encode" | "decode";
type EncodeMethod = "component" | "full" | "component-plus" | "space";

const encodeMethods: { value: EncodeMethod; label: string; desc: string; fn: (v: string) => string }[] = [
  {
    value: "component",
    label: "encodeURIComponent",
    desc: "Encode all special chars (recommended for query params)",
    fn: (v) => encodeURIComponent(v),
  },
  {
    value: "full",
    label: "encodeURI",
    desc: "Encode but keep :, /, ?, #, etc.",
    fn: (v) => encodeURI(v),
  },
  {
    value: "component-plus",
    label: "Form / x-www-form-urlencoded",
    desc: "Like encodeURIComponent but spaces → +",
    fn: (v) => encodeURIComponent(v).replace(/%20/g, "+"),
  },
  {
    value: "space",
    label: "Spaces Only → %20",
    desc: "Only encode space characters",
    fn: (v) => v.replace(/ /g, "%20"),
  },
];

const decodeMethods: { value: EncodeMethod; label: string; desc: string; fn: (v: string) => string }[] = [
  {
    value: "component",
    label: "decodeURIComponent",
    desc: "Decode all percent-encoded chars (recommended)",
    fn: (v) => decodeURIComponent(v),
  },
  {
    value: "full",
    label: "decodeURI",
    desc: "Decode but keep %23, %3F, etc.",
    fn: (v) => decodeURI(v),
  },
  {
    value: "component-plus",
    label: "Form / x-www-form-urlencoded",
    desc: "Decode + back to spaces, then percent-decode",
    fn: (v) => decodeURIComponent(v.replace(/\+/g, " ")),
  },
];

/* ── URL parser ── */
interface UrlParts {
  protocol: string;
  host: string;
  pathname: string;
  search: string;
  hash: string;
  params: [string, string][];
}

function tryParseUrl(raw: string): UrlParts | null {
  try {
    const u = new URL(raw);
    return {
      protocol: u.protocol,
      host: u.host,
      pathname: u.pathname,
      search: u.search,
      hash: u.hash,
      params: [...u.searchParams.entries()],
    };
  } catch {
    return null;
  }
}

function countPercentEncoded(str: string): number {
  return (str.match(/%[0-9A-Fa-f]{2}/g) || []).length;
}

export default function UrlEncoderDecoderTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [method, setMethod] = useState<EncodeMethod>("component");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [outputCopied, setOutputCopied] = useState(false);

  /* ── stats ── */
  const stats = useMemo(() => {
    const inputLen = input.length;
    const outputLen = output.length;
    const encoded = countPercentEncoded(mode === "encode" ? output : input);
    const sizeDiff = outputLen - inputLen;
    return {
      inputChars: inputLen.toLocaleString(),
      outputChars: outputLen.toLocaleString(),
      encodedSeqs: encoded.toLocaleString(),
      sizeDiff:
        sizeDiff === 0 ? "±0" : sizeDiff > 0 ? `+${sizeDiff.toLocaleString()}` : sizeDiff.toLocaleString(),
    };
  }, [input, output, mode]);

  const urlParts = useMemo(() => {
    const src = mode === "decode" ? output : input;
    return tryParseUrl(src);
  }, [input, output, mode]);

  /* ── conversion ── */
  const convert = useCallback(
    (value: string, currentMode: Mode, currentMethod: EncodeMethod) => {
      if (!value) {
        setOutput("");
        setError("");
        return;
      }
      try {
        if (currentMode === "encode") {
          const fn = encodeMethods.find((m) => m.value === currentMethod)!.fn;
          setOutput(fn(value));
        } else {
          const fn = decodeMethods.find((m) => m.value === currentMethod)?.fn ?? decodeMethods[0].fn;
          setOutput(fn(value));
        }
        setError("");
      } catch {
        setOutput("");
        setError(currentMode === "encode" ? "⚠ Could not encode the input." : "⚠ Invalid percent-encoded string.");
      }
    },
    [],
  );

  const handleInputChange = (value: string) => {
    setInput(value);
    convert(value, mode, method);
  };

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    /* reset method to default for the new mode */
    setMethod("component");
    if (input.trim()) {
      convert(input, newMode, "component");
    }
  };

  const handleMethodChange = (m: EncodeMethod) => {
    setMethod(m);
    if (input.trim()) {
      convert(input, mode, m);
    }
  };

  const swapInputOutput = () => {
    if (!output) return;
    const newMode: Mode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    setMethod("component");
    setInput(output);
    convert(output, newMode, "component");
  };

  /* ── clipboard ── */
  const copyInput = async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* */ }
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setOutputCopied(true);
      setTimeout(() => setOutputCopied(false), 1800);
    } catch { /* */ }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const activeMethods = mode === "encode" ? encodeMethods : decodeMethods;

  return (
    <div className="space-y-4">
      {/* ── Mode toggle ── */}
      <div className="flex flex-wrap items-center gap-2">
        {(["encode", "decode"] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleModeSwitch(m)}
            className={`rounded-lg border px-5 py-2.5 text-sm font-semibold transition ${
              mode === m
                ? "border-[#6c63ff]/50 bg-[#6c63ff]/15 text-[#a5a0ff]"
                : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground"
            }`}
          >
            {m === "encode" ? "🔗 Encode" : "🔓 Decode"}
          </button>
        ))}

        <button
          onClick={swapInputOutput}
          disabled={!output}
          className="ml-auto rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-muted transition hover:border-border-strong hover:text-foreground disabled:opacity-30"
        >
          ⇅ Swap
        </button>
      </div>

      {/* ── Encoding method selector ── */}
      <div className="flex flex-wrap gap-2">
        {activeMethods.map((m) => (
          <button
            key={m.value}
            onClick={() => handleMethodChange(m.value)}
            className={`rounded-lg border px-4 py-2.5 text-left transition ${
              method === m.value
                ? "border-[#38d9a9]/50 bg-[#38d9a9]/15 text-[#7eeaca]"
                : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground"
            }`}
          >
            <div className="text-xs font-semibold">{m.label}</div>
            <div className="mt-0.5 text-[10px] opacity-60">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* ── Input card ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#6c63ff]" />
            <h2 className="font-display text-sm font-bold tracking-tight">
              {mode === "encode" ? "Text / URL to Encode" : "Encoded URL to Decode"}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={clearAll}
              className="rounded-md border border-border-strong px-3 py-1.5 text-muted transition hover:text-foreground"
            >
              Clear
            </button>
            <button
              onClick={copyInput}
              className="rounded-md border border-border-strong px-3 py-1.5 text-muted transition hover:text-foreground"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_210px]">
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Paste a URL or text to encode…\n\nhttps://example.com/path?name=hello world&q=foo bar"
                : "Paste an encoded URL to decode…\n\nhttps%3A%2F%2Fexample.com%2Fpath%3Fname%3Dhello%20world"
            }
            spellCheck={false}
            className="min-h-[260px] w-full resize-none border-r border-border bg-transparent px-5 py-4 font-mono text-sm leading-7 text-white outline-none placeholder:text-muted-3"
          />

          {/* Stats sidebar */}
          <div className="space-y-2 border-t border-border p-3 md:border-t-0">
            <StatBox label="Input chars" value={stats.inputChars} color="text-[#6c63ff]" />
            <StatBox label="Encoded seqs" value={stats.encodedSeqs} color="text-[#ff6584]" />
            <StatBox label="Size diff" value={stats.sizeDiff} color="text-[#38d9a9]" />
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="rounded-xl border border-[#ff6584]/30 bg-[#ff6584]/10 px-5 py-3 text-sm text-[#ffb3c4]">
          {error}
        </div>
      )}

      {/* ── Output card ── */}
      {output && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_40px_rgba(0,0,0,.45)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
              <h3 className="font-display text-sm font-bold tracking-tight text-white">
                {mode === "encode" ? "Encoded Output" : "Decoded Output"}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={copyOutput}
                className="rounded-md border border-border-strong px-3 py-1.5 text-muted transition hover:text-foreground"
              >
                {outputCopied ? "Copied!" : "Copy Output"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_210px]">
            <textarea
              value={output}
              readOnly
              className="min-h-[200px] w-full resize-none border-r border-border bg-transparent px-5 py-4 font-mono text-sm leading-7 text-white outline-none"
            />
            <div className="space-y-2 border-t border-border p-3 md:border-t-0">
              <StatBox label="Output chars" value={stats.outputChars} color="text-[#6c63ff]" />
              <StatBox
                label="Method"
                value={activeMethods.find((m) => m.value === method)?.label ?? "—"}
                color="text-[#ffa640]"
                small
              />
            </div>
          </div>
        </div>
      )}

      {/* ── URL breakdown ── */}
      {urlParts && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <span className="h-2 w-2 rounded-full bg-[#ffa640]" />
            <h3 className="font-display text-sm font-bold tracking-tight text-white">URL Breakdown</h3>
          </div>
          <div className="divide-y divide-white/5 px-5 text-sm">
            <UrlRow label="Protocol" value={urlParts.protocol} />
            <UrlRow label="Host" value={urlParts.host} />
            <UrlRow label="Path" value={urlParts.pathname} />
            {urlParts.search && <UrlRow label="Query" value={urlParts.search} />}
            {urlParts.hash && <UrlRow label="Hash" value={urlParts.hash} />}
            {urlParts.params.length > 0 && (
              <div className="py-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">
                  Query Parameters
                </span>
                <div className="mt-2 space-y-1.5">
                  {urlParts.params.map(([key, val], i) => (
                    <div key={i} className="flex gap-2 font-mono text-xs">
                      <span className="text-[#6c63ff]">{key}</span>
                      <span className="text-muted-2">=</span>
                      <span className="text-[#38d9a9]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard
          icon="⚡"
          title="Real-time Encoding"
          desc="Encode or decode URLs instantly as you type — no server calls needed."
        />
        <InfoCard
          icon="🔍"
          title="URL Breakdown"
          desc="Paste a full URL to see protocol, host, path, and query params parsed out."
        />
        <InfoCard
          icon="🔒"
          title="100% Private"
          desc="Everything runs in your browser. No data is sent anywhere."
        />
      </div>
    </div>
  );
}

/* ── Sub-components ── */
function StatBox({
  label,
  value,
  color,
  small,
}: {
  label: string;
  value: string;
  color: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className={`font-display font-bold leading-none ${color} ${small ? "text-sm" : "text-2xl"}`}>
        {value}
      </div>
    </div>
  );
}

function UrlRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3 py-2.5">
      <span className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-2">
        {label}
      </span>
      <span className="break-all font-mono text-xs text-white/80">{value}</span>
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
