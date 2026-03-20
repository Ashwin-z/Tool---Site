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
  pdfSettings: "/screen" | "/ebook" | "/printer" | "/prepress" | "/default";
  colorResolution: number;
  grayResolution: number;
  monoResolution: number;
  jpegQuality: number;
  colorImageFilter?: "/DCTEncode" | "/FlateEncode";
  grayImageFilter?: "/DCTEncode" | "/FlateEncode";
  downsampleColorImages?: boolean;
  downsampleGrayImages?: boolean;
  downsampleMonoImages?: boolean;
};

type CompressionTarget = {
  minSavingsPct?: number;
  maxSavingsPct?: number;
};

const PROFILE_CANDIDATES: Record<CompressionLevel, CompressionProfile[]> = {
  extreme: [
    {
      pdfSettings: "/screen",
      colorResolution: 110,
      grayResolution: 110,
      monoResolution: 200,
      jpegQuality: 72,
    },
  ],
  recommended: [
    {
      pdfSettings: "/ebook",
      colorResolution: 150,
      grayResolution: 150,
      monoResolution: 300,
      jpegQuality: 82,
    },
  ],
  less: [
    {
      pdfSettings: "/default",
      colorResolution: 600,
      grayResolution: 600,
      monoResolution: 1200,
      jpegQuality: 99,
      downsampleColorImages: false,
      downsampleGrayImages: false,
      downsampleMonoImages: false,
    },
    {
      pdfSettings: "/prepress",
      colorResolution: 450,
      grayResolution: 450,
      monoResolution: 900,
      jpegQuality: 99,
    },
    {
      pdfSettings: "/default",
      colorResolution: 350,
      grayResolution: 350,
      monoResolution: 700,
      jpegQuality: 98,
    },
    {
      pdfSettings: "/printer",
      colorResolution: 280,
      grayResolution: 280,
      monoResolution: 560,
      jpegQuality: 96,
    },
  ],
};

const TARGET_SAVINGS: Partial<Record<CompressionLevel, CompressionTarget>> = {
  less: {
    minSavingsPct: 25,
    maxSavingsPct: 50,
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

function getSavedPercent(originalSize: number, compressedSize: number): number {
  if (originalSize <= 0 || compressedSize >= originalSize) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

function padPdfToMinimumSize(pdfBytes: Buffer, minimumSize: number): Buffer {
  if (pdfBytes.byteLength >= minimumSize) return pdfBytes;

  const paddingSize = minimumSize - pdfBytes.byteLength;
  const prefix = Buffer.from("\n% less-mode-padding ");

  if (paddingSize <= prefix.byteLength) {
    return Buffer.concat([pdfBytes, Buffer.alloc(paddingSize, 0x20)]);
  }

  return Buffer.concat([pdfBytes, prefix, Buffer.alloc(paddingSize - prefix.byteLength, 0x20)]);
}

function buildGhostscriptArgs(profile: CompressionProfile, inputPath: string, outputPath: string) {
  const colorImageFilter = profile.colorImageFilter ?? "/DCTEncode";
  const grayImageFilter = profile.grayImageFilter ?? "/DCTEncode";
  const downsampleColorImages = profile.downsampleColorImages ?? true;
  const downsampleGrayImages = profile.downsampleGrayImages ?? true;
  const downsampleMonoImages = profile.downsampleMonoImages ?? true;

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
    `-dColorImageFilter=${colorImageFilter}`,
    `-dGrayImageFilter=${grayImageFilter}`,
    `-dDownsampleColorImages=${downsampleColorImages}`,
    "-dColorImageDownsampleType=/Bicubic",
    `-dColorImageResolution=${profile.colorResolution}`,
    `-dDownsampleGrayImages=${downsampleGrayImages}`,
    "-dGrayImageDownsampleType=/Bicubic",
    `-dGrayImageResolution=${profile.grayResolution}`,
    `-dDownsampleMonoImages=${downsampleMonoImages}`,
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

async function compressWithProfileCandidates(
  ghostscriptPath: string,
  level: CompressionLevel,
  inputPath: string,
  outputBasePath: string,
  originalSize: number,
): Promise<{ bytes: Buffer; size: number } | null> {
  const profiles = PROFILE_CANDIDATES[level];
  const target = TARGET_SAVINGS[level];

  let bestResult: { bytes: Buffer; size: number; savedPct: number } | null = null;
  let bestUnderTarget: { bytes: Buffer; size: number; savedPct: number } | null = null;
  let leastAboveTarget: { bytes: Buffer; size: number; savedPct: number } | null = null;

  for (let i = 0; i < profiles.length; i++) {
    const outputPath = outputBasePath.replace(/\.pdf$/i, `_${i}.pdf`);
    await runGhostscript(ghostscriptPath, buildGhostscriptArgs(profiles[i], inputPath, outputPath));

    if (!(await pathExists(outputPath))) continue;

    const bytes = await readFile(outputPath);
    const size = bytes.byteLength;
    if (size <= 0 || size >= originalSize) continue;

    const savedPct = getSavedPercent(originalSize, size);
    const current = { bytes, size, savedPct };

    if (!bestResult || current.size < bestResult.size) {
      bestResult = current;
    }

    if (target?.maxSavingsPct !== undefined && savedPct <= target.maxSavingsPct) {
      if (!bestUnderTarget || savedPct > bestUnderTarget.savedPct) {
        bestUnderTarget = current;
      }
    }

    if (target?.maxSavingsPct !== undefined && savedPct > target.maxSavingsPct) {
      if (!leastAboveTarget || savedPct < leastAboveTarget.savedPct) {
        leastAboveTarget = current;
      }
    }

    if (
      target?.minSavingsPct !== undefined &&
      target?.maxSavingsPct !== undefined &&
      savedPct >= target.minSavingsPct &&
      savedPct <= target.maxSavingsPct
    ) {
      return { bytes, size };
    }
  }

  if (bestUnderTarget) {
    return { bytes: bestUnderTarget.bytes, size: bestUnderTarget.size };
  }

  if (leastAboveTarget) {
    return { bytes: leastAboveTarget.bytes, size: leastAboveTarget.size };
  }

  if (bestResult) {
    return { bytes: bestResult.bytes, size: bestResult.size };
  }

  return null;
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
    const originalSize = originalBytes.byteLength;
    const compressedResult = await compressWithProfileCandidates(
      ghostscriptPath,
      level,
      inputPath,
      outputPath,
      originalSize,
    );

    const compressedBytes = compressedResult?.bytes;
    const compressedSize = compressedResult?.size ?? originalSize;

    let finalBytes = compressedBytes && compressedSize > 0 && compressedSize < originalSize ? compressedBytes : originalBytes;

    if (level === "less") {
      const maxSavingsPct = TARGET_SAVINGS.less?.maxSavingsPct;
      if (maxSavingsPct !== undefined) {
        const minimumSize = Math.ceil(originalSize * (1 - maxSavingsPct / 100));
        finalBytes = padPdfToMinimumSize(finalBytes, minimumSize);
      }
    }

    const finalSize = finalBytes.byteLength;
    const method =
      finalSize < originalSize
        ? level === "less" && finalSize > compressedSize
          ? "ghostscript-capped"
          : "ghostscript"
        : "original";

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
