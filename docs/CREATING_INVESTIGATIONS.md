# Creating New Investigations

Guide for creating investigations in SenseMaker.

You can do this either locally in VS Code or in Prose.io:

```
https://prose.io/#Ashish-Sites/sensemaker-site
```

Prose writes directly to this repository, so commits there trigger deployment the
same way as local commits.

## Investigation Filename

Use kebab-case (lowercase with hyphens) for the filename:

```
✓ emerging-behavior-in-complexity.md
✓ consciousness-and-emergence.md
✗ Emerging Behavior In Complexity.md
✗ EmergingBehavior.md
```

Place investigations in `content/investigations/[area]/[filename].md`

## Front Matter Template

Every investigation must have complete front matter:

```yaml
---
title: "Full Human-Readable Title of Investigation"
created: 2026-06-26
status: "Seed"
areas: ["Area1", "Area2"]
topics: ["Topic1", "Topic2"]
questions:
  - "What is the first core question?"
  - "What is the second?"
tags: ["free-form-tag", "another-tag"]
related: []
draft: false
---
```

### Field Descriptions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | String | Yes | Human-readable title. Use title case. |
| `created` | Date | Yes | Format: YYYY-MM-DD. Date you started this. |
| `status` | String | Yes | Must be one of: Seed, Thinking, Reading, Exploring, Model Emerging, Essay Draft, Stable, Reopened, Archived |
| `areas` | List | Yes | At least one. Use exact area names (capitalized). |
| `topics` | List | Yes | At least one. More specific than areas. |
| `questions` | List | Yes | At least one. These drive the investigation. Use complete sentences ending with `?` |
| `tags` | List | Yes | Can be empty. Use lowercase, kebab-case. |
| `related` | List | Yes | Can be empty. Use filenames (without `.md`) of related investigations. |
| `draft` | Boolean | Yes | Use `false` for published, `true` to hide. |

## Content Format: Dated Entries

Begin with initial entry using a Markdown heading with the date:

```markdown
## 26-June-2026

Your initial thoughts, observations, questions.

You can use multiple paragraphs, bullet points, code blocks—whatever makes sense.

---

## 03-July-2026

When you return to this investigation, add a new dated section (also level 2 heading).

Use a horizontal rule (---) to separate entries visually.

Don't edit the earlier entry. Add new thoughts here.

---

## 15-December-2026

Nine months later, you notice something new...
```

### Date Format

Always use: `DD-Month-YYYY` (e.g., `26-June-2026`)

This is consistent and sortable.

## If You Use Prose.io

- Create files under `content/investigations/<area>/...`
- Keep filename in kebab-case
- Confirm front matter remains valid YAML lists for `areas`, `topics`, `questions`, `tags`, and `related`
- Keep append-only behavior: add a new dated section, do not overwrite prior dated sections

## Content Elements You Can Use

### Emphasis

```markdown
*Italic* or _italic_

**Bold** or __bold__

***Bold italic***
```

### Lists

```markdown
- Unordered item
- Another item
  - Nested item

1. Ordered item
2. Another item
   1. Nested ordered
```

### Code

Inline code: `` `code` ``

```markdown
Code block:

```python
def hello():
    print("world")
```

```javascript
console.log("JavaScript works too");
```
```

### Mathematics

Inline: `$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$`

Display (paragraph):
```
$$
F = ma
$$
```

### Quotes

```markdown
> This is a block quote
> It can span multiple lines
> 
> And have multiple paragraphs
```

### Links

```markdown
[Link text](https://example.com)

[Internal investigation](../other-investigation/)

Link to specific idea in investigation with section headers
```

### Footnotes

```markdown
This is a claim[^1].

[^1]: This is the footnote text. It can be multiple paragraphs.
```

### Tables

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

### Admonitions (Note, Warning, Idea, etc.)

If supported by theme:

```markdown
> **Note**: This is important context

> **Question**: Is this assumption valid?

> **Insight**: This connects to earlier thinking about...
```

## Linking to Other Investigations

### In Front Matter

Use the `related` field:

```yaml
related:
  - "emerging-behavior"
  - "distributed-systems"
  - "consciousness"
```

These show up as a linked list at the bottom with status badges.

### In Body

Link using relative paths:

```markdown
See my investigation on [emerging behavior](../philosophy/emergence/).

This connects to [distributed systems](../engineering/distributed-systems/).
```

Or external links:

