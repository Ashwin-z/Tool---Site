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

**Not yet appearing:** `/tools/pdf-redaction-checker` does not surface for
"pdf redaction checker". The page is days old, so this is expected rather than a
problem — but it is the baseline to measure against.

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
