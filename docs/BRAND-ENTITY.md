# ToolMint brand & entity — Batch 3

## The problem

Three live sites share the name. Two also share the positioning:

| Domain | Title | Scale | In Common Crawl graph |
|---|---|---|---|
| **toolmint.tools** (this site) | ToolMint | 174 URLs, 77 tools | **no** |
| toolmint.online | "ToolMint \| Privacy-First Utility Hub" | 1,308 URLs (1,261 programmatic) | no |
| toolmint.app | "ToolMint — ... \| Privacy-First" | 37 URLs | no |

Plus gettoolmint.com and toolmint.co (AI tooling — different category, same name).

A search engine asked about `toolmint.tools` returned features belonging to the
others: "9 languages", "WebAssembly and Web Workers", "pay per use". None are ours.

**Stated carefully:** this is an entity/discoverability risk. It is *not*
established that it is causing ranking loss — there is no Search Console data
to test that against.

## The decision: keep the domain, sharpen the identity

No domain migration. `toolmint.tools` keeps every URL and whatever equity exists.
What changed is how consistently and distinctively the site describes itself.

### We deliberately do not say "privacy-first"

Both name-collision competitors lead with that exact phrase, so it identifies
the category rather than us. ToolMint states the concrete, checkable behaviour
instead: **the file is never uploaded, and you can confirm it in the Network tab.**

### One source of truth

`src/lib/brand.ts` now holds the name, alternate name, tagline, descriptions,
contact addresses and the schema builders. Previously the identity was retyped
across `layout.tsx`, `page.tsx`, `about/page.tsx`, `manifest.ts` and `tools/page.tsx`.

**The tool count is derived from the registry.** Eight places claimed "80+"; after
Batch 1C retired four tools the real number is **77**. That drift is now impossible.

### Schema

`Organization` and `WebSite` gained `@id`, `alternateName` ("ToolMint PDF Tools"),
a real `description` naming the domain, and a structured `logo`. `WebSite` links
to the Organization via `publisher`.

**`sameAs` is deliberately absent.** There are no verified external profiles, and
inventing them would be fabricating entity signals.

### About

Added a "Which ToolMint is this?" section that names the collision honestly,
does not disparage anyone, anchors identity to the domain, and points at a check
the reader can run.

## Still outstanding

**Contact addresses still bounce.** `toolmint.tools` has no MX record — verified
again in Batch 3. `CONTACT.contactWorks` is `false` in `brand.ts`; flip it only
once a test message has actually been received. See `docs/DNS-EMAIL.md`.

**No external mentions exist.** The domain is absent from the Common Crawl link
graph entirely. Entity recognition needs real third-party references, which no
on-page change can manufacture.

## Legitimate next steps

1. Configure DNS/mail so the published addresses work.
2. Earn genuine external references. The strongest candidate remains a tool
   people cite rather than an article: a redaction-safety checker that tells
   someone whether their existing "redacted" PDF still has recoverable text.
3. Once any real profile exists, add it to `sameAs` — and not before.
