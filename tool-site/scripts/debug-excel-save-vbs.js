const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const scriptPath = path.join(__dirname, 'debug-excel-save-blank.vbs');
const cscript = path.join(process.env.SystemRoot, 'System32', 'cscript.exe');
const proc = spawn(cscript, ['//nologo', scriptPath], { windowsHide: true });
let stdout = '';
let stderr = '';
proc.stdout.on('data', (c) => stdout += c.toString());
proc.stderr.on('data', (c) => stderr += c.toString());
proc.on('exit', (code) => {
  console.log({ code, stdout, stderr });
  const out = path.join(process.env.TEMP, 'tc-vbs-save', 'blank.xlsx');
  console.log({ exists: fs.existsSync(out), out });
});
proc.on('error', (error) => {
  console.error(error);
});
