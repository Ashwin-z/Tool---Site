# DNS and email — required manual action

Verified 2026-09-08 against `8.8.8.8`.

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

Forwarding is enough today — the requirement is that mail *arrives*.

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

Then send a real message to `hello@toolmint.tools` from an outside account and
confirm it arrives. **DNS records resolving is not proof that mail is delivered** —
only a received test message is.

### 4. Then, and only then

Re-apply to AdSense. A publisher site with a non-functioning contact address is
a poor look during a manual review, and it is the cheapest of the outstanding
problems to fix.

## Note on `ads.txt`

`public/ads.txt` contains `google.com, pub-6047516956320980, DIRECT, ...`.
This is harmless while no ads are served and should stay — it will be needed if
AdSense is eventually approved. It is a public file by design, not a secret.
