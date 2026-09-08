$ErrorActionPreference = 'Stop'
$tempDir = Join-Path $env:TEMP "tc-test-full"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Write-Host "Step 1: Creating test Word doc with table..."
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Add()
$range = $doc.Content
$table = $doc.Tables.Add($range, 3, 3)
$table.Borders.Enable = $true
for ($r = 1; $r -le 3; $r++) {
  for ($c = 1; $c -le 3; $c++) {
    $table.Cell($r, $c).Range.Text = "R${r}C${c}"
  }
}
$htmlPath = Join-Path $tempDir "_intermediate_.html"
Write-Host "Saving HTML to: $htmlPath"
$doc.SaveAs2([string]$htmlPath, [int]10)
$doc.Close($false)
$word.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
Write-Host "Word done."
Start-Sleep -Seconds 2

Write-Host "Files created:"
Get-ChildItem $tempDir -Recurse | ForEach-Object { Write-Host "  $($_.FullName)" }

Write-Host "`nStep 2: Opening HTML in Excel..."
$xlsxPath = Join-Path $tempDir "output.xlsx"
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$excel.AskToUpdateLinks = $false
$wb = $excel.Workbooks.Open($htmlPath)
Write-Host "Workbook open. Saving to: $xlsxPath"
try {
  $wb.SaveAs([string]$xlsxPath, 51)
  Write-Host "SUCCESS! Size: $((Get-Item $xlsxPath).Length) bytes"
} catch {
  Write-Host "FAILED with format 51: $($_.Exception.Message)"
  Write-Host "Trying without format..."
  try {
    $xlsxPath2 = Join-Path $tempDir "output2.xlsx"
    $wb.SaveAs([string]$xlsxPath2)
    Write-Host "SUCCESS without format! Size: $((Get-Item $xlsxPath2).Length) bytes"
  } catch {
    Write-Host "ALSO FAILED: $($_.Exception.Message)"
  }
}
$wb.Close($false)
$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "All done."
