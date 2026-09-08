# ToolMint analytics — event schema

Added in Batch 0. Before this, the codebase contained **no analytics of any
kind** — no GA4, no GTM, no error tracking, no uptime monitoring. That is why
seven broken tool endpoints went unnoticed for months.

## Configuration

Set in `.env.production` on the server, then **rebuild** (the value is inlined
at build time, so a restart alone will not pick it up):

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Get the ID from Google Analytics → Admin → Data Streams → Web.

**Until this is set, no events are sent and no script is loaded.** That is
deliberate: `AnalyticsScripts` returns `null` when the ID is absent, so dev and
CI stay silent and no placeholder ID ships to production.

> **This is the one outstanding configuration blocker from Batch 0.** Everything
> else is wired and verified; the site is simply waiting for a real ID.

## Where the code lives

| File | Role |
|---|---|
| `src/lib/analytics.ts` | Typed event API. The only place `gtag` is called. |
| `src/components/analytics-scripts.tsx` | Loads GA4. Rendered once in `layout.tsx`. |
| `src/components/tool-analytics.tsx` | Fires `tool_view`. On all 81 tool pages. |

Never call `window.gtag` directly. Add to `analytics.ts` instead, so the privacy
contract stays enforceable in one place.

## Privacy contract

These are **never** sent, and the helper API makes it hard to send them by accident:

- file contents, or any part of a document
- **file names** — use `fileType(name)` to send the extension only
- exact file sizes — use `sizeBucket(bytes)` to send a range
- passwords or anything from a credential field
- free text the user typed, except a search term passed through `sanitiseQuery()`,
  which strips emails, long digit runs and URLs, then truncates to 64 chars
- email addresses or other identifiers

`gtag config` sets `anonymize_ip: true`.

## Events

| Event | Fires when | Status |
|---|---|---|
| `page_view` | any page load | automatic (GA4) |
| `tool_view` | a tool page renders | **automatic, all 81 pages** |
| `tool_start` | user triggers the primary action | reference impl: `merge-pdf` |
| `tool_complete` | the tool produces a result | reference impl: `merge-pdf` |
| `tool_error` | the tool fails | reference impl: `merge-pdf` |
| `tool_download` | user downloads the output | reference impl: `merge-pdf` |
| `tool_reset` | user clears the tool | reference impl: `merge-pdf` |
| `tool_copy` | user copies the output | helper ready, not yet wired |
| `tool_share` | user shares a result | helper ready, not yet wired |
| `search` | site search submitted | helper ready, not yet wired |
| `outbound_click` | external link clicked | helper ready, not yet wired |

### Parameters

| Parameter | Type | Notes |
|---|---|---|
| `tool_slug` | string | e.g. `merge-pdf` |
| `category` | string | `pdf`, `image`, `text`, `calculators`, `developer`, `seo`, `converters`, `more` |
| `processing_mode` | `browser` \| `server` \| `server-fetch` | from `src/lib/processing-mode.ts` |
| `file_type` | string | extension only, via `fileType()` |
| `file_size_bucket` | `<1mb` \| `1-5mb` \| `5-20mb` \| `20-100mb` \| `>100mb` | via `sizeBucket()` |
| `file_count` | number | how many files, never which |
| `output_type` | string | e.g. `pdf` |
| `success` | boolean | set automatically by `toolComplete` / `toolError` |
| `failure_type` | enum | see below |
| `duration_ms` | number | rounded |

`failure_type` values: `unsupported_file`, `file_too_large`, `invalid_input`,
`processing_failed`, `server_unavailable`, `network_error`, `timeout`,
`browser_unsupported`, `unknown`. Use `classifyError(err, httpStatus)` rather
than picking by hand — it never sends the error message.

## Wiring a tool (the Batch 1 pattern)

`src/components/pdf-merger-tool.tsx` is the reference implementation. Copy it:

```tsx
import { analytics, classifyError, sizeBucket } from "@/lib/analytics";

const TOOL = { tool_slug: "merge-pdf", category: "pdf", processing_mode: "browser" } as const;

// on the primary action
const startedAt = performance.now();
analytics.toolStart({ ...TOOL, file_type: "pdf", file_count: files.length,
                      file_size_bucket: sizeBucket(totalBytes) });

// on success
analytics.toolComplete({ ...TOOL, output_type: "pdf",
                         duration_ms: Math.round(performance.now() - startedAt) });

// on failure
catch (err) {
  analytics.toolError({ ...TOOL, failure_type: classifyError(err) });
}

// on download
analytics.toolDownload({ ...TOOL, output_type: "pdf" });
```

**The remaining 80 tools still need this.** It is per-tool work and belongs in
Batch 1 alongside the tool rebuilds, not in Batch 0.

## The questions this is meant to answer

Once `tool_start` / `tool_complete` / `tool_error` are wired sitewide:

- Which tools get traffic but no usage? (`tool_view` high, `tool_start` low → the page sells something the tool doesn't deliver)
- Which tools get started but not finished? (`tool_start` high, `tool_complete` low → UX or performance problem)
- Which tools fail, and how? (`tool_error` by `failure_type`)
- Which tools lead to a second tool? (session path)
- Which landing pages produce nothing? (`page_view` with no `tool_view`)

A completion rate below ~60% on a working tool means the tool, not the traffic,
is the problem. That is the Batch 1 decision gate.
