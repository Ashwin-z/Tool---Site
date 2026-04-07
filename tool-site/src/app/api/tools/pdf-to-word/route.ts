import { spawn } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { NextResponse } from "next/server";

import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

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

  # ── Fix alignment: comprehensive grid & spacing overrides ──
  $document.SnapToGrid = $false
  $document.GridOriginFromMargin = $false
  try { $document.AutoHyphenation = $false } catch {}

  # Apply paragraph formatting fixes to entire document at once via Range
  $rng = $document.Content
  try { $rng.ParagraphFormat.SnapToGrid = $false } catch {}
  try { $rng.ParagraphFormat.SpaceBeforeAuto = $false } catch {}
  try { $rng.ParagraphFormat.SpaceAfterAuto = $false } catch {}
  try { $rng.ParagraphFormat.AutoAdjustRightIndent = $false } catch {}
  try { $rng.ParagraphFormat.DisableLineHeightGrid = $true } catch {}
  try { $rng.ParagraphFormat.WidowControl = $false } catch {}
  try { $rng.ParagraphFormat.KeepWithNext = $false } catch {}
  try { $rng.ParagraphFormat.KeepTogether = $false } catch {}
  try { $rng.ParagraphFormat.PageBreakBefore = $false } catch {}
  try { $rng.Font.Kerning = 0 } catch {}

  # Disable CJK grid layout mode per section
  try {
    foreach ($s in $document.Sections) {
      $s.PageSetup.LayoutMode = 1  # wdLayoutModeDefault
    }
  } catch {}

  # Lock shape / text-box anchoring to preserve positions
  try {
    foreach ($shape in $document.Shapes) {
      $shape.LockAnchor = $true
    }
  } catch {}

  # Also fix inline shapes and text frames
  try {
    foreach ($frame in $document.Frames) {
      $frame.LockAnchor = $true
    }
  } catch {}

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
  const rl = checkRateLimit(`pdf-to-word:${getClientIp(request)}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  if (process.platform !== "win32") {
    return NextResponse.json(
      { error: "This conversion is not available on this server." },
      { status: 501 },
    );
  }

  const formData = await request.formData();
  const input = formData.get("file");

  if (!(input instanceof File)) {
    return NextResponse.json({ error: "Please upload a PDF file." }, { status: 400 });
  }

  if (input.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File size exceeds the 50 MB limit." }, { status: 400 });
  }

  if (!/\.pdf$/i.test(input.name)) {
    return NextResponse.json(
      { error: "Only .pdf files are supported." },
      { status: 400 },
    );
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "toolmint-pdf2word-"));
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
    console.error("[pdf-to-word]", error);
    return NextResponse.json({ error: "Failed to convert PDF to Word." }, { status: 500 });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
