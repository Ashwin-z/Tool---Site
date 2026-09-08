import { spawn } from "node:child_process";

import { NextResponse } from "next/server";

import { DOWN_TOOL_SLUGS, TOOL_OUTAGES } from "@/lib/tool-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Health endpoint for uptime monitoring.
 *
 * Point any free monitor (Better Stack, UptimeRobot, Healthchecks.io) at
 * https://toolmint.tools/api/health and alert on a non-200 response.
 *
 * It reports whether the external binaries the PDF pipeline depends on are
 * actually present, so the next outage is visible in minutes rather than
 * being discovered months later by an audit.
 *
 * Exposes no user data and no configuration values. Set HEALTH_CHECK_KEY to
 * require ?key=<value> if you would rather keep it private.
 */

const BINARIES: { name: string; candidates: string[]; neededBy: string[] }[] = [
  {
    name: "ghostscript",
    candidates: ["gswin64c.exe", "gswin32c.exe", "gs"],
    neededBy: ["compress-pdf", "pdf-to-pdfa"],
  },
  {
    name: "pdfcpu",
    candidates: ["pdfcpu.exe", "pdfcpu"],
    neededBy: ["protect-pdf", "unlock-pdf"],
  },
];

function probe(cmd: string, args: string[], timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (ok: boolean) => {
      if (!settled) {
        settled = true;
        resolve(ok);
      }
    };
    try {
      const proc = spawn(cmd, args, { stdio: "ignore", windowsHide: true });
      const timer = setTimeout(() => {
        proc.kill();
        done(false);
      }, timeoutMs);
      proc.once("error", () => {
        clearTimeout(timer);
        done(false);
      });
      proc.once("exit", (code) => {
        clearTimeout(timer);
        done(code === 0);
      });
    } catch {
      done(false);
    }
  });
}

export async function GET(request: Request) {
  const key = process.env.HEALTH_CHECK_KEY;
  if (key) {
    const provided = new URL(request.url).searchParams.get("key");
    if (provided !== key) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const binaries: Record<string, { available: boolean; neededBy: string[] }> = {};
  await Promise.all(
    BINARIES.map(async (b) => {
      let available = false;
      for (const c of b.candidates) {
        if (await probe(c, ["-version"])) {
          available = true;
          break;
        }
      }
      binaries[b.name] = { available, neededBy: b.neededBy };
    }),
  );

  const body = {
    status: "ok" as const,
    time: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    platform: process.platform,
    nodeVersion: process.version,
    analyticsConfigured: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
    binaries,
    knownOutages: {
      count: DOWN_TOOL_SLUGS.length,
      tools: DOWN_TOOL_SLUGS,
      reasons: Object.fromEntries(
        Object.entries(TOOL_OUTAGES).map(([slug, o]) => [slug, o.cause]),
      ),
    },
  };

  return NextResponse.json(body, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
