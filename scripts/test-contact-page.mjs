/**
 * Contact page smoke test.
 *
 * The contact page is the return path for outreach, so its correctness is a
 * credibility question rather than a cosmetic one. Two things matter most:
 *
 *   1. It must not present a mailbox as usable while that mailbox bounces.
 *      A warning above a live mailto: is still a trap — the visitor writes a
 *      real message and it disappears.
 *   2. It must not leak anything. No third-party requests, no address in a
 *      query string, and none of the outreach planning material in the bundle.
 *
 * Usage:
 *   npm run build && npx next start -p 3000 &
 *   BASE=http://127.0.0.1:3000 node scripts/test-contact-page.mjs
 */
import puppeteer from "puppeteer-core";

const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.BASE ?? "http://127.0.0.1:3000";

let failures = 0;
const log = (pass, name, detail = "") => {
  if (!pass) failures++;
  console.log(`  [${pass ? "PASS" : "FAIL"}] ${name}${detail ? "  — " + detail : ""}`);
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });

// --------------------------------------------------------------- DESKTOP
console.log("\n=== CONTACT PAGE (desktop) ===");
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 1000 });

const requests = [];
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
page.on("request", (r) => requests.push({ url: r.url(), method: r.method() }));

const res = await page.goto(`${BASE}/contact`, { waitUntil: "networkidle2", timeout: 120000 });
log(res.status() === 200, "returns 200", `HTTP ${res.status()}`);
log(errors.length === 0, "no page errors", errors.join(" | "));

const facts = await page.evaluate(() => {
  const main = document.querySelector("main");
  const text = main?.innerText ?? "";
  return {
    h1Count: document.querySelectorAll("h1").length,
    hasMain: Boolean(main),
    liveMailto: document.querySelectorAll('a[href^="mailto:"]').length,
    struckThrough: /not receiving mail yet/i.test(text),
    inactiveNotice: /Email delivery is not active/i.test(text),
    promisesReply: /within 1-2 business days/i.test(text),
    addressesVisible: /hello@toolmint\.tools/.test(text),
    emptyLinks: [...main.querySelectorAll("a")].filter((a) => !a.textContent.trim() && !a.getAttribute("aria-label")).length,
    focusable: [...main.querySelectorAll("a, button, input")].filter((e) => !e.disabled).every((e) => e.tabIndex >= 0),
  };
});

// Truthfulness: the mailbox does not work, so the page must not act as if it does.
log(facts.liveMailto === 0, "no live mailto: link while the mailbox bounces", `${facts.liveMailto} found`);
log(facts.struckThrough, "addresses marked 'not receiving mail yet'");
log(facts.inactiveNotice, "delivery-inactive notice present");
log(!facts.promisesReply, "makes no response-time promise it cannot keep");
log(facts.addressesVisible, "addresses still visible so people know where to reach us later");

// Accessibility smoke.
log(facts.h1Count === 1, "exactly one h1", String(facts.h1Count));
log(facts.hasMain, "has a main landmark");
log(facts.emptyLinks === 0, "no unnamed links", String(facts.emptyLinks));
log(facts.focusable, "every interactive element is keyboard reachable");

// Privacy.
const origin = new URL(BASE).origin;
const thirdParty = [...new Set(requests
  .filter((r) => !r.url.startsWith(origin) && !r.url.startsWith("data:") && !r.url.startsWith("blob:"))
  .map((r) => new URL(r.url).host))];
log(thirdParty.length === 0, "no third-party requests", thirdParty.join(", "));
log(!requests.some((r) => /[?&][^=]*=[^&]*%40|[?&][^=]*=[^&]*@/.test(r.url)),
  "no email address in any query string");

await page.close();

// ---------------------------------------------------------------- MOBILE
console.log("\n=== CONTACT PAGE (mobile 390x844) ===");
{
  const m = await browser.newPage();
  await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  await m.goto(`${BASE}/contact`, { waitUntil: "networkidle2", timeout: 120000 });
  const r = await m.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    scrollWidth: document.documentElement.scrollWidth,
    inner: window.innerWidth,
    notice: /not receiving mail yet/i.test(document.querySelector("main").innerText),
  }));
  log(!r.overflow, "no horizontal overflow", `${r.scrollWidth}px vs ${r.inner}px`);
  log(r.notice, "mailbox status still visible on mobile");
  await m.close();
}

// ------------------------------------------- OUTREACH MATERIAL MUST NOT SHIP
// The outreach package and tracker live in docs/ and are never imported by the
// app. Confirm none of it reached the client bundle.
console.log("\n=== CLIENT BUNDLE ===");
{
  const p = await browser.newPage();
  const scripts = [];
  p.on("response", async (r) => {
    if (r.url().endsWith(".js") && r.url().startsWith(origin)) scripts.push(r.url());
  });
  await p.goto(`${BASE}/contact`, { waitUntil: "networkidle2", timeout: 120000 });

  let leaked = [];
  for (const url of scripts.slice(0, 40)) {
    const body = await p.evaluate(async (u) => {
      try { return await (await fetch(u)).text(); } catch { return ""; }
    }, url);
    for (const needle of ["resources.rsf.org", "training.rsf.org", "editorial@gijn", "OUTREACH-TRACKER", "Pitch A"]) {
      if (body.includes(needle)) leaked.push(`${needle} in ${url.split("/").pop()}`);
    }
  }
  log(leaked.length === 0, `no outreach material in the client bundle (${scripts.length} scripts checked)`, leaked.join(", "));
  await p.close();
}

await browser.close();
console.log(`\n${failures} failure(s)`);
process.exitCode = failures ? 1 : 0;
