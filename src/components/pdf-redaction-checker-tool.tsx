"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

import { analytics, classifyError, fileType, sizeBucket } from "@/lib/analytics";
import {
  checkPdfRedaction,
  EncryptedPdfError,
  resultType,
  type Finding,
  type RedactionReport,
  type RiskChannel,
} from "@/lib/pdf-redaction-check";

const TOOL = { tool_slug: "pdf-redaction-checker", category: "pdf", processing_mode: "browser" } as const;

/** Above this the browser is likely to struggle, especially on mobile. */
const MAX_FILE_SIZE = 100 * 1024 * 1024;

/**
 * Plain-language explanation for each detection channel. Ordinary users must
 * never be handed PDF operator internals; the technical detail lives in the
 * "How this was detected" line, which is secondary.
 */
const CHANNEL_COPY: Record<
  RiskChannel,
  { title: string; why: string; fix: string; technical: string }
> = {
  "under-shape": {
    title: "Text is still readable underneath a box",
    why:
      "Someone drew a filled rectangle or pasted an image over this text, but the text itself was never removed. Anyone can select it, copy it, or extract it with a script in seconds.",
    fix:
      "Redact the document again with a tool that deletes the underlying text rather than covering it, then re-check the result.",
    technical:
      "The text is painted earlier in the page's content stream than an opaque rectangle or image that covers at least 60% of its bounding box.",
  },
  "invisible-text": {
    title: "Invisible text is present",
    why:
      "This text is set to render invisibly. It does not appear on screen or in print, but it is still in the file and any text extractor will find it.",
    fix:
      "Remove the invisible text, or flatten the page to an image if the words are not needed.",
    technical:
      "The text uses PDF rendering mode 3 or 7. Pages that are an image with a full invisible OCR layer are excluded, because that is how every searchable scan works.",
  },
  "same-colour": {
    title: "Text is the same colour as its background",
    why:
      "This text is painted in the same colour as whatever is behind it, so it looks blank but is fully intact in the file. Selecting the area reveals it.",
    fix:
      "Delete the text rather than recolouring it, then re-check.",
    technical:
      "The run's fill colour is within a small RGB distance of the last opaque shape painted beneath it, or of the unpainted page.",
  },
};

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function groupByChannel(report: RedactionReport) {
  const groups = new Map<RiskChannel, Finding[]>();
  for (const p of report.pages) {
    for (const f of p.findings) {
      const list = groups.get(f.channel) ?? [];
      list.push(f);
      groups.set(f.channel, list);
    }
  }
  return groups;
}

