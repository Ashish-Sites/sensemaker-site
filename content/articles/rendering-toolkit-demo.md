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