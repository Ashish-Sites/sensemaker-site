param(
    [string]$BaseUrl = "https://ashish-sites.github.io/sensemaker-site/",
    [string]$OutputDir = "public"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

$shellCommand = $null
if (Get-Command "pwsh" -ErrorAction SilentlyContinue) {
    $shellCommand = "pwsh"
} elseif (Get-Command "powershell" -ErrorAction SilentlyContinue) {
    $shellCommand = "powershell"
} else {
    throw "Neither 'pwsh' nor 'powershell' is available on PATH."
}

$hugoCommand = $null
$localHugo = Join-Path $repoRoot "hugo"
$localHugoExe = Join-Path $repoRoot "hugo.exe"
if (Test-Path -LiteralPath $localHugoExe) {
    $hugoCommand = $localHugoExe
} elseif (Test-Path -LiteralPath $localHugo) {
    $hugoCommand = $localHugo
} elseif (Get-Command "hugo" -ErrorAction SilentlyContinue) {
    $hugoCommand = "hugo"
} else {
    throw "Hugo executable not found. Install Hugo or add it to PATH."
}

Write-Host "Running taxonomy validation..."
& $shellCommand -File (Join-Path $PSScriptRoot "validate-taxonomy.ps1")

Write-Host "Running content quality validation..."
& $shellCommand -File (Join-Path $PSScriptRoot "validate-content-quality.ps1")

Write-Host "Building Hugo site..."
Push-Location $repoRoot
try {
    & $hugoCommand --minify --cleanDestinationDir --baseURL $BaseUrl --destination $OutputDir
} finally {
    Pop-Location
}

Write-Host "Running built-link validation..."
$resolvedOutputDir = Join-Path $repoRoot $OutputDir
if (-not (Test-Path -LiteralPath $resolvedOutputDir)) {
    throw "Build output directory not found: $resolvedOutputDir"
}

& $shellCommand -File (Join-Path $PSScriptRoot "validate-built-links.ps1") -PublicDir $resolvedOutputDir

Write-Host "All validations passed. Build completed successfully."
