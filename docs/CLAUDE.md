# EnvDeck — CLAUDE.md

> Instructions for Claude Code. Read this before writing any code.

---

## What is EnvDeck?

A Mac desktop app built with Electron that lets developers manage remote Linux servers without needing VNC or a GUI setup.

**Core problem it solves:** Connecting to remote servers, editing `.env` files, managing Docker containers, and browsing remote files — all from a clean local UI.

**Principles:**

- Nothing stored in the cloud. Everything stays on the user's local machine.
- PEM keys stored in OS Keychain via `keytar` — never written to disk as plaintext.
- Offline-capable once connected to a server.

---

## Tech Stack

| Layer | Library | Notes |
| --- | --- | --- |
| Desktop | Electron + Vite | Use `electron-vite` for dev setup |
| UI | React + Tailwind CSS | Functional components, hooks only |
| SSH connection | `ssh2` | All SSH ops go through main process |
| SFTP / file ops | `ssh2-sftp-client` | Built on ssh2 |
| Code editor | Monaco Editor (`@monaco-editor/react`) | Use for file editing |
| Local storage | `electron-store` | Server list, preferences |
| Secure key storage | `keytar` | PEM keys stored in OS Keychain |
| State management | Zustand | Keep it simple, no Redux |
| Icons | `lucide-react` | Consistent icon set |

---

## Project Structure

```fs
envdeck/
├── src/
│   ├── main/                  # Electron main process
│   │   ├── index.ts           # App entry, window creation
│   │   ├── ipc/               # IPC handlers (ssh, sftp, docker)
│   │   │   ├── ssh.ts
│   │   │   ├── sftp.ts
│   │   │   └── docker.ts
│   │   └── keychain.ts        # keytar wrapper
│   ├── renderer/              # React app (UI)
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Sidebar/       # Server list + switcher
│   │   │   ├── FileTree/      # Remote file explorer
│   │   │   ├── Editor/        # Monaco editor panel
│   │   │   ├── Terminal/      # SSH terminal tab
│   │   │   ├── Docker/        # Container list + controls
│   │   │   └── EnvDiff/       # Side-by-side .env diff viewer
│   │   ├── store/             # Zustand stores
│   │   │   ├── serverStore.ts
│   │   │   └── editorStore.ts
│   │   └── hooks/             # Custom React hooks
│   └── preload/
│       └── index.ts           # Context bridge (exposes IPC to renderer)
├── docs/
│   ├── CLAUDE.md
│   ├── GITHUB.md
│   └── TASKS.md
├── README.md
├── package.json
└── electron.vite.config.ts
```

---

## Architecture Rules

### IPC (Inter-Process Communication)

- **All SSH/SFTP/system operations MUST run in the main process** — never in the renderer.
- Renderer calls `window.electronAPI.xxx()` via the context bridge.
- Preload (`src/preload/index.ts`) exposes only the methods the renderer needs — nothing else.
- Never expose `ipcRenderer` or `ipcMain` directly to the renderer.

### Security

- PEM key content is passed once from renderer to main on connect. Main stores it in memory only for the session. Never pass it back to renderer.
- Use `contextIsolation: true` and `nodeIntegration: false` in `BrowserWindow`.
- Sanitize all file paths before passing to SFTP operations.

### SSH / SFTP

- One SSH connection object per server, stored in a Map in main process.
- SFTP client is created from the SSH connection — do not open a separate SSH connection for SFTP.
- Always handle connection errors and emit them back to renderer via IPC event.

### State (Renderer)

- Use Zustand for global state: active server, open files, editor tabs.
- Local component state (useState) for UI-only state (hover, loading spinners).
- Do not store sensitive data (PEM content, passwords) in Zustand.

---

## Feature Scope (v1)

Build these in order:

1. **Server Manager** — Add/edit/delete server connections (name, IP, username, PEM key)
2. **SSH Connect** — Establish connection, show status indicator
3. **File Tree** — Browse remote directories via SFTP
4. **File Editor** — Open, edit, and save remote files (Monaco Editor)
5. **Terminal** — Raw SSH terminal tab using `xterm.js`
6. **Docker Panel** — List containers (`docker ps`), start/stop/restart
7. **Env Diff** — Select same file across two connected servers, show diff

Do not build features outside this list for v1.

---

## UI / UX Rules

- Dark theme by default. Use Tailwind's `dark:` classes.
- Layout: left sidebar (server list + file tree) | main area (editor / terminal tabs) | right panel (Docker / Diff, toggleable)
- Use tabs for open files — same pattern as VSCode.
- Show connection status per server (green dot = connected, red = error, yellow = connecting).
- All destructive actions (delete server, overwrite file) require a confirmation dialog.
- Error messages must be human-readable: "Could not connect — check your IP and PEM key" not "ECONNREFUSED".

---

## Code Style

- TypeScript everywhere. No `any` types — use proper interfaces.
- Async/await, not `.then()` chains.
- One component per file. File name = component name (PascalCase).
- Utility functions go in `src/renderer/utils/` or `src/main/utils/`.
- No inline styles. Tailwind classes only.
- Handle every async operation with try/catch and surface errors to the UI.

---

## What to Avoid

- Do not use `shell: true` in any `exec` or `spawn` call — security risk.
- Do not store PEM key content in `electron-store` — use `keytar`.
- Do not make direct HTTP calls from the renderer — route through main process IPC.
- Do not use `remote` module (deprecated in Electron).
- Do not add dependencies without a clear reason.

---

## Dev Commands

```bash
npm run dev          # Start Electron + Vite dev server
npm run build        # Build for production (Mac .dmg)
npm run typecheck    # Run TypeScript checks
npm run lint         # ESLint
```

---

## Definition of Done (per feature)

A feature is complete when:

- [ ] It works on a real remote server (manual test)
- [ ] Errors are handled and shown in the UI
- [ ] No TypeScript errors
- [ ] Code is committed with a descriptive message (see GITHUB.md)
