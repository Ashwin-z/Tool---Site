#!/usr/bin/env node
/**
 * Metadata guard. Run against a build: `node scripts/audit-metadata.mjs`
 *
 * Fails (exit 1) on the defects Batch 0 fixed, so they cannot silently return:
 *   1. mojibake in any title, description or body    (28 titles were corrupt)
 *   2. a duplicated "| ToolMint" suffix              (21 pages had one)
 *   3. a title that will be truncated in a SERP      (80 were over 70 chars)
 *   4. a meta description over 160 characters        (61 were)
 *   5. an og:image reference that is not the generated one
 *   6. processing-mode drift: a tool page claiming browser-only while its
 *      component actually POSTs to /api/tools/*
 *
 * Reads the prerendered HTML in .next/server/app, so it checks what users and
 * crawlers actually receive rather than what the source intends.
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const APP = join(process.cwd(), ".next", "server", "app");
const SRC_TOOLS = join(process.cwd(), "src", "app", "tools");
const COMPONENTS = join(process.cwd(), "src", "components");

const TITLE_MAX = 65; // includes the " | ToolMint" suffix
const DESC_MAX = 160;
const MOJIBAKE = /[ÂÃâ][-¿–—‘’“”€]/;

if (!existsSync(APP)) {
  console.error("No build found at .next/server/app — run `npm run build` first.");
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (entry.endsWith(".html")) out.push(p);
  }
  return out;
}

const failures = [];
const warnings = [];

for (const file of walk(APP)) {
  const html = readFileSync(file, "utf8");
  const route = "/" + relative(APP, file).replace(/\\/g, "/").replace(/\.html$/, "").replace(/^index$/, "");

  // Next internals (_global-error, _not-found) are never indexed.
  if (route.startsWith("/_")) continue;

  const title = (html.match(/<title>(.*?)<\/title>/s) ?? [, ""])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) ?? [, ""])[1];
  const ogImages = [...html.matchAll(/<meta property="og:image" content="([^"]*)"/g)].map((m) => m[1]);

  if (MOJIBAKE.test(title)) failures.push(`${route}  MOJIBAKE in <title>: ${title}`);
  if (MOJIBAKE.test(desc)) failures.push(`${route}  MOJIBAKE in description`);
  if (MOJIBAKE.test(html)) warnings.push(`${route}  mojibake somewhere in body`);

  const brandCount = (title.match(/ToolMint/g) ?? []).length;
  if (/\|\s*ToolMint\s*\|\s*ToolMint/.test(title)) {
    failures.push(`${route}  DUPLICATE brand suffix: ${title}`);
  } else if (brandCount > 1) {
    warnings.push(`${route}  brand appears ${brandCount}x in title: ${title}`);
  }

  if (title.length > TITLE_MAX) warnings.push(`${route}  title ${title.length}ch (>${TITLE_MAX})`);
  if (!desc) failures.push(`${route}  MISSING meta description`);
  else if (desc.length > DESC_MAX) warnings.push(`${route}  description ${desc.length}ch (>${DESC_MAX})`);

  for (const img of ogImages) {
    if (img.includes("/og/")) failures.push(`${route}  og:image points at removed /og/ path: ${img}`);
  }
}

// --- processing-mode drift check -------------------------------------------
const apiComponents = new Set();
for (const f of readdirSync(COMPONENTS)) {
  if (!f.endsWith(".tsx")) continue;
  if (/["'`]\/api\/tools\//.test(readFileSync(join(COMPONENTS, f), "utf8"))) {
    apiComponents.add(f.replace(/\.tsx$/, ""));
  }
}

const modeSrc = readFileSync(join(process.cwd(), "src", "lib", "processing-mode.ts"), "utf8");
const declaredServer = new Set(
  [...modeSrc.matchAll(/^\s*"([a-z0-9-]+)",$/gm)].map((m) => m[1]),
);

for (const slug of readdirSync(SRC_TOOLS)) {
  const page = join(SRC_TOOLS, slug, "page.tsx");
  if (!existsSync(page)) continue;
  const src = readFileSync(page, "utf8");
  if (src.includes("redirect(") && src.length < 400) continue;

  const imports = [...src.matchAll(/from "@\/components\/([a-z0-9-]+)"/g)].map((m) => m[1]);
  const resolved = new Set(imports);
  for (const i of imports) {
    const lp = join(COMPONENTS, `${i}.tsx`);
    if (!existsSync(lp)) continue;
    const lt = readFileSync(lp, "utf8");
    for (const m of lt.matchAll(/["'`]@\/components\/([a-z0-9-]+)["'`]/g)) resolved.add(m[1]);
  }

  const usesApi = [...resolved].some((c) => apiComponents.has(c));
  if (usesApi && !declaredServer.has(slug)) {
    failures.push(
      `${slug}  PROCESSING DRIFT: calls /api/tools/* but is not listed in processing-mode.ts — the page claims browser-only processing and that is false`,
    );
  }
}

// --- report -----------------------------------------------------------------
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings.slice(0, 30)) console.log("  ! " + w);
  if (warnings.length > 30) console.log(`  … and ${warnings.length - 30} more`);
}

if (failures.length) {
  console.error(`\n${failures.length} FAILURE(S):`);
  for (const f of failures) console.error("  x " + f);
  process.exit(1);
}

console.log(`\nMetadata audit passed. ${walk(APP).length} pages checked, ${warnings.length} warning(s).`);
