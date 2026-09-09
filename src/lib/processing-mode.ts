/**
 * SINGLE SOURCE OF TRUTH for how each tool processes user data.
 *
 * Both the UI badge and the SEO metadata read from here, so a tool's public
 * privacy claim can never drift from what the code actually does.
 *
 * Derived by tracing every tool page -> its component -> any `/api/tools/*`
 * call it makes. Verified 2026-09-08. If you add a tool that POSTs to an API
 * route, you MUST add its slug below or the site will make a false claim.
 *
 * Guard: scripts/audit-metadata.mjs re-derives this mapping from source and
 * fails if it disagrees with this file.
 */

export type ProcessingMode = "browser" | "server" | "server-fetch";

/** The user's file is uploaded to ToolMint's server, processed, then deleted. */
const SERVER_UPLOAD_TOOLS = new Set<string>([
  // compress-pdf moved to browser-side processing in Batch 1A.
  // pdf-to-excel followed in Batch 1D — the last PDF tool that uploaded a file.
  // pdf-to-word followed in Batch 1C; excel/word/powerpoint-to-pdf and
  // pdf-to-pdfa were retired in Batch 1C (see tool-availability.ts).
  // protect-pdf and unlock-pdf followed in Batch 1B (src/lib/pdf-security.ts).
  "html-to-pdf",
]);

/**
 * No user file is uploaded. The server fetches a public URL on the user's
 * behalf, because a browser cannot read a third-party page directly (CORS).
 */
const SERVER_FETCH_TOOLS = new Set<string>([
  "meta-tag-generator",
  "og-tag-generator",
  "robots-txt-generator",
  "sitemap-generator",
]);

export function getProcessingMode(slug: string): ProcessingMode {
  if (SERVER_UPLOAD_TOOLS.has(slug)) return "server";
  if (SERVER_FETCH_TOOLS.has(slug)) return "server-fetch";
  return "browser";
}

/** Short label for the badge shown on the tool page. */
export const PROCESSING_LABEL: Record<ProcessingMode, string> = {
  browser: "Runs in your browser",
  server: "Uploaded, then deleted",
  "server-fetch": "Fetches a public URL",
};

/** One honest sentence, used in the badge tooltip and in page copy. */
export const PROCESSING_DETAIL: Record<ProcessingMode, string> = {
  browser:
    "This tool runs entirely in your browser. Your file is never uploaded and never leaves your device.",
  server:
    "This tool uploads your file to ToolMint's server to process it. The file is deleted immediately after processing and is never stored or shared.",
  "server-fetch":
    "This tool sends the web address you enter to ToolMint's server, which fetches that public page for you. No file from your device is uploaded.",
};

/** Phrase safe to use in meta descriptions for a whole category. */
export function categoryProcessingClaim(slugs: string[]): string {
  const modes = new Set(slugs.map(getProcessingMode));
  if (modes.size === 1 && modes.has("browser")) return "every tool runs in your browser";
  if (modes.has("browser")) return "most tools run entirely in your browser";
  return "files are deleted straight after processing";
}

export function isBrowserOnly(slug: string): boolean {
  return getProcessingMode(slug) === "browser";
}