export default function PdfRedactionCheckerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [report, setReport] = useState<RedactionReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const headingId = useId();
  const resultsId = useId();

  useEffect(() => {
    analytics.toolView(TOOL);
  }, []);
  useEffect(() => () => abortRef.current?.abort(), []);

  const pickFile = useCallback((list: FileList | File[] | null) => {
    if (!list) return;
    const picked = Array.from(list);
    const pdf = picked.find(isPdf);
    setReport(null);
    setError(null);

    if (!pdf) {
      setNotice("That is not a PDF. Choose a file ending in .pdf.");
      analytics.toolError({ ...TOOL, failure_type: "unsupported_file" });
      return;
    }
    if (pdf.size > MAX_FILE_SIZE) {
      setNotice("That file is over 100 MB, which is too large to analyse in a browser tab.");
      analytics.toolError({ ...TOOL, failure_type: "file_too_large", file_type: fileType(pdf.name) });
      return;
    }
    setNotice(null);
    setFile(pdf);
  }, []);

  const analyse = useCallback(async () => {
    if (!file) return;
    const controller = new AbortController();
    abortRef.current = controller;

    setBusy(true);
    setError(null);
    setReport(null);
    setProgress({ done: 0, total: 0 });

    const startedAt = Date.now();
    analytics.toolStart({
      ...TOOL,
      file_type: fileType(file.name),
      file_size_bucket: sizeBucket(file.size),
      file_count: 1,
    });

    try {
      const bytes = await file.arrayBuffer();
      const result = await checkPdfRedaction(bytes, {
        signal: controller.signal,
        onProgress: (done, total) => setProgress({ done, total }),
      });
      setReport(result);
      // Only the verdict label leaves the browser. Never the document, the
      // recovered text, or any metadata value.
      analytics.toolComplete({
        ...TOOL,
        file_type: fileType(file.name),
        file_size_bucket: sizeBucket(file.size),
        output_type: resultType(result),
        page_count_bucket: result.pages.length <= 10 ? "1-10" : result.pages.length <= 50 ? "11-50" : "50+",
        duration_ms: Math.round(Date.now() - startedAt),
      });
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      if (err instanceof EncryptedPdfError) {
        setError(
          "This PDF is password protected, so its contents cannot be read. Unlock it first, then check it.",
        );
        analytics.toolError({ ...TOOL, failure_type: "unsupported_file" });
      } else {
        setError(
          "This file could not be analysed. It may be corrupt or not a valid PDF.",
        );
        analytics.toolError({ ...TOOL, failure_type: classifyError(err) });
      }
    } finally {
      setBusy(false);
      setProgress(null);
      abortRef.current = null;
    }
  }, [file]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setFile(null);
    setReport(null);
    setError(null);
    setNotice(null);
    if (inputRef.current) inputRef.current.value = "";
    analytics.toolReset(TOOL);
  }, []);

  const groups = report ? groupByChannel(report) : null;
  const pagesAffected = report
    ? report.pages.filter((p) => p.findings.length > 0).map((p) => p.page)
    : [];

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-5">
      <h2 id={headingId} className="sr-only">
        Check a PDF for recoverable text
      </h2>

      {/* ---------------------------------------------------- 1. SELECT PDF */}
      {!report && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files); }}
          className="rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-10"
          style={{
            borderColor: dragOver ? "#6c63ff" : "var(--border)",
            background: dragOver ? "rgba(108,99,255,0.06)" : "var(--surface-1)",
          }}
        >
          <p className="text-3xl" aria-hidden>
            🔍
          </p>
          <p className="mt-3 font-semibold text-foreground">
            {file ? file.name : "Drop a PDF here, or choose a file"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6" style={{ color: "var(--muted)" }}>
            The file is read inside this browser tab. It is never uploaded — you can confirm that
            in your browser&apos;s Network tab.
          </p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]"
            style={{ background: "#6c63ff" }}
          >
            {file ? "Choose a different PDF" : "Choose a PDF"}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            aria-label="Choose a PDF to check for recoverable text"
            onChange={(e) => pickFile(e.target.files)}
            className="sr-only"
          />
        </div>
      )}

      {notice && (
        <p
          role="alert"
          className="rounded-xl border px-4 py-3 text-sm leading-6"
          style={{ borderColor: "var(--border)", background: "var(--surface-1)", color: "var(--muted)" }}
        >
          {notice}
        </p>
      )}

      {/* -------------------------------------------------------- 2. ANALYZE */}
      {file && !report && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={analyse}
            disabled={busy}
            className="min-h-11 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff] disabled:opacity-60"
            style={{ background: "#6c63ff" }}
          >
            {busy ? "Checking…" : "Check this PDF"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="min-h-11 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]"
            style={{ borderColor: "var(--border)" }}
          >
            Clear
          </button>
        </div>
      )}

      {busy && (
        <p role="status" aria-live="polite" className="text-sm" style={{ color: "var(--muted)" }}>
          {progress && progress.total
            ? `Checking page ${progress.done} of ${progress.total}…`
            : "Reading the document…"}
        </p>
      )}

      {error && (
        <p
          role="alert"
          data-verdict="error"
          className="rounded-xl border px-4 py-3 text-sm leading-6"
          style={{ borderColor: "#f87171", background: "rgba(248,113,113,0.08)", color: "var(--foreground)" }}
        >
          {error}
        </p>
      )}

      {/* -------------------------------------------------------- 3. RESULTS */}
      {report && (
        <div id={resultsId} className="flex flex-col gap-4" role="region" aria-live="polite">
          <div
            /* Stable hook for the regression suite. Page copy legitimately
               repeats phrases like "no recoverable text was detected" in the
               FAQ, so tests must read the verdict from here, not from the
               body text. */
            data-verdict={report.verdict}
            className="rounded-2xl border p-5"
            style={{
              borderColor: report.verdict === "leaks-found" ? "#f87171" : "var(--border)",
              background: report.verdict === "leaks-found" ? "rgba(248,113,113,0.08)" : "var(--surface-1)",
            }}
          >
            {report.verdict === "leaks-found" ? (
              <>
                <p className="text-lg font-bold" style={{ color: "#f87171" }}>
                  Potential text leak detected
                </p>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--muted)" }}>
                  {report.totalFindings} item{report.totalFindings === 1 ? "" : "s"} of readable text
                  {pagesAffected.length > 0 && (
                    <> on page{pagesAffected.length === 1 ? "" : "s"} {pagesAffected.join(", ")}</>
                  )}{" "}
                  can still be recovered from this file, even though it is not visible on screen.
                </p>
              </>
            ) : report.verdict === "no-text-layer" ? (
              <>
                <p className="text-lg font-bold text-foreground">No text layer in this PDF</p>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--muted)" }}>
                  Every page is an image, so there is no extractable text for these checks to find.
                  That does not tell you whether the pictures themselves show something sensitive.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold" style={{ color: "#86efac" }}>
                  No recoverable text was detected
                </p>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--muted)" }}>
                  No recoverable text was found by the checks ToolMint performs. That is not the same
                  as proving the document is secure — see what this tool cannot check, below.
                </p>
              </>
            )}
            <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
              {report.pages.length} page{report.pages.length === 1 ? "" : "s"} analysed
              {report.pages.some((p) => p.ocrLayerRuns > 0) && " · a scanned OCR text layer was found and treated as normal"}
            </p>
          </div>

          {/* ------------------------------------------------------ 4. DETAILS */}
          {groups && groups.size > 0 && (
            <div className="flex flex-col gap-3">
              {[...groups.entries()].map(([channel, findings]) => {
                const copy = CHANNEL_COPY[channel];
                return (
                  <div
                    key={channel}
                    className="rounded-2xl border p-5"
                    style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
                  >
                    <h3 className="font-semibold text-foreground">{copy.title}</h3>
                    <p className="mt-2 text-sm leading-6" style={{ color: "var(--muted)" }}>
                      {copy.why}
                    </p>

                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                      Recovered text ({findings.length})
                    </p>
                    <ul className="mt-2 flex flex-col gap-1">
                      {findings.slice(0, 20).map((f, i) => (
                        <li
                          key={`${channel}-${i}`}
                          className="rounded-lg border px-3 py-2 text-sm"
                          style={{ borderColor: "var(--border)", background: "var(--background)" }}
                        >
                          <span className="text-xs" style={{ color: "var(--muted)" }}>
                            Page {f.page}:{" "}
                          </span>
                          <span className="break-words font-mono text-foreground">{f.text}</span>
                        </li>
                      ))}
                    </ul>
                    {findings.length > 20 && (
                      <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                        …and {findings.length - 20} more.
                      </p>
                    )}

                    <p className="mt-4 text-sm leading-6 text-foreground">
                      <strong>How to fix it:</strong> {copy.fix}
                    </p>
                    {showAdvanced && (
                      <p className="mt-2 text-xs leading-5" style={{ color: "var(--muted)" }}>
                        <strong>How this was detected:</strong> {copy.technical}
                      </p>
                    )}
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="min-h-11 self-start rounded-xl border px-4 py-2 text-sm font-medium transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]"
                style={{ borderColor: "var(--border)" }}
                aria-expanded={showAdvanced}
              >
                {showAdvanced ? "Hide technical detail" : "Show technical detail"}
              </button>
            </div>
          )}

          {/* Metadata is reported for review, never as a leak: nearly every PDF
              carries these fields, so calling their presence a failure would
              fire on almost every document. */}
          {report.metadataReview && (
            <div
              className="rounded-2xl border p-5"
              style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
            >
              <h3 className="font-semibold text-foreground">Worth reviewing: document properties</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--muted)" }}>
                These fields travel with the file and are visible to anyone who opens its properties.
                They are normal to have — check that they do not name a person or matter you meant to
                remove.
              </p>
              <dl className="mt-3 grid gap-2">
                {report.metadata.map((m) => (
                  <div key={m.key} className="flex flex-wrap gap-2 text-sm">
                    <dt className="font-semibold text-foreground">{m.key}:</dt>
                    <dd className="break-words font-mono" style={{ color: "var(--muted)" }}>{m.value}</dd>
                  </div>
                ))}
                {report.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-sm">
                    <dt className="font-semibold text-foreground">Embedded files:</dt>
                    <dd style={{ color: "var(--muted)" }}>{report.attachments.join(", ")}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* ----------------------------------------- 5. RECOMMENDATION / 6. NEXT */}
          <div
            className="rounded-2xl border p-5"
            style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
          >
            <h3 className="font-semibold text-foreground">What this check cannot tell you</h3>
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm leading-6" style={{ color: "var(--muted)" }}>
              <li>Whether a signature, photo, chart or other non-text content is hidden under a box — this analyses text only.</li>
              <li>Whether the text that is visible ought to have been removed.</li>
              <li>Whether an earlier saved revision inside the file still holds the original content.</li>
              <li>Anything inside a password-protected PDF it cannot open.</li>
            </ul>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/tools/redact-pdf"
                className="min-h-11 inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]"
                style={{ background: "#6c63ff" }}
              >
                {report.verdict === "leaks-found" ? "Fix it with Redact PDF" : "Redact a PDF"}
              </Link>
              <button
                type="button"
                onClick={reset}
                className="min-h-11 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]"
                style={{ borderColor: "var(--border)" }}
              >
                Check another PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
