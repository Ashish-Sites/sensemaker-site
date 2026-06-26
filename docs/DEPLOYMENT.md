# Deployment Guide

How to set up GitHub Pages hosting and deploy SenseMaker.

## Prerequisites

- GitHub account
- Git installed locally
- Hugo installed (extended version)

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create new repository named `wiki-site` (or any name)
3. Make it **Public** (required for free GitHub Pages)
4. Initialize with README (optional, you have one)
5. Click "Create repository"

## Step 2: Initialize Local Repository

```bash
cd c:\projects\wiki-site

# Initialize git
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: SenseMaker MVP"

# Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/wiki-site.git

# Create main branch and push
git branch -M main
git push -u origin main
```

## Step 3: Configure GitHub Pages

1. Go to your repository on GitHub
2. Go to **Settings** → **Pages**
3. Under "Source", select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**

The GitHub Actions workflow automatically creates the `gh-pages` branch on first deploy.

## Step 4: First Deployment

The workflow runs automatically on push to `main`:

```bash
# Make a small change
echo "# Testing deployment" >> README.md

# Commit and push
git add README.md
git commit -m "Trigger first deployment"
git push
```

Go to **Actions** tab to watch the build. When complete, your site is live at:

```
https://USERNAME.github.io/wiki-site/
```

## Custom Domain Setup

### Using a Domain You Own

1. **Update workflow file** (`.github/workflows/deploy.yml`):

```yaml
- name: Deploy
  uses: peaceiris/actions-gh-pages@v3
  if: github.ref == 'refs/heads/main'
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./public
    cname: wiki.yourdomain.com  # Change this
```

2. **DNS Configuration**:

Go to your domain registrar and add a CNAME record:

```
CNAME wiki.yourdomain.com  →  USERNAME.github.io
```

(Replace `wiki` with your subdomain)

3. **GitHub Pages Settings**:

Back in GitHub Pages settings, GitHub will auto-detect and verify the domain.

4. **Enable HTTPS** (recommended):

In GitHub Pages settings, check "Enforce HTTPS" once the domain is verified.

5. **Deploy**:

```bash
git add .github/workflows/deploy.yml
git commit -m "Update custom domain"
git push
```

### Using GitHub's Default Domain

If you don't have a custom domain, your site is at:

```
https://USERNAME.github.io/wiki-site/
```

You can access it immediately after the first successful deployment.

## Optional Browser CMS (Prose.io)

If you want browser-based editing for Markdown content (create, edit, delete),
you can use Prose.io with this repo.

### Setup

1. Ensure `.prose.yml` exists at repository root (already added).
2. Push your latest `main` branch.
3. Open:

```
https://prose.io/#Ashish-Sites/sensemaker-site
```

4. Authorize with GitHub when prompted.

### What You Can Do in Prose

- Create new investigation files in `content/investigations/...`
- Edit front matter fields (`title`, `status`, `areas`, etc.)
- Append new dated entries in Markdown body
- Delete investigations when needed
- Commit changes directly to `main`

After commit, GitHub Actions deploys the updated site automatically.

### Notes

- Prose.io is an external hosted editor and may occasionally be unavailable.
- Your source of truth remains Markdown + Git.
- For bulk edits or advanced refactors, local VS Code editing is still better.

## Optional Browser CMS (Decap CMS)

Decap CMS gives a form-based editor for front matter plus Markdown body editing.

### Included in this repo

- Admin app entry: `static/admin/index.html`
- CMS config: `static/admin/config.yml`

After deployment, open:

```
https://ashish-sites.github.io/sensemaker-site/admin/
```

### Important: GitHub Pages auth requirement

On GitHub Pages, Decap needs an OAuth bridge service to authenticate with GitHub.

In `static/admin/config.yml`, set:

```yaml
backend:
  name: github
  repo: Ashish-Sites/sensemaker-site
  branch: main
  base_url: https://your-oauth-bridge.example.com
  auth_endpoint: auth
```

