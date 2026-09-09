/**
 * Batch 5 cluster test: the redaction content pages and the links that bind
 * them to the checker.
 *
 * A content page is not "done" when it renders. It is done when its internal
 * links resolve, its structure is sound, it works on a phone, and it does not
 * quietly pull in third-party requests. That is what this checks.
 *
 * Usage:
 *   npm run build && npx next start -p 3000 &
 *   BASE=http://127.0.0.1:3000 node scripts/test-redaction-cluster.mjs
 */
import puppeteer from "puppeteer-core";

const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.BASE ?? "http://127.0.0.1:3000";

const CHECKER = "/tools/pdf-redaction-checker";
const GUIDE = "/blog/how-to-tell-if-pdf-redaction-failed";
const HOWTO = "/blog/how-to-redact-a-pdf";
const REDACT = "/tools/redact-pdf";

let failures = 0;
const log = (pass, name, detail = "") => {
  if (!pass) failures++;
  console.log(`  [${pass ? "PASS" : "FAIL"}] ${name}${detail ? "  — " + detail : ""}`);
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });

/** Collect page facts plus every third-party request made while loading. */
async function inspect(url, viewport = { width: 1400, height: 1000 }) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const thirdParty = [];
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
  page.on("request", (req) => {
    const u = req.url();
    if (!u.startsWith(new URL(BASE).origin) && !u.startsWith("data:") && !u.startsWith("blob:")) {
      thirdParty.push(new URL(u).host);
    }
  });
  const res = await page.goto(`${BASE}${url}`, { waitUntil: "networkidle2", timeout: 120000 });
  const facts = await page.evaluate(() => ({
    h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.trim()),
    h2Count: document.querySelectorAll("main h2").length,
    hrefs: [...document.querySelectorAll("main a[href]")].map((a) => a.getAttribute("href")),
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    emptyLinks: [...document.querySelectorAll("main a")].filter((a) => !a.textContent.trim() && !a.getAttribute("aria-label")).length,
    hasMain: Boolean(document.querySelector("main")),
    wordCount: (document.querySelector("main")?.innerText ?? "").split(/\s+/).filter(Boolean).length,
  }));
  return { page, status: res.status(), thirdParty: [...new Set(thirdParty)], errors, ...facts };
}

// ------------------------------------------------------- 1. PAGES RENDER
console.log("\n=== PAGES ===");
const pages = {};
for (const url of [CHECKER, GUIDE, HOWTO, REDACT, "/contact"]) {
  const r = await inspect(url);
  pages[url] = r;
  log(r.status === 200, `${url} returns 200`, `HTTP ${r.status}`);
  log(r.h1.length === 1, `${url} has exactly one h1`, r.h1.join(" | ").slice(0, 60));
  log(r.hasMain, `${url} has a main landmark`);
  log(r.errors.length === 0, `${url} has no page errors`, r.errors.join(" | "));
  log(r.emptyLinks === 0, `${url} has no unnamed links`, String(r.emptyLinks));
  await r.page.close();
}

// ------------------------------------------- 2. THE CHECK -> FIX -> CHECK LOOP
console.log("\n=== CLUSTER LINK GRAPH ===");
const has = (url, target) => (pages[url]?.hrefs ?? []).some((h) => h && h.includes(target));
log(has(CHECKER, "/tools/redact-pdf"), "checker links to Redact PDF (fix step)");
log(has(CHECKER, GUIDE), "checker links to the failure guide");
log(has(GUIDE, "/tools/pdf-redaction-checker"), "guide links to the checker (verify step)");
log(has(GUIDE, "/tools/redact-pdf"), "guide links to Redact PDF");
log(has(HOWTO, "/tools/pdf-redaction-checker"), "how-to-redact post links to the checker");
log(has(HOWTO, GUIDE), "how-to-redact post links to the failure guide");
log(has(REDACT, "/tools/pdf-redaction-checker"), "Redact PDF links back to the checker (re-check step)");

// --------------------------------------------------- 3. NO BROKEN INTERNAL LINKS
console.log("\n=== INTERNAL LINKS RESOLVE ===");
const internal = new Set();
for (const url of [CHECKER, GUIDE, HOWTO]) {
  for (const h of pages[url].hrefs ?? []) {
    if (h && h.startsWith("/") && !h.startsWith("//")) internal.add(h.split("#")[0]);
  }
}
let broken = [];
const probe = await browser.newPage();
for (const href of internal) {
  const res = await probe.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded", timeout: 120000 }).catch(() => null);
  if (!res || res.status() >= 400) broken.push(`${href} -> ${res ? res.status() : "error"}`);
}
await probe.close();
log(broken.length === 0, `all ${internal.size} internal links resolve`, broken.join(", "));

