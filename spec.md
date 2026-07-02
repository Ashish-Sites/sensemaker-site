# Status Content Type — Specification

## 1. Purpose

Add a machine-generated, read-only content type (`status`) to the Sensemaker site that surfaces structural properties of the corpus — link integrity, intent/summary drift, thematic clustering — without ever writing to authored content.

## 2. Non-negotiable constraints

- **No back-writes.** The generator never touches `content/investigations/`, `content/articles/`, `content/questions/`, or any existing frontmatter field.
- **One-way dependency.** `status` reads from investigations/articles/questions. Nothing in those types may link to, embed, or reference a status page.
- **CMS-invisible.** `content/status/` is not registered as an editable collection in the CMS config. It is machine-owned, equivalent to a `dist/` folder in version control terms.
- **Fully regenerable.** Deleting `content/status/` and re-running the generator must reproduce equivalent output with no data loss to the real record.
- **Decoupled from publish.** The generator runs independently of the on-demand publish workflow. It never blocks authoring or deployment.

## 3. Inputs

The generator reads all published markdown files under `content/investigations/`, `content/articles/`, `content/questions/` and parses YAML frontmatter. Required fields (confirm/adjust to actual schema before implementation):

| Field | Type | Used for |
|---|---|---|
| `id` / `slug` | string | node identity |
| `title` | string | display |
| `intent` | string, immutable | drift detection |
| `summary` | string | drift detection, clustering |
| `body` | markdown | clustering |
| `related_investigations` | []string | graph integrity |
| `related_articles` | []string | graph integrity |
| `related_questions` | []string | graph integrity |
| `created` | date | staleness, rhythm |
| `updated` | date | staleness |
| `area`, `topic`, `tags` | string/[]string | optional clustering context |

If any field name differs from the live schema, update the parser config, not this spec.

## 4. Architecture

```
[content/*.md]  --read only-->  [generator script]  --writes-->  [content/status/*.md]  --Hugo build-->  [nav: /status/]
```

- **Generator**: standalone Python script, run manually or via separate cron/CI job — never part of the existing publish Action.
- **Output**: one or more markdown files with frontmatter under `content/status/`, each tagged `generated: true`, `generated_at: <ISO8601>`, `source_commit: <sha>`.
- **Rendering**: a dedicated Hugo layout (`layouts/status/single.html`, `layouts/status/list.html`) visually distinct from authored content types (e.g. a persistent "Generated — not part of the record" banner).
- **Navigation**: `Status` added as a top-level nav item, separate from Investigations/Articles/Areas/Topics.

## 5. Feature phases

### Phase 1 — Link integrity (build first; no AI dependency)
Pure graph logic over existing `related_*` frontmatter fields.

- **Orphans**: items with zero inbound and zero outbound relation links.
- **Asymmetric links**: A → B declared, but B → A missing (backlink not reciprocated).
- **Stale items**: `updated` older than N months (configurable), surfaced as a list, not a judgment.

Output: `content/status/link-integrity.md` — three lists, item counts, last-run timestamp.

### Phase 2 — Intent/summary drift
Requires embeddings (Claude API or local sentence-transformers).

- For every item with both `intent` and `summary` populated, compute embedding cosine distance.
- Rank descending. Surface top N (e.g. 10) as "largest drift since creation."
- No verdict rendered — distance score and both texts shown side by side; you judge.

Output: `content/status/intent-drift.md`.

### Phase 3 — Thematic clustering + similarity suggestions
- Embed all `title + summary + body` per item.
- Cluster (HDBSCAN or k-means, k chosen by silhouette score) → cluster label, member list, 2–3 representative excerpts per cluster.
- Similarity matrix → for each item, top 3 nearest neighbors not already linked, rendered as "possibly related — not linked" suggestions. Never written back as links.

Output: `content/status/clusters.md`, plus a `related-suggestions` block per item rendered only on the status page for that item — never on the source item's own page.

### Phase 4 — Semantic search (optional, later)
Replaces static JSON keyword index with embedding-based query. Separate from `status` conceptually but shares the embedding pipeline built in Phase 3.

## 6. Explicit exclusions

- No auto-generated summaries or intent text.
- No auto-applied links, tags, or areas.
- No writes to any file outside `content/status/`.
- No status page treated as citable evidence within an investigation.

## 7. Delivery order

1. Phase 1 (link integrity) — validates the full pipeline (script → `content/status/` → Hugo build → nav) with zero AI dependency.
2. Phase 2 (drift) — first AI-dependent piece, small surface area.
3. Phase 3 (clustering/suggestions) — highest value, highest complexity.
4. Phase 4 (search) — only if Phase 1–3 prove the pipeline is worth extending.

---

# GHCP Prompt — Phase 1 (Link Integrity Generator)

```
Build a Python script for a Hugo static site (content in content/investigations/,
content/articles/, content/questions/, each file with YAML frontmatter parsed via
python-frontmatter).

Goal: read-only graph integrity checker. It must NEVER write to any file outside
content/status/.

Steps:
1. Walk all markdown files under content/investigations/, content/articles/,
   content/questions/. Parse frontmatter fields: id (or filename slug if id absent),
   title, related_investigations, related_articles, related_questions, updated.
2. Build a directed graph (use networkx) where each node is a content item
   (type:id) and each related_* entry is an edge from the source item to the
   target item.
3. Compute:
   a. Orphans: nodes with in-degree 0 AND out-degree 0.
   b. Asymmetric links: edges A->B where no corresponding B->A edge exists.
   c. Stale items: nodes whose `updated` date (or `created` if `updated` absent)
      is older than a configurable STALE_MONTHS threshold (default 6), passed
      as a CLI argument.
4. Generate a single markdown file at content/status/link-integrity.md with:
   - YAML frontmatter: title: "Link Integrity", generated: true,
     generated_at: <current ISO8601 timestamp>, source_commit: <git rev-parse HEAD,
     shell out or read from env var if unavailable>.
   - A body with three sections (Orphans, Asymmetric Links, Stale Items), each
     as a markdown list of item titles with relative links to their content path,
     plus a total count per section.
5. The script must be idempotent: running it twice produces the same output file,
   fully overwritten each run, no accumulation.
6. The script must NEVER modify any file under content/investigations/,
   content/articles/, or content/questions/ — read-only access to those
   directories, enforced by only ever calling open() on content/status/ paths
   for writing.
7. Add a CLI entry point: `python generate_status.py --stale-months 6
   --content-dir ./content --output-dir ./content/status`.
8. Include basic error handling: skip files with malformed frontmatter, log a
   warning, continue processing rest of corpus.
9. No external API calls, no embeddings, no LLM calls in this phase — pure
   graph logic only, using only python-frontmatter, networkx, and pyyaml as
   dependencies.

Also provide:
- A minimal Hugo layout snippet (layouts/status/single.html) that renders this
  page with a persistent banner: "Generated — not part of the authored record"
  and displays generated_at and source_commit from frontmatter.
- A one-line addition to the Hugo nav config (config.toml or data/menu file,
  ask which is in use if unclear) adding a top-level "Status" item pointing
  to /status/.
```
