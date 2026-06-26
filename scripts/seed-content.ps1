$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path "$PSScriptRoot/..").Path

$targetDirs = @('content/areas','content/topics','content/tags','content/questions','content/articles','content/investigations')
foreach ($d in $targetDirs) {
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
  Get-ChildItem $d -Force | Remove-Item -Recurse -Force
}

function Write-Md {
  param([string]$Path,[string[]]$Lines)
  $dir = Split-Path -Parent $Path
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  Set-Content -Path $Path -Value ($Lines -join "`n") -Encoding utf8
}

$areas = @(
  'Personal Systems','Technical Systems','Learning Design','Research Practice','Product Thinking','AI Strategy','Writing Craft','Knowledge Management','Decision Making','Career Development','Data Literacy','Social Dynamics'
)
$topics = @(
  'Habit Formation Loops','Distributed Systems Tradeoffs','Learning Feedback Cycles','Experiment Design','Roadmapping Under Uncertainty','Model Evaluation Patterns','Argument Structure','Note-making Workflows','Decision Journaling','Career Narrative Design','Causal Inference Basics','Team Communication Norms'
)
$topicAreas = @(
  'Personal Systems','Technical Systems','Learning Design','Research Practice','Product Thinking','AI Strategy','Writing Craft','Knowledge Management','Decision Making','Career Development','Data Literacy','Social Dynamics'
)
$tags = @('framework','first-principles','case-study','synthesis','open-question','hypothesis','evidence-log','counterexample','weekly-review','long-term','quick-win','risk')
$questions = @(
  'What problem am I actually trying to solve?',
  'What assumptions am I making without evidence?',
  'Which tradeoff matters most right now?',
  'What would change my mind?',
  'What is the smallest useful experiment?',
  'Where is the bottleneck in this system?',
  'What does success look like in 90 days?',
  'What signals should I monitor weekly?',
  'Which alternative explanation fits the data?',
  'What can be simplified without losing value?',
  'Who is affected by this decision?',
  'What should be documented for future me?'
)

for ($i=0; $i -lt 12; $i++) {
  $n = '{0:D2}' -f ($i+1)
  $slug = "area-$n"
  Write-Md "content/areas/$slug/_index.md" @(
    '---',
    'entry_type: area_term',
    ('title: "{0}"' -f $areas[$i]),
    ('description: "Area {0} anchors a broad investigation domain."' -f $n),
    'lifecycle: active',
    'draft: false',
    '---',
    ('Broad context for investigations related to **{0}**.' -f $areas[$i])
  )
}

for ($i=0; $i -lt 12; $i++) {
  $n = '{0:D2}' -f ($i+1)
  $slug = "topic-$n"
  Write-Md "content/topics/$slug/_index.md" @(
    '---',
    'entry_type: topic_term',
    ('title: "{0}"' -f $topics[$i]),
    ('description: "Topic {0} provides focused subject context for investigations."' -f $n),
    ('primary_area: "{0}"' -f $topicAreas[$i]),
    'lifecycle: active',
    'draft: false',
    '---',
    ('Focused topic aligned to **{0}**.' -f $topicAreas[$i])
  )
}

for ($i=0; $i -lt 12; $i++) {
  $n = '{0:D2}' -f ($i+1)
  $slug = "tag-$n"
  Write-Md "content/tags/$slug/_index.md" @(
    '---',
    'entry_type: tag_term',
    ('title: "{0}"' -f $tags[$i]),
    ('description: "Tag {0} for cross-cutting classification."' -f $n),
    'lifecycle: active',
    'draft: false',
    '---',
    'Cross-cutting tag used across investigations and articles.'
  )
}

for ($i=0; $i -lt 12; $i++) {
  $n = '{0:D2}' -f ($i+1)
  $slug = "question-$n"
  Write-Md "content/questions/$slug/_index.md" @(
    '---',
    'entry_type: question_term',
    ('title: "{0}"' -f $questions[$i]),
    ('description: "Question {0} guides investigation intent and scope."' -f $n),
    'lifecycle: active',
    'draft: false',
    '---',
    'Inquiry prompt for investigation planning and review.'
  )
}

