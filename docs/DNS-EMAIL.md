# DNS and email — required manual action

Verified 2026-09-08 against `8.8.8.8`. **Re-verified 2026-09-09 (Batch 6):
state unchanged — still no MX, SPF, DKIM or DMARC.**

Run `node scripts/check-email-dns.mjs` to re-check at any time. It exits
non-zero while outreach must not start.

## Current state

| Record | Status |
|---|---|
| `NS` | `ns1hwy` / `ns2cvx` / `ns3gxy` / `ns4sxy.name.com` — DNS is managed at **Name.com** |
| `A` | `158.220.103.173` |
| **`MX`** | **NONE** |
| **`TXT` (SPF)** | **NONE** |
| **`TXT` `_dmarc`** | **NONE** |

## The problem

`/contact` publishes two addresses:

- `hello@toolmint.tools`
- `partnerships@toolmint.tools`

**Neither can receive mail.** With no MX record, every message sent to them
bounces at the sending server. This has been true for the life of the site, so:

- no user has ever been able to report a broken tool
- no partnership or advertiser enquiry has ever arrived
- any correspondence relating to the three AdSense rejections was undeliverable

This cannot be fixed in code. It requires DNS changes at Name.com.

## What to do

### 1. Choose a mail provider

| Option | Cost | Notes |
|---|---|---|
| **Name.com email forwarding** | free/cheap | Simplest. Forwards `hello@toolmint.tools` to a personal Gmail. Receive-only. **Recommended to unblock immediately.** |
| Zoho Mail | free tier | Real mailbox, can send as `hello@toolmint.tools`. |
| Google Workspace | ~$6/user/mo | Overkill for now. |

Forwarding was enough when the only requirement was that mail *arrives*.

**It is no longer enough.** Batch 5 produced an outreach campaign, and that
changes the requirement in two ways:

1. **You need to send *as* the address, not just receive at it.** Pitching a
   journalist from a personal Gmail while the site lists `hello@toolmint.tools`
   is an inconsistency the recipient will notice, and it undercuts a pitch whose
   whole basis is credibility. Name.com forwarding is receive-only.
2. **You need SPF, DKIM and DMARC, or the mail will be filtered.** A domain with
   no authentication records sending cold mail to newsrooms, law-firm IT
   departments and government FOI offices has close to the worst possible
   deliverability profile — those are precisely the recipients running strict
   filtering. The message will not bounce; it will silently land in spam, which
   is worse, because you will read the absence of replies as disinterest.

For outreach, pick a provider that gives a real mailbox and a DKIM key. Zoho's
free tier does; forwarding does not.

### Sending history

A domain that has never sent mail has no reputation. Do not send the whole
campaign on day one. Send a handful, spaced out, and only expand once replies
are arriving normally. This is the same reason Batch 6 recommends starting with
five targets rather than fifty.

### 2. Add the records at Name.com

Log in → Domains → `toolmint.tools` → DNS Records.

**MX** — exact values come from whichever provider you pick. Do not guess them;
copy them from the provider's setup screen. Shape:

```
Type: MX   Host: @   Answer: <provider mail host>   Priority: 10   TTL: 3600
```

**SPF** — one TXT record only. Never publish two SPF records; that breaks SPF.

```
Type: TXT  Host: @   Answer: v=spf1 include:<provider-spf-domain> ~all
```

**DMARC** — start in monitor mode so nothing is rejected while you verify:

```
Type: TXT  Host: _dmarc   Answer: v=DMARC1; p=none; rua=mailto:hello@toolmint.tools
```

Move to `p=quarantine` after a couple of weeks of clean reports.

**DKIM** — only if the provider issues a key. It will give you an exact host
(e.g. `selector1._domainkey`) and value. Copy verbatim.

### 3. Verify

Allow up to an hour for propagation, then:

```bash
nslookup -type=MX toolmint.tools 8.8.8.8
nslookup -type=TXT toolmint.tools 8.8.8.8
nslookup -type=TXT _dmarc.toolmint.tools 8.8.8.8
```

Or simply run:

```bash
node scripts/check-email-dns.mjs
```

Then send a real message to `hello@toolmint.tools` from an outside account and
confirm it arrives. **DNS records resolving is not proof that mail is delivered** —
only a received test message is. The script deliberately reports "configured",
never "working", for this reason.

Once a test message has actually arrived, set `CONTACT.contactWorks = true` in
`src/lib/brand.ts`. The notice on `/contact` disappears on its own and the
response-time line comes back.

### 4. Then, and only then

Re-apply to AdSense. A publisher site with a non-functioning contact address is
a poor look during a manual review, and it is the cheapest of the outstanding
problems to fix.

## Note on `ads.txt`

`public/ads.txt` contains `google.com, pub-6047516956320980, DIRECT, ...`.
This is harmless while no ads are served and should stay — it will be needed if
AdSense is eventually approved. It is a public file by design, not a secret.
