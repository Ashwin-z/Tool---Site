# Office converter decisions (Batch 1C)

Five tools still depended on the old server architecture. Each was assessed on
evidence, not effort, and the outcome is one rebuild and four retirements.

| Tool | Was | Decision | Now |
|---|---|---|---|
| PDF to Word | 500 (Word COM) | **Rebuild client-side** | Works, in-browser |
| PDF to PDF/A | 503 (Ghostscript) | **Retire** | 410 Gone |
| Word to PDF | 500 (Word COM) | **Retire** | 410 Gone |
| Excel to PDF | 500 (Excel COM) | **Retire** | 410 Gone |
| PowerPoint to PDF | 500 (PowerPoint COM) | **Retire** | 410 Gone |

---

## PDF to Word — REBUILT CLIENT-SIDE

The component already contained a capable browser converter (table detection,
image cropping, bold/italic/colour/underline/bullet/alignment detection) behind
a "server-first, client fallback" switch. Because the server always returned
500, **every user was already getting the browser result** — after a pointless
failed upload. Batch 1C deleted the server attempt.

**Measured quality** (real Chrome, driving the UI, outputs re-opened and parsed):

| Input | Output | Word recall | Structure |
|---|---|---|---|
| 20-page prose PDF | 11.8 KB docx, 259 paragraphs | **96.3%** | paragraphs preserved |
| 2-page business report | 9.1 KB docx, 14 paragraphs | **78.3%** | 5 font sizes → heading levels; "Quarterly Report", "EMEA", "412,000", "Notes", "Appendix" all present |
| 5-page scan | 392 KB docx, **6 images** | n/a (no text layer) | pages embedded as images |

**Honest limitations, now stated on the page:** tables drawn with ruled lines
come through as positioned text rather than Word tables; multi-column layouts
are not rebuilt; scanned pages become images, not text (the page points those
users to PDF to Text, which runs OCR).

---

## PDF to PDF/A — RETIRED

This is the decision with the hardest evidence behind it. veraPDF 1.30.2 (the
industry-standard validator, run locally) was used to test what a browser can
actually produce.

A best-effort browser implementation was written with pdf-lib — XMP metadata
with `pdfaid:part`/`conformance`, an OutputIntent with an embedded sRGB ICC
profile, a document ID, no encryption, no object streams — then validated:

| Input | veraPDF verdict (PDF/A-1b) | Failing rule |
|---|---|---|
| Image-only scan (no fonts) | **PASS** | — |
| Text PDF, non-embedded Helvetica | **FAIL** | clause 6.3.4 — "font programs for all fonts shall be embedded" |
| Text PDF, embedded Arial TTF | **FAIL** | clause 6.3.3.2 — Type 2 CIDFont requires a `CIDToGIDMap` |

The blocker is structural, not effort. **A browser cannot embed a font program
that is not already in the file**, and every text fixture tested used
non-embedded Helvetica — the most common case in real-world PDFs, because
Word, browsers and most generators reference the base-14 fonts without
embedding them. Even when fonts *were* embedded, the file failed on a
different structural rule, showing that each producing application introduces
its own violations that a pass-through cannot repair.

A converter that passes only for image-only scans would refuse the majority of
what users bring it. PDF/A demand is also narrow and enterprise-shaped, and
those users have Acrobat, which reports exactly which rules a file breaks.

---

## Word / Excel / PowerPoint to PDF — RETIRED

All three are conversions where **the source application already exports PDF
natively, for free, with perfect fidelity**. The user need is weak, and browser
fidelity is poor:

**Word to PDF** — `mammoth` (already a dependency) converts DOCX *semantics*:
it preserved headings, bold and tables in testing, but it discards page size,
margins, columns, fonts and positioning **by design**. A Word-to-PDF export is
judged entirely on looking identical to the document, so semantic conversion
fails the only test that matters.

**Excel to PDF** — the `xlsx` library does not evaluate formulas. A test cell
of `=B2+C2` over values 100 and 120 read back as **0**, not 220. A spreadsheet
converter that silently prints zeros where totals belong is worse than no
converter. Print areas, page breaks and charts are also unavailable.

**PowerPoint to PDF** — no PPTX *parser* exists in the dependency set
(`pptxgenjs` only writes). Hand-parsing OOXML means implementing DrawingML,
theme inheritance, layout/master chains and EMU geometry: multi-week work with
poor expected fidelity.

---

## Why 410 and not a redirect

A redirect is only honest when the destination satisfies the same intent.
Nothing on ToolMint converts a PowerPoint to a PDF, so redirecting
`/tools/powerpoint-to-pdf` to the PDF category would be the same
URL-preservation trick that produced the soft-404s found in the Batch 0 audit.

**410 Gone** tells search engines the resource is deliberately gone and should
be dropped, rather than retried indefinitely as a 404 would be.
`src/lib/tool-availability.ts` holds the list and the reasons; `middleware.ts`
serves the 410 with a plain-language explanation and a pointer to the tools
that do work.

### Content handled, not abandoned

Eight blog posts referenced the retired tools, and four contained
step-by-step instructions to "Open the ToolMint Word to PDF tool". Those
sections were **rewritten, not deleted** — the articles still answer real
search intent, and the honest answer ("use Word's own export, here is how")
is better advice than the tool ever was. Each rewritten section also states
plainly why ToolMint does not offer the converter. Retired slugs were removed
from every `relatedToolSlugs` array.

---

## Does ToolMint still need a server?

**The Windows/Office/Ghostscript machine is no longer needed.** After Batch 1C
nothing in the codebase shells out to an external binary — `/api/health`
reports zero binary dependencies and zero known outages.

But **a plain Node host is still required**, for two reasons that have nothing
to do with Office:

1. `html-to-pdf` uses **puppeteer-core** — it needs a real browser server-side.
   (Working in production; out of scope for this batch.)
2. Four SEO tools (`meta-tag-generator`, `og-tag-generator`,
   `robots-txt-generator`, `sitemap-generator`) fetch third-party URLs on the
   user's behalf, which a browser cannot do because of CORS.
3. `pdf-to-excel` still runs server-side, though it is pure JS and could
   plausibly move to the browser.

So the accurate statement is: **ToolMint no longer needs Windows, Microsoft
Office or Ghostscript** — the expensive, fragile part. It needs an ordinary
Node host, which can be the cheapest Linux box or a serverless platform.
That is the change that makes the ~$30/month defensible or removable.

**No new server infrastructure was introduced in this batch**, and none is
recommended: no LibreOffice service, no containers, no queue. The three Office
conversions do not justify infrastructure when the source applications already
do the job for free.
