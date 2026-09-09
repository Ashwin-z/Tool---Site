# ToolMint deployment

Last verified: 2026-09-08 (Batch 0).

## PRODUCTION IS 14 COMMITS BEHIND — nothing since Batch 0 is live

**Measured 2026-09-09 against `https://toolmint.tools` (Batch 8).**

Every batch from 0 to 7 exists only in this repository. The live site is still
serving the pre-Batch-0 baseline (`ad63b06`, deployed 2026-05-17).

| Evidence | Live production | This repo |
|---|---|---|
| `/tools/pdf-redaction-checker` | **HTTP 404** | exists, tested |
| `/blog/how-to-tell-if-pdf-redaction-failed` | **HTTP 404** | exists, tested |
| Retired tools (`word-to-pdf`, `excel-to-pdf`, `pdf-to-pdfa`) | HTTP 200 — still listed | 410, retired in Batch 1C |
| `/contact` | 1 live `mailto:` + "within 1-2 business days" | no live mailto, no promise |
| `/about` | says "privacy-first", no operator section | differentiated, operator section |
| Homepage tool count | "80+ tools" / "82 tools" | derived count, 77 |
| `/api/health` | **HTTP 404** (renders the HTML 404 page) | 200, JSON health endpoint (Batch 0) |
| Sitemap URLs | 179 | 176 |
| Processing badge on tool pages | absent | present |

### Why this matters more than any SEO or outreach work

1. **The linkable asset does not exist publicly.** The Redaction Checker is a
   404. Outreach pointing a journalist at it would have sent them to an error
   page — far worse than never writing.
2. **The live contact page is making a false promise right now.** It offers a
   working `mailto:` and a 1–2 business day response on a mailbox with no MX
   record. Batches 5 and 7 fixed this in the repo; the fix was never shipped.
3. **The browser-side PDF rebuild is not live.** The server-dependent tools that
   caused the original commercial failure are still the ones being served.
4. **Every "it isn't ranking" measurement was measuring a page that isn't
   published.** See the correction in `docs/AUTHORITY-BASELINE.md`.

### The immediate blocker: no remote, and the repo cannot create one

**Verified 2026-09-09 (Batch 9).**

`git remote -v` is empty. The deploy procedure below says
`git pull  # once a remote exists` — it still does not exist, so the production
server has no way to fetch these commits.

#### What this environment can and cannot do

| Capability | State |
|---|---|
| GitHub SSH authentication | **works** — authenticates as `neuraventis` via `~/.ssh/id_ed25519_neuraventis` |
| Create a GitHub repository | **not possible** — needs the API (no token present) or the web UI |
| `gh` CLI | not installed |
| SSH to production (`158.220.103.173:22`) | **closed/filtered** |
| RDP to production (`:3389`) | open, but needs interactive Administrator login |
| Direct app port (`:3001`) | closed externally — correct, it sits behind Caddy |

GitHub does **not** auto-create a repository on push, so working SSH auth is not
enough on its own. Two decisions are also the owner's, not the agent's: which
account or organisation ToolMint should live under (the authenticated identity
is `neuraventis`, a different business), and whether to grant deploy access.

#### Step 1 — owner action, roughly two minutes

Create an **empty private** repository. Do not initialise it with a README,
.gitignore or licence — the history already exists and an initial commit would
force a merge.

- Web UI: <https://github.com/new> → Private → **no** initialisation files.
- Or with a token: `gh repo create <owner>/toolmint --private`

#### Step 2 — then this repo can be pushed

> **The placeholder trap — this actually happened.** In Batch 11 the remote had
> been configured as literally `git@github.com:<OWNER>/toolmint.git`. The
> template below was pasted without substituting the account name. GitHub
> rejects it with *"is not a valid repository name"*, so nothing could ever be
> pushed — but `git remote -v` showed an origin, which made the blocker look
> cleared and cost a batch. **Substitute the owner before running this.**

