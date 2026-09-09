# The ToolMint PDF suite — status after Batch 1D

Last verified 2026-09-09 by real-browser testing against a local production
build. This is the reference for what the PDF product actually is.

## The headline

**Every tool that accepts a PDF file now processes it in the browser.** The
file never reaches ToolMint. Batch 1D moved the last one — PDF to Excel.

The single remaining server-side tool in the PDF category is **HTML to PDF**,
and it does not take a PDF: it takes a web address, which our server has to
fetch because a browser cannot read a third-party site directly (CORS).

## Processing-mode matrix

Verified by reading the badge off each rendered page and comparing it with
`src/lib/processing-mode.ts`. All 20 matched.

| Tool | Mode | Uploads a file? | Claim on page | Verified |
|---|---|---|---|---|
| compress-pdf | browser | no | Runs in your browser | yes |
| merge-pdf | browser | no | Runs in your browser | yes |
| split-pdf | browser | no | Runs in your browser | yes |
| rotate-pdf | browser | no | Runs in your browser | yes |
| edit-pdf | browser | no | Runs in your browser | yes |
| crop-pdf | browser | no | Runs in your browser | yes |
| add-page-numbers-to-pdf | browser | no | Runs in your browser | yes |
| add-watermark-to-pdf | browser | no | Runs in your browser | yes |
| protect-pdf | browser | no | Runs in your browser | yes |
| unlock-pdf | browser | no | Runs in your browser | yes |
| sign-pdf | browser | no | Runs in your browser | yes |
| redact-pdf | browser | no | Runs in your browser | yes |
| compare-pdf | browser | no | Runs in your browser | yes |
| image-to-pdf | browser | no | Runs in your browser | yes |
| pdf-to-jpg | browser | no | Runs in your browser | yes |
| pdf-to-word | browser | no | Runs in your browser | yes |
| pdf-to-powerpoint | browser | no | Runs in your browser | yes |
| **pdf-to-excel** | **browser** | **no** | Runs in your browser | **yes (Batch 1D)** |
| pdf-to-text | browser | no | Runs in your browser | yes |
| html-to-pdf | server | no — takes a URL | Uploaded, then deleted | yes |

Retired and returning **410 Gone**: `word-to-pdf`, `excel-to-pdf`,
`powerpoint-to-pdf`, `pdf-to-pdfa` (Batch 1C — see `tool-availability.ts`).

## PDF to Excel — the Batch 1D rebuild

### Why it was portable

The server route was 1,331 lines of **pure JavaScript** — `pdfjs-dist` +
`exceljs` — with no external binary. Only two lines used Node's canvas. This
is not a naive text dump: it renders each page, detects ruling lines, clusters
glyphs into a row/column grid, infers merged cells, samples fill colours and
extracts embedded images.

The port changed exactly four things:

| Server | Browser |
|---|---|
| `@napi-rs/canvas` `createCanvas` | `document.createElement("canvas")` |
| `canvas.toBuffer("image/png")` | `toDataURL` decoded to bytes |
| filesystem lookup for the pdf.js worker | shared `getPdfjs()` from `/vendor/pdfjs` |
| `Buffer` | `Uint8Array` |

`exceljs` ships an official browser build (`dist/exceljs.min.js`, ~862KB),
which webpack selects automatically via the package's `browser` field. It is
dynamically imported on first conversion, not at page load.

### Measured output quality

Real Chrome, driving the real UI. Every output opened afterwards with
**openpyxl** (an independent reader), not just checked for existence.

| Fixture | Case | Result | Time |
|---|---|---|---|
| `t-ruled.pdf` | ruled invoice table | 1 sheet, **all rows and values exact** | 0.8s |
| `t-unruled.pdf` | unruled aligned table, 2 pages | 2 sheets, 58 cells, headers + amounts intact | 0.8s |
| `report.pdf` | table + prose, 2 pages | 2 sheets, 20 cells, 5 merged ranges | 0.8s |
| `t-prose.pdf` | prose, no table | 1 sheet, 22 cells (text preserved as rows) | 0.8s |
| `04-scanned.pdf` | image-only scan | **refused with an OCR pointer** | — |
| `06-large.pdf` | 24-page image PDF | **refused with an OCR pointer** | — |
| `09-corrupt.pdf` | truncated file | refused: "damaged or incomplete" | — |
| `enc-aes-256.pdf` | password-protected | refused: "use Unlock PDF first" | — |

Cell-level fidelity on the ruled invoice, read back independently:

```
Item        | Qty | Unit   | Total
Widget A    | 12  | 24.50  | 294.00
Widget B    | 3   | 119.99 | 359.97
Service fee | 1   | 75.00  | 75.00
Shipping    | 1   | 18.40  | 18.40
TOTAL       | 747.37
```

Every header, row label and figure survived in the right column.

### A defect this testing caught

The first working build produced, for a scanned PDF, a **5-sheet workbook
containing nothing at all** — a file that downloads and opens and is useless.
The engine now counts extracted glyphs and, when a document has no text layer,
refuses with:

