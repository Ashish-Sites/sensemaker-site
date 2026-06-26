param(
    [string]$PublicDir = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot "..")).Path "public"),
    [string]$SiteBasePath = "/sensemaker-site"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$errors = New-Object System.Collections.Generic.List[string]

function Add-Error {
    param([string]$Message)
    $errors.Add($Message)
}

function Normalize-BasePath {
    param([string]$BasePath)

    if ([string]::IsNullOrWhiteSpace($BasePath)) {
        return ""
    }

    $value = $BasePath.Trim()
    if (-not $value.StartsWith("/")) {
        $value = "/" + $value
    }

    $value = $value.TrimEnd('/')
    if ($value -eq "/") {
        return ""
    }

    return $value
}

function Get-ResolvedTargetPath {
    param(
        [string]$PublicRoot,
        [string]$HtmlFilePath,
        [string]$UrlPath,
        [string]$BasePath
    )

    $clean = $UrlPath -replace '[?#].*$', ''
    if ([string]::IsNullOrWhiteSpace($clean)) {
        return $null
    }

    if ($clean.StartsWith("/")) {
        $trimmed = $clean.TrimStart('/')

        if (-not [string]::IsNullOrEmpty($BasePath)) {
            $prefix = $BasePath.TrimStart('/') + "/"
            if ($trimmed.StartsWith($prefix)) {
                $trimmed = $trimmed.Substring($prefix.Length)
            }
        }

        return Join-Path $PublicRoot $trimmed
    }

    $htmlDir = Split-Path -Parent $HtmlFilePath
    return Join-Path $htmlDir $clean
}

function Test-LinkTargetExists {
    param(
        [string]$CandidatePath,
        [string]$OriginalPath
    )

    if ([string]::IsNullOrWhiteSpace($CandidatePath)) {
        return $true
    }

    $normalizedCandidate = $CandidatePath
    $hasTrailingSlash = $OriginalPath -match '/$'
    $hasExtension = [System.IO.Path]::GetExtension($OriginalPath)

    if (Test-Path -LiteralPath $normalizedCandidate) {
        $item = Get-Item -LiteralPath $normalizedCandidate
        if ($item.PSIsContainer) {
            return (Test-Path -LiteralPath (Join-Path $normalizedCandidate "index.html"))
        }
        return $true
    }

    if ($hasTrailingSlash) {
        return (Test-Path -LiteralPath (Join-Path $normalizedCandidate "index.html"))
    }

    if ([string]::IsNullOrWhiteSpace($hasExtension)) {
        if (Test-Path -LiteralPath ($normalizedCandidate + ".html")) {
            return $true
        }

        if (Test-Path -LiteralPath (Join-Path $normalizedCandidate "index.html")) {
            return $true
        }
    }

    return $false
}

if (-not (Test-Path -LiteralPath $PublicDir)) {
    Write-Host "Public directory not found: $PublicDir"
    exit 1
}

$basePath = Normalize-BasePath -BasePath $SiteBasePath
$htmlFiles = Get-ChildItem -Path $PublicDir -Recurse -File -Filter "*.html"

$linkPattern = [regex]'(?is)\b(?:href|src)\s*=\s*["'']([^"'']+)["'']'

foreach ($htmlFile in $htmlFiles) {
    $raw = Get-Content -LiteralPath $htmlFile.FullName -Raw
    $matches = $linkPattern.Matches($raw)

    foreach ($m in $matches) {
        $url = $m.Groups[1].Value.Trim()
        if ([string]::IsNullOrWhiteSpace($url)) {
            continue
        }

        if ($url.StartsWith("#")) {
            continue
        }

        if ($url -match '^(mailto:|tel:|javascript:|data:|https?:)') {
            continue
        }

        if ($url.StartsWith("//")) {
            continue
        }

        $pathOnly = $url -replace '[?#].*$', ''
        $targetPath = Get-ResolvedTargetPath -PublicRoot $PublicDir -HtmlFilePath $htmlFile.FullName -UrlPath $pathOnly -BasePath $basePath

        if (-not (Test-LinkTargetExists -CandidatePath $targetPath -OriginalPath $pathOnly)) {
            $relativeHtml = $htmlFile.FullName.Replace((Resolve-Path $PublicDir).Path, "").TrimStart('\\', '/')
            Add-Error("Broken link in public/$relativeHtml -> $url")
        }
    }
}

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Built-link validation failed:"
    foreach ($err in $errors) {
        Write-Host ("- {0}" -f $err)
    }
    exit 1
}

Write-Host ("Validated built links across {0} HTML file(s)." -f $htmlFiles.Count)
Write-Host "Built-link validation passed."