```bash
cd C:/Users/Ashwin/Documents/tool-site

OWNER=your-github-account            # <-- set this to the real account first
case "$OWNER" in *your-github-account*|*'<'*) echo "STOP: set OWNER first"; exit 1;; esac

git remote add origin "git@github.com:$OWNER/toolmint.git"
git ls-remote origin >/dev/null && echo "remote reachable"   # fails loudly if wrong
git push -u origin master            # all 17 commits, no rewrite, no squash
```

Then confirm with:

```bash
node scripts/check-deploy-ready.mjs
```

It validates that the remote has no unsubstituted placeholder, is actually
reachable, that the target commit is pushed, that the rollback baseline exists,
and that no real `.env` is tracked. It exits non-zero while deployment cannot
proceed, so a deploy should never be claimed while it fails.

Do not force-push. The history is linear and does not need rewriting.

#### Step 3 — point production at the remote

Production has no SSH access from here, so this runs on the server over RDP:

```powershell
cd C:\Users\Administrator\Documents\ToolMint.tools\Tool---Site\Tool---Site\tool-site

# one-off: back up the current live state before anything changes
Copy-Item .next ..\next-backup-ad63b06 -Recurse
Copy-Item .env.production ..\env-backup.production   # if it exists

git init                       # if the deploy dir is not already a repo
git remote add origin git@github.com:<owner>/toolmint.git
git fetch origin
git checkout -f e3c2fc1        # the intended release, not master
```

#### Step 4 — build and restart

```powershell
npm ci
npm run build
node scripts/audit-metadata.mjs   # abort if this fails
pm2 restart tool-site
pm2 save
```

`.env.example` is now tracked (it was previously excluded by the `.env*` rule,
which meant a fresh clone had no template to copy). Copy it to `.env.production`
and fill in values — everything in it is empty except `NODE_ENV` and `PORT`.

#### Step 5 — verify the gap actually closed

```bash
for u in /tools/pdf-redaction-checker /blog/how-to-tell-if-pdf-redaction-failed; do
  curl -s -o /dev/null -w "$u %{http_code}\n" https://toolmint.tools$u   # expect 200
done
for u in /tools/word-to-pdf /tools/excel-to-pdf /tools/powerpoint-to-pdf /tools/pdf-to-pdfa; do
  curl -s -o /dev/null -w "$u %{http_code}\n" https://toolmint.tools$u   # expect 410
done
curl -s https://toolmint.tools/api/health          # expect JSON, not HTML
curl -s https://toolmint.tools/contact | grep -c 'href="mailto:'   # expect 0
```

Until step 1 happens, no other work on this project can reach a user.

### Rollback — verified 2026-09-09

The mechanism was tested this batch with a throwaway git worktree, without
touching production: `ad63b06` checks out cleanly and yields a complete tree
(its registry contains 82 tool slugs, which matches the "82 tools" copy still
being served live — independent confirmation that production is that commit).

`git fsck` is clean and all 16 commits are intact.

To restore the baseline on the server:

```powershell
cd C:\Users\Administrator\Documents\ToolMint.tools\Tool---Site\Tool---Site\tool-site
git checkout -f ad63b06
npm ci
npm run build
pm2 restart tool-site
```

Faster, if the pre-deploy backup from step 3 exists: stop PM2, restore
`..\next-backup-ad63b06` over `.next`, restart. PM2 keeps the old process alive
until the restart, so downtime is a few seconds either way.

**Must be preserved across any rollback:** `.env.production` (not in git),
the Caddy configuration (not in this repo), and the PM2 process registration
(`pm2 save`).

## Source of truth

**`C:\Users\Ashwin\Documents\tool-site` is the production source.**

Verified by comparing this repo's `.next/server/app/*.html` prerender output
against live `https://toolmint.tools` HTML across five pages (`/`,
`/tools/pdf-tools`, `/tools/merge-pdf`, a blog post, `/about`). The `<main>`
content matched byte-for-byte on all five.

This directory is now a git repository. Commit `ad63b06` is the untouched
production baseline as deployed on 2026-05-17 — roll back to it with
`git checkout ad63b06` if a Batch 0 change causes a problem.

### Stale copies — do not edit these