```markdown
[Paper: "Emergence as a Fundamental Concept"](https://arxiv.org/...)

[Book: Gödel, Escher, Bach](https://en.wikipedia.org/...)
```

## Updating an Investigation

### Adding New Thinking

1. Open the file
2. Go to the end
3. Add a new dated section with level-2 heading
4. Write your new thoughts
5. Add separator line if needed
6. Commit and push

**Don't edit earlier entries.** The chronological record matters.

### Changing Front Matter

Update only the front matter:

```yaml
created: 2026-06-26
status: "Thinking"  # Changed from "Seed"
areas: ["Engineering", "Philosophy"]  # Added Philosophy
tags: ["added", "a", "new", "tag"]
```

The `updated` date is automatic (from file modification time).

### Moving to Different Status

Change the `status` field:

```yaml
status: "Model Emerging"  # Evolved from "Thinking"
```

Status affects the visual badge and sorting on the homepage.

### Archiving

Set status to "Archived":

```yaml
status: "Archived"
```

Archived investigations still appear in search but not in "Open" or "Recently Active" sections.

## Workflow Example

### Day 1: Start a New Investigation

```bash
# Create file
cat > content/investigations/ai/transformers-and-scaling.md << 'EOF'
---
title: "Transformers and Scaling Laws"
created: 2026-06-26
status: "Seed"
areas: ["AI"]
topics: ["Deep Learning", "Scaling"]
questions:
  - "How do transformer architectures scale with data and parameters?"
  - "Are there fundamental limits to scaling?"
tags: ["transformers", "scaling"]
related: []
draft: false
---

## 26-June-2026

Just finished reading papers on scaling laws. Some initial thoughts:

- The loss function follows predictable power laws
- Performance scales smoothly with model size
- But capabilities appear discretely

This is puzzling.

EOF
```

### Week Later: Return with New Insight

```bash
# Edit the file, add to the end:
# ## 03-July-2026
# 
# Read more about phase transitions in physical systems.
# Maybe there's an analogy here...
```

### Month Later: Update Status

```bash
# Edit front matter:
# status: "Thinking"
```

## Areas and Topics

### Use Consistent Area Names

Use these (or add your own):

- Engineering
- AI
- Philosophy
- Economics
- Psychology
- Civilization
- Religion
- Nature
- Personal

Choose primary area (first in list) based on what feels most important.

### Topics Should Narrow

- Area: "Engineering"
- Topic: "Distributed Systems"
- Topic: "Consensus Algorithms"
- Topic: "Raft Protocol"

## Best Practices

1. **Start small**: Don't wait until you have complete thoughts. "Seed" status is fine.

2. **Use questions**: Start investigations with the questions that puzzle you, not answers.

3. **Be honest**: Write for yourself. Include failures, confusion, wrong turns.

4. **Date consistently**: Every new section gets a clear date heading.

5. **Link intentionally**: Use `related` to explicitly note connections.

6. **Search before creating**: Use search to avoid duplicate investigations.

7. **Evolve status**: Let status change as thinking progresses.

8. **Let it grow**: Don't overthink organization. You have search.

## Testing Locally

```bash
# From project root
hugo server

# Visit http://localhost:1313/investigations/

# Search across all investigations
# Filter by status, area, topic
```

## Publishing

```bash
# Commit and push to GitHub
git add content/investigations/ai/transformers-and-scaling.md
git commit -m "New investigation: Transformers and Scaling Laws"
git push origin main

# GitHub Actions automatically builds and deploys
```

## Common Questions

**Q: Can I change the title later?**  
A: Yes. Update the `title` field. The filename doesn't affect the display title.

**Q: What if I wrote something wrong?**  
A: Don't delete it. Add a new dated section correcting the record. The evolution is valuable.

**Q: Can I use images?**  
A: Yes. Use page bundles. Create a folder instead of a file, with the Markdown renamed to `index.md`. Place images in the same folder.

```
content/investigations/ai/
├── transformers-and-scaling/
│   ├── index.md
│   └── attention-mechanism.png
```

Then reference: `![Attention Mechanism](attention-mechanism.png)`

**Q: How do I search?**  
A: Use the search page. It searches titles, body, questions, tags, areas, topics, and status.

**Q: How do I find related investigations?**  
A: Use the `related` field in front matter. Use search. Use area/topic browsing on homepage.

**Q: Can I make investigations private?**  
A: Yes. Set `draft: true` to hide from listings (search still works).

---

Now start investigating. The system exists to support your thinking, not the other way around.
