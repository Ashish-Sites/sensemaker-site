---
entry_type: article
title: CMS Rendering Toolkit Demo
description: Demonstrates the CMS block types for the rendering toolkit
created: 2026-07-03
article_type: synthesis
investigations:
  - personal-knowledge-system
tags:
  - knowledge-work
  - extensibility
confidence: high
content_blocks:
  - type: markdown
    markdown: |
      ## CMS-authored blocks

      This page proves the CMS blocks render end-to-end.
  - type: code
    language: java
    code: |
      if (record != null) {
        return record.isValid();
      }
  - type: mermaid
    diagram: |
      flowchart TD
        A[CMS] --> B[Preview]
        B --> C[Build]
        C --> D[Deploy]
  - type: table
    markdown: |
      | Item | Status |
      | --- | --- |
      | CMS block | Ready |
      | Site render | Ready |
  - type: image
    src: /images/uploads/screenshot-2026-07-02-112706.png
    alt: CMS example image
    title: CMS-uploaded image
  - type: chart
    chart_type: bar
    series: Progress
    labels: Draft|Build|Deploy
    values: 10|20|15
  - type: callout
    variant: info
    title: CMS note
    body: |
      This is a CMS-authored callout.
  - type: quote
    source: George Box
    date: 2026-06-25
    body: |
      All models are wrong, but some are useful.
  - type: details
    title: Why blocks?
    open: false
    body: |
      Blocks keep authoring structured while still generating standard page HTML.
  - type: definition
    term: Toolkit
    body: |
      A reusable set of content patterns for authoring and rendering.
  - type: tabs
    id: cms-demo-tabs
    items:
      - title: One
        body: |
          First tab content.
      - title: Two
        body: |
          Second tab content.
  - type: timeline
    id: cms-demo-timeline
    events:
      - date: 2026-06-20
        title: Research
        body: |
          Evaluated the content patterns.
      - date: 2026-07-03
        title: Delivery
        body: |
          Implemented the CMS block support.
  - type: checklist
    body: |
      - [x] CMS schema updated
      - [x] Preview updated
      - [ ] Publish and test in CMS
  - type: embed
    src: https://www.youtube.com/embed/dQw4w9WgXcQ
    title: Example embed
    ratio: 16:9
  - type: referencecard
    ref: /articles/why-personal-knowledge-systems-matter
    label: Background article
  - type: math
    expression: |
      E = mc^2
lifecycle: active
draft: false
---

This page is generated from CMS-style front matter blocks.