const { spawn } = require('node:child_process');
const { mkdtemp, writeFile, access } = require('node:fs/promises');
const { constants: fsConstants } = require('node:fs');
const os = require('node:os');
const path = require('node:path');

async function exists(p) {
  try { await access(p, fsConstants.F_OK); return true; } catch { return false; }
}

(async () => {
  const powershellPath = path.join(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'tc-startproc-'));
  const workerScript = path.join(tempDir, 'worker.ps1');
  const outputPath = path.join(tempDir, 'blank.xlsx');

  const worker = `$ErrorActionPreference = 'Stop'
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
  await writeFile(workerScript, worker, 'utf8');

  const launcherCommand = `
$proc = Start-Process -FilePath ${JSON.stringify(powershellPath)} -ArgumentList @('-NoProfile','-NonInteractive','-STA','-ExecutionPolicy','Bypass','-File',${JSON.stringify(workerScript)}) -Wait -PassThru
exit $proc.ExitCode
`;

  const result = await new Promise((resolve) => {
    const proc = spawn(powershellPath, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', launcherCommand], { windowsHide: true });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (c) => stdout += c.toString());
    proc.stderr.on('data', (c) => stderr += c.toString());
    proc.once('exit', (code) => resolve({ code, stdout, stderr }));
    proc.once('error', (error) => resolve({ code: -1, stdout, stderr, error: String(error) }));
  });

  console.log({ tempDir, outputPath, exists: await exists(outputPath), result });
})();
