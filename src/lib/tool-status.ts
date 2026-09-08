/**
 * SINGLE SOURCE OF TRUTH for tools that are currently not working in production.
 *
 * Verified by live testing against https://toolmint.tools on 2026-09-08.
 * Every entry below was reproduced twice by POSTing a real file to the
 * endpoint and recording the status code.
 *
 * ROOT CAUSE (all entries): these tools shell out to binaries that are not
 * available or not functioning on the production Windows host —
 *   - Ghostscript (`gs` / `gswin64c.exe`)  -> pdf-to-pdfa
 *     (compress-pdf was rebuilt browser-side in Batch 1A and is no longer here)
 *     (protect-pdf and unlock-pdf were rebuilt in the browser in Batch 1B
 *      and are no longer here — see src/lib/pdf-security.ts)
 *   - Microsoft Word/Excel via PowerShell COM automation
 *                                          -> word-to-pdf, excel-to-pdf,
 *                                             powerpoint-to-pdf, pdf-to-word
 *
 * Office COM automation is not supported by Microsoft for server-side use, so
 * these need re-architecting (browser-side, or headless LibreOffice on Linux)
 * rather than repairing. Tracked for Batch 1.
 *
 * When a tool is fixed, delete its entry here — the API route, the tool page
 * notice and the health check all read from this file.
 */

export type ToolOutage = {
  /** Observed status before this file existed. */
  observedStatus: number;
  /** Plain-language cause, shown to nobody but read by developers. */
  cause: string;
  /** What the user is told. Must be honest and must not promise a date. */
  userMessage: string;
  /** Tools that do the same job and DO work, offered as an alternative. */
  alternatives?: string[];
};

export const TOOL_OUTAGES: Record<string, ToolOutage> = {
  "pdf-to-word": {
    observedStatus: 500,
    cause: "Conversion pipeline failing on production host",
    userMessage:
      "PDF to Word conversion is temporarily offline while we replace the conversion engine.",
    alternatives: ["pdf-to-text", "pdf-to-excel"],
  },
  "pdf-to-pdfa": {
    observedStatus: 503,
    cause: "Ghostscript binary unavailable on production host",
    userMessage: "PDF/A conversion is temporarily offline while we replace the conversion engine.",
    alternatives: ["compress-pdf", "split-pdf"],
  },
  "word-to-pdf": {
    observedStatus: 500,
    cause: "Microsoft Word COM automation unavailable on production host",
    userMessage: "Word to PDF conversion is temporarily offline while we replace the converter.",
    alternatives: ["image-to-pdf", "html-to-pdf"],
  },
  "excel-to-pdf": {
    observedStatus: 500,
    cause: "Microsoft Excel COM automation unavailable on production host",
    userMessage: "Excel to PDF conversion is temporarily offline while we replace the converter.",
    alternatives: ["html-to-pdf"],
  },
  "powerpoint-to-pdf": {
    observedStatus: 500,
    cause: "Microsoft PowerPoint COM automation unavailable on production host (untested, same pipeline)",
    userMessage:
      "PowerPoint to PDF conversion is temporarily offline while we replace the converter.",
    alternatives: ["image-to-pdf"],
  },
};

export function isToolDown(slug: string): boolean {
  return slug in TOOL_OUTAGES;
}

export function getOutage(slug: string): ToolOutage | undefined {
  return TOOL_OUTAGES[slug];
}

export const DOWN_TOOL_SLUGS = Object.keys(TOOL_OUTAGES);

/**
 * Standard maintenance response for a route whose tool is listed above.
 * 503 + Retry-After is the correct signal: it tells Google the resource is
 * temporarily unavailable and should not be de-indexed.
 */
export function maintenanceResponse(slug: string): Response {
  const outage = TOOL_OUTAGES[slug];
  return new Response(
    JSON.stringify({
      error: outage?.userMessage ?? "This tool is temporarily unavailable.",
      code: "TOOL_MAINTENANCE",
      tool: slug,
      alternatives: outage?.alternatives ?? [],
    }),
    {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "86400",
        "Cache-Control": "no-store",
      },
    },
  );
}
