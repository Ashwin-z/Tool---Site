import { spawn } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function buildOutputFileName(fileName: string): string {
  return `${fileName.replace(/\.[^.]+$/, "") || "presentation"}.pdf`;
}

async function resolvePowerShellPath(): Promise<string> {
  const candidates = [
    process.env.SystemRoot
      ? path.join(process.env.SystemRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe")
      : "",
    "powershell.exe",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate.includes(path.sep)) {
      if (await pathExists(candidate)) return candidate;
      continue;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        const proc = spawn(candidate, ["-NoProfile", "-Command", "$PSVersionTable.PSVersion.ToString()"], {
          stdio: "ignore",
          windowsHide: true,
        });
        proc.once("error", reject);
        proc.once("exit", (code) => (code === 0 ? resolve() : reject(new Error(String(code)))));
      });
      return candidate;
    } catch {
      // continue
    }
  }

  throw new Error("PowerShell is not available on this machine.");
}

async function runPowerPointExportViaPowerShell(
  inputPath: string,
  outputPath: string,
  scriptPath: string,
): Promise<void> {
  const powershellPath = await resolvePowerShellPath();

  const script = `$ErrorActionPreference = 'Stop'
$inputPath = ${JSON.stringify(inputPath)}
$outputPath = ${JSON.stringify(outputPath)}

$ppt = $null
$deck = $null

try {
  $ppt = New-Object -ComObject PowerPoint.Application
  # Open(FileName, ReadOnly, Untitled, WithWindow)
  $deck = $ppt.Presentations.Open([string]$inputPath, $true, $false, $false)

  # ppSaveAsPDF = 32
  $deck.SaveAs([string]$outputPath, [int]32)
}
finally {
  if ($deck -ne $null) {
    try { $deck.Close() } catch {}
  }
  if ($ppt -ne $null) {
    try { $ppt.Quit() } catch {}
  }
  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
}`;

  await writeFile(scriptPath, script, "utf8");

  await new Promise<void>((resolve, reject) => {
    const proc = spawn(
      powershellPath,
      ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", scriptPath],
      { windowsHide: true },
    );

    let stderr = "";
    let stdout = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.once("error", reject);
    proc.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(stderr.trim() || stdout.trim() || `PowerPoint export failed with code ${code ?? "unknown"}`),
      );
    });
  });
}

export async function POST(request: Request) {
  if (process.platform !== "win32") {
    return NextResponse.json(
      { error: "Native PowerPoint export is only available on Windows." },
      { status: 501 },
    );
  }

  const formData = await request.formData();
  const input = formData.get("file");

  if (!(input instanceof File)) {
    return NextResponse.json({ error: "Please upload a PowerPoint file." }, { status: 400 });
  }

  if (!/\.(pptx|ppt)$/i.test(input.name)) {
    return NextResponse.json(
      { error: "Only .pptx and .ppt files are supported." },
      { status: 400 },
    );
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "toolcraft-ppt-"));
  const safeName = sanitizeFileName(input.name) || "presentation.pptx";
  const inputPath = path.join(tempDir, safeName);
  const outputPath = path.join(tempDir, buildOutputFileName(safeName));
  const scriptPath = path.join(tempDir, "export-ppt-to-pdf.ps1");

  try {
    const bytes = Buffer.from(await input.arrayBuffer());
    await writeFile(inputPath, bytes);

    await runPowerPointExportViaPowerShell(inputPath, outputPath, scriptPath);

    const pdfBytes = await readFile(outputPath);
    if (pdfBytes.byteLength < 1000) {
      return NextResponse.json(
        { error: "PowerPoint produced an empty or invalid PDF." },
        { status: 500 },
      );
    }

    const fileName = buildOutputFileName(safeName);
    return new NextResponse(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
        "X-File-Name": encodeURIComponent(fileName),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to export PowerPoint to PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
