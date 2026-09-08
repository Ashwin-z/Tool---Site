# Protect PDF & Unlock PDF — browser rebuild (Batch 1B)

Rebuilt 2026-09-08. Both tools previously shelled out to the `pdfcpu` binary,
which is not installed on the production host — they returned **HTTP 503 to
every user**. They now run entirely in the visitor's browser.

## Why this needed a from-scratch implementation

Neither existing dependency could do it:

| Library | Encryption support |
|---|---|
| pdf-lib 1.17.1 | **None.** Exports only `EncryptedPDFError`. |
| jsPDF 4.2.1 | RC4 support removed in v4. |
| pdfjs-dist 5.5.207 | Can *read* encrypted PDFs, cannot write one. |

So `src/lib/pdf-security.ts` implements the ISO 32000 standard security
handler directly, on WebCrypto (`crypto.subtle`) plus two primitives WebCrypto
does not provide and the PDF spec still requires: **RC4** and **MD5**.

## What it does and does not do

### Protect → AES-256, revision 6

Writes the strongest scheme the PDF format defines (PDF 2.0, `V 5 / R 6`,
`AESV3`), which is what Acrobat produces today.

**We deliberately do not offer RC4.** It is broken, and shipping it would be
selling false security.

**We deliberately do not offer permissions-only protection.** A permissions
("owner") password does not encrypt anything — it sets a flag *asking* the
reader to disable printing or copying, which most PDF software ignores or
strips in seconds. The tool page now says so plainly. The previous page copy
advertised "set sharing permissions" and "restrict editing and printing",
which the implementation never delivered; that copy has been corrected.

A single password is set as both the user and owner password, so one password
opens the file and owns it. Permissions are left permissive (`P = -3904`):
the point is confidentiality, not usage restriction.

### Unlock → removes RC4 40/128-bit, AES-128, AES-256

| Scheme | Spec | Supported |
|---|---|---|
| RC4 40-bit | V1 R2 | yes |
| RC4 128-bit | V2 R3 | yes |
| AES-128 | V4 R4 `AESV2` | yes |
| AES-256 | V5 R5/R6 `AESV3` | yes |
| Owner-password-only (opens with no password) | any | yes |
| Certificate / public-key handler | — | **no** — detected and explained |
| Custom security handler | — | **no** — detected and explained |

**It cannot guess or break a password.** You must know it. There is no
brute-forcing, and files whose password is unknown are refused honestly rather
than "attempted".

## Test results

### Engine (production module, transpiled, run against fixtures)

15/15 assertions passed, including: AES-256 output produced; empty and
3-character passwords rejected; already-encrypted input refused; all five
encryption schemes removed; wrong password, missing password, unencrypted
input and corrupt input each reported with the correct error code; and a
protect→unlock round trip on our own output.

### Real browser (Chrome via puppeteer, driving the actual UI)

| Check | Result |
|---|---|
| Merge 3 PDFs → order `A1 A2 B1 B2 B3 C1` | **exact**, 6 pages |
| Merge with an encrypted input | explained, not a crash |
| Split a 10-page PDF | 10 pages reported, output correct |
| Protect: mismatched passwords | rejected before any work |
| Protect: output scheme | `Standard V5 R6 256-bit AES` per MuPDF |
| Protect: wrong password on output | rejected |
| Unlock RC4 40-bit / AES-128 / AES-256 | all removed, 20 pages, 8460 words intact |
| Unlock: wrong password | "That password is not correct for this PDF." |
| Unlock: unencrypted input | "This PDF has no password on it…" |
| Page errors across all runs | **zero** |

Every downloaded file was re-opened with an independent reader (PyMuPDF):
page counts, text and rendering all intact; unlocked files confirmed *not*
encrypted; the protected file confirmed encrypted and password-gated.

### Network privacy — measured, not asserted

Across every run of all four tools, Chrome recorded:

```
non-GET requests ............................ 0
request bodies > 1KB ........................ 0
third-party hosts contacted ................. 0
CDN requests (unpkg / jsdelivr / cdnjs) ..... 0
pdf.js worker fetched from .................. /vendor/pdfjs/pdf.worker.min.mjs
```

No PDF and **no password** is transmitted anywhere. The password lives only in
React state and is cleared as soon as the output file is produced.

## Local pdf.js — the unpkg removal

`merge-pdf` and `split-pdf` previously set:

