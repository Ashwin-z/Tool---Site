/**
 * Full browser test for the shipped PDF Redaction Checker.
 *
 * This exercises the REAL page in REAL Chrome, not the prototype. That matters:
 * the TypeScript engine in src/ is a port, and a port has to be proven, not
 * assumed. Expectations come from the independently-validated prototype and
 * from PyMuPDF, so the shipped code is never used to prove itself correct.
 *
 * Covers: correctness parity, network privacy, accessibility, performance,
 * and the encrypted / corrupt / large edge cases.
 *
 * Usage:
 *   python scripts/redaction-fixtures.py --out .fixtures
 *   npm run build && npx next start &
 *   BASE=http://127.0.0.1:3000 FIXTURES=.fixtures node scripts/test-redaction-checker.mjs
 *
 * REALPDFS is optional: point it at a directory of real published PDFs to
 * re-run the false-positive measurement. Those files are not committed.
 */
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.BASE ?? "http://127.0.0.1:3000";
const URL = `${BASE}/tools/pdf-redaction-checker`;
const FIX = process.env.FIXTURES ?? path.join(process.cwd(), "fixtures");
const REAL = process.env.REALPDFS ?? path.join(process.cwd(), "realpdfs");

let failures = 0;
const log = (pass, name, detail = "") => {
  if (!pass) failures++;
  console.log(`  [${pass ? "PASS" : "FAIL"}] ${name}${detail ? "  â€” " + detail : ""}`);
};

/** LEAK = tool must report a leak. CLEAN = must not. NOTEXT = image-only. */
const CASES = [
  // fixtures â€” expectation from PyMuPDF-verified ground truth
  [FIX, "rc-black-box", "LEAK", "black box over live text"],
  [FIX, "rc-white-box", "LEAK", "white box over live text"],
  [FIX, "rc-mixed", "LEAK", "page 1 unsafe, page 2 clean"],
  [FIX, "rc-annot-square", "LEAK", "unflattened square annotation"],
  [FIX, "rc-invisible-text", "LEAK", "invisible OCR-mode text"],
  [FIX, "rc-white-text", "LEAK", "white-on-white text"],
  [FIX, "rc-image-overlay", "LEAK", "opaque image over live text"],
  [FIX, "rc-metadata-leak", "CLEAN", "page clean; metadata shown for review"],
  [FIX, "rc-true-redaction", "CLEAN", "text genuinely removed"],
  [FIX, "rc-no-redaction", "CLEAN", "ordinary document"],
  [FIX, "rc-benign-table", "CLEAN", "shaded table must not flag"],
  [FIX, "rc-benign-cover", "CLEAN", "white title on dark cover"],
  [FIX, "rc-rasterised", "NOTEXT", "flattened to an image"],
  [FIX, "rc-scan-only", "NOTEXT", "pure scan, no text layer"],
  [FIX, "rc-vector-signature", "CLEAN", "known limit: non-text content"],
  // real-world published PDFs â€” all legitimate, none may flag
  [REAL, "dhs-redaction-memo", "CLEAN", "scanned govt memo with OCR layer"],
  [REAL, "irs-form-1040", "CLEAN", "heavily shaded tax form"],
  [REAL, "irs-form-w4", "CLEAN", "shaded form"],
  [REAL, "irs-form-w9", "CLEAN", "shaded form"],
  [REAL, "arxiv-xmlcompress", "CLEAN", "LaTeX paper, rotated chart labels"],
  [REAL, "arxiv-sdrbench", "CLEAN", "LaTeX paper with figures"],
  [REAL, "berkshire-annual-report", "CLEAN", "annual report"],
  [REAL, "nist-sp800-171", "CLEAN", "114-page publication"],
  [REAL, "irs-pub17-excerpt", "CLEAN", "government publication"],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox"],
});

