import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { NextResponse } from "next/server";

import { resolvePdfcpuPath, runPdfcpu, sanitizePdfFileName } from "@/lib/server-pdfcpu";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

async function tryDecrypt(pdfcpuPath: string, inputPath: string, outputPath: string, password: string) {
  await runPdfcpu(pdfcpuPath, ["decrypt", "-upw", password, "--", inputPath, outputPath]);
}

async function tryDecryptWithOwnerPassword(pdfcpuPath: string, inputPath: string, outputPath: string, password: string) {
  await runPdfcpu(pdfcpuPath, ["decrypt", "-opw", password, "--", inputPath, outputPath]);
}

export async function POST(request: Request) {
  const rl = checkRateLimit(`unlock-pdf:${getClientIp(request)}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "toolmint-unlock-pdf-"));

  try {
    const pdfcpuPath = await resolvePdfcpuPath();
    if (!pdfcpuPath) {
      return NextResponse.json(
        { error: "PDF unlock is temporarily unavailable. Please try again later." },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const password = String(formData.get("password") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload a PDF file." }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds the 100 MB limit." }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: "Enter the PDF password to unlock the file." }, { status: 400 });
    }

    const inputPath = path.join(tempDir, "input.pdf");
    const outputPath = path.join(tempDir, "output.pdf");
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    try {
      await tryDecrypt(pdfcpuPath, inputPath, outputPath, password);
    } catch (error) {
      try {
        await tryDecryptWithOwnerPassword(pdfcpuPath, inputPath, outputPath, password);
      } catch {
        throw error;
      }
    }

    const outputBytes = await readFile(outputPath);
    const outputName = sanitizePdfFileName(file.name, "_unlocked");

    return new NextResponse(new Uint8Array(outputBytes), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${outputName}"`,
        "x-file-name": encodeURIComponent(outputName),
      },
    });
  } catch (error) {
    console.error("[unlock-pdf]", error);
    return NextResponse.json({ error: "Failed to unlock PDF. Check that the password is correct." }, { status: 500 });
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
