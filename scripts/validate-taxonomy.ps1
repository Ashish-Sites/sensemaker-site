Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

$taxonomyRules = @(
    @{ Name = "areas"; EntryType = "area_term" },
    @{ Name = "topics"; EntryType = "topic_term" },
    @{ Name = "tags"; EntryType = "tag_term" },
    @{ Name = "questions"; EntryType = "question_term" }
)

$errors = New-Object System.Collections.Generic.List[string]

function Get-FrontMatter {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    $match = [regex]::Match($Content, "(?s)^---\s*(.*?)\s*---")
    if (-not $match.Success) {
        return $null
    }

    return $match.Groups[1].Value
}

foreach ($rule in $taxonomyRules) {
    $taxonomyDir = Join-Path $repoRoot (Join-Path "content" $rule.Name)
    if (-not (Test-Path $taxonomyDir)) {
        $errors.Add("Missing taxonomy directory: $taxonomyDir")
        continue
    }

    $rootIndex = Join-Path $taxonomyDir "_index.md"
    if (-not (Test-Path $rootIndex)) {
        $errors.Add("Missing root taxonomy index file: $rootIndex")
    }

    $duplicateIndexFiles = Get-ChildItem -Path $taxonomyDir -Recurse -File -Filter "_index-*.md"
    foreach ($dup in $duplicateIndexFiles) {
        $errors.Add("Duplicate term index file detected (must be renamed to _index.md): $($dup.FullName)")
    }

    $termFiles = Get-ChildItem -Path $taxonomyDir -Recurse -File -Filter "_index.md" |
        Where-Object { $_.FullName -ne $rootIndex }

    $titleToPath = @{}
    foreach ($termFile in $termFiles) {
        $content = Get-Content -LiteralPath $termFile.FullName -Raw
        $frontMatter = Get-FrontMatter -Content $content
        if ($null -eq $frontMatter) {
            $errors.Add("Missing or invalid front matter in: $($termFile.FullName)")
            continue
        }

        $entryTypePattern = "(?mi)^\s*entry_type\s*:\s*$([regex]::Escape($rule.EntryType))\s*$"
        if (-not [regex]::IsMatch($frontMatter, $entryTypePattern)) {
            $errors.Add("Missing or invalid entry_type in $($termFile.FullName). Expected: $($rule.EntryType)")
        }

        $titleMatch = [regex]::Match($frontMatter, "(?mi)^\s*title\s*:\s*(.+?)\s*$")
        if (-not $titleMatch.Success) {
            $errors.Add("Missing title in term file: $($termFile.FullName)")
            continue
        }

        $title = $titleMatch.Groups[1].Value.Trim().Trim('"').Trim("'")
        $normalizedTitle = $title.ToLowerInvariant()
        if ($titleToPath.ContainsKey($normalizedTitle)) {
            $errors.Add("Duplicate term title '$title' in taxonomy '$($rule.Name)': $($titleToPath[$normalizedTitle]) and $($termFile.FullName)")
            continue
        }

        $titleToPath[$normalizedTitle] = $termFile.FullName
    }

    Write-Host ("Validated taxonomy '{0}' with {1} term file(s)." -f $rule.Name, $termFiles.Count)
}

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Taxonomy validation failed:"
    foreach ($err in $errors) {
        Write-Host ("- {0}" -f $err)
    }
    exit 1
}

Write-Host "Taxonomy validation passed."