# Outreach package — PDF Redaction Checker

Prepared for **manual sending**. Nothing here has been sent, and nothing should
be sent automatically.

> **Blocker: outreach email does not work yet.**
> `toolmint.tools` has no MX record, so mail to `hello@toolmint.tools` and
> `partnerships@toolmint.tools` bounces. Anyone who replies to an outreach
> message gets a delivery failure — which, for a credibility-based pitch, is
> worse than not sending at all. `/contact` now says so plainly, and
> `CONTACT.contactWorks` in `src/lib/brand.ts` stays `false` until a test
> message has actually been received. **Fix DNS before sending anything.**
> See `docs/DNS-EMAIL.md`.

---

## 1. Short pitch (cold, 4 sentences)

> Most "redacted" PDFs that leak do so the same way: a black box is drawn over
> the text, and the text is never removed. I built a free checker that reads a
> PDF in the browser and reports any text that is still recoverable — no upload,
> because a document being redacted is sensitive by definition.
>
> It is tested against a fixture set built and verified with a second, independent
> PDF library, and it currently reports zero false alarms across nine real
> published documents (169 pages). The limitations are published on the page
> rather than buried — it reads text, so a signature hidden under a box is
> outside what it can see.
>
> If it is useful for your readers: https://toolmint.tools/tools/pdf-redaction-checker

## 2. Longer editorial pitch

> Redaction fails silently. The document looks finished, and the text underneath
> is one copy-and-paste away. It has happened to law firms, government agencies
> and newsrooms, and it keeps happening because the failure is invisible in
> exactly the place people check: the screen.
>
> The Free Law Project's `x-ray` is the reference tool for detecting this, and
> it is excellent — but it is a Python library. The people most exposed to the
> problem (lawyers filing exhibits, journalists handling leaked documents, FOI
> officers) generally cannot install and run a Python package on the document
> they are about to publish.
>
> ToolMint's PDF Redaction Checker runs the equivalent checks in the browser.
> It reports text hidden under a shape or image, invisible text, text matched to
> its background colour, and document properties worth reviewing — with the page
> each finding came from.
>
> Two things may be worth your readers' attention beyond the tool itself:
>
> **The methodology is published.** Draw order is the whole design: a filled box
> only conceals text painted before it. An early revision ignored that and
> flagged sixteen cells of an ordinary shaded table as "hidden text". For a tool
> making a security claim, a false alarm on a normal document is more damaging
> than a missed edge case, so the false-positive work is documented alongside the
> detections.
>
> **The scanned-document case is under-covered elsewhere.** A searchable scan is
> a picture with an invisible text layer over it. Draw a black box on the
> picture and the text layer survives untouched. We keep this as a dedicated test
> fixture because it defeats the intuition that a scan is safe.
>
> Page: https://toolmint.tools/tools/pdf-redaction-checker
> Guide: https://toolmint.tools/blog/how-to-tell-if-pdf-redaction-failed

## 3. Methodology summary (one paragraph, quotable)

> The checker walks each page's drawing instructions in order and rebuilds every
> text run with its position, colour and rendering mode. Draw order matters
> because a filled box only conceals text painted before it. Only opaque,
> axis-aligned rectangles and images above a minimum size count as covers;
> semi-transparent fills are highlights, not redactions. Pages that are an image
> with a full invisible text layer are classified as scans, so a normal OCR layer
> is not reported as hidden content — but text covered by a shape is still
> reported even on such a page.

## 4. What the tool is (neutral description for a directory or roundup)

> **PDF Redaction Checker** — a free browser-based tool that checks whether a
> PDF's redactions actually removed the text or only covered it. Detects text
> under shapes and images, invisible text, background-coloured text, and reports
> document properties for review. Runs entirely on the user's device; the file is
> never uploaded. Limitations published. No account required.

## 5. How to describe the relationship to x-ray

Always accurately, and never as a criticism. Suggested wording:

> `x-ray` (Free Law Project) and this checker have **different scopes, not
> different quality**. x-ray documents its scope as rectangles over text, and on
> identical fixtures the two agree on every case inside that scope. This checker
> additionally reports invisible text, image overlays and document properties,
> and runs in a browser rather than as a Python library. For bulk or pipeline
> processing, x-ray is the better fit.

Do not claim x-ray "misses" things. It does not set out to cover them.

## 6. Link destination

| Audience | Send them to |
|---|---|
| Anyone who needs the tool | `/tools/pdf-redaction-checker` |
| A "how do I know if it failed" article | `/blog/how-to-tell-if-pdf-redaction-failed` |
| A methodology or research citation | `/tools/pdf-redaction-checker#methodology` |

