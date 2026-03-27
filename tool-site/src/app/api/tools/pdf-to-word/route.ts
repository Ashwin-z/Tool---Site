import { spawn } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ── Helpers ─────────────────────────────────────────────── */

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
  return `${fileName.replace(/\.[^.]+$/, "") || "document"}.docx`;
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

/* ── Core conversion ─────────────────────────────────────── */

async function runPdfToWordViaPowerShell(
  inputPath: string,
  outputPath: string,
  scriptPath: string,
): Promise<void> {
  const powershellPath = await resolvePowerShellPath();

  // Word can natively open PDFs and reflow them into editable DOCX.
  // wdFormatDocumentDefault = 16  (.docx)
  const script = `$ErrorActionPreference = 'Stop'
$inputPath  = ${JSON.stringify(inputPath)}
$outputPath = ${JSON.stringify(outputPath)}

# ── Suppress the "Converting PDF…" confirmation dialog via registry ──
$regPath = "HKCU:\\Software\\Microsoft\\Office\\16.0\\Word\\Options"
$regName = "DisableConvertPdfWarning"
$oldVal  = $null
if (Test-Path $regPath) {
  $oldVal = (Get-ItemProperty -Path $regPath -Name $regName -ErrorAction SilentlyContinue).$regName
  Set-ItemProperty -Path $regPath -Name $regName -Value 1 -Type DWord -Force
}

$word     = $null
$document = $null

try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0          # wdAlertsNone
  $word.ScreenUpdating = $false
  $word.AutomationSecurity = 3     # msoAutomationSecurityForceDisable

  # Open PDF — Word reflows it into an editable document
  $document = $word.Documents.Open([string]$inputPath, [bool]$false, [bool]$true)

  # Brief pause to let Word finish internal PDF reflow
  Start-Sleep -Seconds 1

  # SaveAs2  → wdFormatDocumentDefault (16) = .docx
  $document.SaveAs2([string]$outputPath, [int]16)
}
finally {
  if ($document -ne $null) {
    try { $document.Close($false) } catch {}
  }
  if ($word -ne $null) {
    try { $word.Quit() } catch {}
  }

  # Restore old registry value
  if (Test-Path $regPath) {
    if ($null -ne $oldVal) {
      Set-ItemProperty -Path $regPath -Name $regName -Value $oldVal -Type DWord -Force
    } else {
      Remove-ItemProperty -Path $regPath -Name $regName -ErrorAction SilentlyContinue
    }
  }

  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
}`;

  await writeFile(scriptPath, script, "utf8");

  await new Promise<void>((resolve, reject) => {
    const TIMEOUT_MS = 180_000; // 3 minutes max

    const proc = spawn(
      powershellPath,
      ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", scriptPath],
      { windowsHide: true },
    );

    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(new Error("PDF-to-Word conversion timed out after 3 minutes. The file may be too large or complex."));
    }, TIMEOUT_MS);

    let stderr = "";
    let stdout = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.once("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    proc.once("exit", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(stderr.trim() || stdout.trim() || `PDF-to-Word conversion failed with code ${code ?? "unknown"}`),
      );
    });
  });
}

/* ── Route handler ───────────────────────────────────────── */

export async function POST(request: Request) {
  if (process.platform !== "win32") {
    return NextResponse.json(
      { error: "Native PDF-to-Word conversion is only available on Windows with Microsoft Word installed." },
      { status: 501 },
    );
  }

  const formData = await request.formData();
  const input = formData.get("file");

  if (!(input instanceof File)) {
    return NextResponse.json({ error: "Please upload a PDF file." }, { status: 400 });
  }

  if (!/\.pdf$/i.test(input.name)) {
    return NextResponse.json(
      { error: "Only .pdf files are supported." },
      { status: 400 },
    );
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "toolcraft-pdf2word-"));
  const safeName = sanitizeFileName(input.name) || "document.pdf";
  const inputPath = path.join(tempDir, safeName);
  const outputPath = path.join(tempDir, buildOutputFileName(safeName));
  const scriptPath = path.join(tempDir, "convert-pdf-to-word.ps1");

  try {
    const bytes = Buffer.from(await input.arrayBuffer());
    await writeFile(inputPath, bytes);

    await runPdfToWordViaPowerShell(inputPath, outputPath, scriptPath);

    const docxBytes = await readFile(outputPath);
    if (docxBytes.byteLength < 500) {
      return NextResponse.json(
        { error: "Word produced an empty or invalid DOCX." },
        { status: 500 },
      );
    }

    const fileName = buildOutputFileName(safeName);
    return new NextResponse(new Uint8Array(docxBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
        "X-File-Name": encodeURIComponent(fileName),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to convert PDF to Word.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
