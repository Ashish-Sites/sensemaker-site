# SenseMaker - Command Reference

Quick reference for common SenseMaker commands.

## Local Development

```bash
# Start local development server
hugo server

# Build production site
hugo

# Clean build (remove generated files)
rm -r public resources
hugo

# Watch for changes and rebuild
hugo server --watch
```

## Creating Investigations

### Windows
```bash
# Create new investigation
new-investigation.bat [area] [slug] "Investigation Title"

# Example:
new-investigation.bat engineering distributed-systems "Distributed Systems Design"

# Create in new area (creates folder automatically)
new-investigation.bat philosophy consciousness "Consciousness and AGI"
```

### macOS / Linux
```bash
# Create new investigation
./new-investigation.sh [area] [slug] "Investigation Title"

# Example:
./new-investigation.sh engineering distributed-systems "Distributed Systems Design"
```

## Git Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit (one approach: atomic commits)
git commit -m "Add investigation: Topic Title"

# Push to GitHub
git push origin main

# View log
git log --oneline

# See changes
git diff
git diff HEAD~1
```

## Investigation Management

### Create
```bash
# Manual method (any OS):
# 1. Create file: content/investigations/[area]/[filename].md
# 2. Use template from CREATING_INVESTIGATIONS.md
# 3. Fill in front matter
# 4. Add first dated section
```

### Edit
```bash
# Edit investigation
# Change front matter as needed
# Add new dated section at the end (never modify earlier entries)
# Save and push
```

### Change Status
```yaml
# Edit front matter:
status: "Seed"          # → Change to...
status: "Thinking"
status: "Reading"
status: "Exploring"
status: "Model Emerging"
status: "Essay Draft"
status: "Stable"
status: "Reopened"
status: "Archived"
```

### Link Investigations
```yaml
# In the front matter:
related:
  - "other-investigation-slug"
  - "another-investigation"

# In the body:
[Link text](../area/investigation-slug/)
```

### Hide from Public
```yaml
# In front matter:
draft: true

# Investigation still searchable but hidden from lists
```

## Configuration

### Change Site Title
Edit `config.toml`:
```toml
title = "Your Title Here"
```

### Change Site Description
Edit `config.toml`:
```toml
[params]
  description = "Your description here"
```

### Add Menu Item
Edit `config.toml`:
```toml
[[menu.main]]
  name = "Custom Page"
  url = "/custom/"
  weight = 5
```

### Customize Colors
Edit `themes/sensemaker/static/css/style.css`:
```css
:root {
  --color-bg: #0d1117;
  --color-text: #c9d1d9;
  --color-status-seed: #3fb950;
  /* ... etc ... */
}
```

## Deployment

### First Time GitHub Setup
```bash
# Initialize local repo
git init

# Add files
git add .

# Commit
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/USERNAME/wiki-site.git

# Create and push to main
git branch -M main
git push -u origin main

# Then configure GitHub Pages:
# - Go to Settings → Pages
# - Source: gh-pages branch
# - Save
```

### Deploy Changes
```bash
# Make changes
# ... edit investigations ...

# Commit
git add .
git commit -m "Add investigation: Title"

# Push (triggers automatic deployment)
git push origin main

# Check deployment:
# - Go to Actions tab
# - See workflow status
# - Wait 2-3 minutes
# - Visit your site URL
```

### Rollback
```bash
# Revert last commit
git revert HEAD

# Push (deploys reverted code)
git push origin main
```

## Troubleshooting

### Search Not Working Locally
```bash
# Hugo doesn't serve JSON locally by default
# Build production site instead:
hugo

# Serve from public directory:
cd public
python -m http.server 8000

# Visit http://localhost:8000
```

### Build Fails
```bash
# Check error logs:
hugo --debug

# Common issues:
# - Syntax error in front matter (check YAML)
# - Invalid date format (use YYYY-MM-DD)
# - Path issues in links
```

### Status Badge Not Showing
```yaml
# Ensure status is exact (case-sensitive):
status: "Seed"              # ✓
status: "seed"              # ✗
status: "SEED"              # ✗

# Valid status values:
- Seed
- Thinking
- Reading
- Exploring
- Model Emerging
- Essay Draft
- Stable
- Reopened
- Archived
```

### Investigation Not Appearing
```yaml
# Check front matter:
draft: false                # Must be false to show

# Check content folder:
# Must be in: content/investigations/[area]/[slug].md

# Check YAML syntax:
# - Use proper indentation (2 spaces)
# - Quotes around strings with colons
```

## Common Workflows

### Daily Note-Taking
```bash
# Open your current investigation
# Add new dated section at the end
# Write observations
# Save and push
git add content/investigations/area/investigation.md
git commit -m "Daily notes on [topic]"
git push
```

### Weekly Review
```bash
# Check homepage for recently updated investigations
# Revisit some open investigations
# Update status if thinking evolved
# Add new connections via related field
```

### Monthly Synthesis
```bash
# Search for related investigations
# Create connecting document
# Link investigations with related field
# Update status of completed investigations
```

### Archiving Completed Work
```yaml
# Edit investigation:
status: "Archived"

# Push
git add .
git commit -m "Archive investigation: [topic]"
git push
```

## File Organization

### Where Investigations Go
```
content/investigations/
├── engineering/
│   └── [your-investigation].md
├── ai/
│   └── [your-investigation].md
├── philosophy/
│   └── [your-investigation].md
└── [add-your-areas-here]/
    └── [investigations].md
```

### Theme Files
```
themes/sensemaker/
├── layouts/              # HTML templates (don't edit unless extending)
├── static/css/           # Stylesheets (safe to edit)
└── static/js/            # JavaScript (safe to edit)
```

### Documentation
```
Root directory:
├── README.md             # Main documentation
├── PHILOSOPHY.md         # Why SenseMaker exists
├── QUICKSTART.md         # Get started quickly
├── CREATING_INVESTIGATIONS.md  # How to write investigations
├── DEPLOYMENT.md         # GitHub Pages setup
└── BUILD_SUMMARY.md      # What was built
```

## Testing

### Preview Locally
```bash
hugo server
# Visit http://localhost:1313
# Changes auto-reload
```

### Test Search
```bash
hugo
cd public
python -m http.server 8000
# Visit http://localhost:8000
# Test search functionality
```

### Check Deployment
```bash
# After git push
# 1. Go to GitHub Actions tab
# 2. Watch workflow run
# 3. Green checkmark = success
# 4. Visit yoursite.github.io/wiki-site/
```

## Useful Links

- **Hugo Docs**: https://gohugo.io/documentation/
- **Hugo Templates**: https://gohugo.io/templates/
- **Markdown Guide**: https://www.markdownguide.org/
- **Git Docs**: https://git-scm.com/doc
- **GitHub Pages**: https://pages.github.com/

## Remember

- **Append, don't overwrite**: Add new dated sections
- **Use search**: You don't need perfect organization
- **Start small**: MVP is fine; grow from there
- **Backup to Git**: Everything is versioned
- **Accumulate**: More valuable over time

---

**Quick help?** Run: `hugo help`  
**Need docs?** See: `README.md`  
**How to create?** See: `CREATING_INVESTIGATIONS.md`
