# EnvDeck

![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)
![Platform: macOS](https://img.shields.io/badge/platform-macOS-lightgrey.svg)
![Built with Electron](https://img.shields.io/badge/built%20with-Electron-47848F.svg)

**A native macOS desktop app for managing remote Linux servers — SSH, a real file manager, Docker, and `.env` diffing — without living in a terminal, and without anything leaving your machine.**

Managing a remote server usually looks like this:

```
ssh -i key.pem user@ip
cd /app
nano .env            # no syntax highlighting, no undo
docker restart app
# repeat for staging, repeat for prod
```

EnvDeck replaces that with one local app: connect once, then browse files like Finder, edit configs with the same editor as VS Code, manage Docker containers with a click, and diff `.env` files across servers side by side.

## Features

- **Server Manager** — save connections by name, IP, username, and PEM key. Keys live in the macOS Keychain, never on disk.
- **SSH Terminal** — real interactive shells, multiple tabs, live connection status.
- **File Manager** — a real file manager over SFTP, not a read-only tree: expand/collapse, rename, delete, copy path, create files and folders, Get Info (size, permissions, modified date) — right-click just like Finder.
- **Code Editor** — Monaco (the engine behind VS Code), automatic language detection, tabs with unsaved-change indicators, `Cmd+S` to save, a warning before opening very large files.
- **Docker Panel** — list containers, start/stop/restart (with confirmation), tail the last 100 log lines with pagination, auto-refreshes every 10 seconds.
- **Env Diff** — load the same (or different) `.env` file from two servers, see exactly what's missing or different, copy a value across, save it back.
- **Fully local** — no cloud, no account, no telemetry. Once you're connected to a server, the app works entirely offline.

## Screenshots

_Coming soon._

## Tech Stack

| Layer              | Library                                                        |
| ------------------ | -------------------------------------------------------------- |
| Desktop shell      | Electron + `electron-vite`                                     |
| UI                 | React + Tailwind CSS                                           |
| SSH / SFTP         | `ssh2` (one connection per server, reused for every operation) |
| Code editor        | Monaco Editor (`@monaco-editor/react`)                         |
| Terminal           | `xterm.js`                                                     |
| State              | Zustand                                                        |
| Secure key storage | `keytar` (macOS Keychain)                                      |
| Local preferences  | `electron-store`                                               |

## Getting Started

### Prerequisites

- macOS (Apple Silicon or Intel)
- Node.js 18+
- npm

### Run it locally

```bash
git clone https://github.com/devaPOC/envdeck.git
cd envdeck
npm install
npm run dev
```

### Build a `.dmg`

```bash
npm run build
```

Produces `dist/EnvDeck-<version>-<arch>.dmg`.

## Architecture

- **Main process** owns every SSH/SFTP/Docker/terminal operation — the renderer never touches credentials or opens a network connection directly. It talks to the main process exclusively through a typed `contextBridge` API (`src/preload/index.ts`).
- **One SSH connection per server**, reused for SFTP, exec, and shell channels — no connection is ever opened twice for the same server.
- **Zustand** for cross-component state (servers, open files, terminal sessions); local `useState` for UI-only state.
- **Tailwind**, dark theme by default, no inline styles.

## Security

- PEM keys are stored in the macOS Keychain via `keytar` and never written to disk in plaintext.
- All SSH/SFTP/Docker operations run in Electron's main process; the renderer has no direct system access (`contextIsolation: true`, `nodeIntegration: false`).
- No data is sent to any third-party service — this app only talks to the servers you tell it to.

## Roadmap

- [ ] SSH tunneling / port forwarding
- [ ] Export a server list for team sharing (no credentials included)
- [ ] Windows and Linux support

## Contributing

See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for branch strategy, commit conventions, and how to open a PR.

## License

MIT — see [LICENSE](./LICENSE).
