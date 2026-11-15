# GitHub Workflow — EnvDeck

---

## 1. Create the Repository

### On GitHub (do this once)

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `envdeck`
3. Description: `Mac desktop app to manage remote servers — file manager, editor, terminal, Docker panel`
4. Set to **Public**
5. Do NOT initialize with README (you already have one)
6. Click **Create repository**

### On your machine

```bash
cd envdeck
git init
git add .
git commit -m "chore: initial project setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/envdeck.git
git push -u origin main
```

---

## 2. Branch Strategy

```fs
main              ← always stable, working code only
└── dev           ← integration branch, merge features here first
    ├── feat/server-manager
    ├── feat/file-tree
    ├── feat/editor
    ├── feat/terminal
    ├── feat/docker-panel
    └── feat/env-diff
```

### Rules

- **Never commit directly to `main`**
- Build each feature on its own branch off `dev`
- Merge feature → `dev` when complete and tested
- Merge `dev` → `main` only when a full milestone is stable

### Create a feature branch

```bash
git checkout dev
git pull origin dev
git checkout -b feat/server-manager
```

---

## 3. Commit Message Convention

Follow **Conventional Commits** — this makes your git history readable and professional.

### Format

```format
<type>: <short description>

[optional body]
```

### Types

| Type | When to use |
| --- | --- |
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `chore` | Setup, config, dependencies (no production code) |
| `style` | UI/CSS changes only |
| `refactor` | Code restructure, no behavior change |
| `docs` | README, CLAUDE.md, comments |
| `test` | Tests only |

### Examples

```bash
git commit -m "feat: add server connection form with PEM key input"
git commit -m "feat: implement SFTP file tree with expand/collapse"
git commit -m "fix: handle SSH timeout error with user-friendly message"
git commit -m "chore: add electron-store and keytar dependencies"
git commit -m "style: add dark theme to editor panel"
git commit -m "docs: update README with usage instructions"
```

### Rules

- Present tense: "add feature" not "added feature"
- Lowercase first letter after the colon
- No period at the end
- Keep the subject line under 72 characters
- If it needs more explanation, add a blank line then a body

---

## 4. Daily Workflow

```bash
# Start of day — sync with remote
git checkout dev
git pull origin dev

# Create / switch to your feature branch
git checkout -b feat/docker-panel
# or
git checkout feat/docker-panel

# Work on code...

# Stage only what's relevant
git add src/renderer/components/Docker/
git add src/main/ipc/docker.ts

# Check what you're about to commit
git status
git diff --staged

# Commit
git commit -m "feat: add Docker container list with status indicators"

# Push to remote
git push origin feat/docker-panel
```

---

## 5. Pull Requests

When a feature is complete and manually tested:

1. Push your branch to GitHub
2. Go to your repo on GitHub → **Pull Requests** → **New Pull Request**
3. Base: `dev` ← Compare: `feat/your-feature`
4. Title: same as your last commit message
5. Description template:

```markdown
## What this PR does
Brief description of the feature.

## How to test
1. Step one
2. Step two
3. Expected result

## Screenshots
(attach a screenshot or screen recording of the feature working)
```

6. Click **Create Pull Request**
7. Review the diff yourself — make sure nothing accidental is included
8. Merge with **Squash and merge** to keep history clean

---

## 6. What Goes in .gitignore

Make sure your `.gitignore` includes:

```fs
node_modules/
dist/
out/
.env
.env.local
*.pem
*.key
.DS_Store
```

**Never commit PEM keys or `.env` files.**

---

## 7. Tagging Releases

When `main` reaches a stable milestone:

```bash
git checkout main
git tag -a v1.0.0 -m "v1.0.0: initial release with SSH, file manager, editor, terminal, Docker"
git push origin v1.0.0
```

Use semantic versioning: `v1.0.0` → `v1.1.0` (new feature) → `v1.1.1` (bug fix)

---

## 8. GitHub Profile Tips

To make this project look good on your profile:

- Add a **social preview image** (Settings → Social Preview) — a simple screenshot of the app
- Pin this repo on your GitHub profile
- Add topics to the repo: `electron`, `ssh`, `devtools`, `mac`, `react`, `typescript`, `docker`
- Write a good first issue: `feat: implement env diff viewer` — shows you plan ahead
- Keep commits frequent — a consistent green contribution graph matters
