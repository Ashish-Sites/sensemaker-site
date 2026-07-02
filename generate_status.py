#!/usr/bin/env python3
"""
Status Generator for SenseMaker
Phase 1: Link Integrity (pure graph logic)
Phase 2: Rhythm Analysis (semantic coherence using Gemini embeddings)
"""

import os
import sys
import argparse
from pathlib import Path
from datetime import datetime, timedelta
import subprocess
import json
import re

try:
    import frontmatter
    import networkx as nx
except ImportError as e:
    print(f"Error: Missing required package. Install with:")
    print("  pip install python-frontmatter networkx")
    sys.exit(1)

# Optional: Gemini embeddings for rhythm analysis
try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False


def get_git_commit():
    """Get current git commit SHA. Return 'unknown' if git not available."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            capture_output=True,
            text=True,
            check=False
        )
        return result.stdout.strip() if result.returncode == 0 else "unknown"
    except Exception:
        return "unknown"


def get_gemini_client():
    """Initialize Gemini client. Return None if key not available."""
    if not HAS_GEMINI:
        return None
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not set. Skipping rhythm analysis.", file=sys.stderr)
        return None
    
    genai.configure(api_key=api_key)
    return genai


def embed_text(client, text):
    """Embed text using Gemini embeddings API."""
    if not client or not text:
        return None
    
    try:
        result = client.embed_content(
            model="models/embedding-001",
            content=text
        )
        return result['embedding']
    except Exception as e:
        print(f"Warning: Embedding failed for text: {e}", file=sys.stderr)
        return None


def cosine_similarity(vec1, vec2):
    """Compute cosine similarity between two vectors."""
    if not vec1 or not vec2:
        return 0.0
    
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    mag1 = sum(a ** 2 for a in vec1) ** 0.5
    mag2 = sum(b ** 2 for b in vec2) ** 0.5
    
    if mag1 == 0 or mag2 == 0:
        return 0.0
    
    return dot_product / (mag1 * mag2)


def chunk_text(text, max_length=500):
    """Split text into semantic chunks (roughly by paragraphs or sentences)."""
    if not text:
        return []
    
    # Split by double newlines first (paragraphs)
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        if len(current_chunk) + len(para) > max_length:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = para
        else:
            current_chunk += "\n\n" + para if current_chunk else para
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return [c for c in chunks if len(c) > 50]  # Skip tiny chunks


def analyze_rhythm(client, items, items_dict):
    """
    Analyze rhythm/coherence for each item.
    Returns list of (item_type, slug, title, coherence_score, analysis_dict).
    """
    if not client:
        return []
    
    results = []
    
    for item_type, slug, data in items:
        if item_type == "question":  # Skip questions, they're just prompts
            continue
        
        title = data.get("title", slug)
        summary = data.get("summary", "")
        body = data.get("body", "")
        intent = data.get("intent", "")
        
        # If no intent, use summary as the declared promise
        intent_text = intent or summary or title
        
        if not body or not intent_text:
            results.append((item_type, slug, title, None, {"reason": "No body or intent"}))
            continue
        
        # Embed the intent/promise
        intent_embed = embed_text(client, intent_text)
        if not intent_embed:
            results.append((item_type, slug, title, None, {"reason": "Embedding failed"}))
            continue
        
        # Chunk and embed body
        body_chunks = chunk_text(body)
        if not body_chunks:
            results.append((item_type, slug, title, None, {"reason": "No substantial body"}))
            continue
        
        chunk_scores = []
        for chunk in body_chunks:
            chunk_embed = embed_text(client, chunk)
            if chunk_embed:
                score = cosine_similarity(intent_embed, chunk_embed)
                chunk_scores.append(score)
        
        if chunk_scores:
            coherence = sum(chunk_scores) / len(chunk_scores)
            
            # Identify divergent chunks (score < 0.6)
            divergences = []
            for i, score in enumerate(chunk_scores):
                if score < 0.6:
                    divergences.append({
                        "chunk_idx": i,
                        "score": round(score, 2),
                        "text": body_chunks[i][:200] + "..."
                    })
            
            results.append((item_type, slug, title, round(coherence, 2), {
                "intent": intent_text,
                "coherence": round(coherence, 2),
                "chunk_count": len(body_chunks),
                "avg_chunk_score": round(sum(chunk_scores) / len(chunk_scores), 2),
                "divergences": divergences[:3]  # Top 3 divergent sections
            }))
        else:
            results.append((item_type, slug, title, None, {"reason": "Could not score chunks"}))
    
    return results


def parse_content_files(content_dir, types=None):
    """
    Walk content_dir/investigations/, articles/, questions/.
    Parse frontmatter. Return list of (type, slug, data) tuples.
    """
    if types is None:
        types = ["investigations", "articles", "questions"]
    
    items = []
    for content_type in types:
        type_dir = Path(content_dir) / content_type
        if not type_dir.exists():
            continue
        
        for md_file in type_dir.glob("*.md"):
            # Skip _index files
            if md_file.stem == "_index":
                continue
            
            try:
                with open(md_file, "r", encoding="utf-8") as f:
                    post = frontmatter.load(f)
                
                # Extract slug from filename (without .md)
                slug = md_file.stem
                
                data = {
                    "title": post.metadata.get("title", slug),
                    "slug": slug,
                    "related": post.metadata.get("related", []),
                    "attached_articles": post.metadata.get("attached_articles", []),
                    "investigations": post.metadata.get("investigations", []),
                    "created": post.metadata.get("created"),
                    "updated": post.metadata.get("updated"),
                    "summary": post.metadata.get("summary", ""),
                    "intent": post.metadata.get("intent", ""),
                    "body": post.content,  # Add body content for rhythm analysis
                }
                
                items.append((content_type.rstrip("s"), slug, data))
            except Exception as e:
                print(f"Warning: Skipping {md_file} — {e}", file=sys.stderr)
    
    return items


def build_graph(items):
    """
    Build directed graph from items.
    Nodes: (type, slug) tuples.
    Edges: based on related, attached_articles, investigations fields.
    """
    G = nx.DiGraph()
    
    for item_type, slug, data in items:
        node_id = (item_type, slug)
        G.add_node(node_id, title=data["title"], type=item_type)
    
    # Add edges based on relations
    for item_type, slug, data in items:
        source_node = (item_type, slug)
        
        # investigation -> investigation (related)
        if item_type == "investigation":
            for target_slug in data.get("related", []):
                target_node = ("investigation", target_slug)
                if target_node in G:
                    G.add_edge(source_node, target_node, relation="related")
            
            # investigation -> article (attached_articles)
            for target_slug in data.get("attached_articles", []):
                target_node = ("article", target_slug)
                if target_node in G:
                    G.add_edge(source_node, target_node, relation="attached")
        
        # article -> investigation (investigations)
        elif item_type == "article":
            for target_slug in data.get("investigations", []):
                target_node = ("investigation", target_slug)
                if target_node in G:
                    G.add_edge(source_node, target_node, relation="attached_from")
    
    return G


def find_orphans(G, items_dict):
    """Find items with in-degree 0 AND out-degree 0."""
    orphans = []
    for node in G.nodes():
        if G.in_degree(node) == 0 and G.out_degree(node) == 0:
            item_type, slug = node
            title = items_dict.get((item_type, slug), {}).get("title", slug)
            orphans.append((item_type, slug, title))
    return orphans


def find_asymmetric_links(G, items_dict):
    """
    Find edges A->B where no corresponding B->A edge exists.
    """
    asymmetric = []
    checked = set()
    
    for source, target in G.edges():
        pair = tuple(sorted([source, target]))
        if pair in checked:
            continue
        checked.add(pair)
        
        has_forward = G.has_edge(source, target)
        has_backward = G.has_edge(target, source)
        
        if has_forward and not has_backward:
            s_type, s_slug = source
            t_type, t_slug = target
            s_title = items_dict.get(source, {}).get("title", s_slug)
            t_title = items_dict.get(target, {}).get("title", t_slug)
            asymmetric.append((source, target, s_title, t_title))
    
    return asymmetric


def find_stale_items(items, stale_months):
    """
    Find items whose updated (or created if updated absent) is older than stale_months.
    """
    stale = []
    cutoff = datetime.now() - timedelta(days=stale_months * 30)
    
    for item_type, slug, data in items:
        date_str = data.get("updated") or data.get("created")
        if not date_str:
            continue
        
        try:
            # Handle both date and datetime objects
            if isinstance(date_str, datetime):
                item_date = date_str
            elif isinstance(date_str, str):
                item_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            else:
                # Assume it's a date object, convert to datetime
                item_date = datetime.combine(date_str, datetime.min.time())
            
            # Make cutoff naive if item_date is naive
            if item_date.tzinfo is None:
                cutoff_naive = cutoff
            else:
                cutoff_naive = cutoff.replace(tzinfo=item_date.tzinfo)
            
            if item_date < cutoff_naive:
                days_old = (datetime.now() - item_date.replace(tzinfo=None)).days
                item_date_only = item_date.date() if hasattr(item_date, 'date') else item_date
                stale.append((item_type, slug, data["title"], item_date_only, days_old))
        except Exception as e:
            print(f"Warning: Could not parse date for {item_type}/{slug}: {e}", file=sys.stderr)
    
    stale.sort(key=lambda x: x[4], reverse=True)
    return stale


def generate_markdown(orphans, asymmetric, stale, source_commit, output_path):
    """
    Generate link-integrity.md with frontmatter and body.
    """
    now_iso = datetime.now().isoformat() + "Z"
    
    # Build frontmatter
    frontmatter_dict = {
        "title": "Link Integrity",
        "entry_type": "status",
        "generated": True,
        "generated_at": now_iso,
        "source_commit": source_commit,
        "draft": False,
    }
    
    # Build body
    body_lines = []
    body_lines.append("# Link Integrity Report")
    body_lines.append("")
    body_lines.append("This page is automatically generated. It is not part of the authored record.")
    body_lines.append(f"**Last generated:** {now_iso}")
    body_lines.append(f"**Source commit:** `{source_commit}`")
    body_lines.append("")
    
    # Orphans section
    body_lines.append("## Orphans")
    body_lines.append(f"Items with no inbound or outbound links: **{len(orphans)}**")
    body_lines.append("")
    if orphans:
        for item_type, slug, title in orphans:
            link = f"/sensemaker-site/{item_type}s/{slug}/"
            body_lines.append(f"- [{title}]({link}) — {item_type}")
    else:
        body_lines.append("None.")
    body_lines.append("")
    
    # Asymmetric links section
    body_lines.append("## Asymmetric Links")
    body_lines.append(f"Links declared in one direction but not reciprocated: **{len(asymmetric)}**")
    body_lines.append("")
    if asymmetric:
        for source, target, s_title, t_title in asymmetric:
            s_type, s_slug = source
            t_type, t_slug = target
            s_link = f"/sensemaker-site/{s_type}s/{s_slug}/"
            t_link = f"/sensemaker-site/{t_type}s/{t_slug}/"
            body_lines.append(f"- [{s_title}]({s_link}) → [{t_title}]({t_link}) (not reciprocated)")
    else:
        body_lines.append("None.")
    body_lines.append("")
    
    # Stale items section
    body_lines.append("## Stale Items")
    body_lines.append(f"Not updated for {30} days: **{len(stale)}**")
    body_lines.append("")
    if stale:
        for item_type, slug, title, date, days_old in stale:
            link = f"/sensemaker-site/{item_type}s/{slug}/"
            body_lines.append(f"- [{title}]({link}) — updated {date} ({days_old} days ago)")
    else:
        body_lines.append("None.")
    body_lines.append("")
    
    # Write file
    body_content = "\n".join(body_lines)
    post = frontmatter.Post(body_content, **frontmatter_dict)
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(frontmatter.dumps(post))
    
    print(f"✓ Generated {output_path}")
    print(f"  - Orphans: {len(orphans)}")
    print(f"  - Asymmetric links: {len(asymmetric)}")
    print(f"  - Stale items: {len(stale)}")


def generate_rhythm_markdown(rhythm_results, source_commit, output_path):
    """
    Generate rhythm-analysis.md with coherence scores.
    """
    now_iso = datetime.now().isoformat() + "Z"
    
    frontmatter_dict = {
        "title": "Rhythm Analysis",
        "entry_type": "status",
        "generated": True,
        "generated_at": now_iso,
        "source_commit": source_commit,
        "draft": False,
    }
    
    body_lines = []
    body_lines.append("# Rhythm Analysis")
    body_lines.append("")
    body_lines.append("This page is automatically generated. It is not part of the authored record.")
    body_lines.append(f"**Last generated:** {now_iso}")
    body_lines.append(f"**Source commit:** `{source_commit}`")
    body_lines.append("")
    body_lines.append("## Content Coherence Report")
    body_lines.append("")
    body_lines.append("Analyzes semantic alignment between declared intent and actual body content. Scores range 0.0–1.0 (higher = more coherent).")
    body_lines.append("")
    body_lines.append("---")
    body_lines.append("")
    
    # Group by type
    investigations = [r for r in rhythm_results if r[0] == "investigation"]
    articles = [r for r in rhythm_results if r[0] == "article"]
    
    # Investigations
    if investigations:
        body_lines.append("## Investigations")
        body_lines.append("")
        for item_type, slug, title, score, analysis in investigations:
            body_lines.append(f"### [{title}](/sensemaker-site/{item_type}s/{slug}/)")
            body_lines.append("")
            
            if score is None:
                body_lines.append(f"*Cannot analyze: {analysis.get('reason', 'Unknown')}*")
            else:
                status_icon = "✓" if score >= 0.80 else "⚠️" if score >= 0.70 else "❌"
                body_lines.append(f"**Coherence Score:** {score} {status_icon}")
                body_lines.append("")
                
                body_lines.append(f"**Intent:** {analysis.get('intent', 'N/A')[:150]}")
                body_lines.append("")
                
                body_lines.append(f"**Analysis:** {analysis.get('chunk_count', 0)} sections analyzed, avg coherence {analysis.get('avg_chunk_score', 0)}")
                
                if analysis.get("divergences"):
                    body_lines.append("")
                    body_lines.append("**Divergences (sections not aligned with intent):**")
                    for div in analysis["divergences"]:
                        body_lines.append(f"- Section {div['chunk_idx']}: coherence {div['score']} — \"{div['text'][:80]}...\"")
            
            body_lines.append("")
    
    # Articles
    if articles:
        body_lines.append("## Articles")
        body_lines.append("")
        for item_type, slug, title, score, analysis in articles:
            body_lines.append(f"### [{title}](/sensemaker-site/{item_type}s/{slug}/)")
            body_lines.append("")
            
            if score is None:
                body_lines.append(f"*Cannot analyze: {analysis.get('reason', 'Unknown')}*")
            else:
                status_icon = "✓" if score >= 0.80 else "⚠️" if score >= 0.70 else "❌"
                body_lines.append(f"**Coherence Score:** {score} {status_icon}")
                body_lines.append("")
                
                body_lines.append(f"**Intent:** {analysis.get('intent', 'N/A')[:150]}")
                body_lines.append("")
                
                body_lines.append(f"**Analysis:** {analysis.get('chunk_count', 0)} sections analyzed, avg coherence {analysis.get('avg_chunk_score', 0)}")
                
                if analysis.get("divergences"):
                    body_lines.append("")
                    body_lines.append("**Divergences (sections not aligned with intent):**")
                    for div in analysis["divergences"]:
                        body_lines.append(f"- Section {div['chunk_idx']}: coherence {div['score']} — \"{div['text'][:80]}...\"")
            
            body_lines.append("")
    
    # Summary
    scored = [r for r in rhythm_results if r[2] is not None]
    if scored:
        avg_coherence = sum(r[3] for r in scored if r[3]) / len([r for r in scored if r[3]])
        body_lines.append("---")
        body_lines.append("")
        body_lines.append("## Summary")
        body_lines.append("")
        body_lines.append(f"**Overall Corpus Coherence:** {round(avg_coherence, 2)}")
        body_lines.append("")
        body_lines.append("**Interpretation:**")
        if avg_coherence >= 0.85:
            body_lines.append("- 0.85+: Excellent coherence. Content stays focused.")
        elif avg_coherence >= 0.75:
            body_lines.append("- 0.75–0.84: Good coherence. Minor tangents detected in some pieces.")
        elif avg_coherence >= 0.65:
            body_lines.append("- 0.65–0.74: Fair coherence. Some pieces drift from stated intent.")
        else:
            body_lines.append("- Below 0.65: Weak coherence. Strong divergence from intent detected.")
    
    # Write file
    body_content = "\n".join(body_lines)
    post = frontmatter.Post(body_content, **frontmatter_dict)
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(frontmatter.dumps(post))
    
    print(f"✓ Generated {output_path}")
    print(f"  - Items analyzed: {len(rhythm_results)}")
    print(f"  - Scored items: {len([r for r in rhythm_results if r[3] is not None])}")


def main():
    parser = argparse.ArgumentParser(
        description="Generate status pages for SenseMaker."
    )
    parser.add_argument(
        "--content-dir",
        default="./content",
        help="Path to content directory (default: ./content)"
    )
    parser.add_argument(
        "--output-dir",
        default="./content/status",
        help="Path to output directory (default: ./content/status)"
    )
    parser.add_argument(
        "--stale-months",
        type=int,
        default=6,
        help="Consider items stale if not updated for N months (default: 6)"
    )
    parser.add_argument(
        "--enable-rhythm",
        action="store_true",
        help="Enable rhythm analysis using Gemini embeddings (requires GEMINI_API_KEY)"
    )
    
    args = parser.parse_args()
    
    content_dir = Path(args.content_dir)
    output_dir = Path(args.output_dir)
    
    if not content_dir.exists():
        print(f"Error: Content directory not found: {content_dir}", file=sys.stderr)
        sys.exit(1)
    
    print(f"Scanning {content_dir}...")
    items = parse_content_files(content_dir)
    print(f"  Found {len(items)} items")
    
    # Build index for lookups
    items_dict = {(t, s): d for t, s, d in items}
    
    # Phase 1: Link Integrity (always run)
    print("Building graph...")
    G = build_graph(items)
    print(f"  Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    
    print("Analyzing integrity...")
    orphans = find_orphans(G, items_dict)
    asymmetric = find_asymmetric_links(G, items_dict)
    stale = find_stale_items(items, args.stale_months)
    
    source_commit = get_git_commit()
    output_path = output_dir / "link-integrity.md"
    
    generate_markdown(orphans, asymmetric, stale, source_commit, output_path)
    
    # Phase 2: Rhythm Analysis (optional, requires Gemini)
    if args.enable_rhythm:
        print("\nAnalyzing rhythm...")
        if not HAS_GEMINI:
            print("  Warning: google-generativeai not installed. Skipping rhythm analysis.")
            print("  Install with: pip install google-generativeai")
        else:
            client = get_gemini_client()
            if client:
                rhythm_results = analyze_rhythm(client, items, items_dict)
                rhythm_output = output_dir / "rhythm-analysis.md"
                generate_rhythm_markdown(rhythm_results, source_commit, rhythm_output)
            else:
                print("  Skipping rhythm analysis (no API key)")
    
    print("\n✓ Done!")


if __name__ == "__main__":
    main()
