const { spawn } = require('node:child_process');
const { mkdtemp, writeFile, readFile, rm, access } = require('node:fs/promises');
const { constants: fsConstants } = require('node:fs');
const os = require('node:os');
const path = require('node:path');

async function pathExists(targetPath) {
  try {
    await access(targetPath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function resolvePowerShellPath() {
  const candidates = [
    process.env.SystemRoot ? path.join(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe') : '',
    'powershell.exe',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate.includes(path.sep)) {
      if (await pathExists(candidate)) return candidate;
      continue;
    }
  }
  throw new Error('PowerShell not found');
}

async function createPdf(pdfPath) {
  const ps = `
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Add()
$table = $doc.Tables.Add($doc.Content, 3, 3)
$table.Borders.Enable = $true
for ($r = 1; $r -le 3; $r++) {
  for ($c = 1; $c -le 3; $c++) {
    $table.Cell($r, $c).Range.Text = "R${'$'}{r}C${'$'}{c}"
  }
}
$doc.SaveAs2([string]${JSON.stringify(pdfPath)}, [int]17)
$doc.Close($false)
$word.Quit()
`;

  const powershellPath = await resolvePowerShellPath();
  await new Promise((resolve, reject) => {
    const proc = spawn(powershellPath, ['-NoProfile', '-STA', '-ExecutionPolicy', 'Bypass', '-Command', ps], { windowsHide: false });
    let stderr = '';
    proc.stderr.on('data', (c) => { stderr += c.toString(); });
    proc.once('exit', (code) => code === 0 ? resolve() : reject(new Error(stderr || `create pdf failed ${code}`)));
    proc.once('error', reject);
  });
}

async function run() {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'tc-node-spawn-'));
  const inputPath = path.join(tempDir, 'sample.pdf');
  const outputPath = path.join(tempDir, 'sample.xlsx');
  const scriptPath = path.join(tempDir, 'convert-pdf-to-excel.ps1');
  const htmlPath = path.join(tempDir, '_intermediate_.html');
  console.log({ tempDir, inputPath, htmlPath, outputPath, scriptPath });

  await createPdf(inputPath);

  const script = `$ErrorActionPreference = 'Stop'
$inputPath  = ${JSON.stringify(inputPath)}
$htmlPath   = ${JSON.stringify(htmlPath)}
$outputPath = ${JSON.stringify(outputPath)}

Add-Type -AssemblyName System.Runtime.InteropServices
function Release-ComObject($obj) {
  if ($null -ne $obj) {
    try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($obj) | Out-Null } catch {}
  }
}
$word = $null
$document = $null
$excel = $null
$workbook = $null
$outputWorkbook = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $word.ScreenUpdating = $false
  $word.AutomationSecurity = 3
  $document = $word.Documents.Open([string]$inputPath, $false, $true)
  $document.SaveAs2([string]$htmlPath, [int]10)
  $document.Close($false)
  Release-ComObject $document; $document = $null
  $word.Quit()
  Release-ComObject $word; $word = $null
  Start-Sleep -Milliseconds 1500
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false
  $excel.ScreenUpdating = $false
  $excel.AskToUpdateLinks = $false
  $workbook = $excel.Workbooks.Open([string]$htmlPath)
  foreach ($sheet in $workbook.Worksheets) {
    $sheet.Cells.EntireColumn.AutoFit()
  }
  if (Test-Path $outputPath) { Remove-Item -Path $outputPath -Force }
  $outputWorkbook = $excel.Workbooks.Add()
  while ($outputWorkbook.Worksheets.Count -gt 1) {
    $outputWorkbook.Worksheets.Item(1).Delete()
  }
  foreach ($sheet in $workbook.Worksheets) {
    $sheet.Copy($outputWorkbook.Worksheets.Item($outputWorkbook.Worksheets.Count))
  }
  $outputWorkbook.Worksheets.Item(1).Delete()
  $outputWorkbook.SaveAs([string]$outputPath, [int]51)
}
finally {
  if ($null -ne $document) { try { $document.Close($false) } catch {} ; Release-ComObject $document }
  if ($null -ne $word) { try { $word.Quit() } catch {} ; Release-ComObject $word }
  if ($null -ne $workbook) { try { $workbook.Close($false) } catch {} ; Release-ComObject $workbook }
  if ($null -ne $outputWorkbook) { try { $outputWorkbook.Close($false) } catch {} ; Release-ComObject $outputWorkbook }
  if ($null -ne $excel) { try { $excel.Quit() } catch {} ; Release-ComObject $excel }
  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
}`;

  await writeFile(scriptPath, script, 'utf8');
  const powershellPath = await resolvePowerShellPath();
  const result = await new Promise((resolve) => {
    const proc = spawn(powershellPath, ['-NoProfile', '-NonInteractive', '-STA', '-ExecutionPolicy', 'Bypass', '-File', scriptPath], { windowsHide: false });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (c) => { stdout += c.toString(); });
    proc.stderr.on('data', (c) => { stderr += c.toString(); });
    proc.once('error', (error) => resolve({ ok: false, error: String(error), stdout, stderr }));
    proc.once('exit', (code) => resolve({ ok: code === 0, code, stdout, stderr }));
  });

  console.log(result);
  if (await pathExists(outputPath)) {
    const bytes = await readFile(outputPath);
    console.log('output bytes', bytes.length);
  }
  console.log('temp dir kept at', tempDir);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
