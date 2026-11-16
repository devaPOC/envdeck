# EnvDeck — Project Conventions

> Reference for anyone (human or AI) working on this codebase. EnvDeck shipped its v1.0.0 feature set; this file now documents how it's built, not how to build it.

## What is EnvDeck?

A Mac desktop app built with Electron that lets developers manage remote Linux servers without needing VNC or a GUI setup — SSH, SFTP file management, Docker, and `.env` diffing, all local.

**Principles:**

- Nothing stored in the cloud. Everything stays on the user's local machine.
- PEM keys stored in OS Keychain via `keytar` — never written to disk as plaintext.
- Offline-capable once connected to a server (no CDN dependencies — see `src/renderer/customMonaco.ts` and `main.tsx`).

## Tech Stack

| Layer              | Library                                | Notes                                                                                                                  |
| ------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Desktop            | Electron + Vite                        | `electron-vite` for dev/build                                                                                          |
| UI                 | React + Tailwind CSS                   | Functional components, hooks only                                                                                      |
| SSH connection     | `ssh2`                                 | All SSH ops go through the main process                                                                                |
| SFTP / file ops    | `ssh2`'s native `Client.sftp()`        | **Not** `ssh2-sftp-client` — it opens its own connection, which would violate the one-connection-per-server rule below |
| Code editor        | Monaco Editor (`@monaco-editor/react`) | Bundled locally (not CDN); only the languages actually used are imported — see `customMonaco.ts`                       |
| Terminal           | `xterm.js` + `xterm-addon-fit`         |                                                                                                                        |
| Local storage      | `electron-store`                       | Server list, preferences — pinned to `^8.x` (v9+ is ESM-only and breaks the CJS main process)                          |
| Secure key storage | `keytar`                               | PEM keys, OS Keychain only                                                                                             |
| State management   | Zustand                                | One store per concern: servers, editor, terminal                                                                       |
| Icons              | `lucide-react`                         |                                                                                                                        |

## Project Structure

```fs
envdeck/
├── src/
│   ├── main/                  # Electron main process
│   │   ├── index.ts           # App entry, window + menu creation
│   │   ├── menu.ts            # Custom application menu
│   │   ├── ipc/                # IPC handlers (ssh, sftp, docker, servers, terminal, app)
│   │   └── keychain.ts        # keytar wrapper
│   ├── renderer/               # React app (UI)
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── store/              # Zustand stores
│   └── preload/
│       └── index.ts            # Context bridge (exposes IPC to renderer)
├── docs/
├── build/                      # Icon, DMG background (electron-builder resources)
├── resources/                  # Flat assets (e.g. icon.png)
└── electron.vite.config.ts
```

## Architecture Rules

### IPC

- **All SSH/SFTP/Docker/system operations run in the main process** — never in the renderer.
- Renderer calls `window.electronAPI.xxx()` via the context bridge only.
- Preload exposes only the methods the renderer needs — nothing else.
- Never expose `ipcRenderer`/`ipcMain` directly to the renderer.

### Security

- PEM key content is sent once from renderer to main on add/edit, stored in the Keychain, never sent back.
- `contextIsolation: true`, `nodeIntegration: false`.
- Container IDs and shell commands built from user input (Docker panel) are validated against a strict pattern before ever reaching a shell command string.

### SSH / SFTP

- **One SSH connection per server**, cached in a `Map` in `ssh.ts`.
- **One SFTP channel per server**, cached and reused for every file operation — opening a channel costs two network round trips (subsystem open + SFTP INIT/VERSION), so it's opened once and reused, not once per click.
- Shell (terminal) and exec channels multiplex over that same connection; nothing opens a second TCP connection to the same server.

### State (Renderer)

- Zustand for state shared across components: servers, open files, terminal sessions.
- Local `useState` for UI-only state (menus, modals, inline editing).
- Never store PEM content or passwords in Zustand or `electron-store`.

## UI / UX Rules

- Dark theme by default, no inline styles — Tailwind only.
- Layout: left sidebar (servers + file manager) | main area (editor/terminal tabs) | right panel (Docker/Diff, toggleable).
- All destructive actions (delete, stop/restart a container, overwrite a file) require a confirmation dialog.
- Error messages are human-readable ("Could not connect — check your IP and PEM key"), never raw error codes or stack traces.

## Code Style

- TypeScript everywhere, no `any`.
- Async/await, not `.then()` chains (except where composing promises makes that clearer).
- One component per file, PascalCase matching the component name.
- Prettier (`.prettierrc.json`) + ESLint (`eslint-config-prettier` wired in last) — run `npm run format` / `npm run lint`.
- Don't add a dependency without a clear reason; don't re-fetch or re-render more than necessary (see the SFTP channel-reuse and Monaco bundle-trimming notes above — both were real, measured problems, not speculative ones).

## Dev Commands

```bash
npm run dev          # Start Electron + Vite dev server
npm run build        # Build for production (.dmg)
npm run typecheck    # TypeScript checks
npm run lint         # ESLint
npm run format       # Prettier (writes)
```
