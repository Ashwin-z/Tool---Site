"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { analytics, sizeBucket } from "@/lib/analytics";
import { downloadBlob, formatBytes, sanitizeBaseName } from "@/lib/client-pdf-utils";
import {
  EXCEL_CAPABILITIES,
  ExcelError,
  type ExcelResult,
  MAX_FILE_SIZE,
} from "@/lib/pdf-to-excel-types";

const TOOL = { tool_slug: "pdf-to-excel", category: "pdf", processing_mode: "browser" } as const;

/** Bucketed so an exact document page count is never transmitted. */
function pageBucket(n: number): string {
  if (n <= 1) return "1";
  if (n <= 10) return "2-10";
  if (n <= 50) return "11-50";
  return "50+";
}

type Done = { name: string; blob: Blob; result: ExcelResult };

const isPdf = (f: File) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");

export default function PdfToExcelTool() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const headingId = useId();
  const errorId = useId();

  useEffect(() => () => abortRef.current?.abort(), []);

  const choose = useCallback((list: FileList | File[] | null) => {
    const pdf = (list ? Array.from(list) : []).find(isPdf);
    if (!pdf) {
      setError("That is not a PDF. Choose a file ending in .pdf.");
      return;
    }
    if (pdf.size > MAX_FILE_SIZE) {
      setError(`That file is over ${formatBytes(MAX_FILE_SIZE)}, which is too large to process in the browser.`);
      return;
    }
    setFile(pdf);
    setDone(null);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    analytics.toolReset(TOOL);
    setFile(null);
    setDone(null);
    setError(null);
    setProgress(0);
    setStage("");
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const run = useCallback(async () => {
    if (!file || busy) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError(null);
    setDone(null);
    setProgress(0);

    analytics.toolStart({
      ...TOOL,
      file_type: "pdf",
      file_count: 1,
      file_size_bucket: sizeBucket(file.size),
    });

    try {
      // pdfjs + the exceljs browser build are ~1MB together, so the engine is
      // fetched on first conversion rather than on page load.
      const { convertPdfToExcel } = await import("@/lib/pdf-to-excel");
      const buffer = await file.arrayBuffer();
      const result = await convertPdfToExcel(buffer, {
        signal: controller.signal,
        onProgress: (f, note) => {
          setProgress(f);
          setStage(note);
        },
      });

      const blob = new Blob([new Uint8Array(result.bytes)], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      setDone({ name: `${sanitizeBaseName(file.name)}.xlsx`, blob, result });

      analytics.toolComplete({
        ...TOOL,
        file_type: "pdf",
        output_type: "xlsx",
        file_count: 1,
        file_size_bucket: sizeBucket(result.outputSize),
        page_count_bucket: pageBucket(result.pageCount),
        duration_ms: result.durationMs,
      });
    } catch (err) {
      const ee = err instanceof ExcelError ? err : null;
      if (ee?.code === "cancelled") {
        setError("Cancelled. Your file was not changed.");
      } else {
        setError(ee?.message ?? "Something went wrong converting this PDF.");
        analytics.toolError({
          ...TOOL,
          file_type: "pdf",
          file_size_bucket: sizeBucket(file.size),
          failure_type:
            ee?.code === "encrypted" || ee?.code === "corrupt" || ee?.code === "no-text-layer"
              ? "unsupported_file"
              : ee?.code === "too-large"
                ? "file_too_large"
                : "processing_failed",
        });
      }
    } finally {
      setBusy(false);
      setProgress(0);
      setStage("");
      abortRef.current = null;
    }
  }, [file, busy]);

  const download = useCallback(() => {
    if (!done) return;
    analytics.toolDownload({
      ...TOOL,
      output_type: "xlsx",
      file_count: 1,
      file_size_bucket: sizeBucket(done.blob.size),
    });
    downloadBlob(done.blob, done.name);
  }, [done]);

  const btn =
    "min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]";
  const ghost =
    "min-h-11 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]";

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-5">
      <h2 id={headingId} className="sr-only">
        Convert a PDF to an Excel spreadsheet
      </h2>

      {!done ? (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              choose(e.dataTransfer.files);
            }}
            className="rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-9"
            style={{
              borderColor: dragOver ? "#6c63ff" : "var(--border)",
              background: dragOver ? "rgba(108,99,255,.06)" : "var(--surface-1)",
            }}
          >
            <p className="text-3xl" aria-hidden>
              📊
            </p>
            <p className="mt-3 font-semibold text-foreground">
              {file ? file.name : "Choose a PDF with tables in it"}
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6" style={{ color: "var(--muted)" }}>
              {file ? formatBytes(file.size) : `Drag and drop, or browse. Up to ${formatBytes(MAX_FILE_SIZE)}.`}
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={`${btn} mt-5 text-white`}
              style={{ background: "#6c63ff" }}
            >
              {file ? "Choose a different PDF" : "Choose PDF"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              aria-label="Choose a PDF to convert to Excel"
              onChange={(e) => choose(e.target.files)}
            />
          </div>

          {/* Honest expectations, shown BEFORE the user commits time */}
          <div
            className="rounded-2xl border p-5"
            style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
          >
            <h3 className="text-sm font-semibold text-foreground">What you will get</h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-6" style={{ color: "var(--muted)" }}>
              {EXCEL_CAPABILITIES.does.map((d) => (
                <li key={d} className="flex gap-2">
                  <span aria-hidden style={{ color: "#4ade80" }}>
                    ✓
                  </span>
                  {d}
                </li>
              ))}
            </ul>
            <h3 className="mt-4 text-sm font-semibold text-foreground">What it will not do</h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-6" style={{ color: "var(--muted)" }}>
              {EXCEL_CAPABILITIES.doesNot.map((d) => (
                <li key={d} className="flex gap-2">
                  <span aria-hidden style={{ color: "var(--muted-2)" }}>
                    ✕
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {error ? (
            <p
              id={errorId}
              role="alert"
              className="rounded-xl border px-4 py-3 text-sm leading-6"
              style={{ borderColor: "rgba(239,68,68,.4)", background: "rgba(239,68,68,.08)", color: "#fca5a5" }}
            >
              {error}
            </p>
          ) : null}

          {file ? (
            busy ? (
              <div className="flex flex-col gap-3">
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress * 100)}
                  aria-label="Conversion progress"
                  className="h-2 w-full overflow-hidden rounded-full"
                  style={{ background: "var(--surface-2)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.max(4, progress * 100)}%`, background: "#6c63ff" }}
                  />
                </div>
                <p role="status" aria-live="polite" className="text-sm" style={{ color: "var(--muted)" }}>
                  {stage || "Working"}
                </p>
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  className={ghost}
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={run} className={`${btn} text-white`} style={{ background: "#6c63ff" }}>
                  Convert to Excel
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className={ghost}
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  Clear
                </button>
              </div>
            )
          ) : null}
        </>
      ) : (
        <div className="flex flex-col gap-4" role="region" aria-live="polite">
          <div
            className="rounded-2xl border p-5"
            style={{ borderColor: "rgba(34,197,94,.35)", background: "rgba(34,197,94,.07)" }}
          >
            <p className="font-semibold" style={{ color: "#86efac" }}>
              Spreadsheet ready
            </p>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--muted)" }}>
              One worksheet per page. Open it and check the numbers before you rely on them — table
              detection is an inference, not a guarantee.
            </p>

            <dl className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <dt className="text-xs" style={{ color: "var(--muted)" }}>
                  Worksheets
                </dt>
                <dd className="text-lg font-bold tabular-nums text-foreground">{done.result.pageCount}</dd>
              </div>
              <div>
                <dt className="text-xs" style={{ color: "var(--muted)" }}>
                  Size
                </dt>
                <dd className="text-lg font-bold tabular-nums text-foreground">
                  {formatBytes(done.result.outputSize)}
                </dd>
              </div>
              <div>
                <dt className="text-xs" style={{ color: "var(--muted)" }}>
                  Took
                </dt>
                <dd className="text-lg font-bold tabular-nums text-foreground">
                  {(done.result.durationMs / 1000).toFixed(1)}s
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={download} className={`${btn} text-white`} style={{ background: "#6c63ff" }}>
                Download XLSX
              </button>
              <button
                type="button"
                onClick={reset}
                className={ghost}
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                Convert another
              </button>
            </div>
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
            <h3 className="font-semibold text-foreground">Next steps</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                { name: "PDF to Word", href: "/tools/pdf-to-word", desc: "Get the text as a document instead." },
                { name: "PDF to Text (OCR)", href: "/tools/pdf-to-text", desc: "For scanned pages with no text layer." },
                { name: "Split PDF", href: "/tools/split-pdf", desc: "Pull out just the pages with tables." },
              ].map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="rounded-xl border p-3 transition hover:-translate-y-0.5"
                  style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
                >
                  <span className="block text-sm font-semibold text-foreground">{t.name}</span>
                  <span className="mt-0.5 block text-xs" style={{ color: "var(--muted)" }}>
                    {t.desc}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
