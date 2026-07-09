# SenseMaker Design Document

Date: 2026-06-26
Status: Active

## Table of Contents

1. [Purpose](#purpose)
2. [Goals and Non-Goals](#goals-and-non-goals)
3. [System Overview](#system-overview)
4. [Information Architecture](#information-architecture)
5. [Page and UI Architecture](#page-and-ui-architecture)
6. [Content Model Alignment](#content-model-alignment)
7. [Validation and Quality Gates](#validation-and-quality-gates)
8. [Build and Deployment Architecture](#build-and-deployment-architecture)
9. [Operational Rules](#operational-rules)
10. [Trade-Offs](#trade-offs)
11. [Extension Points](#extension-points)
12. [Change Management](#change-management)

## Purpose

Define how SenseMaker is designed end-to-end so content, templates, scripts, and CI checks evolve safely without regressions.

## Goals and Non-Goals

### Goals

1. Support long-horizon thinking with structured but flexible content.
2. Keep navigation and taxonomy relationships legible.
3. Make invalid content fail fast before deployment.
4. Keep build and deploy deterministic and repeatable.
5. Preserve readable, responsive UI for dense content pages.

### Non-Goals

1. Multi-user workflows and role-based authorization.
2. Dynamic server-side runtime or database-backed rendering.
3. Real-time collaborative editing.
4. Full external link health checking in CI.

## System Overview

SenseMaker is a Hugo-based static site with:

1. Content authored in Markdown under content.
2. Rendering via custom theme templates and CSS.
3. Build-time validators implemented in PowerShell.
4. CI deployment via GitHub Actions to gh-pages.

Core path:

1. Content authoring/update.
2. Validation scripts run.
3. Hugo build generates public.
4. Built HTML is checked for internal broken links.
5. Deploy only if all checks pass.

## Information Architecture

Primary entity types:

1. Investigations: narrative spine and primary thinking artifact.
2. Articles: attachable supporting modules.
3. Scratchpads: freehand, discardable thinking pages outside the formal graph.
4. Taxonomy terms: areas, topics, tags, questions.

Relationship rules:

1. Investigation -> areas, topics, questions are required context.
2. Investigation -> tags and attached/related articles are optional.
3. Articles may be standalone or linked to one or more investigations.
4. Scratchpads remain unlinked from investigations, articles, and questions by design.
5. Term pages aggregate linked content and metadata.

## Page and UI Architecture

### Main page classes

1. Homepage: dashboard-style overview and map clusters.
2. List pages: summary stats plus sortable/filterable tables.
3. Detail pages: two-column layout with content and right rail.
4. Help page: full-width documentation surface.

### Shared detail-page structure

1. Context strip near top (areas/topics/tags or equivalent).
2. Main prose content column.
3. Right rail with metadata and lineage panels.

### Right-rail behavior

1. Sticky offsets are computed dynamically in JavaScript.
2. If viewport height is insufficient, lineage panel falls back to non-sticky.
3. Goal is zero overlap and predictable scroll behavior.

## Content Model Alignment

The canonical content-model policy is documented in:

1. docs/CONTENT_MODEL_DECISIONS.md

Design assumptions tied to the model:

1. description is short summary text and rendered on detail pages.
2. lifecycle is used where present for active/archive filtering.
3. taxonomy terms use canonical _index.md locations and entry_type markers.

## Validation and Quality Gates

Validation scripts:

1. scripts/validate-taxonomy.ps1
   Ensures taxonomy structure, canonical term files, and required entry_type values.
2. scripts/validate-content-quality.ps1
   Enforces markdown/content invariants such as balanced fences and image/link safety rules.
3. scripts/validate-built-links.ps1
   Scans generated HTML in public and fails on broken internal href/src references.

Validation philosophy:

1. Prefer deterministic local checks over manual review.
2. Fail build on structural or rendering-risk issues.
3. Keep checks explicit and scriptable for CI parity.

## Build and Deployment Architecture

Single entrypoint:

1. scripts/build-with-validation.ps1

Execution order:

1. Taxonomy validation.
2. Content-quality validation.
3. Hugo production build.
4. Built-link validation.

CI wiring:

1. .github/workflows/deploy.yml runs build-with-validation.
2. Deployment only happens after successful validation and build.

## Operational Rules

1. Treat generated-link integrity as a release gate.
2. Keep taxonomy entries canonical with no duplicate term index files.
3. Keep scripts cross-shell friendly where possible.
4. Update docs when behavior or policy changes.

## Trade-Offs

1. Strong validation may occasionally block deploys for minor issues, but reduces production regressions.
2. Built-link checks focus on internal assets/routes and do not validate remote URL uptime.
3. Sticky side-panel behavior optimizes readability but uses JS measurement logic for robustness.

## Extension Points

1. Add new validators as separate scripts and chain them via build-with-validation.
2. Extend content-quality rules for front matter completeness or schema checks.
3. Add optional external link checks as a non-blocking report step.
4. Introduce visual regression snapshots for layout-sensitive templates.

## Change Management

When changing any of the following, update this design document and docs/README.md:

1. Content types, required fields, or relationship semantics.
2. Layout architecture or sticky behavior logic.
3. Validation scripts, thresholds, or failure criteria.
4. Build/deploy workflow or command entrypoints.

Definition of done for architecture-level changes:

1. Code updated.
2. Validation pipeline passes locally.
3. CI workflow is aligned.
4. Documentation updated.
