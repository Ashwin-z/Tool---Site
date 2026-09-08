import { spawn } from "node:child_process";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import os from "node:os";
import path from "node:path";

import { NextResponse } from "next/server";

import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

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
  return `${fileName.replace(/\.[^.]+$/, "") || "spreadsheet"}.pdf`;
}

async function resolvePowerShellPath(): Promise<string> {
  const candidates = [
    process.env.SystemRoot ? path.join(process.env.SystemRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe") : "",
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

async function runExcelExportViaPowerShell(inputPath: string, outputPath: string, scriptPath: string): Promise<void> {
  const powershellPath = await resolvePowerShellPath();

  const script = `$ErrorActionPreference = 'Stop'
$inputPath = ${JSON.stringify(inputPath)}
$outputPath = ${JSON.stringify(outputPath)}

$excel = $null
$workbook = $null

try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false
  $excel.ScreenUpdating = $false
  $excel.EnableEvents = $false
  $excel.AskToUpdateLinks = $false
  $excel.AutomationSecurity = 3

  $workbook = $excel.Workbooks.Open($inputPath, 0, $true)

  foreach ($worksheet in $workbook.Worksheets) {
    try {
      $usedRange = $worksheet.UsedRange
      if ($usedRange -ne $null) {
        $usedRange.Rows.AutoFit() | Out-Null
        $usedRange.Columns.AutoFit() | Out-Null
      }
      $worksheet.PageSetup.Zoom = $false
      $worksheet.PageSetup.FitToPagesWide = 1
      $worksheet.PageSetup.FitToPagesTall = $false
      $worksheet.PageSetup.Orientation = 2
      $worksheet.PageSetup.CenterHorizontally = $true
      $worksheet.PageSetup.CenterVertically = $false
      $worksheet.PageSetup.LeftMargin = $excel.InchesToPoints(0.25)
      $worksheet.PageSetup.RightMargin = $excel.InchesToPoints(0.25)
      $worksheet.PageSetup.TopMargin = $excel.InchesToPoints(0.3)
      $worksheet.PageSetup.BottomMargin = $excel.InchesToPoints(0.3)
      $worksheet.PageSetup.HeaderMargin = $excel.InchesToPoints(0.15)
      $worksheet.PageSetup.FooterMargin = $excel.InchesToPoints(0.15)
      $worksheet.PageSetup.PrintGridlines = $false
    } catch {
      # ignore per-sheet page setup issues and continue
    }
  }

  $xlTypePDF = 0
  $workbook.ExportAsFixedFormat($xlTypePDF, $outputPath)
}
finally {
  if ($workbook -ne $null) {
    try { $workbook.Close($false) } catch {}
  }
  if ($excel -ne $null) {
    try { $excel.Quit() } catch {}
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

      reject(new Error(stderr.trim() || stdout.trim() || `Excel export failed with code ${code ?? "unknown"}`));
    });
  });
}

export async function POST(request: Request) {
  const rl = checkRateLimit(`excel-to-pdf:${getClientIp(request)}`, { maxRequests: 10, windowMs: 60_000 });
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
    return NextResponse.json({ error: "Please upload an Excel file." }, { status: 400 });
  }

  if (input.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File size exceeds the 50 MB limit." }, { status: 400 });
  }

  if (!/\.(xlsx|xls|csv)$/i.test(input.name)) {
    return NextResponse.json(
      { error: "Only .xlsx, .xls, and .csv files are supported." },
      { status: 400 },
    );
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "toolmint-excel-"));
  const safeName = sanitizeFileName(input.name) || "spreadsheet.xlsx";
  const inputPath = path.join(tempDir, safeName);
  const outputPath = path.join(tempDir, buildOutputFileName(safeName));
  const scriptPath = path.join(tempDir, "export-excel-to-pdf.ps1");

  try {
    const bytes = Buffer.from(await input.arrayBuffer());
    await writeFile(inputPath, bytes);

    await runExcelExportViaPowerShell(inputPath, outputPath, scriptPath);

    const pdfBytes = await readFile(outputPath);
    if (pdfBytes.byteLength < 1000) {
      return NextResponse.json(
        { error: "Excel produced an empty or invalid PDF." },
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
    console.error("[excel-to-pdf]", error);
    return NextResponse.json({ error: "Failed to export spreadsheet to PDF." }, { status: 500 });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
