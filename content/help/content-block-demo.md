---
title: "Content Block Demo"
description: "Dummy content page to test rendering of all supported content blocks."
draft: false
---

## Table of Contents

- [Callout](#callout)
- [Code](#code)
- [Mermaid](#mermaid)
- [Chart](#chart)
- [Image](#image)
- [Table](#table)
- [Quote](#quote)
- [Details](#details)
- [Definition](#definition)
- [Tabs](#tabs)
- [Timeline](#timeline)
- [Checklist](#checklist)
- [Embed](#embed)
- [Reference Card](#reference-card)
- [Math](#math)
- [Content Link](#content-link)

## Callout

{{< callout variant="info" title="Demo Callout" >}}
This is dummy callout content used for rendering checks.
{{< /callout >}}

## Code

{{< code lang="javascript" >}}
function greet(name) {
  return `Hello, ${name}`;
}
console.log(greet("SenseMaker"));
{{< /code >}}

## Mermaid

{{< mermaid >}}
flowchart TD
  A[Draft] --> B[Review]
  B --> C[Publish]
{{< /mermaid >}}

## Chart

{{< chart type="line" labels="Jan|Feb|Mar|Apr" values="10|20|15|30" series="Dummy Series" >}}

## Image

{{< image src="/images/favicon.svg" alt="Placeholder demo image" title="Demo image caption" >}}

## Table

{{< table >}}
| Column A | Column B | Column C |
|----------|----------|----------|
| Alpha    | 10       | Pass     |
| Beta     | 20       | Pass     |
| Gamma    | 30       | Check    |
{{< /table >}}

## Quote

{{< quote source="Demo Source" date="2026-07-03" >}}
Dummy quote content for visual verification.
{{< /quote >}}

## Details

{{< details title="Expand Demo Details" open="false" >}}
Hidden content block body for expansion/collapse test.
{{< /details >}}

## Definition

{{< definition term="Sensemaking" >}}
A process of organizing information into useful understanding.
{{< /definition >}}

## Tabs

{{< tabs id="demo-tabs" >}}
Overview
Primary tab body with dummy text.
---
Notes
Secondary tab body with another sentence.
---
Checklist
Third tab body with test content.
{{< /tabs >}}

## Timeline

{{< timeline id="demo-timeline" >}}
2026-01-01 | Started
Initial setup complete.
---
2026-03-01 | Iteration
Second pass with refinements.
---
2026-06-01 | Stabilized
Rendering tests finalized.
{{< /timeline >}}

## Checklist

{{< checklist >}}
- [x] Create test page
- [x] Add all supported blocks
- [ ] Verify final deployed rendering
{{< /checklist >}}

## Embed

{{< embed src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Demo Embed" ratio="16:9" >}}

## Reference Card

{{< referencecard ref="/articles/the-north-start-of-my-career" label="Demo Reference" >}}

## Math

{{< math >}}
E = mc^2
{{< /math >}}

## Content Link

{{< contentlink ref="/investigations/direction-of-my-career" label="Demo Content Link" >}}