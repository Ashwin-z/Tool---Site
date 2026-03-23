/**
 * Bulk replacement script to migrate hardcoded dark-theme colors to CSS variable-based Tailwind classes.
 * Run: node scripts/theme-migrate.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, basename } from "node:path";

const COMPONENTS_DIR = join(import.meta.dirname, "..", "src", "components");
const TOOLS_DIR = join(import.meta.dirname, "..", "src", "app", "tools");

// Files to skip (already themed or no colors)
const SKIP_COMPONENTS = new Set([
  "theme-context.tsx",
  "site-header.tsx",
  "site-nav.tsx",
  "site-footer.tsx",
  "popular-tools.tsx",
  "nav-shell-context.tsx",
  "domain-availability-tool.tsx",
  "invoice-generator-tool.tsx",
  "quotation-generator-tool.tsx",
]);

const SKIP_ROUTE_DIRS = new Set([
  "domain-availability",
  "invoice-generator",
  "quotation-generator",
  "[slug]",
]);

// Ordered replacements — PASS 2: additional near-white/near-dark colors
const REPLACEMENTS = [
  // Near-white text colors (secondary text that should theme)
  ["text-[#d7d7ea]", "text-foreground/85"],
  ["text-[#c7c7d6]", "text-foreground/75"],
  ["text-[#c8c9d9]", "text-foreground/75"],
  ["text-[#c4c5d7]", "text-foreground/75"],
  ["text-[#bfc0d4]", "text-muted"],
  ["text-[#8f90a6]", "text-muted"],
  ["text-[#7f7f95]", "text-muted-2"],

  // Near-dark backgrounds
  ["bg-[#13131c]", "bg-surface"],
  ["bg-[#0f0f15]", "bg-background"],
  ["bg-[#14141d]", "bg-surface"],
  ["bg-[#15151d]", "bg-surface"],
];

// Additional replacements for route pages (meta text often uses text-white for headings)
const ROUTE_REPLACEMENTS = [
  ...REPLACEMENTS,
];

async function processFile(filePath, replacements) {
  let content = await readFile(filePath, "utf-8");
  const original = content;
  let changeCount = 0;

  for (const [find, replace] of replacements) {
    const before = content;
    content = content.replaceAll(find, replace);
    if (content !== before) {
      const occurrences = (before.split(find).length - 1);
      changeCount += occurrences;
    }
  }

  if (content !== original) {
    await writeFile(filePath, content, "utf-8");
    return changeCount;
  }
  return 0;
}

async function processComponents() {
  const files = (await readdir(COMPONENTS_DIR)).filter(
    (f) => f.endsWith(".tsx") && !SKIP_COMPONENTS.has(f)
  );

  console.log(`\n=== Processing ${files.length} component files ===\n`);
  let totalChanges = 0;
  const changedFiles = [];

  for (const file of files.sort()) {
    const filePath = join(COMPONENTS_DIR, file);
    const changes = await processFile(filePath, REPLACEMENTS);
    if (changes > 0) {
      console.log(`  ✓ ${file} — ${changes} replacements`);
      changedFiles.push({ file, changes });
      totalChanges += changes;
    }
  }

  console.log(`\n  Components: ${changedFiles.length} files changed, ${totalChanges} total replacements\n`);
  return changedFiles;
}

async function processRoutePages() {
  let dirs;
  try {
    dirs = await readdir(TOOLS_DIR);
  } catch {
    console.log("No tools directory found, skipping route pages.");
    return [];
  }

  const pagePaths = [];
  for (const dir of dirs) {
    if (SKIP_ROUTE_DIRS.has(dir)) continue;
    const pagePath = join(TOOLS_DIR, dir, "page.tsx");
    try {
      await readFile(pagePath, "utf-8");
      pagePaths.push({ dir, path: pagePath });
    } catch {
      // no page.tsx in this dir
    }
  }

  console.log(`=== Processing ${pagePaths.length} route pages ===\n`);
  let totalChanges = 0;
  const changedFiles = [];

  for (const { dir, path } of pagePaths.sort((a, b) => a.dir.localeCompare(b.dir))) {
    const changes = await processFile(path, ROUTE_REPLACEMENTS);
    if (changes > 0) {
      console.log(`  ✓ tools/${dir}/page.tsx — ${changes} replacements`);
      changedFiles.push({ file: `tools/${dir}/page.tsx`, changes });
      totalChanges += changes;
    }
  }

  console.log(`\n  Route pages: ${changedFiles.length} files changed, ${totalChanges} total replacements\n`);
  return changedFiles;
}

// Also process the main tools listing page and other app pages
async function processAppPages() {
  const appDir = join(import.meta.dirname, "..", "src", "app");
  const pagesToCheck = [
    join(appDir, "tools", "page.tsx"),
    join(appDir, "page.tsx"),
    join(appDir, "contact", "page.tsx"),
    join(appDir, "privacy", "page.tsx"),
    join(appDir, "terms", "page.tsx"),
  ];

  console.log(`=== Processing app-level pages ===\n`);
  let totalChanges = 0;
  const changedFiles = [];

  for (const pagePath of pagesToCheck) {
    try {
      const changes = await processFile(pagePath, REPLACEMENTS);
      if (changes > 0) {
        const rel = pagePath.split("src\\app\\")[1] || pagePath;
        console.log(`  ✓ ${rel} — ${changes} replacements`);
        changedFiles.push({ file: rel, changes });
        totalChanges += changes;
      }
    } catch {
      // file doesn't exist
    }
  }

  console.log(`\n  App pages: ${changedFiles.length} files changed, ${totalChanges} total replacements\n`);
  return changedFiles;
}

async function main() {
  console.log("Theme Migration Script — Replacing hardcoded colors with CSS variable Tailwind classes\n");

  const compResults = await processComponents();
  const routeResults = await processRoutePages();
  const appResults = await processAppPages();

  const allChanged = [...compResults, ...routeResults, ...appResults];
  const totalReplacements = allChanged.reduce((sum, f) => sum + f.changes, 0);

  console.log("════════════════════════════════════════");
  console.log(`TOTAL: ${allChanged.length} files modified, ${totalReplacements} replacements made`);
  console.log("════════════════════════════════════════");
}

main().catch(console.error);