/** Upload one PDF and read the verdict back out of the DOM. */
async function runCase(page, filePath) {
  await page.goto(URL, { waitUntil: "networkidle2" });
  // The tool is a dynamic import with ssr:false, so the input does not exist
  // until the chunk mounts.
  await page.waitForSelector('input[type="file"]', { timeout: 30000 });
  const input = await page.$('input[type="file"]');
  await input.uploadFile(filePath);

  await page.waitForFunction(
    () => [...document.querySelectorAll("button")].some((b) => /Check this PDF/i.test(b.textContent ?? "")),
    { timeout: 20000 },
  );
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /Check this PDF/i.test(x.textContent ?? ""));
    b?.click();
  });

  const t0 = Date.now();
  // Read the verdict from the data attribute. Matching on body text is wrong
  // here: the FAQ deliberately quotes the same wording the result uses.
  await page.waitForSelector("[data-verdict]", { timeout: 240000 });
  const ms = Date.now() - t0;

  return await page.evaluate((elapsed) => {
    const el = document.querySelector("[data-verdict]");
    const t = document.body.innerText;
    return {
      verdict: el?.getAttribute("data-verdict") ?? "none",
      errorText: el?.getAttribute("data-verdict") === "error" ? (el.textContent ?? "") : "",
      metadataReview: /Worth reviewing: document properties/i.test(t),
      forbidsAbsolute: /completely secure/i.test(t),
      ms: elapsed,
    };
  }, ms);
}

const VERDICT_TO_EXPECT = {
  "leaks-found": "LEAK",
  "no-leaks-detected": "CLEAN",
  "no-text-layer": "NOTEXT",
  error: "ERROR",
};

// ----------------------------------------------------- 1. CORRECTNESS PARITY
console.log("\n=== CORRECTNESS (expected vs actual, in real Chrome) ===");
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));

  for (const [dir, name, expect, note] of CASES) {
    const fp = path.join(dir, `${name}.pdf`);
    if (!fs.existsSync(fp)) {
      // The real-world PDFs are downloaded, not committed. Skip them when the
      // directory is absent rather than failing a run of the core fixtures.
      if (dir === REAL) { console.log(`  [SKIP] ${name} (set REALPDFS to run)`); continue; }
      log(false, `${name} (missing fixture)`);
      continue;
    }
    let r;
    try {
      r = await runCase(page, fp);
    } catch (e) {
      log(false, name, "timed out / threw: " + String(e).slice(0, 60));
      continue;
    }
    const actual = VERDICT_TO_EXPECT[r.verdict] ?? "NONE";
    log(actual === expect, `${name.padEnd(24)} expect=${expect.padEnd(6)} actual=${actual.padEnd(6)}`, `${note} (${r.ms}ms)`);
    if (r.forbidsAbsolute) log(false, `${name}: page claims "completely secure"`);
  }
  log(errors.length === 0, "no uncaught page errors", errors.join(" | "));
  await page.close();
}

// ------------------------------------------------------------ 2. EDGE CASES
console.log("\n=== EDGE CASES ===");
{
  const page = await browser.newPage();
  for (const [name, expectText] of [
    ["rc-encrypted", /password protected/i],
    ["rc-corrupt", /could not be analysed/i],
  ]) {
    try {
      const r = await runCase(page, path.join(FIX, `${name}.pdf`));
      log(r.verdict === "error" && expectText.test(r.errorText), `${name} handled gracefully`,
          `verdict=${r.verdict} "${r.errorText.slice(0, 60)}"`);
    } catch (e) {
      log(false, `${name} handled gracefully`, String(e).slice(0, 60));
    }
  }
  // Large document: must find the single deep finding and not freeze.
  try {
    const r = await runCase(page, path.join(FIX, "rc-large.pdf"));
    log(r.verdict === "leaks-found", "rc-large: finds the bad redaction on page 250 of 300", `${r.ms}ms`);
    log(r.ms < 180000, "rc-large: completes within 3 minutes", `${(r.ms / 1000).toFixed(1)}s`);
  } catch (e) {
    log(false, "rc-large processed", String(e).slice(0, 60));
  }
  await page.close();
}

