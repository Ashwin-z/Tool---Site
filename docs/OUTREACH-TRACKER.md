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

## First move — decided, not yet sent

**Selected: Reporters Without Borders (RSF Resources).** Rationale below; the
message is ready in `docs/OUTREACH-REDACTION-CHECKER.md` §3b.

### Contact paths, as actually verified on 2026-09-09

| Org | Path | Type | Verified how | Status |
|---|---|---|---|---|
| RSF | `resources.rsf.org/contact-us/` → `training.rsf.org/contact-us/` | Web form | Read directly on RSF's own pages. Quote: *"For any inquiry or suggestion, please fill in our contact form."* The form page adds: *"Data entered through the contact form will NEVER be shared or made public."* | **VERIFIED** |
| GIJN | `gijn.org/contact/` (general form), `editorial@gijn.org` (reported) | Form / email | **Not verifiable.** `gijn.org` returns HTTP 403 to every automated request. The address appears only in a third-party search summary, which also describes it as the channel for *contributor article pitches* requiring a bio, CV and work samples — not third-party tool suggestions. | **UNVERIFIED — do not use on this evidence** |

### Why RSF over GIJN

1. **Verified path.** RSF's submission route was read on RSF's own pages and is
   explicitly for "any inquiry or suggestion". GIJN's could not be confirmed
   from GIJN, and an address taken from a search summary is second-hand.
2. **Demonstrated fit.** `resources.rsf.org` already runs an *External
   resources* section linking third-party tools. There is an existing shelf for
   this; nothing new has to be invented for it to belong.
3. **Right channel for the request.** The one GIJN address that surfaced is
   framed for people pitching articles they will write themselves. Using it to
   suggest a tool would be misusing a stated channel — which is exactly the
   behaviour that gets a sender ignored.
4. **Authority is the tiebreak, not the reason.** `rsf.org` measures 773 against
   `gijn.org` 1185, but the catalogue sits on `resources.rsf.org` and subdomain
   authority does not automatically follow the apex. This is a supporting fact,
   not the argument.

**GIJN is not dropped.** It stays Tier 1 and is the natural second move, via the
general contact form at `gijn.org/contact/` — but only after their contact page
has been read by a human, since automated access is blocked.

### Why nothing has been sent

**Status as of 2026-09-09 (Batch 7): still not sent. Do not record otherwise.**

The blocker is not the contact path, and it is no longer the provider decision
either — that is settled (Zoho free; see `docs/DNS-EMAIL.md` §1, with the exact
records in §3). What remains is two manual steps only the domain owner can take:

1. Create the Zoho mailbox for `hello@toolmint.tools` (needs owner signup).
2. Add MX, SPF, DKIM and DMARC at Name.com (needs owner login).

Neither is possible from the repository environment: there is no Name.com
credential, no mail-provider API key, no MCP integration and no local MTA. That
was re-verified this batch, not assumed.

Until those are done, the blocker is the **return address**.

`toolmint.tools` still has no MX record, so `hello@toolmint.tools` bounces. A
form submission to the single highest-value target, carrying a reply address
that silently fails, spends that one opportunity for nothing. The personal
address of the site's operator was deliberately not substituted — that is their
decision to make and not something to disclose to a third party on their behalf.

Send the moment `node scripts/check-email-dns.mjs` exits 0 **and** a real test
message has actually been received and replied to. The message text is already
written and checked: `docs/OUTREACH-REDACTION-CHECKER.md` §3b — 394 words, no
SEO or link framing, direct checker URL, limitations stated.

When it is sent, set the RSF row's outcome to `sent` with the date, and set
reply status to `awaiting response`. **A form confirmation page is not success**
— only an actual reply or a published reference is.

## Tier 1 — send first

**RSF and GIJN are the two co-leads.** `rsf.org` measures 773 and `gijn.org`
1185, both more authoritative than `smallpdf.com` (3397). RSF's apex is the
stronger of the two, but the target catalogue sits on `resources.rsf.org` and
subdomain authority is not guaranteed to follow the apex — so treat them as a
pair rather than a strict ranking, and send to whichever has a findable
editorial contact first.

| Target | Category | URL | Authority | Why relevant | Destination | Pitch | Contact found? | Date sent | Response | Link | Outcome | Follow-up |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Global Investigative Journalism Network | Investigative journalism | `gijn.org/resource/digital-security/` | **1185** | Maintains standing digital-security resource lists; document handling is core to their audience | Checker + methodology | Editorial | Contact page returns 403 to automated access — read it manually before sending | | | | queued (second move) | |
| Freedom of the Press Foundation | Press freedom / security tooling | `freedom.press` | **14701** | Builds Dangerzone, a PDF-sanitising tool — the topic is already theirs; publishes journalist security guides | Checker + methodology | Research | | | | | queued | |
| NoUploadTools | Privacy tool directory | `nouploadtools.com/submit` | lookup failed | Explicit submission path with published review criteria (local processing, offline support, clear API disclosure); PDF category currently lists 6 tools | Checker | Short | Yes — `/submit` form | | | | queued | |
| Reporters Without Borders — resources | Journalism safety | `resources.rsf.org` | **773** (apex) | Catalogue of journalist-safety resources with an existing *External resources* section for third-party tools | Checker + `#methodology` | §3b (RSF-specific) | **Yes — form at `training.rsf.org/contact-us/`** | not sent | | | **selected, blocked on return address** | send when MX resolves |
| Centre for Investigative Journalism | Source protection training | `tcij.org/source-protection-programme/spp/` | **43797** | Runs source-protection training with Freedom of the Press Foundation; failed redaction is a source-exposure risk | Guide | Editorial | | | | | queued | |

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
