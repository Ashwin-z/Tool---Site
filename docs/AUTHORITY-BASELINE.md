# External authority baseline — 2026-09-09 (Batch 6)

Recorded **before** any outreach, so later change can be attributed. Every value
is either measured or explicitly marked unavailable. Nothing here is estimated.

## What could not be measured, and why

| Signal | Status | Reason |
|---|---|---|
| Backlink count | **unavailable** | No Moz or DataForSEO credentials |
| Referring domains | **unavailable** | Same |
| Search impressions / clicks / position | **unavailable** | Search Console not connected |
| Indexed page count | **unavailable** | Requires Search Console; `site:` operators are unreliable via the search tool |
| Organic sessions | **unavailable** | GA4 has no measurement ID — analytics is inert |
| Core Web Vitals field data | **unavailable** | CrUX needs an API key |

These are not gaps to be filled with estimates. They are the reason the
measurement plan below leans on Common Crawl and manual SERP checks, which are
free and reproducible.

## Common Crawl web graph — `cc-main-2026-jan-feb-mar`

Harmonic-centrality rank; lower is more authoritative.

| Domain | In crawl | In rankings | Harmonic rank |
|---|---|---|---|
| **toolmint.tools** | **no** | **no** | **not in graph** |
| justice.gov | yes | yes | 262 |
| archives.gov | yes | yes | 394 |
| rsf.org | yes | yes | 773 |
| gijn.org | yes | yes | 1,185 |
| uscourts.gov | yes | yes | 2,804 |
| freedom.press | yes | yes | 14,701 |
| tcij.org | yes | yes | 43,797 |
| journaliststoolbox.org | yes | yes | 476,082 |
| nouploadtools.com | lookup failed | — | — |
| smallpdf.com | yes | yes | 3,397 |
| ilovepdf.com | yes | yes | 4,144 |
| textfixer.com | yes | yes | 13,277 |
| free.law | yes | yes | 33,043 |
| redactable.com | yes | yes | 248,125 |
| lazytools.io | no | no | not in graph |
| redactr.io | no | no | not in graph |

Two caveats on reading this table. Authority was measured on the **apex
domain**, but some target pages live on subdomains (`resources.rsf.org`), and
harmonic rank does not necessarily transfer to a subdomain. And the three most
authoritative domains here — `justice.gov`, `archives.gov`, `uscourts.gov` — are
the ones *least* likely to link out, which is exactly why authority alone is a
bad way to order outreach.

**The headline number is that toolmint.tools is still absent entirely.** This is
the single metric this whole effort exists to change. The success condition for
the next release is not a rank — it is *appearing at all*.

Re-check with:

```bash
python ~/.claude/plugins/.../scripts/commoncrawl_graph.py toolmint.tools --json
```

## Indexation — manual SERP observation

Checked 2026-09-09 by searching for the brand and for category terms.

**Indexed and appearing:** `toolmint.tools/`, `/tools`, `/tools/pdf-tools`,
`/tools/redact-pdf`.

**Not appearing:** `/tools/pdf-redaction-checker` and
`/blog/how-to-tell-if-pdf-redaction-failed`.

> **Correction (Batch 8).** An earlier version of this file attributed that
> absence to the pages being new, and called it "expected rather than a
> problem". That was wrong. Both URLs return **HTTP 404 on live production** —
> they were never deployed. A search engine cannot index a page that does not
> exist. The cause is the deployment gap documented in `docs/DEPLOYMENT.md`,
> not crawl latency, and no amount of SEO work changes it.

This also invalidates any conclusion about the checker's ranking potential
drawn before deployment: the experiment has not actually been run yet.

## Brand and entity confusion — worse, not better

Batch 3 found two sites using the identical name and positioning. A brand search
now returns a **third**:

| Domain | Relationship |
|---|---|
| `toolmint.app` | Same name, same "privacy-first" positioning |
| `toolmint.online` | Same name, same positioning |
| `toolsmint.com` | Near-identical name, also publishes a PDF redaction tool |

A search engine summary for a ToolMint query described features that are **not
ours** — a "privacy-first online toolkit for PDFs, images, videos and files"
with a "smart scan" for SSNs and API keys. That is a competitor's product being
attributed to this domain.

This is why the checker matters as an entity signal: it is the one thing on
`toolmint.tools` that none of the name-collision sites has, and it is the
strongest available lever for making the entity distinguishable.

## Competitive movement since Batch 4

- `pdfxray.fly.dev` is resolving again. It failed DNS entirely during Batch 4
  research and was recorded as dead; that was accurate then and is not now.
- `redactvault.com` claims to detect **prior document revisions**. This checker
  explicitly does not, and says so under limitations. It is a real capability
  difference, not a marketing one, and should not be glossed over if a comparison
  ever comes up.
- `nutrient.io` has published a redaction-verification article — commercial PDF
  SDK vendors are entering the topic.

## SERP forensics — 2026-09-09 (Batch 8)

