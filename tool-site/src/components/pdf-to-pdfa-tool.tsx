"use client";

import { useCallback, useRef, useState } from "react";
import {
  downloadBlob,
  formatBytes,
  sanitizeBaseName,
} from "@/lib/client-pdf-utils";

/* ── Types ─────────────────────────────────────────────── */

type ConformanceLevel = "1" | "2" | "3";

type ConvertedFile = {
  name: string;
  originalSize: number;
  blob: Blob;
};

const MAX_FILES = 10;
const MAX_SIZE_MB = 50;

/* ── Component ─────────────────────────────────────────── */

export default function PdfToPdfaTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [conformance, setConformance] = useState<ConformanceLevel>("2");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState<ConvertedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── File handling ── */

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const incoming = Array.from(fileList).filter(
        (f) => f.name.toLowerCase().endsWith(".pdf") && f.size <= MAX_SIZE_MB * 1024 * 1024,
      );
      setFiles((prev) => {
        const names = new Set(prev.map((f) => f.name));
        const unique = incoming.filter((f) => !names.has(f.name));
        return [...prev, ...unique].slice(0, MAX_FILES);
      });
      setResults([]);
      setErrors([]);
    },
    [],
  );

  const removeFile = useCallback((name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
    setResults([]);
    setErrors([]);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      addFiles(event.dataTransfer.files);
    },
    [addFiles],
  );

  /* ── Conversion ── */

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setResults([]);
    setErrors([]);
    setProgress({ done: 0, total: files.length });

    const converted: ConvertedFile[] = [];
    const errorList: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("conformance", conformance);

        const response = await fetch("/api/tools/pdf-to-pdfa", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(body.error ?? `Server returned ${response.status}`);
        }

        const blob = await response.blob();
        converted.push({
          name: sanitizeBaseName(file.name) + `_pdfa.pdf`,
          originalSize: file.size,
          blob,
        });
      } catch (err) {
        errorList.push(
          `${file.name}: ${err instanceof Error ? err.message : "Conversion failed"}`,
        );
      }

      setProgress({ done: i + 1, total: files.length });
    }

    setResults(converted);
    setErrors(errorList);
    setProcessing(false);
  }, [files, conformance]);

  /* ── Download ── */

  const handleDownload = useCallback((result: ConvertedFile) => {
    downloadBlob(result.blob, result.name);
  }, []);

  const handleDownloadAll = useCallback(async () => {
    if (results.length === 1) {
      handleDownload(results[0]);
      return;
    }
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const r of results) {
      zip.file(r.name, r.blob);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "pdfa-converted.zip");
  }, [results, handleDownload]);

  /* ── Reset ── */

  const handleReset = useCallback(() => {
    setFiles([]);
    setResults([]);
    setErrors([]);
    setProgress({ done: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  /* ── Conformance descriptions ── */
  const conformanceDesc: Record<ConformanceLevel, string> = {
    "1": "PDF/A-1b — Based on PDF 1.4. Maximum compatibility with older readers.",
    "2": "PDF/A-2b — Based on PDF 1.7. Supports JPEG2000, transparency, layers.",
    "3": "PDF/A-3b — Based on PDF 1.7. Like PDF/A-2 but allows embedded files.",
  };

  /* ── UI ── */

  return (
    <div className="space-y-4">
      {/* ── Upload area ── */}
      {results.length === 0 && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#6c63ff] via-[#38d9a9] to-[#ffb347]" />

          <div className="px-5 py-5">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-14 transition ${
                dragOver
                  ? "border-[#6c63ff] bg-[#6c63ff]/5"
                  : files.length > 0
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-border hover:border-border-strong"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={(event) => {
                  addFiles(event.target.files);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c63ff]/10 text-3xl">
                🗄️
              </div>

              {files.length > 0 ? (
                <>
                  <p className="mt-3 text-sm font-semibold text-white">
                    {files.length} file{files.length !== 1 ? "s" : ""} selected
                  </p>
                  <p className="mt-2 text-xs text-[#6c63ff]">Click or drop to add more</p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm font-semibold text-white">
                    Drop PDF files here or <span className="text-[#6c63ff]">browse</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-2">
                    Convert PDFs to PDF/A format for long-term archiving. Up to {MAX_FILES} files, {MAX_SIZE_MB}MB each.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* ── File list ── */}
          {files.length > 0 && (
            <div className="border-t border-border px-5 py-4">
              <div className="space-y-2">
                {files.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center justify-between rounded-lg bg-white/[.03] px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{f.name}</p>
                      <p className="text-xs text-muted-2">{formatBytes(f.size)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(f.name);
                      }}
                      className="ml-3 rounded-lg px-2 py-1 text-xs text-muted-2 hover:bg-surface-3 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Conformance picker ── */}
          {files.length > 0 && (
            <div className="border-t border-border px-5 py-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-3">
                PDF/A Conformance Level
              </h3>
              <div className="flex flex-wrap gap-2">
                {(["1", "2", "3"] as ConformanceLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setConformance(lvl)}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                      conformance === lvl
                        ? "bg-[#6c63ff] text-white shadow-[0_4px_12px_rgba(108,99,255,.35)]"
                        : "bg-surface-3/50 text-muted hover:bg-surface-3 hover:text-foreground"
                    }`}
                  >
                    PDF/A-{lvl}b
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-2">{conformanceDesc[conformance]}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Errors ── */}
      {errors.length > 0 && !processing && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <ul className="list-disc pl-4 space-y-1">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Convert button ── */}
      {files.length > 0 && results.length === 0 && !processing && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-t border-border px-5 py-4 text-center">
            <button
              onClick={handleConvert}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
            >
              🗄️ Convert to PDF/A-{conformance}b
            </button>
          </div>
        </div>
      )}

      {/* ── Processing ── */}
      {processing && (
        <div className="flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface px-5 py-12">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-[#6c63ff]" />
            <div
              className="absolute inset-2 animate-spin rounded-full border-4 border-border border-b-[#38d9a9]"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>
          <p className="text-sm font-semibold text-white">
            Converting file {progress.done} of {progress.total}…
          </p>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-[#6c63ff] transition-all duration-300"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {results.length > 0 && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_rgba(0,0,0,.55)]">
            <div className="h-[2px] w-full bg-gradient-to-r from-[#38d9a9] to-[#6c63ff]" />
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400">
                ✓
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-white">
                {results.length === 1 ? "Your PDF/A file is ready!" : `${results.length} PDF/A files are ready!`}
              </h3>

              {results.length > 1 && (
                <button
                  onClick={handleDownloadAll}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-8 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(108,99,255,.4)] transition hover:bg-[#5a52e0]"
                >
                  ⬇ Download All (ZIP)
                </button>
              )}
            </div>

            <div className="border-t border-border px-5 py-4">
              <div className="space-y-2">
                {results.map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between rounded-lg bg-white/[.03] px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{r.name}</p>
                      <p className="text-xs text-muted-2">
                        {formatBytes(r.originalSize)} → {formatBytes(r.blob.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(r)}
                      className="ml-3 rounded-lg bg-[#6c63ff]/10 px-3 py-1.5 text-xs font-semibold text-[#6c63ff] transition hover:bg-[#6c63ff]/20"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface px-5 py-4 text-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[.03]"
            >
              Convert More Files
            </button>
          </div>
        </>
      )}
    </div>
  );
}