```js
pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

That is a third-party runtime dependency on a privacy-first PDF tool, and a
single point of failure. Both now use `src/lib/pdfjs-loader.ts`, the one place
pdf.js is configured, which loads the library and worker from this site's own
`/vendor/pdfjs`.

**Versions verified equal**: `pdfjs-dist` 5.5.207 (package), `pdf.mjs` 5.5.207
and `pdf.worker.min.mjs` 5.5.207 (vendored). pdf.js throws
"The API version does not match the Worker version" on a mismatch, so
`scripts/check-pdfjs-version.mjs` now fails the build if the package, the two
vendored files and the loader constant ever disagree — and also if any file
under `src/` loads a runtime asset from a CDN.

> Pyodide (`python-code-editor`) is an explicit, documented exception in that
> check: it is a large runtime that is not a PDF worker.

## Shared infrastructure added

| File | Purpose |
|---|---|
| `src/lib/pdfjs-loader.ts` | The only pdf.js configuration. `getPdfjs()`, `renderPageThumbnail()`. |
| `src/lib/pdf-security.ts` | Crypto engine. Lazy-loaded (~450KB with pdf-lib). |
| `src/lib/pdf-security-types.ts` | Types, presets, `SecurityError`, so pages render without the engine. |
| `scripts/check-pdfjs-version.mjs` | Build guard for version drift and CDN assets. |

Existing shared pieces were reused rather than duplicated: `analytics.ts`,
`processing-mode.ts`, `tool-status.ts`, `ProcessingBadge`, `ToolStatusNotice`,
`ToolAnalytics`, and `formatBytes`/`sanitizeBaseName`/`downloadBlob`.

## Analytics

All four tools now emit `tool_view`, `tool_start`, `tool_complete`,
`tool_error`, `tool_download` and `tool_reset`. New parameters this batch:

| Parameter | Tool | Example |
|---|---|---|
| `operation_type` | protect / unlock | `"protect"` |
| `encryption_scheme` | unlock | `"AES-256"` — the scheme *removed* |
| `split_mode` | split | `"range"` |
| `page_count_bucket` | split | `"2-10"` |

**Passwords are never sent.** On failure only a category leaves the browser
(`invalid_input`, `unsupported_file`, `processing_failed`) — never the
password, the message, or the file name.

Wiring is verified but **collection still requires `NEXT_PUBLIC_GA_MEASUREMENT_ID`
to be set followed by a rebuild** (it is inlined at build time). That remains
the outstanding blocker from Batch 0.

## Performance

| Page | JS on load | DCL |
|---|---|---|
| merge-pdf | 905 KB | 76 ms |
| split-pdf | 1037 KB | 122 ms |
| protect-pdf | 1060 KB | 115 ms |
| unlock-pdf | 1060 KB | 92 ms |
| compress-pdf | 1062 KB | 87 ms |

pdf-lib and the crypto engine are dynamically imported on first use, not at
page load. Encryption of a 20-page document takes ~190 ms; decryption 80–150 ms
depending on the scheme.

## Accessibility

Fixed this batch: `merge-pdf` and `split-pdf` had **unlabelled file inputs**
(now `aria-label`), **no announced status region** during processing or on
success (now `role="status" aria-live="polite"`), and touch targets down to
15 px (`Clear all`, `Remove`, `↑ Up`/`↓ Down` now 44 px).

Verified across all five PDF tools: exactly one `h1`, file input labelled,
password inputs labelled, no unnamed buttons, no images missing `alt`, primary
control reachable by keyboard in 8 tabs, no horizontal overflow at 390×844.

Remaining sub-40px controls in `<main>` are breadcrumb text links (~20 px) and
split's Range/Pages/Custom tabs (36 px) — noted, not yet changed.

## Known limitations

1. **Main thread, not a Web Worker.** Fine at these sizes; a very large
   encrypted document will still block briefly.
2. **Strings are not re-encrypted on protect.** Stream contents are encrypted;
   document-level strings (some metadata, annotation text) are written plain.
   Readers accept this and the page content is fully protected, but it is not
   a complete implementation of the spec.
3. **Certificate-based and custom security handlers** are detected and
   refused, not supported.
4. **Unlock needs the password.** No recovery, by design.
5. Fixtures are MuPDF-generated. Files from Acrobat, Word and enterprise
   scanners have not been tested and may use structures we skip.