Observed by running each query and reading the result set. **Positions are not
recorded**: the search tool returns a result set, not ranked positions, and
inventing them would be worse than omitting them. No search volume is given
anywhere below — none is available without paid credentials.

| Query | Dominant intent | What actually ranks | ToolMint | Attackable? |
|---|---|---|---|---|
| `pdf redaction checker` | Transactional — do the task now | **6 of 6 results are tools.** textfixer, pdfxray, lazytools, tamperlens, redactvault, redactifyai. No articles, no major vendor. | Absent (404) | **Yes — best target** |
| `verify redacted pdf` | Mixed tool + reference | Tools, plus `nutrient.io` (SDK vendor article) and a **Cornell University IT knowledge-base page** | Absent | **Yes** |
| `failed pdf redaction` | Informational | **ABA judges' journal PDF**, a court e-filing help-desk article, Argelius Labs research, vendor blogs | Absent | Moderate |
| `hidden text in pdf` | **Mismatched** | Adobe community forums, Smallpdf *"Invisible Text in PDFs: What It Is and How to **Add** It"*, UPDF/Wondershare *"How to **Hide** Text in PDF"* | Absent | **No — wrong intent** |
| `redact pdf online` | Transactional, vendor-owned | Xodo, Smallpdf, PDF24, PDF4me, pdfFiller, Evernote, PDFAid | Absent | No — authority-gated |

### The one keyword finding that changes a decision

**`hidden text in pdf` is the wrong target and should be dropped.** Its SERP is
people trying to *add* invisible text, hide text deliberately, or troubleshoot an
OCR layer — not people checking whether a redaction failed. It currently appears
in the checker page's `keywords` array and is echoed in the supporting post's
framing. The nearest queries with matching intent are `verify redacted pdf` and
`failed pdf redaction`.

This is recorded, not implemented. It is a two-line change and belongs in the
next SEO wave, not in a deployment/outreach batch.

### Smallest set of meaningful SEO actions

Deliberately not "write more content" — the cluster already covers the intent.

1. **Deploy.** Everything below is theoretical until the pages return 200.
2. **Retarget `hidden text in pdf`** to `verify redacted pdf` / `failed pdf
   redaction` on the checker page and the supporting post.
3. **Nothing else.** `pdf redaction checker` is a pure tool SERP with no large
   incumbent and no article competition. The existing page is the right shape
   for it. The constraint is publication and references, not content volume.

## Authority learning — what earns references here

Observed from who actually appears across these SERPs, not assumed.

**Page types that earn citations in this niche:**

- **Open-source tooling with published method.** Free Law Project's `x-ray`
  reached Hacker News and is cited by others' research. It is a library, not a
  web tool.
- **Original research with a taxonomy.** Argelius Labs' redaction-failure
  research is cited precisely because it enumerates failure modes and names real
  cases.
- **Professional-body writing.** The ABA judges' journal article on redaction
  failures ranks for the informational query — bar associations publish here.
- **Knowledge-base pages.** Two appeared that had not been identified before: a
  **Cornell University IT knowledge base** article and **Qoppa's PDF Studio KB**
  on checking whether a document is redacted correctly. Vendor and university
  KBs rank for verification intent and are a genuine citation destination type.

**Who cites this material:** bar associations and legal-tech writers, university
IT and law-clinic pages, court e-filing help desks, security researchers, and PDF
software vendors documenting their own tooling.

**Does the checker have plausible destinations beyond RSF?** Yes — but the
strongest are not more journalism organisations. On this evidence the next
categories to consider, after the RSF result is known, are:

1. **Security research / PDF tooling communities** — Argelius already cites
   x-ray, so the citation behaviour is demonstrated.
2. **University IT and law-clinic knowledge bases** — they already publish
   "check your redaction" guidance and do link to external tools.
3. **Legal-tech writers and bar-association publications** — the ABA result
   shows this audience publishes on the topic.

Journalism organisations remain a good fit for the *audience*, but the observed
citation behaviour in this niche is strongest among technical and legal-reference
publishers. **No list is being built from this yet** — the point is to learn from
the first move before scaling, and the first move has not been made.

## Measurement plan

| When | Check | Where |
|---|---|---|
| 7 days | Replies received; bounce or spam reports | Mail client |
| 14 days | Any reference published; checker page appearing for brand terms | Manual SERP |
| 30 days | `/tools/pdf-redaction-checker` ranking for "pdf redaction checker" | Manual SERP |
| 60 days | Referring domains, if credentials exist by then | Moz/DataForSEO |
| 90 days | **Common Crawl: does `toolmint.tools` appear in the graph?** | `commoncrawl_graph.py` |

Common Crawl releases quarterly, so the 90-day check is the first point at which
a new link could realistically show up there. Do not expect ranking movement from
the first few links; the objective at this stage is existence in the graph, not
position.

## What would count as success

Three to five references from relevant organisations that chose to link because
the resource was useful. Not directory listings, not reciprocal links, and not a
larger number of lower-quality mentions.
