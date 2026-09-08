"use client";

import { useCallback, useMemo, useRef, useState } from "react";

type Mode = "encode" | "decode";
type InputType = "text" | "file";

/* ── helpers ── */
function textToBase64(text: string): string {
  try {
    return btoa(
      new TextEncoder()
        .encode(text)
        .reduce((acc, byte) => acc + String.fromCharCode(byte), ""),
    );
  } catch {
    return "⚠ Could not encode — input may contain unsupported characters.";
  }
}

function base64ToText(b64: string): string {
  try {
    const binary = atob(b64.trim());
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return "⚠ Invalid Base64 string.";
  }
}

function isValidBase64(str: string): boolean {
  if (!str.trim()) return true;
  return /^[A-Za-z0-9+/\r\n]+=*\s*$/.test(str.trim());
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export default function Base64EncoderDecoderTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [inputType, setInputType] = useState<InputType>("text");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [copied, setCopied] = useState(false);
  const [outputCopied, setOutputCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── live stats ── */
  const isFileEncode = inputType === "file" && mode === "encode";
  const stats = useMemo(() => {
    const outputLen = output.length;
    const valid = mode === "decode" ? isValidBase64(input) : true;
    return {
      inputSize: isFileEncode ? formatBytes(fileSize) : formatBytes(new Blob([input]).size),
      outputSize: formatBytes(new Blob([output]).size),
      inputChars: isFileEncode ? "—" : input.length.toLocaleString(),
      outputChars: outputLen.toLocaleString(),
      inputLines: isFileEncode ? "—" : (input ? input.split(/\n/).length : 0).toLocaleString(),
      outputLines: output ? output.split(/\n/).length : 0,
      valid,
    };
  }, [input, output, mode, isFileEncode, fileSize]);

  /* ── core conversion ── */
  const convert = useCallback(
    (value: string, currentMode: Mode) => {
      if (!value.trim()) {
        setOutput("");
        return;
      }
      setOutput(currentMode === "encode" ? textToBase64(value) : base64ToText(value));
    },
    [],
  );

  const handleInputChange = (value: string) => {
    setInput(value);
    convert(value, mode);
  };

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setInputType("text");
    setFileName("");
    if (input.trim()) {
      convert(input, newMode);
    }
  };

  const swapInputOutput = () => {
    if (!output) return;
    const newMode: Mode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    setInput(output);
    setInputType("text");
    setFileName("");
    convert(output, newMode);
  };

  /* ── file handling ── */
  const handleFileDrop = async (file: File) => {
    setInputType("file");
    setFileName(file.name);
    setFileSize(file.size);
    if (mode === "encode") {
      const b64 = await fileToBase64(file);
      setInput(`[File: ${file.name} — ${formatBytes(file.size)}]`);
      setOutput(b64);
    } else {
      const text = await file.text();
      setInput(text);
      convert(text, "decode");
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileDrop(file);
  };

  /* ── clipboard ── */
  const copyInput = async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* */
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setOutputCopied(true);
      setTimeout(() => setOutputCopied(false), 1800);
    } catch {
      /* */
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setFileName("");
    setFileSize(0);
    setInputType("text");
    if (fileRef.current) fileRef.current.value = "";
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "encode" ? "encoded.txt" : "decoded.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

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
            {m === "encode" ? "🔒 Encode" : "🔓 Decode"}
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

      {/* ── Input card ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#ff6584] to-[#38d9a9]" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#6c63ff]" />
            <h2 className="font-display text-sm font-bold tracking-tight">
              {mode === "encode" ? "Text to Encode" : "Base64 to Decode"}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label className="cursor-pointer rounded-md border border-border-strong px-3 py-1.5 text-muted transition hover:text-foreground">
              Upload File
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={onFileChange}
              />
            </label>
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
          {/* Text input area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFileDrop(file);
            }}
          >
            {fileName && inputType === "file" && mode === "encode" ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
                <span className="text-4xl">📄</span>
                <p className="text-sm font-semibold text-white">{fileName}</p>
                <p className="text-xs text-muted">File loaded — Base64 output generated below</p>
                <button
                  onClick={() => {
                    setFileName("");
                    setInputType("text");
                    setInput("");
                    setOutput("");
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="mt-1 text-xs text-[#ff6584] hover:underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={
                  mode === "encode"
                    ? "Paste text here to encode to Base64…\n\nOr drag & drop a file."
                    : "Paste Base64 string here to decode…\n\nOr drag & drop a .txt file."
                }
                spellCheck={false}
                className="min-h-[300px] w-full resize-none border-r border-border bg-transparent px-5 py-4 font-mono text-sm leading-7 text-white outline-none placeholder:text-muted-3"
              />
            )}
          </div>

          {/* Stats sidebar */}
          <div className="space-y-2 border-t border-border p-3 md:border-t-0">
            <StatBox label="Input size" value={stats.inputSize} color="text-[#6c63ff]" />
            <StatBox label="Chars" value={stats.inputChars} color="text-[#ff6584]" />
            <StatBox label="Lines" value={String(stats.inputLines)} color="text-[#38d9a9]" />
            {mode === "decode" && (
              <StatBox
                label="Valid Base64"
                value={stats.valid ? "✓ Yes" : "✗ No"}
                color={stats.valid ? "text-[#38d9a9]" : "text-[#ff6584]"}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Output card ── */}
      {output && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_40px_rgba(0,0,0,.45)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#38d9a9]" />
              <h3 className="font-display text-sm font-bold tracking-tight text-white">
                {mode === "encode" ? "Base64 Encoded" : "Decoded Text"}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={downloadOutput}
                className="rounded-md border border-border-strong px-3 py-1.5 text-muted transition hover:text-foreground"
              >
                ↓ Download
              </button>
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
              className="min-h-[220px] w-full resize-none border-r border-border bg-transparent px-5 py-4 font-mono text-sm leading-7 text-white outline-none"
            />
            <div className="space-y-2 border-t border-border p-3 md:border-t-0">
              <StatBox label="Output size" value={stats.outputSize} color="text-[#6c63ff]" />
              <StatBox label="Chars" value={stats.outputChars} color="text-[#ff6584]" />
              <StatBox label="Lines" value={stats.outputLines.toLocaleString()} color="text-[#38d9a9]" />
            </div>
          </div>
        </div>
      )}

      {/* ── Info section ── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <InfoCard
          icon="⚡"
          title="Instant Encoding"
          desc="Convert text or files to Base64 in real time — no server round-trip required."
        />
        <InfoCard
          icon="🔒"
          title="100% Private"
          desc="Everything runs locally in your browser. Your data never leaves your device."
        />
        <InfoCard
          icon="📂"
          title="File Support"
          desc="Drag & drop any file to encode it. Supports images, documents, and binary files."
        />
      </div>
    </div>
  );
}

/* ── Sub-components ── */
function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-2">{label}</div>
      <div className={`font-display text-2xl font-bold leading-none ${color}`}>{value}</div>
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
