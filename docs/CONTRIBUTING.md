# Contributing to EnvDeck

Thanks for considering a contribution. This is a small, personal-scale project — the process below is intentionally lightweight.

## Branch strategy

```
main              ← always stable, working code only
└── dev           ← integration branch, merge features here first
    └── feat/your-feature
```

- Never commit directly to `main`.
- Branch features off `dev`, open a PR back into `dev`.
- `dev` merges into `main` at stable milestones.

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short description>

[optional body]
```

| Type       | When to use                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | New feature or capability                        |
| `fix`      | Bug fix                                          |
| `chore`    | Setup, config, dependencies — no production code |
| `style`    | UI/CSS changes only                              |
| `refactor` | Code restructure, no behavior change             |
| `docs`     | README, CLAUDE.md, comments                      |
| `perf`     | Performance improvement                          |

- Present tense: "add feature", not "added feature".
- Lowercase first letter after the colon, no trailing period.
- Keep the subject line under 72 characters.

## Pull requests

1. Push your branch, open a PR with base `dev`.
2. Describe what the PR does and how to test it.
3. Squash-merge once it's reviewed and (where applicable) manually tested against a real server — most of this app's functionality can't be meaningfully verified by automated tests alone, since it talks to real SSH/SFTP/Docker endpoints.

## What never gets committed

```
node_modules/
dist/
out/
.env
.env.local
*.pem
*.key
.DS_Store
```

**Never commit PEM keys, `.env` files, or any real server credentials.**

## Architecture conventions

See [CLAUDE.md](./CLAUDE.md) for the project's architecture rules (IPC boundaries, security constraints, code style) — these apply whether you're a human contributor or an AI coding assistant.
