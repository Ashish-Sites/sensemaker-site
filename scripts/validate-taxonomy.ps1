Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

$taxonomyRules = @(
    @{ Name = "areas"; Path = "content/areas"; EntryType = "area_term" },
    @{ Name = "topics"; Path = "content/topics"; EntryType = "topic_term" },
    @{ Name = "tags"; Path = "content/tags"; EntryType = "tag_term" },
    @{ Name = "questions"; Path = "content/questions"; EntryType = "question_term" }
)

$errors = New-Object System.Collections.Generic.List[string]

function Get-FrontMatterValue {
    param(
        [string]$Text,
        [string]$Key
    )

    $pattern = "(?m)^" + [regex]::Escape($Key) + ":\s*(.+?)\s*$"
    $match = [regex]::Match($Text, $pattern)
    if (-not $match.Success) {
        return $null
    }

    return $match.Groups[1].Value.Trim().Trim('"')
}

foreach ($rule in $taxonomyRules) {
    $taxonomyDir = Join-Path $repoRoot $rule.Path

    if (-not (Test-Path -LiteralPath $taxonomyDir)) {
        $errors.Add("Missing taxonomy directory: $($rule.Path)")
        continue
    }

    $sectionIndex = Join-Path $taxonomyDir "_index.md"
    if (-not (Test-Path -LiteralPath $sectionIndex)) {
        $errors.Add("Missing section index file: $($rule.Path)/_index.md")
    }

    $allMarkdown = Get-ChildItem -Path $taxonomyDir -Recurse -File -Filter *.md

    foreach ($file in $allMarkdown) {
        $relative = $file.FullName.Substring($repoRoot.Path.Length + 1) -replace '\\', '/'

        if ($relative -eq "$($rule.Path)/_index.md") {
            continue
        }

        $parentName = Split-Path -Path $file.DirectoryName -Leaf
        $isCanonicalTermIndex = ($file.Name -eq "_index.md") -and ($parentName -ne "")
        if (-not $isCanonicalTermIndex) {
            $errors.Add("Non-canonical taxonomy file path: $relative (expected <slug>/_index.md)")
            continue
        }

        $text = Get-Content -LiteralPath $file.FullName -Raw
        $entryType = Get-FrontMatterValue -Text $text -Key "entry_type"
        if ($entryType -ne $rule.EntryType) {
            $errors.Add("Invalid or missing entry_type in $relative (expected '$($rule.EntryType)')")
        }
    }
}

if ($errors.Count -gt 0) {
    Write-Host "Taxonomy validation failed:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host " - $err" -ForegroundColor Red
    }
    throw "Taxonomy validation failed with $($errors.Count) issue(s)."
}

Write-Host "Taxonomy validation passed." -ForegroundColor Green
