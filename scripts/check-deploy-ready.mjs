/**
 * Deployment readiness check.
 *
 * WHY THIS EXISTS
 * Batch 11 began with `git remote -v` reporting an origin, which looked like the
 * blocker had been cleared. The URL was literally
 * `git@github.com:<OWNER>/toolmint.git` — the placeholder from DEPLOYMENT.md,
 * pasted without substitution. GitHub rejects it with "is not a valid repository
 * name", so nothing could ever be pushed, but a casual `git remote -v` made the
 * repository look configured.
 *
 * A remote that exists is not the same as a remote that works. This checks the
 * difference, and everything else that must hold before a deploy can succeed.
 *
 * Usage:  node scripts/check-deploy-ready.mjs [commit]
 * Exits non-zero while deployment cannot proceed, so it can gate a workflow.
 */
import { execSync } from "node:child_process";

const target = process.argv[2] ?? "HEAD";
let failures = 0;

const log = (pass, name, detail = "") => {
  if (!pass) failures++;
  console.log(`  [${pass ? "OK  " : "FAIL"}] ${name}${detail ? "  — " + detail : ""}`);
};
const sh = (cmd) => {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
};

console.log(`\nDeployment readiness\n${"=".repeat(58)}\n`);

// ------------------------------------------------------------------ REMOTE
const url = sh("git config --get remote.origin.url");
log(Boolean(url), "origin is configured", url ?? "no origin");

if (url) {
  // The specific trap that cost a batch: a documented placeholder left in place.
  const placeholder = /<[^>]+>|YOUR[-_]?(OWNER|ORG|USER)|example\.com/i.test(url);
  log(!placeholder, "origin contains no unsubstituted placeholder", placeholder ? url : "");

  // Existing and reachable are different things. Only the network knows.
  const reachable = sh(`git ls-remote --exit-code ${JSON.stringify(url)} HEAD`) !== null;
  log(reachable, "origin is reachable and is a real repository",
    reachable ? "" : "git ls-remote failed — repo missing, renamed, or no access");
}

// ------------------------------------------------------------------ COMMIT
const sha = sh(`git rev-parse --short ${target}`);
log(Boolean(sha), `target commit resolves (${target})`, sha ?? "unresolved");

const dirty = sh("git status --porcelain");
log(dirty === "", "working tree is clean", dirty ? `${dirty.split("\n").length} change(s)` : "");

const branch = sh("git rev-parse --abbrev-ref HEAD");
log(Boolean(branch), "on a named branch", branch ?? "detached");

// Is the target actually on the remote? Only meaningful once origin works.
if (url && sha) {
  const remoteHas = sh(`git branch -r --contains ${sha}`);
  log(Boolean(remoteHas), "target commit exists on origin",
    remoteHas ? remoteHas.trim() : "not pushed yet");
}

// ------------------------------------------------------------- BASELINE
const baseline = sh("git rev-parse --short ad63b06");
log(Boolean(baseline), "rollback baseline ad63b06 is present", baseline ?? "MISSING");

// --------------------------------------------------------------- SECRETS
const trackedEnv = (sh("git ls-files") ?? "")
  .split("\n")
  .filter((f) => /^\.env/.test(f));
const onlyTemplate = trackedEnv.every((f) => f === ".env.example");
log(onlyTemplate, "no real .env file is tracked", trackedEnv.join(", ") || "none");
log(trackedEnv.includes(".env.example"), "the .env template IS tracked",
  "the server copies it to .env.production after cloning");

// ---------------------------------------------------------------- VERDICT
console.log(`\n${"=".repeat(58)}`);
if (failures === 0) {
  console.log("  Ready to push and deploy.\n");
  console.log("  Deploy is still a separate manual step on the server:");
  console.log("  see docs/DEPLOYMENT.md.\n");
} else {
  console.log(`  NOT READY — ${failures} check(s) failed.`);
  console.log("  Do not claim a deployment while any of the above fails.\n");
}
process.exitCode = failures ? 1 : 0;
