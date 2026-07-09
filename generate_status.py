#!/usr/bin/env python3
"""
Status Generator for SenseMaker
Produces a single report.md combining:
  - Structural integrity (orphans, asymmetric links, stale items)
  - Content analysis per item (title match, tone, summary) via Gemini
"""

import os
import sys
import json
import argparse
import subprocess
import re
from pathlib import Path
from datetime import datetime, timedelta, timezone

try:
    import frontmatter
    import networkx as nx
except ImportError:
    print("Error: Missing required packages. Run: pip install python-frontmatter networkx")
    sys.exit(1)

try:
    from google import genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False


# ---------------------------------------------------------------------------
# Utilities
# ---------------------------------------------------------------------------

def get_git_commit():
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            capture_output=True, text=True, check=False
        )
        return result.stdout.strip() if result.returncode == 0 else "unknown"
    except Exception:
        return "unknown"


def get_gemini_client():
    if not HAS_GEMINI:
        return None
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("  Warning: GEMINI_API_KEY not set. Content analysis will be skipped.", file=sys.stderr)
        return None
    return genai.Client(api_key=api_key)


# ---------------------------------------------------------------------------
# Content parsing
# ---------------------------------------------------------------------------

def parse_content_files(content_dir):
    """Parse investigations, articles, questions. Return list of (type, slug, data)."""
    items = []
    for content_type in ["investigations", "articles", "questions"]:
        type_dir = Path(content_dir) / content_type
        if not type_dir.exists():
            continue
        for md_file in sorted(type_dir.glob("*.md")):
            if md_file.stem == "_index":
                continue
            try:
                with open(md_file, "r", encoding="utf-8") as f:
                    post = frontmatter.load(f)
                slug = md_file.stem
                data = {
                    "title":             post.metadata.get("title", slug),
                    "slug":              slug,
                    "summary":           post.metadata.get("summary", ""),
                    "description":       post.metadata.get("description", ""),
                    "related":           post.metadata.get("related", []),
                    "attached_articles": post.metadata.get("attached_articles", []),
                    "investigations":    post.metadata.get("investigations", []),
                    "created":           post.metadata.get("created"),
                    "updated":           post.metadata.get("updated"),
                    "body":              post.content,
                }
                items.append((content_type.rstrip("s"), slug, data))
            except Exception as e:
                print(f"Warning: Skipping {md_file} — {e}", file=sys.stderr)
    return items


def _normalize_ref(text):
    """Normalize slugs/titles into a slug-like key for robust matching."""
    if text is None:
        return ""
    cleaned = re.sub(r"[^a-z0-9]+", "-", str(text).strip().lower())
    return cleaned.strip("-")


def build_ref_lookup(items, target_type):
    """Map multiple identifier forms (slug/title/urlized-title) to canonical slug."""
    lookup = {}
    for item_type, slug, data in items:
        if item_type != target_type:
            continue

        title = data.get("title", "")
        for candidate in [slug, title, _normalize_ref(title)]:
            key = _normalize_ref(candidate)
            if key:
                lookup.setdefault(key, slug)
    return lookup


def resolve_ref_slug(raw_ref, lookup):
    """Resolve a raw reference to a canonical slug using normalized lookup keys."""
    return lookup.get(_normalize_ref(raw_ref))


# ---------------------------------------------------------------------------
# Graph / structural integrity
# ---------------------------------------------------------------------------

def build_graph(items):
    G = nx.DiGraph()
    investigation_lookup = build_ref_lookup(items, "investigation")
    article_lookup = build_ref_lookup(items, "article")

    for item_type, slug, data in items:
        G.add_node((item_type, slug), title=data["title"], type=item_type)

    for item_type, slug, data in items:
        source = (item_type, slug)
        if item_type == "investigation":
            for t in data.get("related", []):
                target_slug = resolve_ref_slug(t, investigation_lookup)
                if target_slug and ("investigation", target_slug) in G:
                    G.add_edge(source, ("investigation", target_slug), relation="related")
            for t in data.get("attached_articles", []):
                target_slug = resolve_ref_slug(t, article_lookup)
                if target_slug and ("article", target_slug) in G:
                    G.add_edge(source, ("article", target_slug), relation="attached")
        elif item_type == "article":
            for t in data.get("investigations", []):
                target_slug = resolve_ref_slug(t, investigation_lookup)
                if target_slug and ("investigation", target_slug) in G:
                    G.add_edge(source, ("investigation", target_slug), relation="attached_from")
    return G


