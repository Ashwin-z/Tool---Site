"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { analytics, sizeBucket } from "@/lib/analytics";
import { downloadBlob, formatBytes, sanitizeBaseName } from "@/lib/client-pdf-utils";
import {
  COMPRESSION_MODES,
  CompressError,
  type CompressResult,
  type CompressionMode,
} from "@/lib/pdf-compression-types";

const TOOL = { tool_slug: "compress-pdf", category: "pdf", processing_mode: "browser" } as const;

const MAX_FILES = 10;
/** Above this the browser is likely to struggle, especially on mobile. */
const MAX_FILE_SIZE = 100 * 1024 * 1024;
/** Above this we warn but still allow it. */
const WARN_FILE_SIZE = 25 * 1024 * 1024;

type QueueItem = {
  id: string;
  file: File;
};

type DoneItem = {
  id: string;
  name: string;
  blob: Blob;
  result: CompressResult;
};

type FailedItem = {
  id: string;
  name: string;
  message: string;
  code: string;
};

let counter = 0;
const uid = () => `f${++counter}_${Date.now()}`;

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export default function PdfCompressorTool() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [mode, setMode] = useState<CompressionMode>("recommended");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [done, setDone] = useState<DoneItem[]>([]);
  const [failed, setFailed] = useState<FailedItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const headingId = useId();
  const modeGroupId = useId();

  useEffect(() => () => abortRef.current?.abort(), []);

  const addFiles = useCallback(
    (list: FileList | File[] | null) => {
      if (!list) return;
      const picked = Array.from(list);
      const pdfs = picked.filter(isPdf);

      if (!pdfs.length) {
        setNotice("Those files are not PDFs. Choose a file ending in .pdf.");
        return;
      }

      const tooBig = pdfs.filter((f) => f.size > MAX_FILE_SIZE);
      const usable = pdfs.filter((f) => f.size <= MAX_FILE_SIZE);

      setQueue((prev) => {
        const room = MAX_FILES - prev.length;
        const next = usable.slice(0, Math.max(0, room));

        const messages: string[] = [];
        if (tooBig.length) {
          messages.push(
            `${tooBig.length} file${tooBig.length > 1 ? "s were" : " was"} over ${formatBytes(MAX_FILE_SIZE)} and skipped.`,
          );
        }
        if (usable.length > room) {
          messages.push(`You can compress ${MAX_FILES} PDFs at a time.`);
        }
        if (picked.length !== pdfs.length) {
          messages.push("Non-PDF files were skipped.");
        }
        const big = next.find((f) => f.size > WARN_FILE_SIZE);
        if (big && !messages.length) {
          messages.push("Large file — this may take a while and needs a good bit of memory.");
        }
        setNotice(messages.join(" ") || null);

        return [...prev, ...next.map((file) => ({ id: uid(), file }))];
      });

      setDone([]);
      setFailed([]);
    },
    [],
  );

  const removeItem = useCallback((id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
    setDone([]);
    setFailed([]);
    setNotice(null);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    analytics.toolReset(TOOL);
    setQueue([]);
    setDone([]);
    setFailed([]);
    setNotice(null);
    setProgress(0);
    setStage("");
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const run = useCallback(async () => {
    if (!queue.length || busy) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setDone([]);
    setFailed([]);
    setNotice(null);
    setProgress(0);

    const totalBytes = queue.reduce((s, q) => s + q.file.size, 0);
    analytics.toolStart({
      ...TOOL,
      file_type: "pdf",
      file_count: queue.length,
      file_size_bucket: sizeBucket(totalBytes),
      processing_mode: "browser",
    });

    const okItems: DoneItem[] = [];
    const badItems: FailedItem[] = [];

    for (let i = 0; i < queue.length; i++) {
      if (controller.signal.aborted) break;
      const item = queue[i];
      setActiveIndex(i);
      setStage(`Reading ${item.file.name}`);

      try {
        // pdf-lib is ~400KB, so the engine is fetched on first use rather than
        // on page load. Everything it needs is already in the browser.
        const { compressPdf } = await import("@/lib/pdf-compression");
        const buffer = await item.file.arrayBuffer();
        const result = await compressPdf(buffer, {
          mode,
          signal: controller.signal,
          onProgress: (fraction, note) => {
            setProgress(fraction);
            setStage(note);
          },
        });
        const blob = new Blob([new Uint8Array(result.bytes)], { type: "application/pdf" });
        okItems.push({ id: item.id, name: `${sanitizeBaseName(item.file.name)}-compressed.pdf`, blob, result });
      } catch (err) {
        const ce = err instanceof CompressError ? err : null;
        if (ce?.code === "cancelled") break;
        badItems.push({
          id: item.id,
          name: item.file.name,
          message: ce?.message ?? "Something went wrong compressing this file.",
          code: ce?.code ?? "unknown",
        });
        analytics.toolError({
          ...TOOL,
          file_type: "pdf",
          file_size_bucket: sizeBucket(item.file.size),
          failure_type:
            ce?.code === "encrypted"
              ? "unsupported_file"
              : ce?.code === "corrupt" || ce?.code === "empty" || ce?.code === "not-a-pdf"
                ? "unsupported_file"
                : ce?.code === "out-of-memory"
                  ? "file_too_large"
                  : "processing_failed",
        });
      }
    }

    setDone(okItems);
    setFailed(badItems);
    setBusy(false);
    setProgress(0);
    setStage("");
    abortRef.current = null;

    if (okItems.length) {
      const before = okItems.reduce((s, d) => s + d.result.originalSize, 0);
      const after = okItems.reduce((s, d) => s + d.result.compressedSize, 0);
      analytics.toolComplete({
        ...TOOL,
        file_type: "pdf",
        output_type: "pdf",
        file_count: okItems.length,
        file_size_bucket: sizeBucket(after),
        duration_ms: okItems.reduce((s, d) => s + d.result.durationMs, 0),
        processing_mode: "browser",
        compression_mode: mode,
        reduction_bucket:
          before > 0 ? `${Math.min(90, Math.round(((1 - after / before) * 100) / 10) * 10)}%+` : "0%",
      });
    }
  }, [queue, busy, mode]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setBusy(false);
    setStage("");
    setProgress(0);
    setNotice("Compression cancelled. Your files were not changed.");
  }, []);

  const downloadOne = useCallback((item: DoneItem) => {
    analytics.toolDownload({
      ...TOOL,
      output_type: "pdf",
      file_count: 1,
      file_size_bucket: sizeBucket(item.blob.size),
    });
    downloadBlob(item.blob, item.name);
  }, []);

  const downloadAll = useCallback(() => {
    analytics.toolDownload({
      ...TOOL,
      output_type: "pdf",
      file_count: done.length,
      file_size_bucket: sizeBucket(done.reduce((s, d) => s + d.blob.size, 0)),
    });
    done.forEach((d, i) => setTimeout(() => downloadBlob(d.blob, d.name), i * 250));
  }, [done]);

  const hasResults = done.length > 0 || failed.length > 0;
  const totalBefore = done.reduce((s, d) => s + d.result.originalSize, 0);
  const totalAfter = done.reduce((s, d) => s + d.result.compressedSize, 0);
  const totalPct = totalBefore ? Math.max(0, (1 - totalAfter / totalBefore) * 100) : 0;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-5">
      <h2 id={headingId} className="sr-only">
        Compress PDF files
      </h2>

      {/* ---------- file selection ---------- */}
      {!hasResults ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          className="rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-10"
          style={{
            borderColor: dragOver ? "#6c63ff" : "var(--border)",
            background: dragOver ? "rgba(108,99,255,.06)" : "var(--surface-1)",
          }}
        >
          <p className="text-3xl" aria-hidden>
            📄
          </p>
          <p className="mt-3 font-semibold text-foreground">
            {queue.length ? "Add more PDFs" : "Choose a PDF to compress"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6" style={{ color: "var(--muted)" }}>
            Drag and drop here, or browse your device. Up to {MAX_FILES} files, {formatBytes(MAX_FILE_SIZE)} each.
          </p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]"
            style={{ background: "#6c63ff" }}
          >
            Choose PDF files
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="sr-only"
            aria-label="Choose PDF files to compress"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>
      ) : null}

      {notice ? (
        <p
          role="status"
          className="rounded-xl border px-4 py-3 text-sm leading-6"
          style={{ borderColor: "rgba(245,158,11,.4)", background: "rgba(245,158,11,.08)", color: "#fcd34d" }}
        >
          {notice}
        </p>
      ) : null}

      {/* ---------- queue ---------- */}
      {queue.length && !hasResults ? (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {queue.map((item, i) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border px-4 py-3"
                style={{
                  borderColor: busy && i === activeIndex ? "#6c63ff" : "var(--border)",
                  background: "var(--surface-1)",
                }}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{item.file.name}</span>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {formatBytes(item.file.size)}
                  </span>
                </span>
                {!busy ? (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="min-h-11 min-w-11 rounded-lg px-2 text-sm transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]"
                    style={{ color: "var(--muted)" }}
                    aria-label={`Remove ${item.file.name}`}
                  >
                    ✕
                  </button>
                ) : null}
              </li>
            ))}
          </ul>

          {/* ---------- mode ---------- */}
          <fieldset disabled={busy} className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
            <legend className="px-1 text-sm font-semibold text-foreground" id={modeGroupId}>
              How much compression?
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-labelledby={modeGroupId}>
              {COMPRESSION_MODES.map((m) => {
                const active = mode === m.id;
                return (
                  <label
                    key={m.id}
                    className="cursor-pointer rounded-xl border p-3 transition"
                    style={{
                      borderColor: active ? "#6c63ff" : "var(--border)",
                      background: active ? "rgba(108,99,255,.10)" : "var(--surface-2)",
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="compression-mode"
                        value={m.id}
                        checked={active}
                        onChange={() => setMode(m.id)}
                        className="h-4 w-4 accent-[#6c63ff]"
                      />
                      <span className="text-sm font-semibold text-foreground">{m.label}</span>
                    </span>
                    <span className="mt-1 block text-xs leading-5" style={{ color: "var(--muted)" }}>
                      {m.blurb}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* ---------- action ---------- */}
          {busy ? (
            <div className="flex flex-col gap-3">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
                aria-label="Compression progress"
                className="h-2 w-full overflow-hidden rounded-full"
                style={{ background: "var(--surface-2)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.max(4, progress * 100)}%`, background: "#6c63ff" }}
                />
              </div>
              <p role="status" aria-live="polite" className="text-sm" style={{ color: "var(--muted)" }}>
                {queue.length > 1 ? `File ${activeIndex + 1} of ${queue.length} — ` : ""}
                {stage || "Working"}
              </p>
              <button
                type="button"
                onClick={cancel}
                className="min-h-11 self-start rounded-xl border px-4 py-2 text-sm font-medium transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={run}
                className="min-h-11 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]"
                style={{ background: "#6c63ff" }}
              >
                Compress {queue.length > 1 ? `${queue.length} PDFs` : "PDF"}
              </button>
              <button
                type="button"
                onClick={reset}
                className="min-h-11 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* ---------- results ---------- */}
      {hasResults ? (
        <div className="flex flex-col gap-4" role="region" aria-live="polite">
          {done.length ? (
            <div
              className="rounded-2xl border p-5"
              style={{ borderColor: "rgba(34,197,94,.35)", background: "rgba(34,197,94,.07)" }}
            >
              <p className="font-semibold" style={{ color: "#86efac" }}>
                {done.length > 1 ? `${done.length} PDFs compressed` : "PDF compressed"}
              </p>

              <dl className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <dt className="text-xs" style={{ color: "var(--muted)" }}>Original</dt>
                  <dd className="text-lg font-bold tabular-nums text-foreground">{formatBytes(totalBefore)}</dd>
                </div>
                <div>
                  <dt className="text-xs" style={{ color: "var(--muted)" }}>Compressed</dt>
                  <dd className="text-lg font-bold tabular-nums text-foreground">{formatBytes(totalAfter)}</dd>
                </div>
                <div>
                  <dt className="text-xs" style={{ color: "var(--muted)" }}>Smaller by</dt>
                  <dd className="text-lg font-bold tabular-nums" style={{ color: "#86efac" }}>
                    {totalPct.toFixed(1)}%
                  </dd>
                </div>
              </dl>

              {done.some((d) => d.result.outcome === "already-optimised") ? (
                <p className="mt-3 text-sm leading-6" style={{ color: "var(--muted)" }}>
                  Some of these were already about as small as they can get, so the original was kept.
                  That usually means the file is mostly text, or its images are already compressed.
                </p>
              ) : null}

              <ul className="mt-4 flex flex-col gap-2">
                {done.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3"
                    style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{d.name}</span>
                      <span className="text-xs tabular-nums" style={{ color: "var(--muted)" }}>
                        {formatBytes(d.result.originalSize)} → {formatBytes(d.result.compressedSize)}
                        {d.result.reductionPct > 0 ? ` (−${d.result.reductionPct.toFixed(1)}%)` : " (unchanged)"}
                        {" · "}
                        {d.result.pageCount} page{d.result.pageCount === 1 ? "" : "s"}
                        {d.result.imagesRecompressed > 0
                          ? ` · ${d.result.imagesRecompressed} image${d.result.imagesRecompressed === 1 ? "" : "s"} optimised`
                          : ""}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => downloadOne(d)}
                      className="min-h-11 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]"
                      style={{ background: "#6c63ff" }}
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {failed.length ? (
            <div
              className="rounded-2xl border p-5"
              style={{ borderColor: "rgba(239,68,68,.35)", background: "rgba(239,68,68,.07)" }}
            >
              <p className="font-semibold" style={{ color: "#fca5a5" }}>
                {failed.length} file{failed.length > 1 ? "s" : ""} could not be compressed
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {failed.map((f) => (
                  <li key={f.id} className="text-sm leading-6" style={{ color: "var(--muted)" }}>
                    <span className="font-medium text-foreground">{f.name}</span> — {f.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {done.length > 1 ? (
              <button
                type="button"
                onClick={downloadAll}
                className="min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]"
                style={{ background: "#6c63ff" }}
              >
                Download all
              </button>
            ) : null}
            {failed.length ? (
              <button
                type="button"
                onClick={run}
                className="min-h-11 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                Try again
              </button>
            ) : null}
            <button
              type="button"
              onClick={reset}
              className="min-h-11 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              Compress another
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
