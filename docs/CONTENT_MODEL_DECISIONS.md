# Content Model Decisions

Date: 2026-06-26
Status: Reviewed and trimmed

## Index
1. [Purpose](#purpose)
2. [Content Types (6)](#content-types-6)
3. [Locked Decisions](#locked-decisions)
4. [Required Core Fields by Type](#required-core-fields-by-type)
5. [Relationship Rules](#relationship-rules)
6. [Deferred or Optional Metadata](#deferred-or-optional-metadata)
7. [Open Items](#open-items)

## Purpose
Keep only current, required content-model decisions and unresolved items.

## Content Types (6)
1. Investigations
2. Articles
3. Questions
4. Tags
5. Areas
6. Topics

## Locked Decisions
1. Investigations are the narrative spine; articles are supporting modules.
2. No full article-embed strategy inside investigation bodies.
3. Areas are broad domains; topics are finer-grained subjects; tags are lightweight labels.
4. `description` exists on all 6 types as short summary text (max 200 chars).
5. `draft` exists on all 6 types for publish control.
6. Questions use lifecycle: `active`, `archived`.
7. Articles use lifecycle: `active`, `archived`.
8. Article type set is:
	- idea
	- sub-article
	- comment
	- evidence
	- summary
	- counterpoint
	- quote
	- definition
	- synthesis
9. `subsection` is replaced by `sub-article`.
10. `draft` is not an article type.
11. Investigations remain intentionally lean; broader governance metadata is not required there.

## Required Core Fields by Type

### Investigations
1. `entry_type`: investigation
2. `title`
3. `created`
4. `status`
5. `body`
6. Optional: `areas`, `topics`, `questions`, `description`, `tags`, `related`, `attached_articles`, `draft`

### Articles
1. `entry_type`: article
2. `title`
3. `created`
4. `article_type`
5. `body`
6. Optional: `description`, `investigations`, `tags`, `draft`, `lifecycle`, `source_link`, `confidence`, `canonical_investigation`

### Questions
1. `entry_type`: question_term
2. `title`
3. Optional: `description`, `body`, `draft`, `lifecycle`

### Tags
1. `entry_type`: tag_term
2. `title`
3. Optional: `body`, `draft`

### Areas
1. `entry_type`: area_term
2. `title`
3. Optional: `description`, `body`, `draft`

### Topics
1. `entry_type`: topic_term
2. `title`
3. Optional: `description`, `body`, `draft`, `primary_area`

## Relationship Rules
1. Investigation -> many Questions (required).
2. Investigation -> Area + Topic context (required).
3. Investigation -> many Articles (optional attachments/references).
4. Investigation -> Tags (optional).
5. Articles may be standalone or attached to one/many investigations.
6. Active-only filtering should apply in CMS relation pickers where lifecycle is present.

## Deferred or Optional Metadata
1. Tags: `tag_kind`, `aliases`, `promote_to_topic_candidate` (deferred/optional).
2. Areas: `area_kind`, `review_cycle`, `steward` (deferred/optional).
3. Topics: `aliases`, `maturity` (deferred/optional).
4. Questions: `question_kind`, `horizon`, `parent_question` (deferred/optional).
5. Articles: `source_link`, `confidence`, `canonical_investigation` are optional (not required for all).

## Open Items
1. Investigations: enforce single area or allow multiple areas long-term.
2. Investigations: keep full status set as-is or simplify later.
