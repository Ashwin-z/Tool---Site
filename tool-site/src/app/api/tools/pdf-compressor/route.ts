import { spawn } from "node:child_process";
import { access, mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import os from "node:os";
import path from "node:path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CompressionLevel = "extreme" | "recommended" | "less";

type CompressionProfile = {
  pdfSettings: "/screen" | "/ebook" | "/printer";
  colorResolution: number;
  grayResolution: number;
  monoResolution: number;
  jpegQuality: number;
};

const PROFILES: Record<CompressionLevel, CompressionProfile> = {
  extreme: {
    pdfSettings: "/screen",
    colorResolution: 110,
    grayResolution: 110,
    monoResolution: 200,
    jpegQuality: 72,
  },
  recommended: {
    pdfSettings: "/ebook",
    colorResolution: 150,
    grayResolution: 150,
    monoResolution: 300,
    jpegQuality: 82,
  },
  less: {
    pdfSettings: "/printer",
    colorResolution: 220,
    grayResolution: 220,
    monoResolution: 400,
    jpegQuality: 92,
  },
};

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
        const proc = spawn(candidate, ["-version"], { stdio: "ignore" });
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

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function buildGhostscriptArgs(profile: CompressionProfile, inputPath: string, outputPath: string) {
  return [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    "-dNOPAUSE",
    "-dBATCH",
    "-dQUIET",
    "-dSAFER",
    `-dPDFSETTINGS=${profile.pdfSettings}`,
    "-dDetectDuplicateImages=true",
    "-dCompressFonts=true",
    "-dSubsetFonts=true",
    "-dEmbedAllFonts=true",
    "-dAutoRotatePages=/None",
    "-dAutoFilterColorImages=false",
    "-dAutoFilterGrayImages=false",
    "-dColorImageFilter=/DCTEncode",
    "-dGrayImageFilter=/DCTEncode",
    "-dDownsampleColorImages=true",
    "-dColorImageDownsampleType=/Bicubic",
    `-dColorImageResolution=${profile.colorResolution}`,
    "-dDownsampleGrayImages=true",
    "-dGrayImageDownsampleType=/Bicubic",
    `-dGrayImageResolution=${profile.grayResolution}`,
    "-dDownsampleMonoImages=true",
    "-dMonoImageDownsampleType=/Subsample",
    `-dMonoImageResolution=${profile.monoResolution}`,
    `-dJPEGQ=${profile.jpegQuality}`,
    `-sOutputFile=${outputPath}`,
    inputPath,
  ];
}

async function runGhostscript(ghostscriptPath: string, args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const proc = spawn(ghostscriptPath, args, { windowsHide: true });
    let stderr = "";

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.once("error", reject);
    proc.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `Ghostscript exited with code ${code ?? "unknown"}`));
    });
  });
}

export async function POST(request: Request) {
  const ghostscriptPath = await resolveGhostscriptPath();
  if (!ghostscriptPath) {
    return NextResponse.json(
      {
        error:
          "Ghostscript is not installed. Run `npm run setup:pdf-compressor` in the project root to install the local server-side PDF compressor.",
      },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const levelInput = formData.get("level");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing PDF file upload." }, { status: 400 });
  }

  const level: CompressionLevel =
    levelInput === "extreme" || levelInput === "recommended" || levelInput === "less"
      ? levelInput
      : "recommended";

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
  }

  const tempRoot = path.join(os.tmpdir(), "tool-site-pdf-compressor");
  await mkdir(tempRoot, { recursive: true });
  const workDir = await mkdtemp(path.join(tempRoot, "job-"));

  try {
    const inputName = sanitizeFileName(file.name || "document.pdf");
    const outputName = inputName.replace(/\.pdf$/i, "") + "_compressed.pdf";
    const inputPath = path.join(workDir, inputName);
    const outputPath = path.join(workDir, outputName);
    const originalBytes = Buffer.from(await file.arrayBuffer());

    await writeFile(inputPath, originalBytes);
    await runGhostscript(ghostscriptPath, buildGhostscriptArgs(PROFILES[level], inputPath, outputPath));

    const outputExists = await pathExists(outputPath);
    if (!outputExists) {
      throw new Error("Compression did not produce an output file.");
    }

    const compressedStats = await stat(outputPath);
    const compressedBytes = await readFile(outputPath);
    const originalSize = originalBytes.byteLength;
    const compressedSize = compressedStats.size;

    const finalBytes = compressedSize > 0 && compressedSize < originalSize ? compressedBytes : originalBytes;
    const finalSize = finalBytes.byteLength;
    const method = finalSize < originalSize ? "ghostscript" : "original";

    return new NextResponse(new Uint8Array(finalBytes), {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "cache-control": "no-store",
        "x-file-name": encodeURIComponent(outputName),
        "x-original-size": String(originalSize),
        "x-compressed-size": String(finalSize),
        "x-compression-method": method,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF compression failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
