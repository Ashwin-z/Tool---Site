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

Everything below requires a Name.com login and a provider signup. Neither is
available to the agent working in this repository: there is no Name.com
credential, no mail-provider API key, no MCP integration and no local MTA. The
records are therefore written out for manual entry, and **nothing here should be
treated as done until the verification in step 4 passes**.

Re-verified 2026-09-09 (Batch 7): still no MX, SPF, DKIM or DMARC.

### 1. Provider decision

The requirement is a real mailbox — not forwarding — that can receive at
`hello@toolmint.tools`, send as that address, and support SPF, DKIM and DMARC.

| Option | Cost | Verdict |
|---|---|---|
| **Zoho Mail — free plan** | £0 | **Recommended to unblock.** Real mailbox, 1 custom domain, 5 users, full SPF/DKIM/DMARC. As of 2026 the free tier is **webmail only** — no IMAP/POP/ActiveSync — and availability is tied to specific regions and data centres. |
| Fastmail | ~$60/yr | The upgrade if outreach volume grows or deliverability disappoints. Mature, strong sending reputation, proper apps. |
| Migadu (Micro) | ~$19/yr | Fine, but the Micro tier caps outgoing mail at ~20/day account-wide. |
| Purelymail | ~$10/yr | Cheapest with a real mailbox, but minimal and self-support. |
| Google Workspace | ~$6/user/mo | Overkill here. |
| Name.com forwarding | free/cheap | **No longer sufficient.** Receive-only: you cannot send *as* the address, and it gives you no DKIM. |

**Choose Zoho free.** It clears the actual blocker at zero cost, and the
webmail-only restriction does not matter for this use: the first outreach
destination (RSF) is a **web form**, so the mailbox only has to *receive* the
reply. Revisit Fastmail if and when outreach becomes routine.

### 2. Create the mailbox (owner, manual)

1. Sign up at `zoho.com/mail` → choose the **free plan** → "Add your own domain".
2. Enter `toolmint.tools` and complete domain verification (Zoho will offer a
   TXT or CNAME record — add whichever it gives you; the value is generated for
   your account and cannot be predicted here).
3. Create the mailbox `hello@toolmint.tools` as the first user.
4. **Note which data centre the account was created in.** This determines the
   MX and SPF values below and is the single easiest thing to get wrong.

### 3. Add the DNS records at Name.com

Name.com → Domains → `toolmint.tools` → DNS Records.

**No conflicts exist.** The domain currently has an `A` record
(`158.220.103.173`) and nothing else relevant: no MX, no TXT, no `_dmarc`. None
of the records below collide with the `A` record or with the site's hosting.

#### MX — required to receive

For an account in Zoho's **`.com` (US) data centre**, per Zoho's documentation:

| Type | Host | Answer | Priority | TTL |
|---|---|---|---|---|
| MX | `@` | `mx.zoho.com` | 10 | 3600 |
| MX | `@` | `mx2.zoho.com` | 20 | 3600 |
| MX | `@` | `mx3.zoho.com` | 50 | 3600 |

> **Region trap.** Zoho's own documentation states: *"The TLD for the MX record
> will vary based on the DC in which your data is hosted in Zoho."* If the
> account was created in the EU, India, Australia or Japan data centre, the
> hosts are **not** `.com` — they will be `.eu`, `.in`, `.com.au` or `.jp`.
> **Copy the exact values from Admin Console → Tools & Configurations rather
> than the table above** if the account is not on `.com`. Guessing here means
> mail silently fails.

#### SPF — one record only

| Type | Host | Answer | TTL |
|---|---|---|---|
| TXT | `@` | `v=spf1 include:zoho.com ~all` | 3600 |

Adjust the include to match the data centre if not on `.com`. **Never publish
two SPF records** — that is a permanent error condition and receivers will treat
the domain as unauthenticated. There is currently no SPF record, so this is a
clean add.

#### DKIM — values cannot be written here

DKIM keys are generated per domain by the provider. **There is no correct value
to pre-write, and inventing one would publish a broken record.**

In Zoho: Admin Console → Domains → `toolmint.tools` → Email Configuration →
DKIM → add a selector (Zoho's default is `zoho`) and it generates the key. Then:

| Type | Host | Answer | TTL |
|---|---|---|---|
| TXT | `zoho._domainkey` | *(the long `v=DKIM1; k=rsa; p=…` string Zoho shows)* | 3600 |

Copy it verbatim, including the whole `p=` value. Then click **Verify** in Zoho.

#### DMARC — start in monitor mode

This one is owner-defined rather than provider-specific, so it is exact:

| Type | Host | Answer | TTL |
|---|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@toolmint.tools` | 3600 |

`p=none` observes without rejecting anything. Move to `p=quarantine` after a
couple of weeks of clean reports — not before, or legitimate mail may vanish.

### 4. Verify — DNS first, then actual mail

```bash
node scripts/check-email-dns.mjs
```

It exits non-zero until MX, SPF, DKIM and DMARC are all present, and it
deliberately reports "configured", never "working".

**DNS resolving is not proof of delivery.** Then, and only then:

1. Send a message from an outside account **to** `hello@toolmint.tools`.
   Confirm it arrives in the Zoho mailbox.
2. Reply **from** `hello@toolmint.tools` to that outside account. Confirm it
   arrives and that the From address really is `hello@toolmint.tools`.
3. In the received copy, open "Show original"/"View source" and confirm
   `spf=pass`, `dkim=pass` and `dmarc=pass` in the Authentication-Results header.

### 5. Only then flip the flag

Set `CONTACT.contactWorks = true` in `src/lib/brand.ts`. The "not receiving mail
yet" notice on `/contact` disappears on its own, the addresses become live
`mailto:` links again, and the response-time line returns.

### 6. Then send the RSF message

The message is written and destination-specific: `docs/OUTREACH-REDACTION-CHECKER.md`
§3b. Submit it through the verified form at `training.rsf.org/contact-us/`,
using `hello@toolmint.tools` as the reply address, then set the RSF row in
`docs/OUTREACH-TRACKER.md` to `sent` with the date.

### Sending history

A domain that has never sent mail has no reputation. Do not send a campaign in
one burst. This is the same reason the outreach plan starts with a single
message rather than fifty.

## Note on `ads.txt`

`public/ads.txt` contains `google.com, pub-6047516956320980, DIRECT, ...`.
This is harmless while no ads are served and should stay — it will be needed if
AdSense is eventually approved. It is a public file by design, not a secret.
