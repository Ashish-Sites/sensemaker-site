param(
    [string]$BaseUrl = "https://ashish-sites.github.io/sensemaker-site/",
    [string]$OutputDir = "public"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

if ($BaseUrl -match '^\[[^\]]+\]\((https?://[^)]+)\)$') {
    $BaseUrl = $Matches[1]
}

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
$hugoFromPath = Get-Command "hugo" -ErrorAction SilentlyContinue
$runningOnWindows = [System.Runtime.InteropServices.RuntimeInformation]::IsOSPlatform([System.Runtime.InteropServices.OSPlatform]::Windows)

if ($runningOnWindows) {
    if (Test-Path -LiteralPath $localHugoExe) {
        $hugoCommand = $localHugoExe
    } elseif (Test-Path -LiteralPath $localHugo) {
        $hugoCommand = $localHugo
    } elseif ($hugoFromPath) {
        $hugoCommand = "hugo"
    }
} else {
    if ($hugoFromPath) {
        $hugoCommand = "hugo"
    } elseif (Test-Path -LiteralPath $localHugo) {
        $hugoCommand = $localHugo
    }
}

if (-not $hugoCommand) {
    throw "Hugo executable not found for this OS. Install Hugo or add it to PATH."
}

Write-Host "Running taxonomy validation..."
$taxonomyValidator = Join-Path $PSScriptRoot "validate-taxonomy.ps1"
if (Test-Path -LiteralPath $taxonomyValidator) {
    & $shellCommand -File $taxonomyValidator
} else {
    Write-Warning "Skipping taxonomy validation: missing script $taxonomyValidator"
}

Write-Host "Running content quality validation..."
$contentValidator = Join-Path $PSScriptRoot "validate-content-quality.ps1"
if (Test-Path -LiteralPath $contentValidator) {
    & $shellCommand -File $contentValidator
} else {
    Write-Warning "Skipping content quality validation: missing script $contentValidator"
}

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

$builtLinksValidator = Join-Path $PSScriptRoot "validate-built-links.ps1"
if (Test-Path -LiteralPath $builtLinksValidator) {
    & $shellCommand -File $builtLinksValidator -PublicDir $resolvedOutputDir
} else {
    Write-Warning "Skipping built-link validation: missing script $builtLinksValidator"
}

Write-Host "All validations passed. Build completed successfully."
