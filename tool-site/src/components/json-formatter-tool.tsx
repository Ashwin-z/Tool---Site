"use client";

import { useMemo, useRef, useState } from "react";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

type IndentMode = "2" | "3" | "4" | "tab";
type OutputMode = "json" | "xml" | "csv" | "yaml";

type ParsedErrorPosition = {
  line: number;
  column: number;
  offset: number;
};

const INDENT_OPTIONS: { value: IndentMode; label: string }[] = [
  { value: "2", label: "2 spaces" },
  { value: "3", label: "3 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tab indentation" },
];

function getIndentValue(indentMode: IndentMode): number | string {
  if (indentMode === "tab") return "\t";
  return Number(indentMode);
}

function countLines(value: string): number {
  return value ? value.split(/\r\n|\r|\n/).length : 0;
}

function describeRoot(value: unknown): string {
  if (Array.isArray(value)) return `Array (${value.length})`;
  if (value === null) return "null";
  return typeof value === "object" ? "Object" : typeof value;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toXmlValue(value: unknown, nodeName: string, depth = 0): string {
  const indent = "  ".repeat(depth);
  const childIndent = "  ".repeat(depth + 1);

  if (Array.isArray(value)) {
    const items = value.map((item) => toXmlValue(item, "item", depth + 1)).join("\n");
    return `${indent}<${nodeName}>\n${items}\n${indent}</${nodeName}>`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const body = entries.length
      ? entries.map(([key, child]) => toXmlValue(child, key, depth + 1)).join("\n")
      : `${childIndent}`;
    return `${indent}<${nodeName}>\n${body}\n${indent}</${nodeName}>`;
  }

  return `${indent}<${nodeName}>${escapeXml(String(value ?? ""))}</${nodeName}>`;
}

function yamlScalar(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") {
    if (value === "" || /[:#\-{}\[\],&*!?|>'\"%@`]/.test(value) || /^\s|\s$/.test(value)) {
      return JSON.stringify(value);
    }
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function toYamlValue(value: unknown, depth = 0): string {
  const indent = "  ".repeat(depth);

  if (Array.isArray(value)) {
    if (!value.length) return `${indent}[]`;
    return value
      .map((item) => {
        if (item && typeof item === "object") {
          return `${indent}-\n${toYamlValue(item, depth + 1)}`;
        }
        return `${indent}- ${yamlScalar(item)}`;
      })
      .join("\n");
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length) return `${indent}{}`;

    return entries
      .map(([key, child]) => {
        if (child && typeof child === "object") {
          return `${indent}${key}:\n${toYamlValue(child, depth + 1)}`;
        }
        return `${indent}${key}: ${yamlScalar(child)}`;
      })
      .join("\n");
  }

  return `${indent}${yamlScalar(value)}`;
}

function flattenRecord(value: unknown, prefix = ""): Record<string, string> {
  if (Array.isArray(value)) {
    if (!value.length) return prefix ? { [prefix]: "" } : {};
    const primitiveOnly = value.every((item) => item === null || typeof item !== "object");
    if (primitiveOnly) {
      return prefix ? { [prefix]: value.map((item) => String(item ?? "")).join("; ") } : { value: value.map((item) => String(item ?? "")).join("; ") };
    }

    return value.reduce<Record<string, string>>((accumulator, item, index) => {
      const key = prefix ? `${prefix}[${index}]` : `[${index}]`;
      return { ...accumulator, ...flattenRecord(item, key) };
    }, {});
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length && prefix) return { [prefix]: "" };
    return entries.reduce<Record<string, string>>((accumulator, [key, child]) => {
      const nextKey = prefix ? `${prefix}.${key}` : key;
      return { ...accumulator, ...flattenRecord(child, nextKey) };
    }, {});
  }

  if (!prefix) return { value: String(value ?? "") };
  return { [prefix]: String(value ?? "") };
}

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsv(value: unknown): string {
  const rowsSource = Array.isArray(value) ? value : [value];
  const rows = rowsSource.map((item) => flattenRecord(item));
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));

  if (!headers.length) return "value";

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsv(row[header] ?? "")).join(","));
  }

  return lines.join("\n");
}

function extractErrorPosition(input: string, message: string): ParsedErrorPosition | null {
  const match = message.match(/position\s+(\d+)/i);
  if (!match) return null;
  const offset = Number(match[1]);
  if (!Number.isFinite(offset)) return null;
  const safeOffset = Math.min(Math.max(offset, 0), input.length);
  const before = input.slice(0, safeOffset);
  const parts = before.split(/\r\n|\r|\n/);
  return {
    line: parts.length,
    column: (parts.at(-1)?.length ?? 0) + 1,
    offset: safeOffset,
  };
}

