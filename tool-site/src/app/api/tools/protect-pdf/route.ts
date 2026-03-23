import { randomBytes } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { NextResponse } from "next/server";

import { resolvePdfcpuPath, runPdfcpu, sanitizePdfFileName } from "@/lib/server-pdfcpu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_PERMISSIONS = new Set(["none", "print", "all"]);

export async function POST(request: Request) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "toolcraft-protect-pdf-"));

  try {
    const pdfcpuPath = await resolvePdfcpuPath();
    if (!pdfcpuPath) {
      return NextResponse.json(
        { error: "pdfcpu is not installed. Add the bundled binary or set PDFCPU_PATH." },
        { status: 500 },
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
    const message = error instanceof Error ? error.message : "Failed to protect PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