$articleTypes = @('idea','sub-article','comment','evidence','summary','counterpoint','quote','definition','synthesis','idea','evidence','summary')
$confLevels = @('low','medium','high')
for ($i=0; $i -lt 12; $i++) {
  $n = '{0:D2}' -f ($i+1)
  $slug = "article-$n"
  $created = (Get-Date '2026-05-01').AddDays($i).ToString('yyyy-MM-dd')
  $type = $articleTypes[$i]
  $conf = $confLevels[$i % 3]
  $inv1 = "investigation-$n"
  $inv2 = "investigation-{0:D2}" -f ((($i+1) % 12) + 1)
  $tag1 = $tags[$i]
  $tag2 = $tags[(($i+1) % 12)]
  $src = if ($type -in @('evidence','quote')) { ('source_link: "https://example.com/source/{0}"' -f $slug) } else { $null }

  $lines = @(
    '---',
    'entry_type: article',
    ('title: "Article {0}: {1}"' -f $n, $topics[$i]),
    ('description: "Sample article {0} for entry-page validation and linked navigation."' -f $n),
    ('created: {0}' -f $created),
    ('article_type: {0}' -f $type),
    'investigations:',
    ('  - {0}' -f $inv1),
    ('  - {0}' -f $inv2),
    'tags:',
    ('  - "{0}"' -f $tag1),
    ('  - "{0}"' -f $tag2)
  )
  if ($src) { $lines += $src }
  $lines += @(
    ('confidence: {0}' -f $conf),
    ('canonical_investigation: {0}' -f $inv1),
    'lifecycle: active',
    'draft: false',
    '---',
    '## Summary',
    'This sample article contains enough structure to validate individual entry layout and related links.',
    '',
    '## Notes',
    '- Generated as fixture content.',
    '- Linked to active taxonomy and investigation entries.'
  )

  Write-Md "content/articles/$slug.md" $lines
}

$statuses = @('Seed','Thinking','Reading','Exploring','Model Emerging','Essay Draft','Stable','Reopened','Archived','Thinking','Exploring','Stable')
for ($i=0; $i -lt 12; $i++) {
  $n = '{0:D2}' -f ($i+1)
  $slug = "investigation-$n"
  $created = (Get-Date '2026-04-01').AddDays($i*2).ToString('yyyy-MM-dd')
  $area1 = $areas[$i]
  $area2 = $areas[(($i+1) % 12)]
  $topic1 = $topics[$i]
  $topic2 = $topics[(($i+2) % 12)]
  $q1 = $questions[$i]
  $q2 = $questions[(($i+3) % 12)]
  $tag1 = $tags[$i]
  $tag2 = $tags[(($i+4) % 12)]
  $related = "investigation-{0:D2}" -f ((($i+1) % 12) + 1)
  $art1 = "article-$n"
  $art2 = "article-{0:D2}" -f ((($i+2) % 12) + 1)

  Write-Md "content/investigations/$slug.md" @(
    '---',
    'entry_type: investigation',
    ('title: "Investigation {0}: {1}"' -f $n, $topics[$i]),
    ('description: "Sample investigation {0} to validate detail views and relationship rendering."' -f $n),
    ('created: {0}' -f $created),
    ('status: "{0}"' -f $statuses[$i]),
    'areas:',
    ('  - "{0}"' -f $area1),
    ('  - "{0}"' -f $area2),
    'topics:',
    ('  - "{0}"' -f $topic1),
    ('  - "{0}"' -f $topic2),
    'questions:',
    ('  - "{0}"' -f $q1),
    ('  - "{0}"' -f $q2),
    'tags:',
    ('  - "{0}"' -f $tag1),
    ('  - "{0}"' -f $tag2),
    'related:',
    ('  - {0}' -f $related),
    'attached_articles:',
    ('  - {0}' -f $art1),
    ('  - {0}' -f $art2),
    'draft: false',
    '---',
    '## Why this exists',
    'This entry is seeded to test individual investigation pages with full relationship context.',
    '',
    '## Current synthesis',
    'Narrative remains primary, with linked articles acting as supporting evidence and notes.'
  )
}

Write-Output 'Created content fixtures (count per type):'
Write-Output "Areas: $((Get-ChildItem content/areas -Directory | Measure-Object).Count)"
Write-Output "Topics: $((Get-ChildItem content/topics -Directory | Measure-Object).Count)"
Write-Output "Tags: $((Get-ChildItem content/tags -Directory | Measure-Object).Count)"
Write-Output "Questions: $((Get-ChildItem content/questions -Directory | Measure-Object).Count)"
Write-Output "Articles: $((Get-ChildItem content/articles -File -Filter *.md | Measure-Object).Count)"
Write-Output "Investigations: $((Get-ChildItem content/investigations -File -Filter *.md | Measure-Object).Count)"
