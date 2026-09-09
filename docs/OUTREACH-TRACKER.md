# Outreach tracker — PDF Redaction Checker

One row per target. Update it by hand as things happen; there is no automation
here by design.

> **Nothing has been sent.** Outreach is blocked until `toolmint.tools` can
> receive mail — run `node scripts/check-email-dns.mjs`. Sending before then
> means a reply from a journalist bounces, which is worse than not writing.

**Authority** is Common Crawl harmonic-centrality rank (lower = more
authoritative), release `cc-main-2026-jan-feb-mar`. For scale: `smallpdf.com`
is 3,397 and `ilovepdf.com` is 4,144. `toolmint.tools` is **not in the graph**.

**Contact** is deliberately blank. Find the real contact on each organisation's
own site at the time of sending. Do not guess an address, and do not reuse a
pattern from another organisation.

---

## Status legend

`queued` → `sent` → `replied` / `no-reply` → `linked` / `declined` / `closed`

---

## Tier 1 — send first

| Target | Category | URL | Authority | Why relevant | Destination | Pitch | Contact found? | Date sent | Response | Link | Outcome | Follow-up |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Global Investigative Journalism Network | Investigative journalism | `gijn.org/resource/digital-security/` | **1185** | Maintains standing digital-security resource lists for investigative journalists worldwide; document handling is core to their audience | Checker + methodology | Editorial | | | | | queued | |
| Freedom of the Press Foundation | Press freedom / security tooling | `freedom.press` | **14701** | Builds Dangerzone, a PDF-sanitising tool — the topic is already theirs; publishes journalist security guides | Checker + methodology | Research | | | | | queued | |
| NoUploadTools | Privacy tool directory | `nouploadtools.com/submit` | not in graph | Explicit submission path with published review criteria (local processing, offline support, clear API disclosure); PDF category currently lists 6 tools | Checker | Short | Yes — `/submit` form | | | | queued | |
| Reporters Without Borders — resources | Journalism safety | `resources.rsf.org` | pending | Maintains a catalogue of digital-safety self-training resources | Guide + checker | Editorial | | | | | queued | |
| Centre for Investigative Journalism | Source protection training | `tcij.org/source-protection-programme/spp/` | pending | Runs source-protection training with Freedom of the Press Foundation; failed redaction is a source-exposure risk | Guide | Editorial | | | | | queued | |

## Tier 2 — good targets, send after Tier 1 feedback

| Target | Category | URL | Authority | Why relevant | Destination | Pitch | Contact found? | Date sent | Response | Link | Outcome | Follow-up |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SPJ Journalist's Toolbox | Journalism tool directory | `journaliststoolbox.org` | 476082 | Explicitly a curated toolbox; low authority but high topical fit and link-oriented by design | Checker | Short | | | | | queued | |
| Argelius Labs | Security research | `argeliuslabs.com` | pending | Published deep research on PDF redaction failures; already cites x-ray | Methodology | Research | | | | | queued | |
| Digital forensics practitioner blogs | Forensics | various | varies | They recover badly redacted text professionally; methodology is the draw | Methodology | Research | | | | | queued | |
| OSINT community resources | OSINT | various | varies | Recovering redacted text is standard practice; a checker is the defensive mirror | Methodology | Short | | | | | queued | |
| Records-management associations | Records management | various | varies | Own retention and disclosure policy | Guide | Editorial | | | | | queued | |

## Tier 3 — longer-term, low link probability but high relevance

These are worth knowing about, and worth a message if a natural opening appears,
but **US federal `.gov` sites very rarely link to third-party commercial tools**.
Treat a link here as a bonus, not a target, and do not spend early effort on them.

| Target | Category | URL | Why relevant | Realistic outcome |
|---|---|---|---|---|
| US Courts — privacy policy for electronic case files | Court e-filing | `uscourts.gov/privacy-policy-electronic-case-files` | Defines the redaction duty that filers must meet | Unlikely to link; useful as citation context |
| Central District of California — document redaction | Court e-filing | `cacd.uscourts.gov/e-filing/document-redaction-and-transcripts` | Already warns filers about redaction | Unlikely to link |
| Northern District of California — redaction of information | Court e-filing | `cand.uscourts.gov/cases-e-filing/cm-ecf/preparing-my-filing/redaction-of-information/` | Same | Unlikely to link |
| DOJ Office of Information Policy — FOIA training | FOI | `justice.gov/oip/training` | Trains federal FOIA staff on redaction | Unlikely to link |
| National Archives OGIS | FOI oversight | `archives.gov/ogis` | Publishes redaction best practice | Unlikely to link |
| University law clinics | Legal education | various | Students file real documents containing real PII | Possible, via individual faculty |

---

## Notes on directories

Only submit to directories that **manually review** and publish their criteria.
NoUploadTools qualifies. Several similar sites surfaced during research
(`browserbasedtools.com`, `goodwebtools.com`, `uploadless.app`,
`privacytool.app`, `privacy-kit.net`) and were **not** added: they appear to be
the same low-quality directory pattern as the ToolMint-name competitors found in
Batch 3, and links from them are worth little and carry association risk. Revisit
only with evidence of genuine editorial review.

## What counts as success

Not "emails sent". A row reaches `linked` only when a third party has chosen to
reference ToolMint because the resource was useful to their readers. Five
genuine references from relevant organisations would be a better outcome than
fifty from directories.