def find_orphans(G, items_dict):
    result = []
    for node in G.nodes():
        if G.in_degree(node) == 0 and G.out_degree(node) == 0:
            item_type, slug = node
            title = items_dict.get(node, {}).get("title", slug)
            result.append((item_type, slug, title))
    return result


def find_asymmetric_links(G, items_dict):
    result = []
    checked = set()
    for source, target in G.edges():
        pair = tuple(sorted([source, target]))
        if pair in checked:
            continue
        checked.add(pair)
        if G.has_edge(source, target) and not G.has_edge(target, source):
            s_title = items_dict.get(source, {}).get("title", source[1])
            t_title = items_dict.get(target, {}).get("title", target[1])
            result.append((source, target, s_title, t_title))
    return result


def find_stale_items(items, stale_days):
    stale = []
    cutoff = datetime.now() - timedelta(days=stale_days)
    for item_type, slug, data in items:
        date_val = data.get("updated") or data.get("created")
        if not date_val:
            continue
        try:
            if isinstance(date_val, datetime):
                item_dt = date_val.replace(tzinfo=None)
            elif isinstance(date_val, str):
                item_dt = datetime.fromisoformat(date_val.replace("Z", "+00:00")).replace(tzinfo=None)
            else:
                item_dt = datetime.combine(date_val, datetime.min.time())
            if item_dt < cutoff:
                days_old = (datetime.now() - item_dt).days
                stale.append((item_type, slug, data["title"], item_dt.date(), days_old))
        except Exception:
            pass
    stale.sort(key=lambda x: x[4], reverse=True)
    return stale


# ---------------------------------------------------------------------------
# Content analysis via Gemini
# ---------------------------------------------------------------------------

ANALYSIS_PROMPT = """\
You are reviewing a piece of writing from a personal knowledge system.

Title: {title}
Description: {description}

Body:
{body}

Provide a short analysis in JSON (no markdown fences, raw JSON only):
{{
  "title_match": "one of: good | partial | poor",
  "title_match_note": "one sentence — does the body actually deliver on the title and description?",
  "tone": "2-4 words describing the writing tone, e.g. exploratory, analytical, reflective",
  "summary": "2-3 sentences summarising what this piece is actually about"
}}
"""

# Models to try in order — flash-lite is cheapest but has lowest quota
CANDIDATE_MODELS = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash-latest",
    "gemini-1.0-pro",
]


def detect_generation_model(client):
    """Discover available generation models via list_models(), then probe to confirm."""
    import time

    # Step 1: list what the API actually has
    listed = []
    try:
        for m in client.models.list():
            name = m.name  # e.g. "models/gemini-2.0-flash"
            if "embedding" in name.lower():
                continue
            # strip "models/" prefix for use in generate_content calls
            short = name.removeprefix("models/")
            listed.append(short)
        print(f"  Available models: {listed[:8]}", file=sys.stderr)
    except Exception as e:
        print(f"  Could not list models: {e}", file=sys.stderr)

    # Step 2: prefer listed models, fall back to static candidates
    static = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
    ]
    candidates = listed + [m for m in static if m not in listed]

    # Step 3: probe each — retry with backoff on 429, skip on 404
    probe = "Reply with the single word: ok"
    for model in candidates[:10]:
        for attempt in range(3):
            try:
                resp = client.models.generate_content(model=model, contents=probe)
                if resp.text:
                    print(f"  ✓ Using generation model: {model}", file=sys.stderr)
                    return model
                break
            except Exception as e:
                err = str(e)
                if "429" in err or "RESOURCE_EXHAUSTED" in err:
                    wait = 15 * (attempt + 1)
                    print(f"  {model}: rate limited, waiting {wait}s (attempt {attempt + 1}/3)…", file=sys.stderr)
                    time.sleep(wait)
                    continue  # retry same model
                # 404 or other non-retriable — skip to next model
                print(f"  {model}: {err.split(chr(10))[0][:80]}", file=sys.stderr)
                break
    return None


