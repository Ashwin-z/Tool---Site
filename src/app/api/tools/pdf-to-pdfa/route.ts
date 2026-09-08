import { NextRequest, NextResponse } from "next/server";
import { access, writeFile, readFile, unlink, mkdir } from "fs/promises";
import { constants as fsConstants } from "fs";
import path, { join } from "path";
import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { tmpdir } from "os";

import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";
import { isToolDown, maintenanceResponse } from "@/lib/tool-status";

export const maxDuration = 120; // 2 min max runtime

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

/** Path to the ICC profile directory */
const ICC_DIR = join(process.cwd(), "bin", "ghostscript", "gs", "iccprofiles");

/** Path to Ghostscript lib (contains PDFA_def.ps etc.) */
const GS_LIB = join(process.cwd(), "bin", "ghostscript", "gs", "lib");

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function resolveGhostscriptPath(): Promise<string | null> {
  const candidates = [
    process.env.GHOSTSCRIPT_PATH,
    path.join(process.cwd(), "bin", "ghostscript", "gs", "bin", "gswin64c.exe"),
    path.join(process.cwd(), "bin", "ghostscript", "gs", "bin", "gswin32c.exe"),
    "gswin64c.exe",
    "gswin32c.exe",
    "gs",
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (candidate.includes(path.sep)) {
      if (await pathExists(candidate)) return candidate;
      continue;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        const proc = spawn(candidate, ["-version"], { stdio: "ignore", windowsHide: true });
        proc.once("error", reject);
        proc.once("exit", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Exit code ${code}`));
        });
      });
      return candidate;
    } catch {
      // Try next candidate.
    }
  }

  return null;
}

function escapePostScriptString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

async function buildPdfaDefinition(title: string, iccPath: string): Promise<string> {
  const templatePath = join(GS_LIB, "PDFA_def.ps");
  const template = await readFile(templatePath, "utf-8");

  return template
    .replace("/Title (Title)", `/Title (${escapePostScriptString(title)})`)
    .replace("/ICCProfile (srgb.icc)", `/ICCProfile (${escapePostScriptString(iccPath)})`)
    .replace("/OutputConditionIdentifier (sRGB)", "/OutputConditionIdentifier (sRGB IEC61966-2.1)");
}

function formatGhostscriptError(stderr: string, code: number): string {
  const normalized = stderr
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const relevant = normalized.find((line) => /error|unable|invalid|undefined|icc|pdfa/i.test(line))
    ?? normalized.at(-1);

  if (!relevant) {
    return `Ghostscript exited with code ${code}. The PDF may be malformed or unsupported.`;
  }

  return `Ghostscript exited with code ${code}: ${relevant}`;
}

export async function POST(request: NextRequest) {
  // Batch 0: this tool depends on a binary that is not working in production.
  // Fail fast with an honest 503 rather than accepting an upload we cannot process.
  // Delete the entry in src/lib/tool-status.ts to re-enable this route.
  if (isToolDown("pdf-to-pdfa")) {
    return maintenanceResponse("pdf-to-pdfa");
  }

  const rl = checkRateLimit(`pdf-to-pdfa:${getClientIp(request)}`, { maxRequests: 8, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const conformance = (formData.get("conformance") as string) ?? "2"; // PDF/A-2b by default

  if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Please upload a valid PDF file." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File size exceeds the 100 MB limit." }, { status: 400 });
  }

  // Validate conformance level
  const validLevels = ["1", "2", "3"];
  const level = validLevels.includes(conformance) ? conformance : "2";
  const ghostscriptPath = await resolveGhostscriptPath();

  if (!ghostscriptPath) {
    return NextResponse.json(
      { error: "PDF/A conversion is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  const sessionDir = join(tmpdir(), `pdfa-${randomUUID()}`);
  await mkdir(sessionDir, { recursive: true });

  const inputPath = join(sessionDir, "input.pdf");
  const outputPath = join(sessionDir, "output.pdf");
  const pdfaDefPath = join(sessionDir, "PDFA_def.ps");

  try {
    // Write uploaded PDF to disk
    const arrayBuf = await file.arrayBuffer();
    await writeFile(inputPath, Buffer.from(arrayBuf));

    const iccPath = join(ICC_DIR, "srgb.icc").replace(/\\/g, "/");
    const pdfaDef = await buildPdfaDefinition(file.name, iccPath);
    await writeFile(pdfaDefPath, pdfaDef, "utf-8");

    const gsArgs = [
      "-dPDFA=" + level,
      "-dBATCH",
      "-dNOPAUSE",
      "-dNOOUTERSAVE",
      "-dSAFER",
      "-dQUIET",
      "-sProcessColorModel=DeviceRGB",
      "-sColorConversionStrategy=RGB",
      "-sDEVICE=pdfwrite",
      "-dPDFACompatibilityPolicy=1",
      `--permit-file-read=${iccPath}`,
      `-sOutputFile=${outputPath}`,
      `-I${GS_LIB}`,
      pdfaDefPath,
      inputPath,
    ];

    const result = await new Promise<{ code: number; output: string }>((resolve, reject) => {
      const proc = spawn(ghostscriptPath, gsArgs, { cwd: sessionDir, windowsHide: true });

      let output = "";
      proc.stderr.on("data", (chunk: Buffer) => {
        output += chunk.toString();
      });
      proc.stdout.on("data", (chunk: Buffer) => {
        output += chunk.toString();
      });

      const timeout = setTimeout(() => {
        proc.kill("SIGKILL");
        reject(new Error("Ghostscript timed out after 90 seconds."));
      }, 90_000);

      proc.on("close", (code) => {
        clearTimeout(timeout);
        resolve({ code: code ?? 1, output });
      });

      proc.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    if (result.code !== 0) {
      console.error("[pdf-to-pdfa] GS output:", result.output);
      return NextResponse.json(
        { error: formatGhostscriptError(result.output, result.code) },
        { status: 500 },
      );
    }

    // Read the output PDF
    const outBuf = await readFile(outputPath);

    const safeName = file.name.replace(/\.pdf$/i, "") + "_pdfa.pdf";

    return new NextResponse(outBuf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}"`,
      },
    });
  } catch (err) {
    console.error("[pdf-to-pdfa] error:", err);
    return NextResponse.json(
      { error: "PDF/A conversion failed." },
      { status: 500 },
    );
  } finally {
    // Cleanup temp files
    await Promise.allSettled([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
      unlink(pdfaDefPath).catch(() => {}),
    ]);
    // Try to remove session directory
    try {
      const { rmdir } = await import("fs/promises");
      await rmdir(sessionDir);
    } catch {
      /* ignore — non-empty or already removed */
    }
  }
}
