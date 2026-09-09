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
| `/api/health` | returns HTML | JSON health endpoint (Batch 0) |
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

### The immediate blocker: there is no git remote

`git remote -v` returns nothing. The deploy procedure below says
`git pull  # once a remote exists` — it still does not. The production server
therefore has no way to fetch these 14 commits.

**Required, in order:**

1. Create a private remote (GitHub/GitLab) and `git push` this repository.
2. On the production host, point the deploy directory at that remote.
3. Run the deploy procedure below.
4. Re-run the verification block, then re-check the live URLs in the table above.

Until step 1 happens, no other work on this project can reach a user.

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
