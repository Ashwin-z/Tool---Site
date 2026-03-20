const { spawn } = require('node:child_process');
const { mkdtemp } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

(async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'tc-node-excel-'));
  const outputPath = path.join(tempDir, 'blank.xlsx');
  const scriptPath = path.join(tempDir, 'blank-save.ps1');
  const fs = require('node:fs/promises');
  const powershellPath = path.join(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  const script = `$ErrorActionPreference = 'Stop'
$excel = $null
$workbook = $null
try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false
  $workbook = $excel.Workbooks.Add()
  $workbook.Worksheets.Item(1).Cells.Item(1,1).Value2 = 'hello'
  $workbook.SaveAs([string]${JSON.stringify(outputPath)}, [int]51)
}
finally {
  if ($null -ne $workbook) { try { $workbook.Close($false) } catch {} }
  if ($null -ne $excel) { try { $excel.Quit() } catch {} }
}`;
  await fs.writeFile(scriptPath, script, 'utf8');
  const result = await new Promise((resolve) => {
    const proc = spawn(powershellPath, ['-NoProfile', '-NonInteractive', '-STA', '-ExecutionPolicy', 'Bypass', '-File', scriptPath], { windowsHide: true });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (c) => stdout += c.toString());
    proc.stderr.on('data', (c) => stderr += c.toString());
    proc.once('exit', (code) => resolve({ code, stdout, stderr }));
    proc.once('error', (error) => resolve({ code: -1, stdout, stderr, error: String(error) }));
  });
  console.log({ tempDir, outputPath, result });
})();