// ------------------------------------------------------- 3. NETWORK PRIVACY
console.log("\n=== NETWORK PRIVACY ===");
{
  const page = await browser.newPage();
  const requests = [];
  page.on("request", (req) => {
    requests.push({ url: req.url(), method: req.method(), size: (req.postData() || "").length });
  });
  await runCase(page, path.join(FIX, "rc-black-box.pdf"));

  const origin = new globalThis.URL(BASE).origin;
  const thirdParty = requests.filter((r) => !r.url.startsWith(origin) && !r.url.startsWith("data:") && !r.url.startsWith("blob:"));
  const uploads = requests.filter((r) => ["POST", "PUT", "PATCH"].includes(r.method));
  const bigBodies = requests.filter((r) => r.size > 2000);

  log(thirdParty.length === 0, "no third-party requests", thirdParty.map((r) => new globalThis.URL(r.url).host).join(", "));
  log(uploads.length === 0, "no POST/PUT/PATCH of any kind", uploads.map((r) => r.url.slice(0, 60)).join(", "));
  log(bigBodies.length === 0, "no request carries a large body", String(bigBodies.length));
  const canary = requests.filter((r) => /4417|Jane%20Doe|Jane\+Doe/i.test(r.url) || /4417/.test(String(r.size)));
  log(canary.length === 0, "canary string never appears in any request URL");
  console.log(`  [INFO] ${requests.length} requests total, all same-origin`);
  await page.close();
}

// -------------------------------------------------------- 4. ACCESSIBILITY
console.log("\n=== ACCESSIBILITY ===");
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });
  await page.goto(URL, { waitUntil: "networkidle2" });

  const a11y = await page.evaluate(() => {
    const fi = document.querySelector('input[type="file"]');
    const buttons = [...document.querySelectorAll("main button")];
    return {
      fileLabelled: Boolean(fi?.getAttribute("aria-label") || fi?.labels?.length),
      unnamedButtons: buttons.filter((b) => !(b.textContent ?? "").trim() && !b.getAttribute("aria-label")).length,
      smallTargets: buttons.filter((b) => b.getBoundingClientRect().height < 40).length,
      h1Count: document.querySelectorAll("h1").length,
      hasMain: Boolean(document.querySelector("main")),
      liveRegions: document.querySelectorAll("[aria-live], [role=status], [role=alert]").length,
    };
  });
  log(a11y.fileLabelled, "file input has an accessible name");
  log(a11y.unnamedButtons === 0, "no unnamed buttons", String(a11y.unnamedButtons));
  log(a11y.smallTargets === 0, "all touch targets >= 40px tall", `${a11y.smallTargets} too small`);
  log(a11y.h1Count === 1, "exactly one h1", String(a11y.h1Count));
  log(a11y.hasMain, "page has a main landmark");

  // The whole flow must be reachable without a mouse.
  const kbd = await page.evaluate(() => {
    const els = [...document.querySelectorAll("main a, main button, main input")]
      .filter((e) => !e.disabled);
    return els.every((e) => e.tabIndex >= 0);
  });
  log(kbd, "every interactive element is keyboard reachable");

  // Results must be announced.
  await runCase(page, path.join(FIX, "rc-black-box.pdf"));
  const announced = await page.evaluate(() => {
    const live = [...document.querySelectorAll("[aria-live], [role=status], [role=alert]")];
    return live.some((el) => el.querySelector("[data-verdict]") || /Potential text leak detected/i.test(el.textContent ?? ""));
  });
  log(announced, "result is inside an aria-live region");
  await page.close();
}

// ----------------------------------------------------------- 5. MOBILE UX
console.log("\n=== MOBILE (390x844) ===");
{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  await runCase(page, path.join(FIX, "rc-black-box.pdf"));
  const m = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    scrollWidth: document.documentElement.scrollWidth,
    inner: window.innerWidth,
    leak: document.querySelector('[data-verdict="leaks-found"]') !== null,
  }));
  log(!m.overflow, "no horizontal overflow on mobile", `${m.scrollWidth}px vs ${m.inner}px viewport`);
  log(m.leak, "result renders correctly on mobile");
  await page.close();
}

await browser.close();
console.log(`\n${failures} failure(s)`);
process.exitCode = failures ? 1 : 0;
