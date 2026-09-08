$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$installDir = Join-Path $root 'bin\ghostscript\gs'
$installerDir = Split-Path -Parent $installDir
$installerPath = Join-Path $installerDir 'gs10070w64.exe'
$exePath = Join-Path $installDir 'bin\gswin64c.exe'
$downloadUrl = 'https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/gs10070/gs10070w64.exe'

if (Test-Path $exePath) {
  Write-Host "Ghostscript is already installed at $exePath"
  exit 0
}

New-Item -ItemType Directory -Force -Path $installerDir | Out-Null

Write-Host 'Downloading Ghostscript installer...'
Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath

Write-Host 'Installing Ghostscript locally into the project...'
Start-Process -FilePath $installerPath -ArgumentList '/S',"/D=$installDir" -Wait -NoNewWindow

if (-not (Test-Path $exePath)) {
  throw "Ghostscript installation completed but gswin64c.exe was not found at $exePath"
}

Write-Host "Ghostscript installed successfully at $exePath"
