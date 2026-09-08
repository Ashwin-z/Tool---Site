"use client";

import { useCallback, useRef, useState } from "react";
import { downloadBlob } from "@/lib/client-pdf-utils";

type ConversionResult = {
  fileName: string;
  blob: Blob;
  sourceUrl: string;
};

function normalizeUrlInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed).toString();
  } catch {
    try {
      return new URL(`https://${trimmed}`).toString();
    } catch {
      return null;
    }
  }
}

function sanitizeFileNamePart(value: string): string {
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+/, "")
    .slice(0, 120);
}

function buildOutputFileName(sourceUrl: string, headerFileName: string | null): string {
  if (headerFileName) {
    const cleanedHeader = sanitizeFileNamePart(headerFileName.replace(/\.pdf$/i, ""));
    if (cleanedHeader) return `${cleanedHeader}.pdf`;
  }

  try {
    const url = new URL(sourceUrl);
    const pathPart = url.pathname.replace(/\/+$/, "").split("/").filter(Boolean).pop() ?? "page";
    const cleanedPath = sanitizeFileNamePart(`${url.hostname}-${pathPart}`);
    return `${cleanedPath || "webpage"}.pdf`;
  } catch {
    return "webpage.pdf";
  }
}

async function fetchPdfForUrl(url: string): Promise<ConversionResult> {
  const response = await fetch(`/api/tools/html-to-pdf/render?url=${encodeURIComponent(url)}`);

  if (!response.ok) {
    let errorMessage = "Failed to convert the webpage to PDF.";

    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) errorMessage = payload.error;
    } catch {
      const text = await response.text();
      if (text) errorMessage = text;
    }

    throw new Error(errorMessage);
  }

  const blob = await response.blob();
  const headerFileName = response.headers.get("x-file-name");

  return {
    blob,
    sourceUrl: url,
    fileName: buildOutputFileName(url, headerFileName),
  };
}

export default function WebpageToPdfTool() {
  const [urlInput, setUrlInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleConvert = useCallback(async () => {
    const normalizedUrl = normalizeUrlInput(urlInput);
    if (!normalizedUrl) {
      setErrorMessage("Please enter a valid webpage URL.");
      return;
    }

    setProcessing(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const converted = await fetchPdfForUrl(normalizedUrl);
      setResult(converted);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to convert the webpage to PDF.");
    } finally {
      setProcessing(false);
    }
  }, [urlInput]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      void handleConvert();
    },
    [handleConvert],
  );

  const handleDownload = useCallback(() => {
    if (!result) return;
    downloadBlob(result.blob, result.fileName);
  }, [result]);

  const handleReset = useCallback(() => {
    setUrlInput("");
    setResult(null);
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.focus();
  }, []);

  return (
    <div className="space-y-4">
      {!result && !processing && (
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]"
        >
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#f59e0b] to-[#38d9a9]" />

          <div className="px-5 py-6">
            <div className="rounded-xl border border-border bg-white/[.02] px-4 py-4">
              <label htmlFor="webpage-url" className="text-sm font-semibold text-white">
                Enter a webpage URL
              </label>
              <p className="mt-1 text-xs text-muted">
                Paste a public http:// or https:// page. We&apos;ll fetch the page and convert it to PDF.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  ref={inputRef}
                  id="webpage-url"
                  type="url"
                  inputMode="url"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="https://example.com"
                  value={urlInput}
                  onChange={(event) => setUrlInput(event.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-border bg-[#0c0c12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted-2 focus:border-[#6c63ff]/60 focus:ring-2 focus:ring-[#6c63ff]/20"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6c63ff] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
                >
                  🌐 Convert URL to PDF
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {errorMessage && !processing && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      {processing && (
        <div className="flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface px-5 py-12">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-[#6c63ff]" />
            <div
              className="absolute inset-2 animate-spin rounded-full border-4 border-border border-b-[#f59e0b]"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>
          <p className="text-sm font-semibold text-white">Fetching and converting the webpage…</p>
          <p className="text-xs text-muted">This can take a moment on large pages.</p>
        </div>
      )}

      {result && !processing && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />

            <div className="flex flex-col items-center px-5 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400">
                ✓
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-white">Your PDF is ready!</h3>
              <p className="mt-2 max-w-2xl text-xs text-muted">{result.sourceUrl}</p>
              <button
                onClick={handleDownload}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
              >
                ⬇ Download PDF
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3">
              <h3 className="font-display text-sm font-bold text-white">Converted Page</h3>
            </div>

            <div className="px-5 py-4 text-sm text-muted">
              Saved from <span className="text-white">{result.sourceUrl}</span>
            </div>

            <div className="border-t border-border px-5 py-4 text-center">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[.03]"
              >
                Convert Another URL
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
