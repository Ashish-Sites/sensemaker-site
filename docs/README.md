# SenseMaker

A digital extension of handwritten thinking. A personal sense-making environment that preserves your natural thinking process while adding capabilities that paper cannot provide.

## Companion Documents

- [Design document](DESIGN.md)
- [Content model decisions](CONTENT_MODEL_DECISIONS.md)
- [Deployment guide](DEPLOYMENT.md)

## Table of Contents

- [Philosophy](#philosophy)
- [Core Principles](#core-principles)
- [Project Structure](#project-structure)
- [Investigation Format](#investigation-format)
- [Status Values](#status-values)
- [Quick Start](#quick-start)
- [Build Validation Pipeline](#build-validation-pipeline)
- [Building and Deployment](#building-and-deployment)
- [Features](#features)
- [Troubleshooting](#troubleshooting)

## Philosophy

SenseMaker is not a blog, wiki, or traditional note-taking application. It is a **digital notebook that has acquired superpowers**:

- **Full-text search** across all investigations
- **Cross-linking** between related ideas
- **Backlinks** showing what references each investigation
- **Easy navigation** through hierarchical organization
- **Long-term preservation** using Git as the database
- **Chronological thinking** that never overwrites earlier observations

## Core Principles

- **Single user optimization**: Designed entirely for one long-term thinker
- **Append-only by default**: Never overwrite earlier thinking; only add new dated entries
- **Hierarchical navigation**: Areas → Topics → Investigations
- **Connected by links**: Everything else linked through manual and automatic relationships
- **Typography first**: Minimal design, readable, fast
- **Future-proof structure**: Easy to add AI integration, knowledge graphs, embeddings later

## Project Structure

```
wiki-site/
├── content/
│   ├── investigations/          # Investigation entries
│   ├── articles/                # Article entries
│   ├── areas/                   # Area taxonomy terms
│   ├── topics/                  # Topic taxonomy terms
│   ├── tags/                    # Tag taxonomy terms
│   ├── questions/               # Question taxonomy terms
│   └── help/
├── scripts/                     # Build/validation scripts
│   ├── validate-taxonomy.ps1
│   ├── validate-content-quality.ps1
│   ├── validate-built-links.ps1
│   └── build-with-validation.ps1
├── themes/
│   └── sensemaker/              # Custom minimal theme
│       ├── layouts/
│       ├── static/
│       │   ├── css/
│       │   └── js/
│       └── config.yaml
├── static/                      # Static assets
├── public/                      # Generated site (git ignored)
├── config.toml                  # Hugo configuration
└── .github/
    └── workflows/
        └── deploy.yml           # GitHub Actions
```

## Investigation Format

Every investigation is a Markdown file with front matter and chronological entries.

### Front Matter

```yaml
---
title: "Investigation Title"
created: 2026-06-26
status: "Seed"              # Seed, Thinking, Reading, Exploring, Model Emerging, Essay Draft, Stable, Reopened, Archived
areas: ["Area1", "Area2"]   # Primary areas of investigation
topics: ["Topic1"]          # Sub-topics
questions:                  # Driving questions
  - "First question?"
  - "Second question?"
tags: ["tag1", "tag2"]      # Free-form tags
related:                    # Related investigations (filename only)
  - "other-investigation"
draft: false
---
```

### Content Format

Entries are dated and separated by dividers:

```markdown
## 26-June-2026

Initial observations...

Questions...

Ideas...

---

## 11-July-2026

New insight after reading...

Different perspective...

---

## 21-January-2027

Earlier assumption was wrong because...

This connects to...
```

**Key principle**: Never overwrite earlier entries. Always append new dated sections.

## Status Values

Status is visually prominent and helps organize thinking:

- **Seed**: Initial idea, barely formed
- **Thinking**: Active exploration and questioning
- **Reading**: Engaged with external sources
- **Exploring**: Experimental phase, testing ideas
- **Model Emerging**: A coherent model or framework is forming
- **Essay Draft**: Ready to synthesize into an essay
- **Stable**: Mature investigation ready for reference
- **Reopened**: Previously stable, now questioning again
- **Archived**: Closed but preserved for history

## Areas of Investigation

Choose primary areas that organize your thinking:

- Engineering
- AI
- Philosophy
- Economics
- Psychology
- Civilization
- Religion
- Nature
- Personal
- (Add your own)

Areas create the top-level navigation. Topics refine within areas.

## Quick Start

### 1. Create a New Investigation

Create a new Markdown file in `content/investigations/[area]/[topic].md`:

```markdown
---
title: "Investigation Title"
created: 2026-06-26
status: "Seed"
areas: ["Area"]
topics: ["Topic"]
questions:
  - "What am I exploring?"
tags: ["tag1"]
related: []
draft: false
---

## 26-June-2026

Initial thoughts...
```

### 2. View Locally

```bash
hugo server
```

Visit `http://localhost:1313`

### 3. Add to Git and Push

```bash
git add .
git commit -m "New investigation: Topic Title"
git push origin main
```

Use the workflow in `.github/workflows/deploy.yml` from the GitHub Actions tab to run the validated build + deploy pipeline.

### 4. Update Later

Simply add a new dated section to the Markdown:

```markdown
---
## [new date]

New thinking...
```

Hugo automatically updates the modification date. The search index regenerates on every build.

## Search

Full-text search works across:
- Investigation titles
- Content body
- Questions
- Tags
- Areas
- Topics
- Status

Search is client-side and instant. The search index (`index.json`) is generated at build time.

## Related Investigations

Link investigations through the `related` front matter field:

```yaml
related:
  - "distributed-systems"
  - "complexity"
```

Use the directory name (slug) of the related investigation, not the title.

Related investigations appear as a linked list at the bottom of each page with their status badges.

## Build Validation Pipeline

The build pipeline includes three validation gates before deployment:

1. `scripts/validate-taxonomy.ps1`
  Checks taxonomy integrity (required `_index.md` files, canonical term files, and required `entry_type`).
2. `scripts/validate-content-quality.ps1`
  Checks markdown quality rules (balanced fences, safe root links, image references, and investigation template ordering).
3. `scripts/validate-built-links.ps1`
  Checks generated HTML in `public/` for broken internal links and missing assets.

Run the full local pipeline with one command:

```powershell
pwsh -File ./scripts/build-with-validation.ps1 -BaseUrl "https://ashish-sites.github.io/sensemaker-site/"
```

## Building and Deployment

### Local Development

```bash
# Install Hugo (extended version required for advanced features)
# https://gohugo.io/installation/

# Serve locally
hugo server

# Run full validated production build
pwsh -File ./scripts/build-with-validation.ps1 -BaseUrl "https://ashish-sites.github.io/sensemaker-site/"
```

### GitHub Pages Deployment

1. Open the `Deploy to GitHub Pages` workflow in GitHub Actions.
2. Run `workflow_dispatch`.
3. Workflow executes validation + build + deploy.
4. Site is published from `gh-pages`.

### Custom Domain

To use a custom domain:

1. Add a `CNAME` file under `static/` with your domain.
2. Add CNAME record at your DNS provider.
3. Ensure GitHub Pages is configured to serve from `gh-pages`.

## Features

### Implemented

- ✅ Chronological investigations with dated entries
- ✅ Status tracking with visual badges
- ✅ Hierarchical organization (Area → Topic)
- ✅ Manual relationship linking
- ✅ Client-side full-text search
- ✅ Dark mode (respects system preference)
- ✅ Responsive design
- ✅ LaTeX support (via KaTeX)
- ✅ Code syntax highlighting
- ✅ GitHub Pages deployment
- ✅ Git-based versioning

### Coming in Future Versions

- AI-powered insights on investigations
- Automatic backlink detection
- Knowledge graph visualization
- Investigation dashboard with analytics
- Embedding-based similarity search
- Private authentication layer
- Image/sketch support in investigations
- Graph database integration
- Question explorer

## Design Principles

1. **Content over decoration**: Typography and readability first
2. **Minimal UI**: Only essential navigation and controls
3. **Fast**: Static site generation, no database
4. **Preserving**: Everything in Git, nothing locked in proprietary formats
5. **Natural**: Feels like a paper notebook that has acquired superpowers
6. **Single-user**: Optimized for deep, long-term thinking

## Technology Stack

- **Hugo**: Static site generator
- **Markdown**: Content format
- **Git**: Version control and database
- **GitHub Pages**: Free hosting
- **GitHub Actions**: Automated deployment
- **KaTeX**: Mathematics rendering
- **Custom CSS**: Responsive design
- **Vanilla JavaScript**: Theme toggle, search

## Troubleshooting

### Search not working

Ensure `outputs` in `config.toml` includes JSON:
```toml
[outputs]
  home = ["HTML", "JSON"]
```

### Hugo not finding theme

Make sure theme folder is at: `themes/sensemaker/`

### Images not displaying

Images should be in page bundles:
```
content/investigations/area/topic/index.md
content/investigations/area/topic/image.png
```

Then reference in Markdown:
```markdown
![Description](image.png)
```

## Contributing to SenseMaker

This is your personal system. Modify freely:

- Customize colors in `themes/sensemaker/static/css/style.css`
- Add areas in `config.toml` if needed
- Extend the theme in `themes/sensemaker/layouts/`
- Add custom metadata to front matter as needed

Everything in Hugo is designed to be extensible.

## Philosophy Behind SenseMaker

See [PHILOSOPHY.md](PHILOSOPHY.md) for a deep dive into the thinking behind this system.

## License

SenseMaker itself is provided as-is. Your investigations are yours.

---

**Version**: v0.1  
**Last Updated**: June 2026  
**Status**: Actively evolving
