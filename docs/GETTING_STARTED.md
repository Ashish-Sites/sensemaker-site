# Getting Started - First Steps

Complete walkthrough for your first 20 minutes with SenseMaker.

## Step 1: Understand the Philosophy (2 minutes)

Read [PHILOSOPHY.md](PHILOSOPHY.md) to understand:
- Why SenseMaker is NOT a wiki/blog/Obsidian alternative
- How it preserves your natural thinking process
- What makes this different

**Key insight**: You write investigations chronologically. Never overwrite. Only append.

## Step 2: Explore Locally (5 minutes)

```bash
# Navigate to project
cd c:\projects\wiki-site

# Start local preview
hugo server

# Open browser
# Visit http://localhost:1313
```

**What to try**:
- Click on "Investigations" in navigation
- Read the 3 sample investigations
- Try searching for "emergence"
- Toggle dark mode (top right)
- Click on status badges to understand meanings

Press `Ctrl+C` in terminal when done to stop server.

## Step 3: Understand Investigation Format (3 minutes)

Look at a sample investigation:

Open `content/investigations/philosophy/emergence.md` and notice:

```yaml
---
title: "Title"
created: 2026-06-26
status: "Thinking"
areas: ["Area"]
topics: ["Topic"]
questions:
  - "Question 1?"
  - "Question 2?"
tags: ["tag1"]
related: []
draft: false
---

## 26-June-2026

Initial thoughts...

---

## 11-July-2026

Later thoughts...
```