def _call_gemini(client, prompt, model):
    """Call a specific model with one retry on quota errors."""
    import time
    for attempt in range(2):
        try:
            response = client.models.generate_content(model=model, contents=prompt)
            return response.text.strip()
        except Exception as e:
            err_str = str(e)
            if ("429" in err_str or "RESOURCE_EXHAUSTED" in err_str) and attempt == 0:
                time.sleep(10)
                continue
            raise


def _classify_error(e):
    """Return a short, human-readable error string — never raw JSON."""
    msg = str(e)
    if "429" in msg or "RESOURCE_EXHAUSTED" in msg:
        return "API quota exceeded — will retry on next scheduled run"
    if "400" in msg or "invalid" in msg.lower():
        return "Invalid request"
    if "403" in msg or "permission" in msg.lower():
        return "API key permission denied"
    if "404" in msg:
        return "Model not found"
    # Fallback: first sentence only, no JSON
    first_line = msg.split("\n")[0][:120]
    return first_line


def analyze_item(client, item_type, slug, data, model):
    """Call Gemini to analyse a single content item. Returns dict."""
    title = data.get("title", slug)
    description = data.get("description") or data.get("summary") or ""
    body = (data.get("body") or "").strip()

    if not body:
        return {"error": "No body text"}

    prompt = ANALYSIS_PROMPT.format(
        title=title,
        description=description or "(none provided)",
        body=body[:3000],
    )

    try:
        raw = _call_gemini(client, prompt, model)
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"error": "Could not parse Gemini response"}
    except Exception as e:
        msg = _classify_error(e)
        print(f"  Warning: {item_type}/{slug}: {msg}", file=sys.stderr)
        return {"error": msg}


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------

SITE_BASE = ""

TYPE_LABELS = {
    "investigations": "Investigation",
    "articles": "Article",
    "scratchpads": "Scratchpad",
    "questions": "Question",
    "areas": "Area",
    "topics": "Topic",
    "tags": "Tag",
    "help": "Help",
    "search": "Search",
    "status": "Status",
    "links": "Links",
}

def item_link(item_type, slug, title):
    base = (SITE_BASE or "").rstrip("/")
    return f"[{title}]({base}/{item_type}s/{slug}/)"


MATCH_ICON = {"good": "✓", "partial": "⚠️", "poor": "❌"}


def generate_report(items, items_dict, G, orphans, asymmetric, stale,
                    content_analyses, source_commit, output_path):
    IST = timezone(timedelta(hours=5, minutes=30))
    now_iso = datetime.now(tz=IST).strftime("%Y-%m-%dT%H:%M:%S+05:30")

    fm = {
        "title": "Status Report",
        "entry_type": "status",
        "generated": True,
        "generated_at": now_iso,
        "source_commit": source_commit,
        "draft": False,
    }

    lines = []

    # Header — layout template already shows the generated banner + timestamps,
    # so just start directly with the content sections.
    lines += [
        "---",
        "",
    ]

    # Section 1: Structural Integrity
    lines += [
        "## Structural Integrity",
        "",
        "Checks link health across the corpus.",
        "",
    ]

    lines += [f"### Orphans — {len(orphans)}", ""]
    if orphans:
        lines.append("Items with no inbound or outbound links:")
        lines.append("")
        for item_type, slug, title in orphans:
            lines.append(f"- {item_link(item_type, slug, title)} *({item_type})*")
    else:
        lines.append("None found. All items are connected.")
    lines.append("")

    lines += [f"### Asymmetric Links — {len(asymmetric)}", ""]
    if asymmetric:
        lines.append("Links declared in one direction but not reciprocated:")
        lines.append("")
        for source, target, s_title, t_title in asymmetric:
            s_type, s_slug = source
            t_type, t_slug = target
            lines.append(
                f"- {item_link(s_type, s_slug, s_title)} → "
                f"{item_link(t_type, t_slug, t_title)} *(not reciprocated)*"
            )
    else:
        lines.append("None found.")
    lines.append("")

    lines += [f"### Stale Items — {len(stale)}", ""]
    if stale:
        lines.append(f"Not updated for {args_stale_days}+ days:")
        lines.append("")
        for item_type, slug, title, date, days_old in stale:
            lines.append(f"- {item_link(item_type, slug, title)} — last updated {date} ({days_old} days ago)")
    else:
        lines.append("None found.")
    lines.append("")

    # Section 2: Content Analysis
    if content_analyses:
        lines += [
            "---",
            "",
            "## Content Analysis",
            "",
            "Per-item analysis: does the content match its title? What is its tone? What does it actually say?",
            "",
        ]

        for group_label, group_type in [("Investigations", "investigation"), ("Articles", "article")]:
            group_items = [(s, d) for (t, s, d) in items if t == group_type]
            if not group_items:
                continue
            lines += [f"### {group_label}", ""]
            for slug, data in group_items:
                title = data.get("title", slug)
                analysis = content_analyses.get((group_type, slug))
                lines += [f"#### {item_link(group_type, slug, title)}", ""]

                if not analysis:
                    lines.append("*Not analyzed.*")
                elif "error" in analysis:
                    lines.append(f"*Could not analyze: {analysis['error']}*")
                else:
                    match_val = analysis.get("title_match", "")
                    icon = MATCH_ICON.get(match_val, "")
                    lines.append(f"**Title match:** {icon} {match_val.capitalize()} — {analysis.get('title_match_note', '')}")
                    lines.append("")
                    lines.append(f"**Tone:** {analysis.get('tone', '—')}")
                    lines.append("")
                    lines.append(f"**Summary:** {analysis.get('summary', '—')}")

                lines.append("")
    else:
        lines += [
            "---",
            "",
            "## Content Analysis",
            "",
            "*Skipped — no Gemini API key available. Set `GEMINI_API_KEY` to enable.*",
            "",
        ]

    body_content = "\n".join(lines)
    post = frontmatter.Post(body_content, **fm)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(frontmatter.dumps(post))

    print(f"  Generated {output_path}")


