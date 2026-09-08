$ErrorActionPreference = 'Stop'

$queueRoot = Join-Path $env:TEMP 'toolcraft-pdf2excel-queue'
$jobsDir = Join-Path $queueRoot 'jobs'
$heartbeatPath = Join-Path $queueRoot 'worker-heartbeat.json'

New-Item -ItemType Directory -Path $jobsDir -Force | Out-Null

Add-Type -AssemblyName System.Runtime.InteropServices

function Remove-ComObjectReference($obj) {
  if ($null -ne $obj) {
    try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($obj) | Out-Null } catch {}
  }
}

function Write-Heartbeat {
  $heartbeat = @{
    pid = $PID
    updatedAt = [DateTime]::UtcNow.ToString('o')
    machine = $env:COMPUTERNAME
  } | ConvertTo-Json -Compress

  Set-Content -Path $heartbeatPath -Value $heartbeat -Encoding UTF8
}

function Invoke-PdfToExcelJob {
  param(
    [Parameter(Mandatory = $true)]
    [string]$JobDir
  )

  $inputPath = Join-Path $JobDir 'input.pdf'
  $htmlPath = Join-Path $JobDir '_intermediate_.html'
  $outputPath = Join-Path $JobDir 'output.xlsx'
  $donePath = Join-Path $JobDir 'done.json'
  $requestPath = Join-Path $JobDir 'request.json'

  $word = $null
  $document = $null
  $excel = $null
  $workbook = $null

  $regPath = 'HKCU:\Software\Microsoft\Office\16.0\Word\Options'
  $regName = 'DisableConvertPdfWarning'
  $oldVal = $null

  try {
    if (Test-Path $regPath) {
      $oldVal = (Get-ItemProperty -Path $regPath -Name $regName -ErrorAction SilentlyContinue).$regName
      Set-ItemProperty -Path $regPath -Name $regName -Value 1 -Type DWord -Force
    }

    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $word.ScreenUpdating = $false
    $word.AutomationSecurity = 3

    $document = $word.Documents.Open([string]$inputPath, $false, $true)
    $document.SaveAs2([string]$htmlPath, [int]10)
    $document.Close($false)
    Remove-ComObjectReference $document
    $document = $null

    $word.Quit()
    Remove-ComObjectReference $word
    $word = $null

    Start-Sleep -Milliseconds 1500

    if (-not (Test-Path $htmlPath)) {
      throw 'Word did not produce the intermediate HTML file.'
    }

    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $excel.ScreenUpdating = $false
    $excel.AskToUpdateLinks = $false

    $workbook = $excel.Workbooks.Open([string]$htmlPath)

    foreach ($sheet in $workbook.Worksheets) {
      $sheet.Cells.EntireColumn.AutoFit() | Out-Null
    }

    if (Test-Path $outputPath) {
      Remove-Item -Path $outputPath -Force
    }

    $workbook.SaveAs([string]$outputPath, [int]51)

    $done = @{
      ok = $true
      completedAt = [DateTime]::UtcNow.ToString('o')
      request = if (Test-Path $requestPath) { Get-Content $requestPath -Raw | ConvertFrom-Json } else { $null }
    } | ConvertTo-Json -Depth 6
    Set-Content -Path $donePath -Value $done -Encoding UTF8
  }
  catch {
    $done = @{
      ok = $false
      completedAt = [DateTime]::UtcNow.ToString('o')
      error = $_.Exception.Message
      details = $_ | Out-String
    } | ConvertTo-Json -Depth 6
    Set-Content -Path $donePath -Value $done -Encoding UTF8
  }
  finally {
    if ($null -ne $document) {
      try { $document.Close($false) } catch {}
      Remove-ComObjectReference $document
    }
    if ($null -ne $word) {
      try { $word.Quit() } catch {}
      Remove-ComObjectReference $word
    }
    if ($null -ne $workbook) {
      try { $workbook.Close($false) } catch {}
      Remove-ComObjectReference $workbook
    }
    if ($null -ne $excel) {
      try { $excel.Quit() } catch {}
      Remove-ComObjectReference $excel
    }

    if (Test-Path $regPath) {
      if ($null -ne $oldVal) {
        Set-ItemProperty -Path $regPath -Name $regName -Value $oldVal -Type DWord -Force
      }
      else {
        Remove-ItemProperty -Path $regPath -Name $regName -ErrorAction SilentlyContinue
      }
    }

    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
  }
}

Write-Host "PDF-to-Excel worker started. Queue: $jobsDir"

while ($true) {
  try {
    Write-Heartbeat

    $jobs = Get-ChildItem -Path $jobsDir -Directory -ErrorAction SilentlyContinue | Sort-Object CreationTimeUtc
    foreach ($job in $jobs) {
      $donePath = Join-Path $job.FullName 'done.json'
      $lockPath = Join-Path $job.FullName 'processing.lock'
      $inputPath = Join-Path $job.FullName 'input.pdf'

      if ((Test-Path $donePath) -or (Test-Path $lockPath) -or -not (Test-Path $inputPath)) {
        continue
      }

      New-Item -ItemType File -Path $lockPath -Force | Out-Null
      try {
        Invoke-PdfToExcelJob -JobDir $job.FullName
      }
      finally {
        Remove-Item -Path $lockPath -Force -ErrorAction SilentlyContinue
      }
    }
  }
  catch {
    Write-Warning ($_ | Out-String)
  }

  Start-Sleep -Milliseconds 750
}