// ------------------------------------------------------ 4. THIRD-PARTY REQUESTS
console.log("\n=== NETWORK / PRIVACY ===");
for (const url of [CHECKER, GUIDE, HOWTO]) {
  const tp = pages[url].thirdParty;
  log(tp.length === 0, `${url} makes no third-party requests`, tp.join(", "));
}

// ----------------------------------------------------------- 5. CONTENT DEPTH
console.log("\n=== CONTENT ===");
log(pages[GUIDE].wordCount > 600, "guide has substantive content", `${pages[GUIDE].wordCount} words`);
log(pages[GUIDE].h2Count >= 5, "guide has a real section structure", `${pages[GUIDE].h2Count} h2`);
log(pages[CHECKER].h2Count >= 8, "checker page keeps its full structure", `${pages[CHECKER].h2Count} h2`);

// --------------------------------------------------------------- 6. MOBILE
console.log("\n=== MOBILE (390x844) ===");
for (const url of [CHECKER, GUIDE]) {
  const m = await inspect(url, { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  log(!m.overflow, `${url} has no horizontal overflow`, `${m.scrollWidth}px vs ${m.innerWidth}px`);
  await m.page.close();
}

// ------------------------------------------------- 7. HONEST-WORDING GUARD
console.log("\n=== WORDING ===");
for (const url of [CHECKER, GUIDE]) {
  const p = await browser.newPage();
  await p.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 120000 });
  const t = await p.evaluate(() => document.body.innerText);
  log(!/completely secure|guaranteed secure|100% secure/i.test(t), `${url} makes no absolute security claim`);
  await p.close();
}
// The contact page must not promise a reply while mail is undeliverable.
{
  const p = await browser.newPage();
  await p.goto(`${BASE}/contact`, { waitUntil: "domcontentloaded", timeout: 120000 });
  const t = await p.evaluate(() => document.body.innerText);
  const honest = /Email delivery is not active/i.test(t) && !/within 1-2 business days/i.test(t);
  log(honest, "/contact does not promise a reply on an undeliverable address");
  await p.close();
}

// ------------------------------------------- 8. OUTREACH LANDING EXPERIENCE
// A journalist or researcher arriving cold must be able to answer these from
// the page itself, without asking. If any of them stops being answerable, the
// asset stops being citable.
console.log("\n=== OUTREACH LANDING (can a stranger answer these?) ===");
{
  const p = await browser.newPage();
  await p.goto(`${BASE}${CHECKER}`, { waitUntil: "domcontentloaded", timeout: 120000 });
  const text = await p.evaluate(() => document.querySelector("main").innerText);
  const questions = [
    ["What does it detect?", /black box|under a (black )?box|invisible text/i],
    ["What does it NOT detect?", /cannot check|cannot detect|outside what it can see/i],
    ["Is the file uploaded?", /never uploaded|does not leave|stays on your device|in your browser/i],
    ["How was it tested?", /how this was tested|independently|PyMuPDF|fixtures/i],
    ["Why trust the result?", /methodology|draw order|false alarm/i],
    ["How does it compare?", /x-ray/i],
    ["What do I do next?", /Redact PDF/i],
  ];
  for (const [q, re] of questions) log(re.test(text), `checker page answers: ${q}`);
  await p.close();
}
{
  const p = await browser.newPage();
  await p.goto(`${BASE}/about`, { waitUntil: "domcontentloaded", timeout: 120000 });
  const text = await p.evaluate(() => document.querySelector("main").innerText);
  log(/Who Runs ToolMint/i.test(text), "about page says who operates ToolMint");
  log(/independent project|not a company/i.test(text), "about page states the operating model");
  // Batch 3 established we do not use the phrase both name-collision
  // competitors lead with; it identifies the category, not us.
  log(!/privacy[- ]first/i.test(text), "about page avoids the contested 'privacy-first' phrasing");
  await p.close();
}

await browser.close();
console.log(`\n${failures} failure(s)`);
process.exitCode = failures ? 1 : 0;
