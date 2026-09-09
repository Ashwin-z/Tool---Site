# ToolMint PDF SEO strategy — Batch 2 research

Research completed 2026-09-09. Evidence sources are labelled on every claim.
Where data could not be obtained, that is stated rather than estimated.

## What could and could not be measured

| Source | Status |
|---|---|
| **SEO plugin — Common Crawl web graph** | **USED.** Free, no credentials. Gave real authority numbers. |
| **Live SERPs** (WebSearch) | **USED.** Real result sets for head and modifier queries. |
| **Competitor pages** (WebFetch/curl) | **USED.** Title, H1, layout, claims, limits, sitemap sizes. |
| **Live site** | **USED.** Full metadata inventory of all 20 PDF pages. |
| SEO plugin — DataForSEO / Moz / Ahrefs / Bing | **UNAVAILABLE.** No credentials, 0 MCP servers. No search volumes, no keyword difficulty, no rank tracking. |
| Search Console | **NO ACCESS.** Only the four figures from the original brief (19 clicks / 10.5K impressions / 0.2% CTR / pos 58.2), now ~4 months stale. |
| GA4 | **NOT COLLECTING.** `NEXT_PUBLIC_GA_MEASUREMENT_ID` is still unset. |

**No search volume or keyword difficulty figure appears anywhere in this
document, because none could be obtained.** Prioritisation is therefore based
on SERP composition, competitor weakness, privacy salience and product
strength — not on volume estimates.

## Finding 1 — authority is the binding constraint

*Source: SEO plugin, Common Crawl `cc-main-2026-jan-feb-mar`.*

| Domain | Harmonic centrality rank | PageRank rank | Hosts linking |
|---|---|---|---|
| smallpdf.com | 3,397 | 14,641 | 16 |
| ilovepdf.com | 4,144 | 16,320 | 55 |
| **drawboard.com** | **64,741** | 206,678 | 13 |
| toolmint.app | **not in graph** | — | — |
| **toolmint.tools** | **not in graph** | — | — |

`toolmint.tools` returns `in_crawl: false, in_rankings: false` — the domain is
**absent from the crawled link graph entirely**. That explains an average
position of 58 far better than any title tag does.

**The encouraging half of this finding:** Drawboard ranks **#3 for the head
term "compress pdf"** with a harmonic rank of 64,741 — roughly fifteen times
weaker than Smallpdf and iLovePDF. Head terms are therefore *not* purely
authority-gated. They are out of reach **now**, but the ceiling is
Drawboard-level authority, not Adobe-level. The first climb is simply getting
into the graph at all.

## Finding 2 — the modifier cluster is where a new site can rank

*Source: live SERPs.*

- **"compress pdf"** → PDF24, iLovePDF, **Drawboard**, Adobe, Canva, Smallpdf,
  PDFGear, PDF Guru. No small site appears.
- **"compress pdf without uploading"** → PDFico, OfflinePDF, AeroPDF,
  ihatepdf, Drawboard, plus how-to posts.
- **"merge pdf without uploading"** → Immplify, Secure Merge, CleanPDF,
  vault-tools, Utilioo, secureonlinetools, gethonestpdf, Drawboard.
- **"redact pdf without uploading"** → RedactOffline, RedactorHQ, WipePrivacy,
  DocMask, plus UPDF and SimpleTool guides.

Two things follow. First, low-authority sites genuinely rank on the modifier —
so it is winnable. Second, **informational posts rank there too** and funnel
to their authors' own tools; that is a content opportunity, not just a tool one.

Note the contrast in tactics: **Drawboard keeps the head term in its title and
uses privacy as an on-page conversion lever**, because it can win the head
term. ToolMint cannot yet, so for us the modifier belongs *in* the title.

## Finding 3 — a brand collision that undermines the positioning

*Source: live SERPs + direct fetch.*

At least six live "ToolMint" entities exist. Two are direct problems:

| Domain | Title | Scale |
|---|---|---|
| **toolmint.online** | "ToolMint — Free Online Tools \| **Privacy-First Utility Hub**", *"Your files never leave your device — ever"* | **1,308 URLs** |
| **toolmint.app** | "ToolMint — Free Online PDF, Image & File Tools \| **Privacy-First**" | 37 URLs |

Identical brand name. Identical positioning. A search engine asked about
`toolmint.tools` **attributed their features to us** — "9 languages",
"WebAssembly and Web Workers", "pay per use". None of that is ours.

**The mitigating detail:** toolmint.online's 1,308 URLs are **1,261
programmatic `/convert/` permutations** over just **22 real tools** and 8 blog
posts, with ~850-word tool pages. It is a page-count competitor, not a depth
one — ToolMint has 82 tools, 80 posts, and verified behaviour. And it is *also*
absent from the Common Crawl graph, exactly like us.

