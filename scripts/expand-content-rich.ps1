$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path "$PSScriptRoot/..").Path

function Get-Description200 {
  param(
    [string]$Kind,
    [string]$Title,
    [string]$Slug
  )

  $base = "Sample $Kind entry for rendering validation across cards, tables, and detail layouts. It keeps dense phrasing, varied punctuation, and readable structure to stress wrapping, truncation, and typographic rhythm in this preview."
  if ($base.Length -gt 200) { return $base.Substring(0, 200) }
  if ($base.Length -lt 200) { return $base + ('x' * (200 - $base.Length)) }
  return $base
}

function Get-RichBody {
  param(
    [string]$Title,
    [string]$TypeName,
    [string]$Slug
  )

  @(
    "# Overview",
    "",
    "This is an expanded sample body for **$TypeName** entry **$Title**. It is intentionally verbose so you can review spacing, hierarchy, and readability at multiple screen sizes.",
    "",
    "## Heading Level 2",
    "",
    "### Heading Level 3",
    "",
    "#### Heading Level 4",
    "",
    "##### Heading Level 5",
    "",
    "###### Heading Level 6",
    "",
    "## Paragraphs and Inline Formatting",
    "",
    'Lorem ipsum style content can hide real rendering issues, so this paragraph mixes **bold**, *italic*, ~~strikethrough~~, `inline code`, and [an internal link](https://ashish-sites.github.io/sensemaker-site/investigations/) with [an external link](https://gohugo.io).',
    "",
    "A second paragraph adds more line wrapping behavior, longer sentence lengths, and a different cadence so you can evaluate vertical rhythm in lists, cards, and prose containers.",
    "",
    "## Blockquote",
    "",
    "> A useful page layout is one that still looks intentional when content becomes noisy, long, and uneven.",
    ">",
    "> - Rendering note",
    "",
    "## Ordered List",
    "",
    "1. First ordered item with a sentence-length description.",
    "2. Second ordered item with nested detail:",
    "   1. Nested ordered item one.",
    "   2. Nested ordered item two.",
    "3. Third ordered item with a concluding note.",
    "",
    "## Unordered List",
    "",
    "- Bullet item one",
    "- Bullet item two",
    "  - Nested bullet A",
    "  - Nested bullet B",
    "- Bullet item three",
    "",
    "## Task List",
    "",
    "- [x] Completed sample task",
    "- [ ] Pending sample task",
    "",
    "## Table",
    "",
    "| Field | Example | Notes |",
    "|---|---|---|",
    "| Type | $TypeName | Demonstrates table alignment and borders |",
    "| Slug | $Slug | Useful for traceability in previews |",
    "| Status | Active | Placeholder value for rendering checks |",
    "",
    "## Code Block",
    "",
    '```yaml',
    "entry_type: $TypeName",
    "title: $Title",
    "slug: $Slug",
    '```',
    "",
    "## Horizontal Rule",
    "",
    "---",
    "",
    "## Image",
    "",
    "![Sample placeholder image](https://ashish-sites.github.io/sensemaker-site/images/uploads/sensemaker-grid.svg)",
    "",
    "## Multi-column Content",
    "",
    '<div style="columns: 2; column-gap: 1.5rem;">',
    '<p>This paragraph is in a two-column HTML block embedded within Markdown. It helps verify that richer body content still behaves correctly inside the main content pane and does not break grid alignment.</p>',
    '<p>Second paragraph in the same column container. Use this to evaluate line breaks, balancing, and spacing near headings, lists, and tables in a dense page layout with metadata side panels.</p>',
    '</div>',
    "",
    "## Footnote-style Line",
    "",
    'Term reference: [Explore Topics](https://ashish-sites.github.io/sensemaker-site/topics/) and [Explore Tags](https://ashish-sites.github.io/sensemaker-site/tags/).'
  ) -join "`n"
}

$files = Get-ChildItem -Path 'content' -Recurse -File -Filter '*.md'
foreach ($file in $files) {
  $raw = Get-Content -LiteralPath $file.FullName -Raw
  $match = [regex]::Match($raw, '(?s)^---\s*(.*?)\s*---\s*(.*)$')
  if (-not $match.Success) { continue }

  $frontMatter = $match.Groups[1].Value
  $body = $match.Groups[2].Value

  $entryTypeMatch = [regex]::Match($frontMatter, '(?mi)^\s*entry_type\s*:\s*(.+?)\s*$')
  $titleMatch = [regex]::Match($frontMatter, '(?mi)^\s*title\s*:\s*(.+?)\s*$')

  $entryType = if ($entryTypeMatch.Success) { $entryTypeMatch.Groups[1].Value.Trim().Trim('"').Trim("'") } else { 'entry' }
  $title = if ($titleMatch.Success) { $titleMatch.Groups[1].Value.Trim().Trim('"').Trim("'") } else { $file.BaseName }

  $slug = $file.BaseName
  if ($file.Name -eq '_index.md') {
    $slug = Split-Path -Leaf (Split-Path -Parent $file.FullName)
  }

  $desc = Get-Description200 -Kind $entryType -Title $title -Slug $slug

  if ([regex]::IsMatch($frontMatter, '(?mi)^\s*description\s*:')) {
    $frontMatter = [regex]::Replace($frontMatter, '(?mi)^\s*description\s*:.*$', ('description: "{0}"' -f $desc))
  } else {
    $frontMatter = $frontMatter.TrimEnd() + "`n" + ('description: "{0}"' -f $desc)
  }

  $newBody = Get-RichBody -Title $title -TypeName $entryType -Slug $slug
  $newText = "---`n$frontMatter`n---`n`n$newBody`n"
  Set-Content -LiteralPath $file.FullName -Value $newText -Encoding utf8
}

# Ensure placeholder image exists for markdown image rendering checks
$imgDir = 'static/images/uploads'
if (-not (Test-Path $imgDir)) {
  New-Item -Path $imgDir -ItemType Directory -Force | Out-Null
}

$svgPath = Join-Path $imgDir 'sample-placeholder.svg'
$svg = @'
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" aria-label="Sample placeholder">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1f2937"/>
      <stop offset="100%" stop-color="#0f766e"/>
    </linearGradient>
  </defs>
  <rect width="960" height="540" fill="url(#g)"/>
  <g fill="#e5e7eb" font-family="Segoe UI, sans-serif" text-anchor="middle">
    <text x="480" y="250" font-size="42" font-weight="700">Sample Content Image</text>
    <text x="480" y="295" font-size="22">Used for markdown rendering validation</text>
  </g>
</svg>
'@
Set-Content -LiteralPath $svgPath -Value $svg -Encoding utf8

Write-Output "Updated files: $($files.Count)"