function downloadTextFile(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function JsonFormatterTool() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentMode, setIndentMode] = useState<IndentMode>("3");
  const [outputMode, setOutputMode] = useState<OutputMode>("json");
  const [statusMessage, setStatusMessage] = useState("Paste JSON and format it instantly.");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedPosition, setParsedPosition] = useState<ParsedErrorPosition | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const parsedSummary = useMemo(() => {
    if (!input.trim()) {
      return {
        inputLines: 0,
        inputChars: 0,
        outputLines: countLines(output),
        outputChars: output.length,
        root: "—",
      };
    }

    try {
      const parsed = JSON.parse(input);
      return {
        inputLines: countLines(input),
        inputChars: input.length,
        outputLines: countLines(output),
        outputChars: output.length,
        root: describeRoot(parsed),
      };
    } catch {
      return {
        inputLines: countLines(input),
        inputChars: input.length,
        outputLines: countLines(output),
        outputChars: output.length,
        root: "Invalid JSON",
      };
    }
  }, [input, output]);

  const applyTransformation = (mode: OutputMode | "validate" | "minify" | "beautify") => {
    const trimmed = input.trim();
    if (!trimmed) {
      setErrorMessage("Add JSON to continue.");
      setParsedPosition(null);
      setStatusMessage("Waiting for JSON input.");
      if (mode !== "validate") setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setErrorMessage(null);
      setParsedPosition(null);

      if (mode === "validate") {
        setOutput(JSON.stringify(parsed, null, getIndentValue(indentMode)));
        setOutputMode("json");
        setStatusMessage(`JSON is valid. Root type: ${describeRoot(parsed)}.`);
        return;
      }

      if (mode === "minify") {
        setOutput(JSON.stringify(parsed));
        setOutputMode("json");
        setStatusMessage("JSON minified successfully.");
        return;
      }

      if (mode === "beautify") {
        setOutput(JSON.stringify(parsed, null, getIndentValue(indentMode)));
        setOutputMode("json");
        setStatusMessage(`JSON formatted with ${INDENT_OPTIONS.find((option) => option.value === indentMode)?.label.toLowerCase()}.`);
        return;
      }

      if (mode === "xml") {
        setOutput(`<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n${toXmlValue(parsed, "root")}`);
        setOutputMode("xml");
        setStatusMessage("Converted JSON to XML.");
        return;
      }

      if (mode === "csv") {
        setOutput(toCsv(parsed));
        setOutputMode("csv");
        setStatusMessage("Converted JSON to CSV.");
        return;
      }

      if (mode === "yaml") {
        setOutput(toYamlValue(parsed));
        setOutputMode("yaml");
        setStatusMessage("Converted JSON to YAML.");
        return;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON input.";
      setErrorMessage(message);
      setParsedPosition(extractErrorPosition(input, message));
      setStatusMessage("JSON validation failed.");
      if (mode === "validate") setOutput("");
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setErrorMessage(null);
    setParsedPosition(null);
    setOutputMode("json");
    setStatusMessage("Workspace cleared.");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const swapPanels = () => {
    if (!output) return;
    setInput(output);
    setStatusMessage("Moved output into the input editor.");
    setErrorMessage(null);
    setParsedPosition(null);
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setStatusMessage("Unable to copy automatically. Please copy manually.");
    }
  };

  const downloadOutput = () => {
    if (!output) return;
    const extension = outputMode === "json" ? "json" : outputMode;
    const mimeType = outputMode === "json" ? "application/json" : outputMode === "xml" ? "application/xml" : outputMode === "csv" ? "text/csv" : "text/yaml";
    downloadTextFile(output, `formatted-output.${extension}`, mimeType);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 1600);
  };

  const handleFilePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB size limit.`);
      return;
    }
    const text = await file.text();
    setInput(text);
    setStatusMessage(`Loaded ${file.name}.`);
    setErrorMessage(null);
    setParsedPosition(null);
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFilePick} className="hidden" />

      <div className="border-b border-border px-4 py-4 md:px-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-white">JSON Formatter Workspace</h2>
            <p className="mt-1 text-sm text-muted">Validate, beautify, minify, and convert JSON right in the browser.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-foreground/75">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full border border-border bg-surface/50 px-4 py-2 transition hover:bg-surface/70">Upload JSON</button>
            <button type="button" onClick={clearAll} className="rounded-full border border-border px-4 py-2 transition hover:bg-surface/70">Clear</button>
          </div>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_240px_minmax(0,1fr)]">
        <section className="min-w-0 border-b border-border xl:border-b-0 xl:border-r xl:border-border">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
            <div>
              <div className="text-sm font-semibold text-white">Input JSON</div>
              <div className="text-xs text-muted">Paste raw JSON or upload a .json file</div>
            </div>
            <div className="rounded-full border border-border bg-surface/50 px-3 py-1 text-xs text-foreground/75">{parsedSummary.inputLines} lines</div>
          </div>
          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setErrorMessage(null);
              setParsedPosition(null);
              setStatusMessage("Input updated.");
            }}
            spellCheck={false}
            placeholder="Paste JSON here..."
            className="min-h-[420px] w-full resize-none bg-[#0f1117] px-4 py-4 font-mono text-sm leading-7 text-[#ecedf6] outline-none placeholder:text-[#596073] md:px-5"
          />
        </section>

        <section className="border-b border-border bg-surface p-4 xl:border-b-0 xl:border-r xl:border-border">
          <div className="space-y-3">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full rounded-2xl border border-border bg-[#21c7b9]/10 px-4 py-3 text-sm font-semibold text-[#c5fff9] transition hover:bg-[#21c7b9]/20">Upload Data</button>
            <button type="button" onClick={() => applyTransformation("validate")} className="w-full rounded-2xl border border-border bg-surface/50 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]">Validate</button>
            <select value={indentMode} onChange={(event) => setIndentMode(event.target.value as IndentMode)} className="w-full rounded-2xl border border-border bg-[#0f1117] px-4 py-3 text-sm text-white outline-none">
              {INDENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#0f1117] text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => applyTransformation("beautify")} className="w-full rounded-2xl bg-[#6c63ff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5a51f6]">Format / Beautify</button>
            <button type="button" onClick={() => applyTransformation("minify")} className="w-full rounded-2xl border border-border bg-surface/50 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]">Minify / Compact</button>

            <div className="rounded-2xl border border-border bg-surface/30 p-3">
              <div className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted">Convert JSON to</div>
              <div className="mt-3 space-y-2">
                <button type="button" onClick={() => applyTransformation("xml")} className="w-full rounded-xl border border-border bg-surface/50 px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.07]">JSON to XML</button>
                <button type="button" onClick={() => applyTransformation("csv")} className="w-full rounded-xl border border-border bg-surface/50 px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.07]">JSON to CSV</button>
                <button type="button" onClick={() => applyTransformation("yaml")} className="w-full rounded-xl border border-border bg-surface/50 px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.07]">JSON to YAML</button>
              </div>
            </div>

            <button type="button" onClick={swapPanels} disabled={!output} className="w-full rounded-2xl border border-border bg-surface/50 px-4 py-3 text-sm font-semibold text-[#d3d4e0] transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40">Use output as input</button>
          </div>
        </section>

        <section className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
            <div>
              <div className="text-sm font-semibold text-white">Output</div>
              <div className="text-xs text-muted">Formatted result ready to copy or download</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-border bg-surface/50 px-3 py-1 text-xs text-foreground/75">{outputMode.toUpperCase()}</div>
              <button type="button" onClick={copyOutput} disabled={!output} className="rounded-full border border-border px-3 py-1 text-xs text-foreground/75 transition hover:bg-surface/70 disabled:cursor-not-allowed disabled:opacity-40">{copied ? "Copied!" : "Copy"}</button>
              <button type="button" onClick={downloadOutput} disabled={!output} className="rounded-full border border-border px-3 py-1 text-xs text-foreground/75 transition hover:bg-surface/70 disabled:cursor-not-allowed disabled:opacity-40">{downloaded ? "Downloaded" : "Download"}</button>
            </div>
          </div>
          <textarea
            value={output}
            onChange={() => undefined}
            readOnly
            spellCheck={false}
            placeholder="Your formatted output will appear here..."
            className="min-h-[420px] w-full resize-none bg-[#0f1117] px-4 py-4 font-mono text-sm leading-7 text-[#ecedf6] outline-none placeholder:text-[#596073] md:px-5"
          />
        </section>
      </div>

      <div className="grid gap-4 border-t border-border bg-surface px-4 py-4 md:px-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="rounded-2xl border border-border bg-surface/50 px-4 py-3 text-sm text-foreground/75">{statusMessage}</div>
          {errorMessage ? (
            <div className="mt-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              <div className="font-semibold">Invalid JSON</div>
              <div className="mt-1">{errorMessage}</div>
              {parsedPosition ? <div className="mt-1 text-rose-50/90">Line {parsedPosition.line}, column {parsedPosition.column}</div> : null}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
          <StatCard label="Input chars" value={parsedSummary.inputChars.toLocaleString()} accent="text-[#6c63ff]" />
          <StatCard label="Output chars" value={parsedSummary.outputChars.toLocaleString()} accent="text-[#ff6584]" />
          <StatCard label="Input lines" value={parsedSummary.inputLines.toLocaleString()} accent="text-[#38d9a9]" />
          <StatCard label="Root type" value={parsedSummary.root} accent="text-[#ffb347]" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[#7f8198]">{label}</div>
      <div className={`mt-2 text-lg font-semibold ${accent}`}>{value}</div>
    </div>
  );
}
