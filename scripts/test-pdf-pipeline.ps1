$ErrorActionPreference = 'Stop'

# Use a real PDF if available, otherwise create a Word doc and save as PDF first
$tempDir = Join-Path $env:TEMP "tc-test-e2e"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$pdfPath = Join-Path $tempDir "test.pdf"
$htmlPath = Join-Path $tempDir "_intermediate_.html"
$xlsxPath = Join-Path $tempDir "output.xlsx"

# Step 0: Create a test PDF using Word
Write-Host "Creating test PDF..."
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Add()
$range = $doc.Content
$table = $doc.Tables.Add($range, 5, 4)
$table.Borders.Enable = $true
# Header row with colors
for ($c = 1; $c -le 4; $c++) {
    $cell = $table.Cell(1, $c)
    $cell.Range.Text = "Header $c"
    $cell.Range.Font.Bold = $true
    $cell.Shading.BackgroundPatternColor = 16711680  # blue
    $cell.Range.Font.Color = 16777215  # white
}
for ($r = 2; $r -le 5; $r++) {
    for ($c = 1; $c -le 4; $c++) {
        $table.Cell($r, $c).Range.Text = "Data R${r}C${c}"
    }
}
# Save as PDF
$doc.SaveAs2([string]$pdfPath, [int]17)  # wdFormatPDF = 17
$doc.Close($false)
$word.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
Write-Host "PDF created: $pdfPath"
Start-Sleep -Seconds 1

# Step 1: Open PDF in Word, save as HTML
Write-Host "`nStep 1: Word opening PDF..."

$regPath = "HKCU:\Software\Microsoft\Office\16.0\Word\Options"
$regName = "DisableConvertPdfWarning"
$oldVal = $null
if (Test-Path $regPath) {
    $oldVal = (Get-ItemProperty -Path $regPath -Name $regName -ErrorAction SilentlyContinue).$regName
    Set-ItemProperty -Path $regPath -Name $regName -Value 1 -Type DWord -Force
}

$word2 = New-Object -ComObject Word.Application
$word2.Visible = $false
$word2.DisplayAlerts = 0
$word2.AutomationSecurity = 3
$doc2 = $word2.Documents.Open([string]$pdfPath, $false, $true)
Write-Host "Saving as HTML..."
$doc2.SaveAs2([string]$htmlPath, [int]10)
$doc2.Close($false)
$word2.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word2) | Out-Null
Write-Host "HTML saved."

# Restore registry
if (Test-Path $regPath) {
    if ($null -ne $oldVal) {
        Set-ItemProperty -Path $regPath -Name $regName -Value $oldVal -Type DWord -Force
    } else {
        Remove-ItemProperty -Path $regPath -Name $regName -ErrorAction SilentlyContinue
    }
}

Start-Sleep -Seconds 2

# Step 2: Open HTML in Excel, save as XLSX
Write-Host "`nStep 2: Excel opening HTML..."
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$excel.AskToUpdateLinks = $false
$wb = $excel.Workbooks.Open([string]$htmlPath)
Write-Host "Auto-fitting columns..."
foreach ($sheet in $wb.Worksheets) {
    $sheet.Cells.EntireColumn.AutoFit()
}
Write-Host "Saving as XLSX..."
$wb.SaveAs([string]$xlsxPath, [int]51)
Write-Host "SUCCESS! Output: $xlsxPath ($((Get-Item $xlsxPath).Length) bytes)"
$wb.Close($false)
$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null

[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()

# Cleanup
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "`nFull PDF->HTML->XLSX pipeline: PASSED"