This is a strategic decision for the owner, not a technical one: either
differentiate the name, or invest hard in entity signals (Organization schema
with `sameAs`, a real About/authorship, external mentions) so the three are
disambiguated.

## Finding 4 — one differentiator no competitor in the SERP can match

The redaction SERP surfaced a widespread failure: *"drawing a black rectangle
over text is NOT redaction — the text layer still exists beneath it."*

**ToolMint's redaction does not have that flaw**, and this was verified
empirically, not assumed. Replicating the shipped export path
(`redact-pdf-tool.tsx` ~590–635: render → canvas → black rects → `embedJpg` →
**new** `PDFDocument`) against a canary document:

| Token | In original | Recoverable from redacted output |
|---|---|---|
| SECRET | yes | **no** |
| CANARY | yes | **no** |
| 9f3a2b | yes | **no** |
| Confidential | yes | **no** |
| Salary | yes | **no** |
| 184000 | yes | **no** |

Original: 102 text characters, 0 images. Output: **0 text characters**, 1
image. The original text layer is discarded, not covered.

> **Scope of that verification:** the *mechanism* is proven in a real run
> against an independent reader (PyMuPDF). The *UI drag interaction* could not
> be automated — the editor surface rendered at 145×205 in headless Chrome and
> `setPointerCapture` did not take across three attempts. Someone should
> confirm the end-to-end flow by hand, and that difficulty may itself indicate
> a pointer-accessibility issue worth checking.

## What was changed (first slice — five pages)

Chosen where privacy salience is genuine **and** modifier demand was observed
in a real SERP — deliberately not applied to all 14 pages lacking it.

| Page | Was | Now |
|---|---|---|
| redact-pdf | Redact PDF Online Free – Hide Sensitive Text | **Redact a PDF – Text Removed, Not Just Covered** |
| sign-pdf | Sign PDF Online Free – Add Digital Signature | **Sign a PDF in Your Browser – No Upload** |
| pdf-to-excel | PDF to Excel Converter – Extract PDF Tables Free | **PDF to Excel in Your Browser – No Upload** |
| pdf-to-text | PDF to Text (OCR) – Extract Text from PDF Free | **PDF to Text (OCR) in Your Browser – No Upload** |
| pdf-to-jpg | PDF to JPG Converter – … (66ch, **truncated**) | **PDF to JPG in Your Browser – No Upload** (49ch) |

Plus two honesty fixes on redact-pdf: **"GDPR and compliance-ready"** and
**"comply with GDPR, HIPAA"** removed (a free tool cannot make anyone
compliant, and there is no BAA), and a section added explaining why a black
box is not redaction — including the honest cost, that output text is no
longer selectable.

## Where privacy should NOT go in the title

Rotate, crop, add-page-numbers, add-watermark, compare, image-to-pdf and
pdf-to-powerpoint have low privacy salience — nobody fears uploading a file to
rotate it. Forcing the modifier there would dilute it.

**html-to-pdf must never carry it**: it is genuinely server-side.

## The one SEO bet

**Own "PDF work you are not allowed to upload."**

Not "free PDF tools" — that fight is lost to Adobe, Canva, Smallpdf, iLovePDF
and PDF24 for the foreseeable future.

- **Audience:** people handling contracts, medical records, HR files, and
  financial statements, who are contractually or professionally barred from
  uploading them to a third party.
- **Cluster:** the "without uploading / private / offline / in browser"
  modifier set, where low-authority sites demonstrably rank today.
- **Lead pages:** redact-pdf, sign-pdf, protect-pdf, unlock-pdf,
  pdf-to-excel — the tools whose inputs are inherently sensitive.
- **Why us over the other privacy sites:** theirs is a claim; ours is
  demonstrable. 19 browser-side tools verified by network capture, real
  AES-256, and a redaction proven to destroy the text layer. No competitor in
  those SERPs can show that.
- **First linkable asset:** not an article — a **redaction-safety checker**
  that tells someone whether their existing "redacted" PDF still has text
  underneath the black boxes. It is genuinely useful, it is alarming in a way
  people share, and it makes the differentiator self-evident.

## Explicitly not done in this batch

No mass title rewrite. No new pages. No articles. No link building. No AdSense
reapplication. Those wait on evidence that this five-page slice moves CTR —
which requires GA4 and Search Console.

## What to do next

1. **Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` and rebuild.** Five batches of
   instrumentation, and this slice's whole hypothesis, are unmeasurable
   without it.
2. **Decide the brand question.** Two same-named competitors with identical
   positioning is a strategic risk that no amount of on-page work fixes.
3. **Verify the redaction flow by hand**, then promote it.
4. Leave the other 14 pages alone until the first slice reports back.
