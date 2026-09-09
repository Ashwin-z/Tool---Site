/**
 * Email readiness check for toolmint.tools.
 *
 * WHY THIS EXISTS
 * Batch 5 shipped an outreach package that cannot be sent, because the domain
 * cannot receive mail. This turns "is email working?" into one command instead
 * of a manual round of nslookup, so the answer is never guessed at.
 *
 * It checks two different things, and the distinction matters:
 *
 *   RECEIVE  — an MX record, so a reply from a journalist actually arrives.
 *   SEND     — SPF, DKIM and DMARC, so cold outreach is not filed as spam.
 *
 * A domain with no SPF/DKIM/DMARC sending cold mail to newsrooms and law-firm
 * IT departments is close to the worst possible deliverability profile: those
 * are exactly the recipients running strict filtering.
 *
 * IMPORTANT: DNS records resolving is NOT proof that mail is delivered. Only a
 * received test message proves that. This script says "configured", never
 * "working" — see CONTACT.contactWorks in src/lib/brand.ts, which must only be
 * flipped after a real message has arrived.
 *
 * Usage:  node scripts/check-email-dns.mjs [domain]
 */
import { Resolver } from "node:dns/promises";

const domain = process.argv[2] ?? "toolmint.tools";

// Resolve against a public resolver rather than whatever the machine is using,
// so a local cache or a VPN resolver cannot produce a misleading answer.
const resolver = new Resolver();
resolver.setServers(["8.8.8.8", "1.1.1.1"]);

const ok = (b) => (b ? "yes" : "NO");
let receiveReady = true;
let sendReady = true;

async function safe(fn) {
  try {
    return await fn();
  } catch {
    return null;
  }
}

console.log(`\nEmail readiness — ${domain}\n${"=".repeat(52)}`);

// ---------------------------------------------------------------- RECEIVE
const mx = await safe(() => resolver.resolveMx(domain));
const hasMx = Array.isArray(mx) && mx.length > 0;
if (!hasMx) receiveReady = false;
console.log(`\nRECEIVE — can a reply reach us?`);
console.log(`  MX record present            ${ok(hasMx)}`);
if (hasMx) {
  for (const r of mx.sort((a, b) => a.priority - b.priority)) {
    console.log(`    ${String(r.priority).padStart(3)}  ${r.exchange}`);
  }
}

// ------------------------------------------------------------------- SEND
const txt = (await safe(() => resolver.resolveTxt(domain))) ?? [];
const flat = txt.map((chunks) => chunks.join(""));
const spfRecords = flat.filter((t) => t.toLowerCase().startsWith("v=spf1"));
const hasSpf = spfRecords.length === 1;
// Two SPF records is not "extra safe" — it is a permerror, and receivers treat
// the domain as unauthenticated.
const duplicateSpf = spfRecords.length > 1;

const dmarcTxt = (await safe(() => resolver.resolveTxt(`_dmarc.${domain}`))) ?? [];
const dmarc = dmarcTxt.map((c) => c.join("")).find((t) => t.toLowerCase().startsWith("v=dmarc1"));

// DKIM selectors are provider-specific, so probe the common ones rather than
// claiming a definitive answer.
const SELECTORS = ["default", "google", "selector1", "selector2", "s1", "s2", "mail", "k1", "zoho", "zmail"];
const foundSelectors = [];
for (const sel of SELECTORS) {
  const rec = await safe(() => resolver.resolveTxt(`${sel}._domainkey.${domain}`));
  if (rec && rec.length) foundSelectors.push(sel);
}

if (!hasSpf || !dmarc || foundSelectors.length === 0) sendReady = false;

console.log(`\nSEND — will cold outreach survive spam filtering?`);
console.log(`  SPF (exactly one record)     ${ok(hasSpf)}${duplicateSpf ? "  << MULTIPLE SPF RECORDS: this breaks SPF" : ""}`);
if (spfRecords.length) spfRecords.forEach((r) => console.log(`    ${r}`));
console.log(`  DMARC                        ${ok(Boolean(dmarc))}`);
if (dmarc) console.log(`    ${dmarc}`);
console.log(`  DKIM (common selectors)      ${foundSelectors.length ? foundSelectors.join(", ") : "none found"}`);
console.log(`    note: selectors are provider-specific; absence here is a hint, not proof`);

// ---------------------------------------------------------------- VERDICT
console.log(`\n${"=".repeat(52)}`);
console.log(`  Can receive replies   ${ok(receiveReady)}`);
console.log(`  Ready to send cold    ${ok(sendReady)}`);

if (!receiveReady) {
  console.log(`\n  BLOCKED: no MX record. Mail to hello@${domain} bounces.`);
  console.log(`  Do not send outreach — a reply would never arrive.`);
} else if (!sendReady) {
  console.log(`\n  PARTIAL: mail can arrive, but authentication is incomplete.`);
  console.log(`  Cold outreach is likely to be filtered. Add the missing records first.`);
} else {
  console.log(`\n  DNS looks correct. This is still NOT proof of delivery:`);
  console.log(`  send a real message from an outside account and confirm it arrives,`);
  console.log(`  then set CONTACT.contactWorks = true in src/lib/brand.ts.`);
}
console.log(`\n  See docs/DNS-EMAIL.md for the exact records to add.\n`);

// Non-zero while outreach must not start, so this can gate a workflow.
process.exitCode = receiveReady && sendReady ? 0 : 1;