> This PDF has no text in it — it looks like a scan or a set of images. There
> is nothing to put into spreadsheet cells. Run it through PDF to Text (OCR)
> first, then convert the result.

### Honest limitations, stated on the page itself

The tool page lists these before the user commits time, not after:

- **Formulas are not preserved, and cannot be.** A PDF stores values, not
  formulas. We never invent them.
- **Scanned pages are refused**, with a pointer to OCR.
- **Charts** are drawings in a PDF, not data.
- Table detection is an inference. Free-flowing prose and multi-column
  layouts will produce an approximate grid.

## A cross-cutting bug fixed in Batch 1D

`downloadBlob` in `src/lib/client-pdf-utils.ts` revoked its object URL
**synchronously** after `link.click()`. That races the browser's read of the
blob: small outputs won, larger ones were silently cancelled. A ~9KB `.docx`
was reliably cancelled in Chrome. The anchor is now attached to the document
and the URL is revoked after a delay. **This affected 17 tools**, not just the
PDF ones.

## Performance

| Page | JS on load | DCL |
|---|---|---|
| merge-pdf | 904 KB | 174 ms |
| split-pdf | 1036 KB | 76 ms |
| pdf-to-excel | 1056 KB | 163 ms |
| protect/unlock-pdf | 1058 KB | 114 / 233 ms |
| compress-pdf | 1061 KB | 827 ms |
| pdf-to-word | 1187 KB | 278 ms |
| pdf-tools (category) | 1521 KB | 49 ms |

Every engine (pdf-lib, the crypto module, exceljs, the Excel engine) is
dynamically imported on first use. The category page is the heaviest and is
the obvious performance target for a later batch.

## Network privacy — measured

Across the whole Batch 1D run (8 PDF-to-Excel conversions plus six other
tools), Chrome recorded:

```
non-GET requests ....................... 0
request bodies > 1KB ................... 0
third-party hosts contacted ............ 0
pdf.js assets served from .............. /vendor/pdfjs/*
```

pdf.js `standard_fonts` (762KB, 16 files) and `cmaps` (1.1MB, 169 files) were
vendored in Batch 1D so text extraction no longer degrades on standard-14 and
CJK documents — and so nothing is fetched from a CDN. pdf.js loads only the
specific font or CMap a document needs.

## Accessibility

Fixed in Batch 1D: `pdf-to-word` had an **unlabelled file input**, a 15px
"Clear all" and a 32px "Remove", and **no announced status region**;
`split-pdf` had 36px mode tabs. All corrected and re-verified.

Across the suite at 390×844: no horizontal overflow, one `h1` per page, file
inputs labelled, no sub-40px targets in `<main>`, primary control reachable by
keyboard, and processing/result states announced via `role="status"`.

## Consistency

An automated audit (`scratchpad/pdf-consistency-audit.mjs`) cross-checks the
tool registry, processing-mode registry, availability registry, tool-status
registry, live HTTP status, sitemap and rendered badges. It currently reports
**0 problems**: no retired tool is registered, linked, or in the sitemap; all
20 active pages return 200; all 4 retired return 410; every active tool is
linked from the category page; no orphans.

## Remaining server dependencies

The Windows/Office/Ghostscript architecture is **entirely gone**. What still
needs an ordinary Node host:

1. **html-to-pdf** — puppeteer-core renders a page. Needs a browser on a server.
2. **Four SEO tools** (`meta-tag-generator`, `og-tag-generator`,
   `robots-txt-generator`, `sitemap-generator`) — they fetch a public URL on
   the user's behalf, which CORS forbids from a browser.
3. Next.js itself (SSR, sitemap, health endpoint).

No PDF tool requires a server any more.

## Analytics status

Events are implemented and wired for PDF to Excel (`tool_view`, `tool_start`,
`tool_complete`, `tool_error`, `tool_download`, `tool_reset`) with
`page_count_bucket` and `file_size_bucket`, and no document content, filenames
or passwords are sent.

> **Analytics wiring exists but production measurement remains disabled until
> `NEXT_PUBLIC_GA_MEASUREMENT_ID` is configured and the application is
> rebuilt.** No `.env` file sets it, and the built output contains no gtag.

## Preliminary SEO cluster findings (for Batch 2 — not acted on here)

- **No cannibalisation.** No two PDF pages share a three-word title head.
- **One title outlier**: `pdf-to-jpg` at 66 characters will truncate.
- **All 20 descriptions** are within range.
- Word counts are healthy (1,113–1,582).
- **The big opportunity**: only **6 of 20** pages carry the "no upload / in
  your browser" differentiator in their title or description — and it is now
  verifiably true for 19 of 20. The other 14 are: rotate, edit, crop,
  add-page-numbers, add-watermark, sign, redact, compare, image-to-pdf,
  html-to-pdf, pdf-to-jpg, pdf-to-powerpoint, pdf-to-excel, pdf-to-text.
