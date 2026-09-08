"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { analytics, sizeBucket } from "@/lib/analytics";
import { downloadBlob, formatBytes, sanitizeBaseName } from "@/lib/client-pdf-utils";
import {
  MIN_PASSWORD_LENGTH,
  PROTECT_SCHEME_BLURB,
  type ProtectResult,
  SecurityError,
  type SecurityOperation,
  type UnlockResult,
} from "@/lib/pdf-security-types";

const MAX_FILE_SIZE = 100 * 1024 * 1024;

type Props = { operation: SecurityOperation };

type Done =
  | { kind: "protect"; name: string; blob: Blob; result: ProtectResult }
  | { kind: "unlock"; name: string; blob: Blob; result: UnlockResult };

const isPdf = (f: File) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");

export default function PdfSecurityTool({ operation }: Props) {
  const protectMode = operation === "protect";
  // Memoised so it does not re-create every render and invalidate the
  // useCallback hooks that depend on it.
  const TOOL = useMemo(
    () =>
      ({
        tool_slug: protectMode ? "protect-pdf" : "unlock-pdf",
        category: "pdf",
        processing_mode: "browser",
        operation_type: operation,
      }) as const,
    [protectMode, operation],
  );

  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const headingId = useId();
  const pwId = useId();
  const confirmId = useId();
  const errorId = useId();

  useEffect(() => () => abortRef.current?.abort(), []);

  const choose = useCallback((list: FileList | File[] | null) => {
    const picked = list ? Array.from(list) : [];
    const pdf = picked.find(isPdf);
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
    // Clearing the password state is the only place it ever lived.
    setPassword("");
    setConfirmPassword("");
    setDone(null);
    setError(null);
    setProgress(0);
    setStage("");
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }, [TOOL]);

  const run = useCallback(async () => {
    if (!file || busy) return;

    if (protectMode) {
      if (!password) return setError("Enter a password to protect this PDF with.");
      if (password.length < MIN_PASSWORD_LENGTH) {
        return setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      }
      if (password !== confirmPassword) return setError("The two passwords do not match.");
    }

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
      // pdf-lib plus the crypto engine are ~450KB, fetched on first use only.
      const { protectPdf, unlockPdf } = await import("@/lib/pdf-security");
      const buffer = await file.arrayBuffer();
      const opts = {
        password,
        signal: controller.signal,
        onProgress: (f: number, note: string) => {
          setProgress(f);
          setStage(note);
        },
      };

      const base = sanitizeBaseName(file.name);
      if (protectMode) {
        const result = await protectPdf(buffer, opts);
        setDone({
          kind: "protect",
          name: `${base}-protected.pdf`,
          blob: new Blob([new Uint8Array(result.bytes)], { type: "application/pdf" }),
          result,
        });
        analytics.toolComplete({
          ...TOOL,
          file_type: "pdf",
          output_type: "pdf",
          file_size_bucket: sizeBucket(result.outputSize),
          duration_ms: result.durationMs,
        });
      } else {
        const result = await unlockPdf(buffer, opts);
        setDone({
          kind: "unlock",
          name: `${base}-unlocked.pdf`,
          blob: new Blob([new Uint8Array(result.bytes)], { type: "application/pdf" }),
          result,
        });
        analytics.toolComplete({
          ...TOOL,
          file_type: "pdf",
          output_type: "pdf",
          file_size_bucket: sizeBucket(result.outputSize),
          duration_ms: result.durationMs,
          // The scheme we removed is useful; the password never is.
          encryption_scheme: result.removed.label,
        });
      }
      // Password is no longer needed once the file is produced.
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      const se = err instanceof SecurityError ? err : null;
      if (se?.code === "cancelled") {
        setError("Cancelled. Your file was not changed.");
      } else {
        setError(se?.message ?? "Something went wrong. Please try a different file.");
        analytics.toolError({
          ...TOOL,
          file_type: "pdf",
          file_size_bucket: sizeBucket(file.size),
          // NOTE: only the category of failure is sent, never the password.
          failure_type:
            se?.code === "wrong-password" || se?.code === "password-required"
              ? "invalid_input"
              : se?.code === "unsupported-encryption" ||
                  se?.code === "not-encrypted" ||
                  se?.code === "already-encrypted" ||
                  se?.code === "corrupt" ||
                  se?.code === "empty"
                ? "unsupported_file"
                : "processing_failed",
        });
      }
    } finally {
      setBusy(false);
      setProgress(0);
      setStage("");
      abortRef.current = null;
    }
  }, [file, busy, protectMode, password, confirmPassword, TOOL]);

  const download = useCallback(() => {
    if (!done) return;
    analytics.toolDownload({
      ...TOOL,
      output_type: "pdf",
      file_count: 1,
      file_size_bucket: sizeBucket(done.blob.size),
    });
    downloadBlob(done.blob, done.name);
  }, [done, TOOL]);

  const btn =
    "min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]";
  const ghost =
    "min-h-11 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c63ff]";

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-5">
      <h2 id={headingId} className="sr-only">
        {protectMode ? "Add a password to a PDF" : "Remove a password from a PDF"}
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
              {protectMode ? "🔒" : "🔓"}
            </p>
            <p className="mt-3 font-semibold text-foreground">
              {file ? file.name : protectMode ? "Choose a PDF to protect" : "Choose a locked PDF"}
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6" style={{ color: "var(--muted)" }}>
              {file
                ? formatBytes(file.size)
                : `Drag and drop, or browse. Up to ${formatBytes(MAX_FILE_SIZE)}.`}
            </p>
            <button type="button" onClick={() => inputRef.current?.click()} className={`${btn} mt-5 text-white`} style={{ background: "#6c63ff" }}>
              {file ? "Choose a different PDF" : "Choose PDF"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              aria-label={protectMode ? "Choose a PDF to password protect" : "Choose a password-protected PDF"}
              onChange={(e) => choose(e.target.files)}
            />
          </div>

          {file ? (
            <div className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
              <label htmlFor={pwId} className="block text-sm font-semibold text-foreground">
                {protectMode ? "Password to set" : "Password for this PDF"}
              </label>
              <p className="mt-1 text-xs leading-5" style={{ color: "var(--muted)" }}>
                {protectMode
                  ? `At least ${MIN_PASSWORD_LENGTH} characters. Anyone opening the file will need it — if you lose it, the file cannot be recovered.`
                  : "Enter the password you normally type to open this file. Leave it empty if the PDF opens without one but is restricted."}
              </p>

              <div className="mt-3 flex gap-2">
                <input
                  id={pwId}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !protectMode) run();
                  }}
                  autoComplete="new-password"
                  spellCheck={false}
                  disabled={busy}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  className="min-h-11 flex-1 rounded-xl border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#6c63ff]"
                  style={{ borderColor: "var(--border)", background: "var(--surface-2)", color: "var(--foreground)" }}
                  placeholder={protectMode ? "Choose a password" : "Password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={ghost}
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {protectMode ? (
                <>
                  <label htmlFor={confirmId} className="mt-4 block text-sm font-semibold text-foreground">
                    Confirm password
                  </label>
                  <input
                    id={confirmId}
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") run();
                    }}
                    autoComplete="new-password"
                    spellCheck={false}
                    disabled={busy}
                    className="mt-2 min-h-11 w-full rounded-xl border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#6c63ff]"
                    style={{ borderColor: "var(--border)", background: "var(--surface-2)", color: "var(--foreground)" }}
                    placeholder="Type it again"
                  />
                  <p className="mt-3 text-xs leading-5" style={{ color: "var(--muted-2)" }}>
                    {PROTECT_SCHEME_BLURB} The password is used here in your browser and is never
                    sent anywhere, stored, or logged.
                  </p>
                </>
              ) : null}
            </div>
          ) : null}

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
                  aria-label={protectMode ? "Encryption progress" : "Decryption progress"}
                  className="h-2 w-full overflow-hidden rounded-full"
                  style={{ background: "var(--surface-2)" }}
                >
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(4, progress * 100)}%`, background: "#6c63ff" }} />
                </div>
                <p role="status" aria-live="polite" className="text-sm" style={{ color: "var(--muted)" }}>
                  {stage || "Working"}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={run} className={`${btn} text-white`} style={{ background: "#6c63ff" }}>
                  {protectMode ? "Protect PDF" : "Remove password"}
                </button>
                <button type="button" onClick={reset} className={ghost} style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                  Clear
                </button>
              </div>
            )
          ) : null}
        </>
      ) : (
        <div className="flex flex-col gap-4" role="region" aria-live="polite">
          <div className="rounded-2xl border p-5" style={{ borderColor: "rgba(34,197,94,.35)", background: "rgba(34,197,94,.07)" }}>
            <p className="font-semibold" style={{ color: "#86efac" }}>
              {done.kind === "protect" ? "PDF protected with AES-256" : `Password removed (${done.result.removed.label})`}
            </p>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--muted)" }}>
              {done.kind === "protect"
                ? "Anyone opening this file will be asked for the password you chose. Keep it somewhere safe — there is no way to recover the file without it."
                : "This copy opens without a password. The original file on your device is unchanged."}
            </p>

            <dl className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <dt className="text-xs" style={{ color: "var(--muted)" }}>Pages</dt>
                <dd className="text-lg font-bold tabular-nums text-foreground">{done.result.pageCount}</dd>
              </div>
              <div>
                <dt className="text-xs" style={{ color: "var(--muted)" }}>Size</dt>
                <dd className="text-lg font-bold tabular-nums text-foreground">{formatBytes(done.result.outputSize)}</dd>
              </div>
              <div>
                <dt className="text-xs" style={{ color: "var(--muted)" }}>Took</dt>
                <dd className="text-lg font-bold tabular-nums text-foreground">{(done.result.durationMs / 1000).toFixed(1)}s</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={download} className={`${btn} text-white`} style={{ background: "#6c63ff" }}>
                Download {done.kind === "protect" ? "protected" : "unlocked"} PDF
              </button>
              <button type="button" onClick={reset} className={ghost} style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                Do another
              </button>
            </div>
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
            <h3 className="font-semibold text-foreground">Next steps</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {(done.kind === "protect"
                ? [
                    { name: "Compress PDF", href: "/tools/compress-pdf", desc: "Shrink it before emailing." },
                    { name: "Sign PDF", href: "/tools/sign-pdf", desc: "Add a signature." },
                    { name: "Unlock PDF", href: "/tools/unlock-pdf", desc: "Remove the password later." },
                  ]
                : [
                    { name: "Compress PDF", href: "/tools/compress-pdf", desc: "Make it smaller." },
                    { name: "Merge PDF", href: "/tools/merge-pdf", desc: "Combine it with others." },
                    { name: "Split PDF", href: "/tools/split-pdf", desc: "Pull out the pages you need." },
                  ]
              ).map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="rounded-xl border p-3 transition hover:-translate-y-0.5"
                  style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
                >
                  <span className="block text-sm font-semibold text-foreground">{t.name}</span>
                  <span className="mt-0.5 block text-xs" style={{ color: "var(--muted)" }}>{t.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