def _coerce_datetime(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.replace(tzinfo=None)
    if hasattr(value, "year") and hasattr(value, "month") and hasattr(value, "day"):
        return datetime.combine(value, datetime.min.time())
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return None
        try:
            return datetime.fromisoformat(text.replace("Z", "+00:00")).replace(tzinfo=None)
        except ValueError:
            for fmt in ("%Y-%m-%d", "%d-%b-%Y"):
                try:
                    return datetime.strptime(text, fmt)
                except ValueError:
                    continue
    return None


def _infer_type_label(md_file, content_dir):
    try:
        relative = md_file.relative_to(content_dir)
    except ValueError:
        relative = md_file
    top_level = relative.parts[0] if relative.parts else md_file.parent.name
    return TYPE_LABELS.get(top_level, top_level.rstrip("s").replace("-", " ").title())


def scan_unpublished_content(content_dir):
    now = datetime.now()
    entries = []

    for md_file in sorted(content_dir.rglob("*.md")):
        try:
            with open(md_file, "r", encoding="utf-8") as f:
                post = frontmatter.load(f)
        except Exception as e:
            print(f"Warning: Skipping unpublished scan for {md_file} — {e}", file=sys.stderr)
            continue

        metadata = post.metadata or {}
        reasons = []

        if bool(metadata.get("draft", False)):
            reasons.append("draft")

        publish_value = metadata.get("publishDate") or metadata.get("publishdate")
        publish_dt = _coerce_datetime(publish_value)
        if publish_dt and publish_dt > now:
            reasons.append("scheduled")

        expiry_value = metadata.get("expiryDate") or metadata.get("expirydate")
        expiry_dt = _coerce_datetime(expiry_value)
        if expiry_dt and expiry_dt <= now:
            reasons.append("expired")

        if not reasons:
            continue

        rel_path = md_file.relative_to(content_dir.parent).as_posix()
        entries.append({
            "title": metadata.get("title", md_file.stem),
            "type": _infer_type_label(md_file, content_dir),
            "path": rel_path,
            "reasons": reasons,
        })

    entries.sort(key=lambda item: (item["type"], item["title"].lower(), item["path"]))
    return entries


def generate_unpublished_report(entries, source_commit, output_path):
    IST = timezone(timedelta(hours=5, minutes=30))
    now_iso = datetime.now(tz=IST).strftime("%Y-%m-%dT%H:%M:%S+05:30")

    fm = {
        "title": "Drafts and Unpublished Content",
        "entry_type": "status",
        "generated": True,
        "generated_at": now_iso,
        "source_commit": source_commit,
        "draft": False,
    }

    lines = [
        "---",
        "",
        "## Summary",
        "",
        f"- **Total unpublished items:** {len(entries)}",
        f"- **Types represented:** {len({entry['type'] for entry in entries}) if entries else 0}",
        "",
    ]

    if entries:
        counts = {}
        for entry in entries:
            counts[entry["type"]] = counts.get(entry["type"], 0) + 1

        lines += [
            "## Counts by Type",
            "",
            "| Type | Count |",
            "|---|---:|",
        ]
        for type_label, count in sorted(counts.items()):
            lines.append(f"| {type_label} | {count} |")
        lines.append("")

        lines += [
            "## Details",
            "",
            "These entries are source-visible but not publish-visible under the current Hugo build rules.",
            "",
        ]

        current_type = None
        for entry in entries:
            if entry["type"] != current_type:
                current_type = entry["type"]
                lines += [f"### {current_type}s", ""]
            reasons = ", ".join(entry["reasons"])
            lines.append(f"- **{entry['title']}** — `{entry['path']}` *({reasons})*")
        lines.append("")
    else:
        lines += [
            "## Counts by Type",
            "",
            "No unpublished items found.",
            "",
        ]

    body_content = "\n".join(lines)
    post = frontmatter.Post(body_content, **fm)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(frontmatter.dumps(post))

    print(f"  Generated {output_path}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

# Module-level so generate_report can reference it
args_stale_days = 30

def main():
    global args_stale_days

    parser = argparse.ArgumentParser(description="Generate SenseMaker status report.")
    parser.add_argument("--content-dir", default="./content")
    parser.add_argument("--output-dir",  default="./content/status")
    parser.add_argument("--stale-days",  type=int, default=30)
    parser.add_argument(
        "--site-base",
        default=os.getenv("STATUS_SITE_BASE", ""),
        help="Optional site base path prefix for generated links (e.g. /sensemaker-site)",
    )
    args = parser.parse_args()

    args_stale_days = args.stale_days
    global SITE_BASE
    SITE_BASE = (args.site_base or "").strip()

    content_dir = Path(args.content_dir)
    output_dir  = Path(args.output_dir)

    if not content_dir.exists():
        print(f"Error: Content directory not found: {content_dir}", file=sys.stderr)
        sys.exit(1)

    print(f"Scanning {content_dir}...")
    items = parse_content_files(content_dir)
    print(f"  Found {len(items)} items")
    items_dict = {(t, s): d for t, s, d in items}

    print("Building graph...")
    G = build_graph(items)
    print(f"  {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

    print("Checking structural integrity...")
    orphans    = find_orphans(G, items_dict)
    asymmetric = find_asymmetric_links(G, items_dict)
    stale      = find_stale_items(items, args.stale_days)
    print(f"  Orphans: {len(orphans)}, Asymmetric: {len(asymmetric)}, Stale: {len(stale)}")

    content_analyses = {}
    client = get_gemini_client()
    if client:
        gen_model = detect_generation_model(client)
        if gen_model:
            analyzable = [(t, s, d) for t, s, d in items if t in ("investigation", "article")]
            print(f"Analyzing {len(analyzable)} items with Gemini ({gen_model})...")
            for item_type, slug, data in analyzable:
                print(f"  Analyzing {item_type}/{slug}...")
                result = analyze_item(client, item_type, slug, data, gen_model)
                content_analyses[(item_type, slug)] = result
        else:
            print("Skipping content analysis (no working generation model found).")
    else:
        print("Skipping content analysis (no Gemini client).")

    source_commit = get_git_commit()
    output_path = output_dir / "report.md"
    drafts_output_path = output_dir / "drafts.md"

    print("Writing report...")
    generate_report(
        items, items_dict, G,
        orphans, asymmetric, stale,
        content_analyses,
        source_commit,
        output_path,
    )

    print("Scanning drafts and unpublished content...")
    unpublished_entries = scan_unpublished_content(content_dir)
    print(f"  Unpublished items: {len(unpublished_entries)}")

    print("Writing drafts report...")
    generate_unpublished_report(
        unpublished_entries,
        source_commit,
        drafts_output_path,
    )

    print("✓ Done!")


if __name__ == "__main__":
    main()