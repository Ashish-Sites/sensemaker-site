---
title: Building a Personal Knowledge System
entry_type: investigation
created: 2026-06-15
status: active
areas: ["Technology"]
topics: ["Knowledge Systems"]
questions: ["What makes a knowledge system effective?"]
tags: ["systems-thinking", "personal-knowledge", "tools"]
description: "Exploring the design patterns and tradeoffs in building a scalable system for capturing and organizing thinking over years"
draft: false

summary: |
  This investigation explores the core design challenge: how to build a knowledge system that preserves fidelity while remaining maintainable by a single person. Traditional systems (databases, wikis, note-taking apps) optimize for different constraints. The key insight is that **structure should follow usage patterns, not precede them**. 
  
  Current approach: lean taxonomy (Areas → Topics → Questions) with flexible investigation-centric content. This allows entry points at multiple levels while keeping the burden of categorization light.

summary_updated: 2026-07-02

comments:
  - text: "Initial observation: most systems fail because they optimize for scale (team collaboration, enterprise volume) rather than individual use. The best personal systems are asymmetric: easy to add, hard to lose."
    date: 2026-06-15
  - text: "After reviewing Roam, Obsidian, Logseq: they all struggle with the same problem—information feels permanent when created but stale when revisited. Need explicit 'review and refresh' workflows."
    date: 2026-06-22
  - text: "Hugo as a foundation is revealing: static generation forces you to make decisions upfront (no runtime queries), which actually clarifies the structure. Every page layout is a statement about information hierarchy."
    date: 2026-07-01
  - text: "The embedded comments/quotes/summary approach is feeling right. It keeps working context visible without fragmenting the narrative."
    date: 2026-07-02

quotes:
  - text: "The test of a first-rate intelligence is the ability to hold two opposed ideas in mind at the same time and still retain the ability to function."
    source: "F. Scott Fitzgerald"
    date: 2026-06-18
  - text: "All models are wrong, but some are useful."
    source: "George Box"
    date: 2026-06-25
  - text: "The map is not the territory; the menu is not the meal."
    source: "Alfred Korzybski (paraphrased)"
    date: 2026-07-01
  - text: "A system is not something you build and then it's done. It's something you live inside and gradually understand."
    source: "Internal note - source unknown"
    date: 2026-07-02
---

# Building a Personal Knowledge System

## The Problem

Knowledge work requires two opposing capabilities:
- **Capture**: Make it trivially easy to add thoughts, articles, evidence—no friction
- **Retrieval**: Make past thinking discoverable and connected—high signal

Most tools optimize for one at the expense of the other.

## Design Approach

**Spine**: Investigations as narrative threads connecting Questions → Analysis → Artifacts

**Leaves**: Articles, quotes, and evidence as modular, reusable pieces

**Grammar**: Areas (broad), Topics (focused), Tags (ad-hoc) as navigation paths

This creates redundancy intentionally—you can reach a piece of content from multiple directions, and it's okay if you don't remember which one.

## Current Implementation

Hugo static generation with:
- Investigations as `content/investigations/`
- Taxonomies (areas, topics, questions, tags) rendered as list + term pages
- Articles as separate content type (not yet fully explored)
- Four-stage validation in build pipeline

## Next Steps

1. Test embedded comments/quotes rendering with actual content
2. Explore article types (evidence, quotes, counterpoints)
3. Add search beyond static JSON index
4. Implement "review and refresh" workflow indicators
