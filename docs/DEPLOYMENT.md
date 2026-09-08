# ToolMint deployment

Last verified: 2026-09-08 (Batch 0).

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
