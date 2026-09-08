#!/usr/bin/env node
/**
 * Guards the locally vendored pdf.js against version drift.
 *
 * pdf.js refuses to run when the library and worker versions differ
 * ("The API version does not match the Worker version"), so a silent
 * mismatch would break every PDF tool at runtime while the build stayed
 * green. This fails the build instead.
 *
 * Also fails if any source file loads a PDF worker from a third-party CDN —
 * merge-pdf and split-pdf both did until Batch 1B.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const VENDOR = join(ROOT, "public", "vendor", "pdfjs");
const failures = [];

function versionsIn(file, limit = 400_000) {
  if (!existsSync(file)) {
    failures.push(`missing vendored file: ${relative(ROOT, file)}`);
    return [];
  }
  const text = readFileSync(file, "utf8").slice(0, limit);
  return [...new Set([...text.matchAll(/\b(\d+\.\d+\.\d+)\b/g)].map((m) => m[1]))];
}

// --- 1. installed pdfjs-dist version -----------------------------------
const installed = JSON.parse(
  readFileSync(join(ROOT, "node_modules", "pdfjs-dist", "package.json"), "utf8"),
).version;

// --- 2. vendored library + worker --------------------------------------
const libVersions = versionsIn(join(VENDOR, "pdf.mjs"));
const workerVersions = versionsIn(join(VENDOR, "pdf.worker.min.mjs"));

if (!libVersions.includes(installed)) {
  failures.push(
    `vendored pdf.mjs does not report ${installed} (found: ${libVersions.slice(0, 3).join(", ") || "none"})`,
  );
}
if (!workerVersions.includes(installed)) {
  failures.push(
    `vendored pdf.worker.min.mjs does not report ${installed} (found: ${workerVersions.slice(0, 3).join(", ") || "none"})`,
  );
}

// --- 3. the loader must declare the same version ------------------------
const loader = readFileSync(join(ROOT, "src", "lib", "pdfjs-loader.ts"), "utf8");
const declared = loader.match(/PDFJS_VERSION\s*=\s*"([\d.]+)"/)?.[1];
if (declared !== installed) {
  failures.push(`src/lib/pdfjs-loader.ts declares ${declared}, but pdfjs-dist is ${installed}`);
}

// --- 4. no third-party PDF worker anywhere in src -----------------------
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx|js|mjs)$/.test(entry)) out.push(p);
  }
  return out;
}

const CDN = /(unpkg\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|jsdelivr\.net)/;
for (const file of walk(join(ROOT, "src"))) {
  const text = readFileSync(file, "utf8");
  for (const [i, line] of text.split("\n").entries()) {
    const trimmed = line.trim();
    // Comments may legitimately mention a CDN (e.g. explaining why we left one).
    if (trimmed.startsWith("*") || trimmed.startsWith("//") || trimmed.startsWith("/*")) continue;
    if (!CDN.test(line)) continue;
    // Pyodide is a documented, separate exception — see python-code-editor.
    if (/pyodide/i.test(line)) continue;
    failures.push(`${relative(ROOT, file)}:${i + 1} loads a runtime asset from a CDN: ${line.trim().slice(0, 90)}`);
  }
}

if (failures.length) {
  console.error(`\npdf.js version/vendoring check FAILED (${failures.length}):`);
  for (const f of failures) console.error("  x " + f);
  process.exit(1);
}

console.log(`pdf.js check passed — library, worker and loader all on ${installed}; no CDN runtime assets in src.`);