| Path | State |
|---|---|
| `Documents\tool-mint.tools\tool-site` | April 2026. **0 blog posts.** Not production. |
| `Documents\Tool Site\tool-site` | 2026-05-17 02:35, ~45 min older than production. Build from 2026-05-04. |
| `Documents\backup of tool site\tool-site` | March 2026. 16 tools only. |
| `Documents\tools site tester\tool tester` | March 2026. 60 tools. |

Recommendation: archive all four to a single `_archive` folder so nobody
edits the wrong one, and push this repo to a private GitHub remote.

## Production environment

| Item | Value | How it was determined |
|---|---|---|
| Host IP | `158.220.103.173` | DNS A record |
| OS | Windows Server | `ecosystem.config.js` path + `process.platform` guard returning 500 not 501 |
| Deploy path | `C:/Users/Administrator/Documents/ToolMint.tools/Tool---Site/Tool---Site/tool-site` | `ecosystem.config.js` |
| Process manager | PM2, app name `tool-site` | `ecosystem.config.js` |
| App port | `3001` | `ecosystem.config.js` |
| Reverse proxy | Caddy | `Via: 1.1 Caddy` response header |
| Runtime | Node.js, Next.js 16.1.6 | `package.json`, `X-Nextjs-*` headers |
| Node version on prod | **UNVERIFIED** | no shell access from the audit machine |
| Caddyfile location | **UNVERIFIED** | not in this repo — likely `C:\Caddy\Caddyfile` or a service dir |

> The audit machine has no access to the production host, so everything below
> the line "commands to run on the server" is derived from config files in this
> repo rather than observed. Verify on first deploy.

## Build

```powershell
npm ci                 # exact versions from package-lock.json
npm run build          # node --max-old-space-size=8192 next build --webpack
node scripts/audit-metadata.mjs   # fails on mojibake / duplicate brand / dead OG refs
```

The build needs ~8 GB of heap headroom and takes 60–90 s. `experimental.cpus: 1`
in `next.config.ts` keeps memory down at the cost of build speed — leave it.

## Deploy (run on the production server)

```powershell
cd C:\Users\Administrator\Documents\ToolMint.tools\Tool---Site\Tool---Site\tool-site

git pull                          # once a remote exists
npm ci
npm run build
node scripts/audit-metadata.mjs   # abort the deploy if this fails
pm2 restart tool-site
pm2 save
```

## Environment variables

Copy `.env.example` to `.env.production` on the server. Nothing in it is secret
except `ERROR_WEBHOOK_URL` and `HEALTH_CHECK_KEY`; `.env*` is gitignored.

**`NEXT_PUBLIC_GA_MEASUREMENT_ID` is inlined at build time**, so setting it
requires a rebuild, not just a restart.

## Verify a deploy

```powershell
curl -I  https://toolmint.tools/
curl -s  https://toolmint.tools/api/health | ConvertFrom-Json
curl -s  https://toolmint.tools/sitemap.xml | Select-String "<loc>" | Measure-Object
```

Expected: `200`, health `status: ok`, 178 sitemap URLs.

## Rollback

```powershell
git log --oneline -10
git checkout <previous-commit>
npm ci && npm run build
pm2 restart tool-site
```

PM2 keeps the old process alive until the restart, so downtime is a few seconds.

## Logs

```powershell
pm2 logs tool-site --lines 200
pm2 status
```

`ecosystem.config.js` sets `max_restarts: 5`. If a bad build crash-loops, PM2
gives up after five attempts and the site stays down — always check
`pm2 status` after deploying.

## Known production gaps

1. **No CI.** Nothing runs the build or the metadata audit before deploy.
2. **No uptime monitoring** until a monitor is pointed at `/api/health`.
3. **Ghostscript and pdfcpu are missing on the production host** (confirmed:
   `/api/health` reports `available: false`; both are present on the developer
   machine, which is why this was never noticed locally).
4. **Microsoft Office COM automation** is used by `word-to-pdf`,
   `excel-to-pdf` and `powerpoint-to-pdf`. Microsoft does not support Office
   automation from a server-side service. These need re-architecting, not
   repairing. See `src/lib/tool-status.ts`.
