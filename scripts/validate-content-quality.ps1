Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$errors = New-Object System.Collections.Generic.List[string]

function Add-Error {
    param([string]$Message)
    $errors.Add($Message)
}

function Resolve-StaticPathFromUrl {
    param([string]$Url)

    if ($Url -match '^https://ashish-sites\.github\.io/sensemaker-site/images/(.+)$') {
        return Join-Path $repoRoot (Join-Path "static/images" $Matches[1])
    }

    if ($Url -match '^/sensemaker-site/images/(.+)$') {
        return Join-Path $repoRoot (Join-Path "static/images" $Matches[1])
    }

    return $null
}

$contentFiles = Get-ChildItem -Path (Join-Path $repoRoot "content") -Recurse -File -Filter "*.md"

foreach ($file in $contentFiles) {
    $raw = Get-Content -LiteralPath $file.FullName -Raw

    # 1) Ensure fenced code blocks are balanced.
    $fenceCount = [regex]::Matches($raw, '(?m)^```').Count
    if (($fenceCount % 2) -ne 0) {
        Add-Error("Unbalanced fenced code blocks in: $($file.FullName)")
    }

    # 2) Enforce site-path-safe root links in markdown bodies.
    $linkMatches = [regex]::Matches($raw, '\[[^\]]+\]\(([^)]+)\)')
    foreach ($m in $linkMatches) {
        $url = $m.Groups[1].Value.Trim()
        if ($url -match '^/') {
            if ($url -notmatch '^/sensemaker-site/') {
                Add-Error("Root-relative link must include /sensemaker-site/ prefix in $($file.FullName): $url")
            }
        }
    }

    # 3) Validate markdown image references point to existing static files when local site URLs are used.
    $imgMatches = [regex]::Matches($raw, '!\[[^\]]*\]\(([^)]+)\)')
    foreach ($m in $imgMatches) {
        $url = $m.Groups[1].Value.Trim()
        $resolved = Resolve-StaticPathFromUrl -Url $url
        if ($null -ne $resolved -and -not (Test-Path $resolved)) {
            Add-Error("Image reference does not exist for $($file.FullName): $url")
        }
    }
}

# 4) Ensure Questions section is rendered before body content in investigation detail template.
$investigationTemplate = Join-Path $repoRoot "themes/sensemaker/layouts/investigations/single.html"
if (-not (Test-Path $investigationTemplate)) {
    Add-Error("Missing investigation detail template: $investigationTemplate")
} else {
    $templateRaw = Get-Content -LiteralPath $investigationTemplate -Raw
    $qIndex = $templateRaw.IndexOf('{{ if .Params.questions }}')
    $contentIndex = $templateRaw.IndexOf('{{ if .Content }}')

    if ($qIndex -lt 0) {
        Add-Error("Could not find Questions section in investigation detail template.")
    }
    if ($contentIndex -lt 0) {
        Add-Error("Could not find body content section in investigation detail template.")
    }
    if ($qIndex -ge 0 -and $contentIndex -ge 0 -and $qIndex -gt $contentIndex) {
        Add-Error("Questions section appears after body content in investigation detail template.")
    }
}

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Content quality validation failed:"
    foreach ($err in $errors) {
        Write-Host ("- {0}" -f $err)
    }
    exit 1
}

Write-Host ("Validated content quality across {0} markdown file(s)." -f $contentFiles.Count)
Write-Host "Content quality validation passed."