You can host this bridge for free (for example on Netlify, Vercel, or Cloudflare Workers)
using the Decap OAuth bridge project.

### Local testing

`local_backend: true` is enabled, so local CMS testing works without OAuth bridge:

```bash
npx decap-server
hugo server
```

Then open:

```
http://localhost:1313/admin/
```

### What the Decap form edits

- `title`, `created`, `status`
- `areas`, `topics`, `questions`, `tags`, `related`
- `draft`
- Markdown body content

## Checking Deployment Status

### In GitHub

1. Go to repository
2. Click **Actions** tab
3. See the most recent workflow run
4. Green checkmark = success
5. Red X = failure (see logs for details)

### In Browser

After successful deployment, visit your GitHub Pages URL (appears in Pages settings).

## Updating Your Site

Every time you push to `main`, the workflow runs:

```bash
# Make changes locally
# ... edit investigations, config, theme, etc ...

# Commit
git add .
git commit -m "Add new investigation: Title"

# Push
git push origin main
```

Deployment happens automatically. Check the Actions tab to confirm.

## Troubleshooting

### Build Fails

**Check the logs**:
1. Go to **Actions**
2. Click the failed workflow
3. Click **Deploy** job
4. Scroll through logs to see the error

**Common issues**:
- Hugo version mismatch
- Syntax error in YAML front matter
- Path issues in templates
- Hugo shortcodes using undefined parameters

### Site Shows Old Version

1. Clear browser cache (Ctrl+Shift+Delete)
2. Do a hard refresh (Ctrl+F5)
3. Check GitHub Pages settings to confirm custom domain

### CNAME Not Verifying

- Check DNS propagation: https://dnschecker.org/
- Wait up to 48 hours for DNS to propagate
- Ensure CNAME record points to `USERNAME.github.io` (not `USERNAME.github.io/wiki-site`)

## Local Development

Use Hugo locally to preview before pushing:

```bash
# From project root
hugo server

# Visit http://localhost:1313
# Changes are live-reloaded
```

Hugo doesn't serve the search index locally by default. To test search:

```bash
# Build static site
hugo

# Serve the public directory
cd public
python -m http.server 8000

# Visit http://localhost:8000
# Now search works
```

## Backing Up

Your repository IS your backup. To ensure it's preserved:

1. **Mirror on another platform**:

```bash
git remote add backup https://gitlab.com/USERNAME/wiki-site.git
git push backup main
```

2. **Local backup**:

```bash
# Clone to external drive
git clone https://github.com/USERNAME/wiki-site.git /backup/wiki-site
```

## Performance

GitHub Pages is fast globally. Your site will be served from Cloudflare's CDN.

To optimize further:

1. **Minimize images**: Use WebP format
2. **Lazy load images**: Hugo can do this with custom shortcodes
3. **Cache busting**: Hugo automatically does this for assets

## Privacy Considerations

Your GitHub repo is public (required for free Pages). Your investigations are visible.

If you need privacy:

1. Use **private repository** + GitHub Pro
2. Use custom domain to hide GitHub hosting
3. Use `draft: true` to hide investigations from listings (they don't appear in search links but are still accessible if URL is known)
4. Consider adding authentication later (future feature)

## Automatic Deployment Tips

The workflow runs on:
- Every push to `main` branch
- Pull requests (doesn't deploy, only builds to check)

To deploy a specific commit:

```bash
git push origin main
```

The workflow will build and deploy within minutes.

## Advanced: Modifying the Workflow

The deployment workflow is in `.github/workflows/deploy.yml`.

You can customize:
- Hugo version
- Build parameters
- Deployment branch
- Notifications

For most use cases, the default workflow is fine.

## Rollback

If deployment causes issues:

```bash
# Revert to previous commit
git revert HEAD

# Push (triggers new deployment with old code)
git push origin main
```

The `gh-pages` branch will be updated automatically.

---

**That's it!** Your SenseMaker is now live and automatically deployed.

Every investigation you add or update will be live within minutes of pushing to GitHub.