**Key points**:
- Front matter (YAML between `---`) defines the investigation
- Content below has dated sections (## DD-Month-YYYY)
- Sections separated by `---` line
- Never edit earlier sections; only add new ones

## Step 4: Create Your First Investigation (5 minutes)

### Option A: Use Script (Easiest)

**On Windows**:
```bash
new-investigation.bat philosophy consciousness "Consciousness and Self-Awareness"
```

**On macOS/Linux**:
```bash
./new-investigation.sh philosophy consciousness "Consciousness and Self-Awareness"
```

This creates: `content/investigations/philosophy/consciousness.md`

### Option B: Create Manually

1. Create folder: `content/investigations/philosophy/`
2. Create file: `consciousness.md`
3. Copy template from `CREATING_INVESTIGATIONS.md`
4. Fill in your details

## Step 5: Edit Your Investigation

Open the new file and:

1. Replace empty `questions` with actual questions driving your exploration
2. Replace empty `topics` field
3. Replace placeholder text with your initial thoughts

Example:

```yaml
---
title: "Consciousness and Self-Awareness"
created: 2026-06-26
status: "Seed"
areas: ["Philosophy"]
topics: ["Consciousness", "Artificial Minds"]
questions:
  - "What is consciousness?"
  - "Can machines be conscious?"
  - "Is consciousness necessary for intelligence?"
tags: ["consciousness", "ai"]
related: []
draft: false
---

## 26-June-2026

These are fundamental questions I keep returning to.

I notice that:
- We can't define consciousness precisely
- Yet I feel fairly certain that I'm conscious
- But I can't prove it to anyone else

This feels like a fundamental gap in human knowledge.

Questions that follow:
- Is consciousness even meaningful to discuss?
- Or is it just a label for something we don't understand?
```

## Step 6: Preview Your Changes

```bash
# Stop previous server (Ctrl+C)
# Then restart
hugo server

# Visit http://localhost:1313/investigations/
# You should see your new investigation
# Click on it to view
```

## Step 7: Commit to Git

```bash
# Check what's changed
git status

# Add your investigation
git add content/investigations/philosophy/consciousness.md

# Commit
git commit -m "New investigation: Consciousness and Self-Awareness"

# View the commit
git log --oneline -1
```

## Step 8: Deploy (Optional - requires GitHub)

If you've set up GitHub repository:

```bash
# Push to GitHub
git push origin main

# Check deployment
# 1. Go to https://github.com/yourusername/wiki-site/actions
# 2. Watch the workflow run (green checkmark when done)
# 3. Visit https://yourusername.github.io/wiki-site/investigations/
# 4. See your investigation live!
```

If not deployed yet, see `DEPLOYMENT.md` for GitHub Pages setup.

## Understanding the Workflow

### Your Typical Day

```bash
# 1. Start Hugo server
hugo server

# 2. Open browser at http://localhost:1313/investigations/

# 3. Click on an investigation you want to add to

# 4. Open the file in editor (content/investigations/area/topic.md)

# 5. Go to the END of the file

# 6. Add new dated section:
# ## 26-June-2026
# 
# New observations...

# 7. Save file

# 8. Refresh browser to see changes

# 9. When done for the day:
git add .
git commit -m "Daily notes on [topic]"
git push origin main

# Done! Live on your website within 2-3 minutes
```

### Your Typical Week

```
Monday: Create new investigation on a topic
Tuesday: Add to existing investigation based on new reading
Wednesday: Link two related investigations using "related" field
Thursday: Change status from "Thinking" to "Reading"
Friday: Archive a completed investigation
```

### Your Typical Month

```
Week 1: Accumulate new observations
Week 2: Revisit older investigations
Week 3: Create connections between ideas
Week 4: Update statuses and maybe create a synthesis
```

## Key Files to Reference

When you need to:

| Need | File |
|------|------|
| Get started quickly | `QUICKSTART.md` |
| Understand philosophy | `PHILOSOPHY.md` |
| Create investigation | `CREATING_INVESTIGATIONS.md` |
| Check commands | `COMMANDS.md` |
| Deploy to web | `DEPLOYMENT.md` |
| See what was built | `BUILD_SUMMARY.md` |
| Find specific file | `FILE_MANIFEST.md` |

## Common Questions After First 20 Minutes

**Q: How do I link investigations?**
A: Use the `related` field in front matter with investigation filenames.

**Q: Can I edit earlier entries?**
A: No. That's the whole point—preserve the evolution. Add new dated entries instead.

**Q: What if I want to change the title?**
A: Edit the front matter `title` field. The filename doesn't matter for display.

**Q: How do I make things private?**
A: Set `draft: true` in front matter to hide from listings (search still works).

**Q: How often should I add to an investigation?**
A: Whenever you have new thoughts. Could be daily, monthly, or yearly.

**Q: What if I get lost in all the thinking?**
A: Use search to find connections. Search is your main navigation tool.

**Q: Can I use multiple areas?**
A: Yes. In front matter: `areas: ["Area1", "Area2"]`. First one is primary.

**Q: How do I change colors?**
A: Edit `themes/sensemaker/static/css/style.css` CSS variables.

## Troubleshooting First 20 Minutes

### Hugo Server Won't Start
```bash
# Ensure Hugo extended is installed
hugo version

# Should show "extended" in output

# If not: Install from https://gohugo.io/installation/
```

### File Not Appearing in List
```yaml
# Check:
draft: false     # Must be false

# File location must be:
content/investigations/[area]/[filename].md

# Check YAML syntax (use spaces, not tabs)
```

### Search Not Working Locally
```bash
# Search requires built site:
hugo
cd public
python -m http.server 8000
# Visit http://localhost:8000
```

### Git Not Working
```bash
# Install Git from https://git-scm.com/

# Configure
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Try again
git status
```

## Next 30 Minutes

After your first 20 minutes:

1. **Create 2-3 more investigations** in different areas
2. **Link them** using the `related` field
3. **Try searching** for keywords
4. **Update status** of one investigation
5. **Explore the theme** CSS if interested

## Next Steps (Beyond First Hour)

1. Read `PHILOSOPHY.md` carefully
2. Follow `CREATING_INVESTIGATIONS.md` for best practices
3. Set up GitHub and deploy following `DEPLOYMENT.md`
4. Start accumulating investigations
5. Review every month to see connections

## Remember

- **Start simple**: Your first investigation doesn't need to be perfect
- **Accumulate**: This gets better over weeks and months
- **Trust search**: You don't need perfect folder organization
- **Preserve everything**: The evolution is valuable
- **Keep going**: The real power emerges over time

---

**You're ready. Create your first investigation now.**

When you're stuck or have questions, refer back to the documentation.

All the tools you need are already built.

Start investigating.
