# Stores a CJ personal access token for scripts/cj-fetch-links.ts, outside the repo.
#   powershell -ExecutionPolicy Bypass -File scripts/cj-set-token.ps1
# Input is hidden. The file lives in your user profile (never committed, never part of a build),
# readable only by your Windows account.
$dir = Join-Path $env:USERPROFILE ".config\leaguepour"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$path = Join-Path $dir "cj.env"

$secure = Read-Host -AsSecureString "Paste your CJ personal access token (input hidden)"
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr).Trim()
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}
if ([string]::IsNullOrWhiteSpace($token)) { Write-Host "No token entered; nothing saved."; exit 1 }

Set-Content -Path $path -Value "CJ_ACCESS_TOKEN=$token" -Encoding ascii -NoNewline
$token = $null
# Owner-only access.
icacls $path /inheritance:r /grant:r "$($env:USERNAME):(R,W)" | Out-Null
Write-Host "Saved to $path (token not shown)."
