# Compress PDF — browser-side rebuild (Batch 1A)

Rebuilt 2026-09-08. The server implementation returned **HTTP 503 to every
user** because it shelled out to Ghostscript, which is not installed on the
production host. It now runs entirely in the visitor's browser.

## Architecture

```
File chosen  →  ArrayBuffer in page memory
             →  pdf-lib parses the document
             →  walk indirect objects, find image XObjects
             →  decode each image  (createImageBitmap)
             →  redraw smaller/lower quality  (OffscreenCanvas)
             →  re-encode JPEG  (convertToBlob)
             →  write the stream back in place
             →  pdf-lib re-saves with object streams
             →  Blob → download
```

Size in a PDF is almost entirely embedded raster images. Text and vector art
are described mathematically and are already compact, so we leave them
completely alone — which is why **text stays selectable and searchable**.

| File | Role |
|---|---|
| `src/lib/pdf-compression.ts` | The engine. Imports pdf-lib. Loaded on demand. |
| `src/lib/pdf-compression-types.ts` | Modes, types, `CompressError`. No pdf-lib, so the page can render controls without pulling 400KB. |
| `src/components/pdf-compressor-tool.tsx` | UI and state machine. |
| `src/app/tools/compress-pdf/page.tsx` | Page, copy, schema. |
| `src/app/api/tools/pdf-compressor/route.ts` | Retired — returns 410. |

### Safety rules the engine follows

- Never touches an `/SMask` or `/Mask` — those carry transparency and JPEG has
  no alpha channel.
- Skips formats it cannot safely re-encode: JPEG 2000, CCITT fax, JBIG2, CMYK,
  Separation/DeviceN, Indexed.
- Skips images under 4096 pixels total — not worth the overhead.
- Keeps the original image whenever the re-encoded version would be larger.
- If the whole output ends up bigger than the input, returns the **original
  file untouched** and reports "already optimised" rather than a worse file.
- Resolves `/ColorSpace` through indirect references and `ICCBased` arrays.
  (An earlier version missed this and silently skipped every Flate image.)

## Compression modes

| Mode | JPEG quality | Max edge | Intended for |
|---|---|---|---|
| Recommended | 0.72 | 2000px | Default. Still fine for normal printing. |
| Strong | 0.55 | 1500px | Email and upload portals. |
| Maximum | 0.40 | 1100px | When it just has to fit under a limit. |

Text and vectors are identical at every level.

## Measured results

Real Chrome, driving the real UI, on a generated 10-file corpus.
`docs`-quality caveat: these are synthetic fixtures — real documents vary.

| Fixture | Mode | Original | Result | Reduction | Time |
|---|---|---|---|---|---|
| text, 1 page | Recommended | 1.52 KB | 1.46 KB | 4.2% | 34 ms |
| text, 20 pages | Recommended | 21.8 KB | 17.9 KB | 17.9% | 45 ms |
| image-heavy, 6 pages | Recommended | 1.73 MB | 536 KB | **69.7%** | 930 ms |
| scanned, 5 pages | Strong | 2.30 MB | 153 KB | **93.5%** | 923 ms |
| Flate/PNG images | Recommended | 2.45 MB | 168 KB | **93.3%** | 407 ms |
| large, 24 pages | Maximum | 7.73 MB | 398 KB | **95.0%** | 1830 ms |
| mixed text+images | Recommended | 1.39 MB | 540 KB | **62.0%** | 936 ms |
| already-compressed | Recommended | — | — | 0.0% (original kept) | — |
| password-protected | Recommended | — | — | handled: asks user to unlock first | — |
| corrupt (truncated) | Recommended | — | — | handled: "damaged or incomplete" | — |

Every successful output was re-opened and verified: **page count preserved,
text preserved, all images present, every page renders.** 0 problems across 7
downloaded files.

The old page claimed "reduce PDF size by up to 90% with no quality loss". That
was true for neither text PDFs (4%) nor for quality (JPEG re-encoding is
lossy). The claim has been removed and replaced with real before/after figures
shown per file.

