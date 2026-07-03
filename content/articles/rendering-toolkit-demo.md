---
entry_type: article
title: Rendering Toolkit Demo
description: Demonstrates the custom Hugo shortcodes for code, Mermaid, charts, images, tables, quotes, TOC, and inline content links
created: 2026-07-03
article_type: synthesis
investigations:
  - personal-knowledge-system
tags:
  - knowledge-work
  - extensibility
confidence: high
lifecycle: active
draft: false
---

# Rendering Toolkit Demo

This page exercises the authoring toolkit. It links inline to {{< contentlink ref="/articles/why-personal-knowledge-systems-matter" label="the background article" >}} and also references {{< contentlink ref="/investigations/personal-knowledge-system" label="the main investigation" >}}.

{{< toc title="Contents" >}}

## Code

{{< code lang="java" >}}
if (user != null) {
  return user.isActive();
}
{{< /code >}}

## Mermaid

{{< mermaid >}}
flowchart TD
    A[Draft] --> B[Validate]
    B --> C[Build]
    C --> D[Deploy]
{{< /mermaid >}}

## Charts

{{< chart type="bar" labels="Draft|Build|Deploy" values="10|20|15" series="Effort" >}}

## Images

{{< image src="/images/uploads/screenshot-2026-07-02-112706.png" alt="Example screenshot" title="Uploaded media from CMS" >}}

## Tables

{{< table caption="Toolkit comparison" >}}
| Type | Best for | Validation |
| --- | --- | --- |
| Code | Highlighted snippets | Language fallback |
| Mermaid | Diagrams | Empty input warning |
| Chart | Structured data | Count matching |
| Image | Uploaded media | Missing source warning |
{{< /table >}}

## Quotes

{{< quote source="George Box" date="2026-06-25" >}}
All models are wrong, but some are useful.
{{< /quote >}}

{{< quote source="Internal note" date="2026-07-02" >}}
A system is not something you build and then it's done. It's something you live inside and gradually understand.
{{< /quote >}}

## Quote

{{< quote source="F. Scott Fitzgerald" date="2026-06-18" >}}
The test of a first-rate intelligence is the ability to hold two opposed ideas in mind at the same time and still retain the ability to function.
{{< /quote >}}

## Callout

{{< callout variant="warning" title="Draft content" >}}
This is a warning callout. Use it for constraints, caveats, or temporary notes.
{{< /callout >}}

{{< callout variant="success" title="Ready" >}}
This is a success callout. Use it for confirmation or completed steps.
{{< /callout >}}

## Details

{{< details title="Why this exists" >}}
This keeps longer supporting context collapsed until the reader asks for it.
{{< /details >}}

## Definition

{{< definition term="Knowledge System" >}}
A knowledge system is the set of processes, structures, and tools used to capture, organize, and revisit thinking.
{{< /definition >}}

## Tabs

{{< tabs id="demo-tabs" >}}
Plan
Outline the work before committing to the structure.
---
Build
Implement the smallest useful slice and validate it.
---
Publish
Push to `main` and deploy from the GitHub Actions workflow.
{{< /tabs >}}

## Timeline

{{< timeline id="demo-timeline" >}}
2026-06-20 | Research
Reviewed how notes, diagrams, and links should work together.
---
2026-07-01 | Implementation
Added the core shortcode toolkit and supporting styles.
---
2026-07-03 | Validation
Confirmed the generated page renders the new content types.
{{< /timeline >}}

## Checklist

{{< checklist >}}
- [x] Add the shortcode
- [x] Add the styles
- [ ] Use it in a new page
- [ ] Deploy to GitHub Pages
{{< /checklist >}}

## Embed

{{< embed src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Example embed" ratio="16:9" >}}

## Reference Card

{{< referencecard ref="/articles/why-personal-knowledge-systems-matter" label="Background article" >}}

## Math

{{< math >}}
E = mc^2
{{< /math >}}