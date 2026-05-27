# Package LeaguePour for Hostinger Node.js deploy (standalone output).
# Run after: npx prisma generate && npx next build

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$PackageDir = Join-Path $Root "leaguepour-build-package"
$ZipPath = Join-Path $Root "leaguepour-next-build.zip"
$StandaloneDir = Join-Path $Root ".next\standalone"
$StandaloneServer = Join-Path $StandaloneDir "server.js"
$StandaloneNextServer = Join-Path $StandaloneDir ".next\server"
$StaticDir = Join-Path $Root ".next\static"
$PublicDir = Join-Path $Root "public"

function Write-Step($Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Assert-PathExists([string]$Path, [string]$Message) {
  if (-not (Test-Path $Path)) {
    throw $Message
  }
}

function Invoke-Robocopy($Source, $Destination) {
  Assert-PathExists $Source "Missing source path: $Source"
  New-Item -ItemType Directory -Force -Path $Destination | Out-Null
  & robocopy $Source $Destination /E /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null
  $code = $LASTEXITCODE
  if ($code -ge 8) {
    throw "robocopy failed ($code): $Source -> $Destination"
  }
}

Write-Step "Checking standalone build output (required before packaging)"
Assert-PathExists $StandaloneDir @"
.next/standalone was not found.
Run:
  npx prisma generate
  npx next build
Ensure next.config.ts includes: output: `"standalone`"
"@
Assert-PathExists $StandaloneServer "Standalone build is incomplete: missing $StandaloneServer"
Assert-PathExists $StandaloneNextServer "Standalone build is incomplete: missing $StandaloneNextServer"

Write-Host "  .next/standalone:              OK" -ForegroundColor Green
Write-Host "  .next/standalone/server.js:    OK" -ForegroundColor Green
Write-Host "  .next/standalone/.next/server: OK" -ForegroundColor Green

Write-Step "Cleaning previous package artifacts"
if (Test-Path $PackageDir) {
  try {
    Remove-Item -Recurse -Force $PackageDir -ErrorAction Stop
  } catch {
    Write-Host "  Retrying cleanup with rmdir..." -ForegroundColor Yellow
    cmd /c "rmdir /s /q `"$PackageDir`"" | Out-Null
    if (Test-Path $PackageDir) {
      throw "Could not remove existing package directory: $PackageDir"
    }
  }
}
if (Test-Path $ZipPath) {
  try {
    Remove-Item -Force $ZipPath -ErrorAction Stop
  } catch {
    cmd /c "del /f `"$ZipPath`"" | Out-Null
    if (Test-Path $ZipPath) {
      throw "Could not remove existing zip: $ZipPath"
    }
  }
}

Write-Step "Copying .next/standalone -> leaguepour-build-package"
Invoke-Robocopy $StandaloneDir $PackageDir

Write-Step "Copying .next/static -> leaguepour-build-package/.next/static"
Invoke-Robocopy $StaticDir (Join-Path $PackageDir ".next\static")

Write-Step "Copying public -> leaguepour-build-package/public"
Invoke-Robocopy $PublicDir (Join-Path $PackageDir "public")

Write-Step "Removing packaged .env (configure env vars in Hostinger)"
$packagedEnv = Join-Path $PackageDir ".env"
if (Test-Path $packagedEnv) {
  Remove-Item -Force $packagedEnv
  Write-Host "  Removed leaguepour-build-package/.env" -ForegroundColor Yellow
}

Write-Step "Verifying required deploy files before zipping"
$requiredPackagePaths = @(
  @{ Label = "server.js"; Path = Join-Path $PackageDir "server.js" },
  @{ Label = ".next/server"; Path = Join-Path $PackageDir ".next\server" },
  @{ Label = "public/marketing"; Path = Join-Path $PackageDir "public\marketing" }
)

foreach ($check in $requiredPackagePaths) {
  $exists = Test-Path $check.Path
  Write-Host ("  {0}: {1}" -f $check.Label, $(if ($exists) { "OK" } else { "MISSING" })) -ForegroundColor $(if ($exists) { "Green" } else { "Red" })
  if (-not $exists) {
    throw "Required deploy path missing: $($check.Label) ($($check.Path))"
  }
}

Write-Step "Creating leaguepour-next-build.zip"
& tar -a -c -f $ZipPath -C $PackageDir .
if ($LASTEXITCODE -ne 0) {
  throw "tar failed to create zip (exit $LASTEXITCODE): $ZipPath"
}

Assert-PathExists $ZipPath "Failed to create zip: $ZipPath"

$zipSizeMb = [math]::Round((Get-Item $ZipPath).Length / 1MB, 2)
Write-Host ""
Write-Host "Verification:" -ForegroundColor Cyan
Write-Host ("  Test-Path .next/standalone:              {0}" -f (Test-Path $StandaloneDir))
Write-Host ("  Test-Path .next/standalone/server.js:    {0}" -f (Test-Path $StandaloneServer))
Write-Host ("  Test-Path .next/standalone/.next/server: {0}" -f (Test-Path $StandaloneNextServer))
Write-Host ("  Test-Path package server.js:             {0}" -f (Test-Path (Join-Path $PackageDir "server.js")))
Write-Host ("  Test-Path package .next/server:          {0}" -f (Test-Path (Join-Path $PackageDir ".next\server")))
Write-Host ("  Test-Path package public/marketing:      {0}" -f (Test-Path (Join-Path $PackageDir "public\marketing")))
Write-Host ""
Write-Host "Package ready:" -ForegroundColor Green
Write-Host "  Directory: $PackageDir"
Write-Host "  Zip:       $ZipPath ($zipSizeMb MB)"
Write-Host ""
Write-Host "Hostinger deploy: upload and extract zip so server.js lives at nodejs/server.js (or your app root)." -ForegroundColor Cyan