The tool page is the canonical destination. It carries the methodology, the
limitations and the test evidence, so a single link gives a writer everything
needed to describe it accurately.

## 7. Visual asset recommendation

No screenshots exist yet. The two worth producing, in this order:

1. **A result screenshot showing a detection** — the recovered line of text with
   its page number, on a synthetic fixture. Never a real document. This is the
   single most reusable image: it shows the failure rather than describing it.
2. **A before/after of the same page** — the black bar as it appears, beside the
   text selected and copied out of it.

Use `rc-black-box.pdf` from `scripts/redaction-fixtures.py` so the canary string
is obviously synthetic and no real data is ever shown.

## 8. Key facts that can be cited

Every figure below is measured and reproducible via `scripts/redaction-fixtures.py`
and `scripts/test-redaction-checker.mjs`. None is an accuracy guarantee.

- Runs entirely in the browser; verified by network capture as **0 third-party
  requests and 0 requests carrying a document body**.
- Fixtures are built **and independently verified with PyMuPDF**, a different PDF
  library from the one the checker uses, so the tests are not circular.
- **Zero false alarms** across nine real published PDFs — US government
  publications, IRS forms, arXiv papers, a shareholder letter — totalling
  **169 pages and roughly 26,700 text runs**.
- Agrees with `x-ray` on every case inside x-ray's documented scope.
- Detects four channels: text under a shape or image, invisible render modes,
  background-coloured text, and document properties (reported for review).
- Published limitations: non-text content under a box, sensitivity of visible
  content, earlier saved revisions inside a file, encrypted PDFs, vertical
  writing modes.
- A 300-page document is analysed in about **2 seconds**.

---

## Target categories

Refined from Batch 4 research. **No individual names or email addresses are
listed, and none should be invented.** Identify real contacts manually from each
organisation's own published contact page.

| # | Category | Why they care | What to reference |
|---|---|---|---|
| 1 | Legal technology writers & blogs | Redaction failure is a recurring malpractice story with named cases | Tool page + methodology |
| 2 | Law-firm KM / practice-support teams | They own the pre-filing checklist that is supposed to catch this | Guide, as a verification step |
| 3 | Court e-filing guidance pages | Many already warn against black boxes but offer no way to verify | Tool page |
| 4 | FOI / public-records offices | They publish redacted documents at volume, under statutory duty | Tool page + limitations |
| 5 | Investigative journalism toolkits | Both sides: protecting sources, and checking documents they receive | Tool page + guide |
| 6 | Press-freedom / source-protection orgs | Source protection failures start with document handling | Tool page |
| 7 | Privacy & DPO resource sites | Disclosure of personal data via failed redaction is a reportable event | Guide |
| 8 | Infosec newsletters | The scanned-OCR case is a genuinely under-covered failure mode | Methodology + guide |
| 9 | Digital forensics practitioners | They are usually the ones recovering the text afterwards | Methodology |
| 10 | OSINT communities | Recovering badly redacted text is standard practice | Methodology |
| 11 | PDF / document-standards communities | Interested in correct content-stream handling and draw order | Methodology |
| 12 | Free Law Project ecosystem | Adjacent, complementary, and correctly credited | Comparison section |
| 13 | University law clinics | Students file real documents with real PII | Guide |
| 14 | Records-management associations | Retention and disclosure policy owners | Tool page |
| 15 | Compliance / healthcare privacy resources | Failed redaction of patient data is a breach | Guide |
| 16 | Security-awareness trainers | A concrete, demonstrable failure that lands in training | Tool page |
| 17 | Developer PDF libraries & docs | May link a browser checker next to their own tooling | Methodology |
| 18 | Privacy-tool directories | Browser-only processing is the listing criterion they care about | Tool page |
| 19 | Existing redaction-failure explainers | Already explain the problem; have no verification step to offer | Guide |
| 20 | Accessibility / document-remediation specialists | Handle the same text-layer internals from another angle | Methodology |

### Priority order

Start with **5, 3, 4, 1, 8**: investigative journalism toolkits, court e-filing
guidance, FOI offices, legal-tech writers, infosec newsletters. They have the
sharpest version of the problem, they publish resource lists, and several
already tell people not to use black boxes without offering a way to check.

### What the first message should focus on

The **verification gap**, not the tool. Most of these audiences already know
black boxes are unsafe and already say so. What none of them currently offer is
a way for a reader to check the document in front of them without installing
software. Lead with that gap, cite the scanned-OCR case as evidence the problem
is subtler than it looks, and let the tool be the answer rather than the pitch.
