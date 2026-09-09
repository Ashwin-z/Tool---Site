# PDF Redaction Checker — methodology and validation

Live page: `/tools/pdf-redaction-checker`
Engine: `src/lib/pdf-redaction-check.ts`
Fixtures: `scripts/redaction-fixtures.py`
Regression: `scripts/test-redaction-checker.mjs`

This document exists because the tool makes a **security claim**. A claim like
that is only worth as much as the evidence behind it, so the evidence is written
down here rather than asserted on the marketing page.

---

## What it detects

| Channel | Failure mode | Signal |
|---|---|---|
| **A** | Text under an opaque box or image | Text painted *earlier* in the content stream than an opaque rectangle/image covering ≥60% of its box |
| **B** | Invisible text | Render mode 3 or 7, excluding whole-page OCR layers |
| **C** | Same-colour text | Fill colour within RGB distance 24 of the last opaque shape beneath it, ≥4 characters |
| **D** | Metadata / attachments | Author-supplied `Title`/`Author`/`Subject`/`Keywords`, plus embedded files |

Channel D is reported **for review, never as a leak**. Nearly every PDF carries
a `Producer` field; treating that as a failure would fire on almost every
document and train users to ignore the tool.

## What it cannot detect

These are limitations of the approach, not gaps to be closed later:

- **Non-text content under a box.** A signature, photograph, chart or map is
  invisible to text analysis. `rc-vector-signature` is kept in the suite as a
  deliberate MISS; if it ever starts passing, this document is out of date.
- **Whether visible content is sensitive.** It finds concealed text. It cannot
  judge what should have been concealed.
- **Earlier incremental revisions.** A PDF can retain previous saved states.
- **Encrypted PDFs** it cannot open — reported as unreadable, never guessed at.
- **Vertical writing modes**, which the glyph-advance calculation does not model.

---

## Why draw order is the whole design

A filled box only conceals text painted **before** it.

An early revision of this engine ignored draw order. It flagged 16 cells of an
ordinary shaded table and a report cover's own white-on-navy title as "hidden
text". For a tool that makes a security claim, **a false alarm on a normal
document is more damaging than a missed edge case**: it destroys the credibility
that makes the tool worth consulting at all.

So every geometric check is ordered, and the same-colour check compares text
against the last opaque shape actually painted beneath it rather than assuming a
white page.

## Discriminators, and where they came from

Several were adopted from [x-ray](https://github.com/freelawproject/x-ray), the
Free Law Project's open-source bad-redaction detector, which has been run over
a very large corpus of court filings:

- **Rectangles only.** Nobody redacts with a bezier blob. Treating every filled
  path as an occluder turns chart wedges, logos and scatter-plot markers into
  "redaction boxes".
- **Opaque fills only** (`ca` = 1). A semi-transparent fill is a highlight.
- **Size floor** (>4pt per side). Hairlines are rules and borders.

Two more came from measured failures on real documents:

- **Form XObject matrices must be applied.** One arXiv figure page is rotated 90°
  by its form matrix alone; ignoring it silently corrupts every coordinate on the
  page. Charts, logos and annotation appearances all arrive this way.
- **Rotated text needs all four corners transformed.** Taking the baseline
  endpoints and padding in device Y collapses a 90°-rotated axis label into a
  thin sliver that any nearby marker appears to cover.

## Two pdf.js details that cause silent wrongness

Recorded because both produce a *working-looking* engine that is quietly broken:

1. `constructPath`'s bbox (`args[2]`) is a **`Float32Array`**, so `Array.isArray()`
   is `false`. Validating it that way drops every rectangle and the tool reports
   everything as clean.
2. `setTextMatrix` passes the matrix as **`args[0]`**, while `transform` passes
   six numbers as the argument list itself. Slicing blindly yields a one-element
   array, collapsing every text box to zero size — which disables all geometric
   checks while the colour-based ones keep passing.

---

## Validation

### Independent ground truth

Fixtures are built **and verified** with PyMuPDF — a different PDF library from
the pdf.js engine under test. `scripts/redaction-fixtures.py` reports whether a
canary string is still recoverable in each fixture, so the suite's expectations
never come from the code being tested.

The corpus separates two facts that are easy to conflate:

- **recoverable** — can an independent parser still read the canary?
- **concealed** — is it hidden from someone looking at the page?

`rc-no-redaction` is recoverable but not concealed: the canary is printed in
plain sight. The checker must **not** flag it. A checker that flags visible text
is a text extractor with an alarm attached.

### Cross-implementation check

Verdicts were compared against `x-ray`, which is built on PyMuPDF:

| | x-ray | this engine |
|---|---|---|
| Text under a rectangle (5 fixtures) | detects | detects |
| All 6 negative fixtures | clean | clean |
| White-on-white text | not covered | detects |
| Opaque image overlay | not covered | detects |
| Metadata content | not covered | reports for review |

The two **agree on every case inside x-ray's documented scope**, which is
"rectangles on top of text". The additional channels are outside what x-ray
claims to cover — they are not defects in it.

### Measured results

| | Count | Basis |
|---|---|---|
| True positives | 8 | Leak fixtures, each independently confirmed by PyMuPDF |
| True negatives | 15 | 6 benign fixtures + 9 real published PDFs |
| False positives | **0** | After the Form XObject, opacity, rectangle-only and size-floor fixes |
| False negatives | 1 | `rc-vector-signature` — documented limitation |

The real-world corpus was 9 published PDFs from varied generators — US
government publications, IRS forms (heavy shading and form fields), two LaTeX
papers with figures, and a shareholder letter — totalling **169 pages and roughly
26,700 text runs**.

Two false-positive sources were found and fixed during that measurement:

- A 4-page scanned government memo produced **878** invisible-text findings, one
  per word: a normal OCR layer. Pages that are an image with a ≥90% invisible
  text layer are now classified as OCR and excluded.
- A LaTeX figure page flagged rotated chart tick labels, traced to the two
  geometry bugs above.

### Performance

Measured in Chrome against a production build: a 300-page / 3.2 MB document in
**1.3 s**; a 114-page NIST publication in **2.0 s**. Analysis yields to the event
loop between pages, so a long document cannot freeze the tab, and it is
cancellable.

---

## Privacy

The engine runs entirely in the browser using the site's local pdf.js build.
Verified by network capture in the regression suite: **0 third-party requests,
0 POST/PUT/PATCH of any kind, 0 requests carrying a document body**, and the
canary string never appears in any request URL.

Analytics receives only a `result_type` label — one of `no_detected_leaks`,
`text_overlay_risk`, `invisible_text_risk`, `metadata_risk`, `multiple_risks`.
Never the document, the recovered text, or any metadata value.

---

## Running the suite

```bash
python scripts/redaction-fixtures.py --out .fixtures   # builds + verifies ground truth
npm run build && npx next start -p 3000 &
BASE=http://127.0.0.1:3000 FIXTURES=.fixtures node scripts/test-redaction-checker.mjs
```

Set `REALPDFS=<dir>` to re-run the false-positive measurement against real
published PDFs. Those files are downloaded rather than committed; the suite
skips them when the directory is absent.

## Wording rules

The result must never claim a document is secure. The permitted phrasing is
"No recoverable text was detected", with the limitations shown alongside it.
`scripts/test-redaction-checker.mjs` asserts that the page never renders the
phrase "completely secure", and fails if it does.
