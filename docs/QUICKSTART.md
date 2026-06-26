# SenseMaker MVP - Quick Start

Get up and running in 5 minutes.

## 1. Prerequisites

- Install [Hugo (Extended)](https://gohugo.io/installation/)
- Install [Git](https://git-scm.com/)
- Have a [GitHub account](https://github.com)

## 2. Clone This Repository

```bash
cd c:\projects
git clone https://github.com/yourusername/wiki-site.git
cd wiki-site
```

Or if you just created it locally and added remote:

```bash
cd c:\projects\wiki-site
git remote add origin https://github.com/yourusername/wiki-site.git
git push -u origin main
```

## 3. Preview Locally

```bash
hugo server
```

Visit `http://localhost:1313` in your browser.

## 4. Create Your First Investigation

Option A: Use the script

```bash
# Windows
new-investigation.bat engineering example-investigation "My First Investigation"

# macOS/Linux
./new-investigation.sh engineering example-investigation "My First Investigation"
```

Option B: Create manually

Create `content/investigations/engineering/my-first-investigation.md`:

```yaml
---
title: "My First Investigation"
created: 2026-06-26
status: "Seed"
areas: ["Engineering"]
topics: ["Example"]
questions:
  - "What do I want to explore?"
tags: ["first"]
related: []
draft: false
---

## 26-June-2026

Initial thoughts go here...
```

## 5. Publish

```bash
# Commit and push
git add .
git commit -m "Add first investigation"
git push origin main
```

GitHub Actions automatically deploys in ~2-3 minutes.

Visit: `https://yourusername.github.io/wiki-site/`

## 6. Add More Investigations

Edit the investigation you just created, or create new ones:

```bash
# Add dated entry to existing investigation
# Edit content/investigations/engineering/my-first-investigation.md
# Add a new ## DD-Month-YYYY section at the end

# Create new investigation in a new area
new-investigation.bat ai neural-networks "Neural Network Scaling"
```

## File Structure You Need to Know

```
wiki-site/
├── content/
│   └── investigations/
│       ├── engineering/
│       │   └── my-investigation.md
│       ├── ai/
│       ├── philosophy/
│       └── _index.md
├── themes/sensemaker/     ← Theme (don't touch unless customizing)
├── config.toml            ← Main configuration
└── .github/workflows/deploy.yml  ← Auto-deployment
```

That's it. The rest is automatic.

## Customization

### Change Colors

Edit `themes/sensemaker/static/css/style.css`:

```css
:root {
  --color-bg: #0d1117;           /* Background color */
  --color-text: #c9d1d9;         /* Text color */
  --color-status-seed: #3fb950;  /* Seed status badge color */
  /* ... etc ... */
}
```

### Add a New Area

1. Create folder: `content/investigations/new-area/`
2. Use in investigations: `areas: ["New Area"]`
3. Automatically appears in navigation

### Change Site Title

Edit `config.toml`:

```toml
title = "My Thinking Lab"
```

### Add Menu Items

Edit `config.toml`:

```toml
[[menu.main]]
  name = "Custom Page"
  url = "/custom/"
  weight = 5
```

## Common Tasks

### Reopening an Investigation

Update the front matter:

```yaml
status: "Reopened"  # Changed from "Stable"
```

Add a new dated entry explaining why you're revisiting it.

### Archiving an Investigation

Update the front matter:

```yaml
status: "Archived"
```

It stays searchable but won't appear in "Open Investigations."

### Moving to Another Area

Update the front matter:

```yaml
areas: ["NewArea", "OldArea"]  # Changed order or added new one
```

### Hide from Public Search

Set to draft:

```yaml
draft: true
```

Investigation won't appear in lists. It's still accessible via URL. Search respects drafts.

## Helpful Commands

```bash
# Preview locally
hugo server

# Build production site
hugo

# Check for errors
hugo

# Clean generated files
rm -r public resources
```

## Next Steps

1. **Read the philosophy**: [PHILOSOPHY.md](PHILOSOPHY.md)
2. **Create investigations**: [CREATING_INVESTIGATIONS.md](CREATING_INVESTIGATIONS.md)
3. **Set up GitHub Pages**: [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Customize the theme**: Edit CSS in `themes/sensemaker/static/css/`

## Getting Help

- Check `README.md` for complete documentation
- See `PHILOSOPHY.md` for why SenseMaker is designed this way
- Check `CREATING_INVESTIGATIONS.md` for investigation best practices
- See `DEPLOYMENT.md` for hosting questions

## Remember

- **Start small**: Your first investigation doesn't need to be perfect
- **Be honest**: Write for yourself, not an audience
- **Accumulate**: This gets better over months and years
- **Never delete**: Archive instead; you might revisit later
- **Use search**: You don't need perfect organization

Now start investigating!

---

**Need help?** Check the docs directory or GitHub Issues.

**Want to customize?** See the theme in `themes/sensemaker/`.

**Ready to publish?** See `DEPLOYMENT.md`.
