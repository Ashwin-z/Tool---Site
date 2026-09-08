$ErrorActionPreference = 'Stop'

# ── Suppress the "Converting PDF" dialog via registry ──
$regPath = 'HKCU:\Software\Microsoft\Office\16.0\Word\Options'
if (Test-Path $regPath) {
  Set-ItemProperty -Path $regPath -Name 'DisableConvertPdfWarning' -Value 1 -Type DWord -Force
  Write-Host "Registry: DisableConvertPdfWarning set to 1"
} else {
  Write-Host "Registry path not found: $regPath"
}

# ── Find a test PDF ──
$pdfPath = Get-ChildItem "$env:TEMP\toolcraft*" -Filter *.pdf -Recurse -ErrorAction SilentlyContinue |
           Select-Object -First 1 -ExpandProperty FullName
if (-not $pdfPath) {
  $pdfPath = Get-ChildItem "$env:USERPROFILE\Downloads" -Filter *.pdf -ErrorAction SilentlyContinue |
             Select-Object -First 1 -ExpandProperty FullName
}
if (-not $pdfPath) { Write-Host "NO_PDF_FOUND"; exit 1 }
Write-Host "Input PDF: $pdfPath"

$outPath = Join-Path $env:TEMP "test_pdf2word_output.docx"
if (Test-Path $outPath) { Remove-Item $outPath -Force }

$word = $null
$doc  = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $word.ScreenUpdating = $false
  $word.AutomationSecurity = 3

  Write-Host "Opening PDF..."
  $doc = $word.Documents.Open(
    [string]$pdfPath,
    [bool]$false,
    [bool]$true,
    [bool]$false,
    [string]"",
    [string]"",
    [bool]$false,
    [string]"",
    [string]"",
    [int]0
  )
  Write-Host "PDF opened, saving as DOCX..."

  $doc.SaveAs2([string]$outPath, [int]16)
  Write-Host "OK size=$((Get-Item $outPath).Length)"
}
catch {
  Write-Host "ERROR: $_"
}
finally {
  if ($doc)  { try { $doc.Close($false) } catch {} }
  if ($word) { try { $word.Quit()       } catch {} }
}