## Privacy verification

The claim is *"Runs in your browser — your PDF is processed on your device and
is not uploaded."* It is driven by `src/lib/processing-mode.ts`, so it cannot
drift from behaviour.

Verified by recording **every** network request Chrome made across nine full
compression runs:

```
non-GET requests issued .............. 0
requests with a body > 1KB ........... 0
third-party hosts contacted .......... 0
```

There is also no third-party runtime asset. Unlike `merge-pdf` and
`split-pdf`, which still fetch their pdf.js worker from `unpkg.com`, this tool
**does not use pdfjs at all** — it needs only pdf-lib, which is bundled. So
there is no CDN to trust and nothing to vendor.

Reproduce it yourself: DevTools → Network → compress a file → no upload appears.

## Performance

| Page | JS on load | DCL |
|---|---|---|
| `/` | 469 KB | 102 ms |
| **`/tools/compress-pdf`** | **1062 KB** | **51 ms** |
| `/tools/merge-pdf` | 905 KB | 64 ms |
| `/tools/split-pdf` | 1036 KB | 212 ms |
| `/tools/pdf-tools` | 1524 KB | 39 ms |

pdf-lib (~418 KB) is **not** in the initial payload — it is dynamically
imported on first compression. Verified: 13 scripts on page load, 15 after
compressing.

## Accessibility

- File input has an `aria-label`; the visible button triggers it.
- Upload button reachable by keyboard in 20 tabs; 2px solid focus outline.
- Progress bar is a real `role="progressbar"` with `aria-valuenow`.
- Status text is `role="status" aria-live="polite"`.
- Mode selector is a labelled `radiogroup` in a `fieldset`/`legend`.
- One `h1`; no images missing alt; no unnamed buttons.
- Drag-and-drop is never the only route — the file picker does everything.

## Mobile

Tested at 390×844 with touch emulation: no horizontal overflow before or after
compression, and a 1.39 MB mixed PDF compressed to 62% on-device. All primary
controls are ≥44px tall. The small controls the audit flags are in the shared
site header/nav, not this tool.

## Limits

- **100 MB** per file, **10 files** at a time. This is a memory limit, not a
  policy one: the device has to hold the document while it works.
- Above **25 MB** the UI warns that it will be slow and memory-hungry.
- Large files on older phones are the main risk; the work happens on the main
  thread with yields between images, so the tab stays responsive but a very
  large file will still take a while.

## Known limitations

1. **Main thread, not a Web Worker.** Yielding between images keeps the UI
   responsive and makes cancellation work, but a Web Worker would be better for
   very large documents. Deferred to keep this batch's risk down.
2. **No visual preview** of before/after quality. Users see sizes, not pages.
3. **CMYK, JPEG 2000, CCITT and JBIG2 images are skipped**, so scanned PDFs
   from some enterprise scanners will compress less than expected.
4. **Chrome's JPEG encoder is less efficient than Ghostscript's** at the same
   nominal quality — a Node/Ghostscript run hit 95% on the image-heavy fixture
   where Chrome reached 69.7%. Browser-side is a real trade against the old
   server pipeline; the old pipeline just did not work.
5. Fixtures are synthetic. Real-world figures will vary.

## What to measure

| Metric | Where | Why it matters |
|---|---|---|
| `tool_view` → `tool_start` | GA4 | Do people who land actually try it? |
| `tool_start` → `tool_complete` | GA4 | **Batch 1A gate: >60%.** |
| `tool_complete` → `tool_download` | GA4 | Did they keep the result? |
| `tool_error` by `failure_type` | GA4 | Which files break it |
| `compression_mode` split | GA4 | Is "Recommended" the right default? |
| `reduction_bucket` | GA4 | Are real files compressing usefully? |
| Impressions / clicks / CTR on `/tools/compress-pdf` | Search Console | Does "without uploading" earn clicks? |
| Average position | Search Console | Baseline was 58.2 sitewide |

None of these can be read until `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set — that
remains the outstanding blocker from Batch 0.
