# Deployment Guide

Date: 2026-07-02
Status: Active

## Table of Contents

1. [Overview](#overview)
2. [One-Time GitHub Setup](#one-time-github-setup)
3. [Workflows](#workflows)
4. [How to Deploy](#how-to-deploy)
5. [How to Run a Local Build](#how-to-run-a-local-build)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The site is hosted on GitHub Pages at:
`https://ashish-sites.github.io/sensemaker-site/`

Two GitHub Actions workflows handle CI and deployment:

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| Build and Validate | `build-validate.yml` | Pull requests to `main` + Manual (`workflow_dispatch`) | Validate + build only, no deploy |
| Deploy to GitHub Pages | `deploy.yml` | Push to `main` (content/theme/config changes) + Manual (`workflow_dispatch`) | Full deploy to GitHub Pages |

---

## One-Time GitHub Setup

These settings must be configured once in the GitHub repository. If deployment breaks after a repository reset or re-creation, verify these first.

### 1. Set Pages source to GitHub Actions

1. Go to **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

This automatically creates the `github-pages` environment with correct permissions. Do not change this to "Deploy from a branch".

### 2. Verify the github-pages environment

1. Go to **Settings → Environments**
2. The `github-pages` environment should exist after completing step 1 above
3. If environment protection rules are present, ensure `main` branch is allowed (or set to No restriction)
4. Do not add Required reviewers unless you want manual approval on every deploy

---

## Workflows

### build-validate.yml

Runs on pull requests to `main` (and manually on demand). Does not deploy. Fails the build if any validation or Hugo build error is found.

Steps:
1. Checkout repository
2. Install Hugo
3. Run `scripts/build-with-validation.ps1` (taxonomy check → content quality check → Hugo build → built-link check)
4. Verify `public/` directory exists

### deploy.yml

Runs automatically on qualifying pushes to `main`, and can also be run manually from the Actions tab. Deploys to GitHub Pages on success.

Steps:
1. Checkout repository
2. Configure GitHub Pages (resolves base URL automatically)
3. Install Hugo
4. Run `scripts/build-with-validation.ps1`
5. Verify `public/` directory exists
6. Upload Pages artifact
7. Deploy to GitHub Pages

---

## How to Deploy

1. Ensure all changes are committed and pushed to `main`.
2. Open the repository on GitHub.
3. Go to **Actions → Deploy to GitHub Pages**.
4. Click **Run workflow → Run workflow**.
5. Wait for both `build` and `deploy` jobs to complete (green).
6. Site is live at `https://ashish-sites.github.io/sensemaker-site/`

---

## How to Run a Local Build

```powershell
cd C:\projects\wiki-site
powershell -File .\scripts\build-with-validation.ps1 -BaseUrl "https://ashish-sites.github.io/sensemaker-site/" -OutputDir "public"
```

This runs the same four-stage pipeline that CI runs:
1. Taxonomy validation
2. Content quality validation
3. Hugo build
4. Built-link validation on generated HTML

---

## Troubleshooting

### 404 at ashish-sites.github.io/sensemaker-site/

**Cause:** GitHub Pages source is set to a branch instead of GitHub Actions, or the previous `gh-pages` branch content is stale.

**Fix:**
1. Settings → Pages → Source → GitHub Actions
2. Re-run the Deploy workflow

---

### "Branch main is not allowed to deploy to github-pages"

**Cause:** Environment protection rule is blocking `main`.

**Fix:**
1. Settings → Environments → github-pages
2. Deployment branches → add `main` or set to No restriction
3. Re-run the Deploy workflow

---

### "Environment deleted" / github-pages environment missing

**Cause:** Environment was manually deleted.

**Fix:**
1. Settings → Pages → Source → GitHub Actions (resave even if already set)
2. GitHub recreates the environment automatically
3. Re-run the Deploy workflow

---

### Build fails with "Hugo executable not found"

**Cause:** Running `build-with-validation.ps1` locally without Hugo installed or on PATH.

**Fix:** Hugo binary `hugo.exe` must be present in the repo root for local Windows use, or `hugo` must be on PATH. On CI, `peaceiris/actions-hugo@v3` installs it automatically.

---

### Build fails with "Cannot overwrite variable IsWindows"

**Cause:** Old version of `build-with-validation.ps1` using `$isWindows` which conflicts with a PowerShell built-in.

**Fix:** The variable is now named `$runningOnWindows`. Ensure latest script version is committed.

---

### Build output directory not found

**Cause:** Hugo build silently failed (usually wrong executable or a build error).

**Fix:** Run the build script locally and check Hugo output. Ensure `public/` is not in `.gitignore` for CI purposes (it is ignored locally but built fresh during CI).
