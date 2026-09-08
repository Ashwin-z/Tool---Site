import { randomBytes } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { NextResponse } from "next/server";

import { resolvePdfcpuPath, runPdfcpu, sanitizePdfFileName } from "@/lib/server-pdfcpu";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";
import { isToolDown, maintenanceResponse } from "@/lib/tool-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const ALLOWED_PERMISSIONS = new Set(["none", "print", "all"]);

export async function POST(request: Request) {
  // Batch 0: this tool depends on a binary that is not working in production.
  // Fail fast with an honest 503 rather than accepting an upload we cannot process.
  // Delete the entry in src/lib/tool-status.ts to re-enable this route.
  if (isToolDown("protect-pdf")) {
    return maintenanceResponse("protect-pdf");
  }

  const rl = checkRateLimit(`protect-pdf:${getClientIp(request)}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "toolmint-protect-pdf-"));

  try {
    const pdfcpuPath = await resolvePdfcpuPath();
    if (!pdfcpuPath) {
      return NextResponse.json(
        { error: "PDF protection is temporarily unavailable. Please try again later." },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const userPassword = String(formData.get("userPassword") ?? "").trim();
    const ownerPassword = String(formData.get("ownerPassword") ?? "").trim();
    const permission = String(formData.get("permission") ?? "none").trim().toLowerCase();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload a PDF file." }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds the 100 MB limit." }, { status: 400 });
    }

    if (!userPassword || userPassword.length < 4) {
      return NextResponse.json({ error: "Enter an open password with at least 4 characters." }, { status: 400 });
    }

    if (!ALLOWED_PERMISSIONS.has(permission)) {
      return NextResponse.json({ error: "Invalid permission option." }, { status: 400 });
    }

    const resolvedOwnerPassword = ownerPassword || randomBytes(18).toString("base64url");
    const inputPath = path.join(tempDir, "input.pdf");
    const outputPath = path.join(tempDir, "output.pdf");

    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    await runPdfcpu(pdfcpuPath, [
      "encrypt",
      "-m",
      "aes",
      "-key",
      "256",
      "-perm",
      permission,
      "-upw",
      userPassword,
      "-opw",
      resolvedOwnerPassword,
      "--",
      inputPath,
      outputPath,
    ]);

    const outputBytes = await readFile(outputPath);
    const outputName = sanitizePdfFileName(file.name, "_protected");

    return new NextResponse(new Uint8Array(outputBytes), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${outputName}"`,
        "x-file-name": encodeURIComponent(outputName),
        "x-owner-password-generated": ownerPassword ? "false" : "true",
      },
    });
  } catch (error) {
    console.error("[protect-pdf]", error);
    return NextResponse.json({ error: "Failed to protect PDF." }, { status: 500 });
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
