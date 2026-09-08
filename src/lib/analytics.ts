/**
 * ToolMint analytics.
 *
 * One typed entry point for every event, so tracking never gets scattered
 * through tool components and every event stays on-schema.
 *
 * PRIVACY CONTRACT — these must never be sent:
 *   - file contents, file names, or any part of a document
 *   - passwords, API keys, or anything typed into a credential field
 *   - free-text the user entered (search terms are the one exception, and
 *     only after `sanitiseQuery` strips anything that looks like PII)
 *   - email addresses, IPs, or other identifiers
 *
 * Only the shapes declared in `ToolEventParams` below leave the browser.
 * See docs/ANALYTICS.md for the full schema.
 */

import type { ProcessingMode } from "@/lib/processing-mode";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

/** True only when a measurement ID is configured. Keeps dev/CI silent. */
export const analyticsEnabled = GA_MEASUREMENT_ID.startsWith("G-");

type GtagFn = (
  command: "event" | "config" | "js" | "set",
  targetOrName: string | Date,
  params?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

/** Why a tool run failed. Keep this list small and stable. */
export type FailureType =
  | "unsupported_file"
  | "file_too_large"
  | "invalid_input"
  | "processing_failed"
  | "server_unavailable"
  | "network_error"
  | "timeout"
  | "browser_unsupported"
  | "unknown";

export type ToolEventParams = {
  tool_slug: string;
  category?: string;
  processing_mode?: ProcessingMode;
  /** Extension only, never the file name. e.g. "pdf", "docx". */
  file_type?: string;
  /** Bucketed size, never the exact byte count. */
  file_size_bucket?: "<1mb" | "1-5mb" | "5-20mb" | "20-100mb" | ">100mb";
  /** Count of files, not their identities. */
  file_count?: number;
  output_type?: string;
  success?: boolean;
  failure_type?: FailureType;
  /** Milliseconds, rounded. */
  duration_ms?: number;
  /** Which compression preset the user chose (compress-pdf). */
  compression_mode?: string;
  /** Bucketed size reduction, e.g. "70%+". Never an exact per-file figure. */
  reduction_bucket?: string;
  /** "protect" | "unlock" — which security operation was run. */
  operation_type?: string;
  /** Encryption scheme REMOVED by unlock, e.g. "AES-256". Never a password. */
  encryption_scheme?: string;
  /** How the pages were chosen in split-pdf: "ranges" | "every-page" | "extract". */
  split_mode?: string;
  /** Bucketed page count, e.g. "11-50". Never an exact document page count. */
  page_count_bucket?: string;
};

export type ToolEventName =
  | "tool_view"
  | "tool_start"
  | "tool_complete"
  | "tool_error"
  | "tool_download"
  | "tool_share"
  | "tool_reset"
  | "tool_copy";

function send(name: string, params: Record<string, unknown> = {}) {
  if (!analyticsEnabled || typeof window === "undefined" || !window.gtag) return;
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") clean[k] = v;
  }
  window.gtag("event", name, clean);
}

/** Fire a tool lifecycle event. */
export function trackTool(name: ToolEventName, params: ToolEventParams) {
  send(name, params);
}

/** Convenience wrappers, so call sites read clearly. */
export const analytics = {
  toolView: (p: ToolEventParams) => trackTool("tool_view", p),
  toolStart: (p: ToolEventParams) => trackTool("tool_start", p),
  toolComplete: (p: ToolEventParams) => trackTool("tool_complete", { success: true, ...p }),
  toolError: (p: ToolEventParams & { failure_type: FailureType }) =>
    trackTool("tool_error", { success: false, ...p }),
  toolDownload: (p: ToolEventParams) => trackTool("tool_download", p),
  toolShare: (p: ToolEventParams) => trackTool("tool_share", p),
  toolReset: (p: ToolEventParams) => trackTool("tool_reset", p),
  toolCopy: (p: ToolEventParams) => trackTool("tool_copy", p),

  /** Site search. The term is sanitised before it is sent. */
  search: (term: string, resultCount?: number) =>
    send("search", { search_term: sanitiseQuery(term), result_count: resultCount }),

  outboundClick: (domain: string) => send("outbound_click", { link_domain: domain }),
};

/** Bucket a byte count so exact file sizes are never transmitted. */
export function sizeBucket(bytes: number): NonNullable<ToolEventParams["file_size_bucket"]> {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return "<1mb";
  if (mb < 5) return "1-5mb";
  if (mb < 20) return "5-20mb";
  if (mb < 100) return "20-100mb";
  return ">100mb";
}

/** Extension only. Never pass a file name to any other analytics function. */
export function fileType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return /^[a-z0-9]{1,6}$/.test(ext) ? ext : "unknown";
}

/**
 * Drop anything resembling PII from a search term before it is sent, and
 * cap the length. Emails, long digit runs and URLs are removed outright.
 */
export function sanitiseQuery(term: string): string {
  const t = term
    .toLowerCase()
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "")
    .replace(/\b\d{5,}\b/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return t.slice(0, 64);
}

/** Map a thrown error to a stable failure_type. Never sends the message. */
export function classifyError(err: unknown, httpStatus?: number): FailureType {
  if (httpStatus === 503 || httpStatus === 501) return "server_unavailable";
  if (httpStatus === 413) return "file_too_large";
  if (httpStatus === 415 || httpStatus === 400) return "unsupported_file";
  if (httpStatus && httpStatus >= 500) return "processing_failed";
  if (err instanceof DOMException && err.name === "AbortError") return "timeout";
  if (err instanceof TypeError) return "network_error";
  return "unknown";
}
