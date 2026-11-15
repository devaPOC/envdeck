# EnvDeck — Task Board

> Work through these in order. Do not skip ahead.
> Each task = one feature branch + one PR into `dev`.
> Mark tasks: `[ ]` pending → `[~]` in progress → `[x]` done

---

## Phase 0 — Project Setup

- [x] `0.1` Scaffold Electron + Vite + React + TypeScript project using `electron-vite`
- [x] `0.2` Install all dependencies: `ssh2`, `ssh2-sftp-client`, `@monaco-editor/react`, `xterm` (as `@xterm/xterm` + `@xterm/addon-fit`), `keytar`, `electron-store`, `zustand`, `lucide-react`, `tailwindcss`
- [x] `0.3` Configure Tailwind CSS with dark mode (`darkMode: 'class'`)
- [~] `0.4` Set up ESLint + Prettier — ESLint done; Prettier not yet added
- [x] `0.5` Create folder structure as defined in `CLAUDE.md`
- [x] `0.6` Set up context bridge in `preload/index.ts` (empty stubs for now)
- [x] `0.7` Verify `npm run dev` launches the app window
- [x] `0.8` Push to GitHub, create `dev` branch

**Branch:** `chore/project-setup`
**Done when:** App window opens with blank React page. No errors in console.

---

## Phase 1 — Server Manager

> User can add, view, edit, and delete server connections.

- [x] `1.1` Design the `Server` type: `{ id, name, host, username }` (`pemKey` is write-only — never stored in Zustand, kept only in OS Keychain)
- [x] `1.2` Create Zustand `serverStore` — holds list of servers, active server
- [x] `1.3` Build `Sidebar` component — shows server list on the left
- [x] `1.4` Build `AddServerModal` — form with fields: Name, IP, Username, PEM Key (textarea)
- [x] `1.5` Save server to `electron-store` (name, host, username only)
- [x] `1.6` Save PEM key to OS Keychain via `keytar` — IPC call to main process
- [x] `1.7` Load saved servers on app start
- [x] `1.8` Add edit and delete server actions
- [x] `1.9` Confirmation dialog before deleting a server

**Branch:** `feat/server-manager`
**Done when:** You can add a server, see it in the sidebar, edit it, and delete it. Data persists after app restart.
**Note:** Implemented and typechecked/linted clean; not yet manually verified in a live app window (sandboxed dev environment can't open a GUI) — please run `npm run dev` from your own terminal and confirm add/edit/delete/restart-persistence before merging.

---

## Phase 2 — SSH Connection

> App connects to a server and shows connection status.

- [x] `2.1` IPC handler in main: `ssh:connect` — takes `serverId`, looks up host/username (from the servers store) and PEM key (from Keychain), creates SSH connection, stores in a Map keyed by server id
- [x] `2.2` IPC handler: `ssh:disconnect` — closes connection, removes from Map
- [x] `2.3` Emit connection events back to renderer: `ssh:status` → `connecting | connected | error | disconnected`
- [x] `2.4` Show status dot in Sidebar next to each server (green/yellow/red)
- [x] `2.5` Connect automatically when user clicks a server
- [x] `2.6` Handle errors gracefully: wrong IP, bad PEM key, timeout — show human-readable message
- [x] `2.7` Disconnect when app closes (cleanup)

**Branch:** `feat/ssh-connection`
**Note:** Implemented and typechecked/lints clean; not yet manually verified against a real remote server (sandboxed dev environment can't open a GUI or reach arbitrary hosts) — please test connect/disconnect/error-path against a real box before merging.
**Done when:** Clicking a server connects to it. Status dot turns green. Error message shows if connection fails.

---

## Phase 3 — File Tree

> Browse directories on the remote server.

- [ ] `3.1` IPC handler: `sftp:readdir` — takes a path, returns list of files/folders with name, type, size, permissions
- [ ] `3.2` Build `FileTree` component — shows folders and files, expand/collapse folders
- [ ] `3.3` Start at `/` or `~` (home directory) on connect
- [ ] `3.4` Show file type icons (folder, file, hidden file)
- [ ] `3.5` Show loading state while fetching directory contents
- [ ] `3.6` Handle permission errors (can't read directory)
- [ ] `3.7` Right-click context menu: Rename, Delete, Copy Path

**Branch:** `feat/file-tree`
**Done when:** You can browse the full directory tree of a connected server.

---

## Phase 4 — File Editor

> Open, edit, and save files on the remote server.

- [ ] `4.1` IPC handler: `sftp:readfile` — takes a path, returns file content as string
- [ ] `4.2` IPC handler: `sftp:writefile` — takes path + content, writes to remote server
- [ ] `4.3` Integrate Monaco Editor in main panel
- [ ] `4.4` Auto-detect language from file extension (`.env`, `.js`, `.json`, `.sh`, etc.)
- [ ] `4.5` Tab system — multiple files open at once, click to switch
- [ ] `4.6` Unsaved changes indicator (dot on tab)
- [ ] `4.7` Save with `Cmd+S` keyboard shortcut
- [ ] `4.8` Confirm before closing a tab with unsaved changes
- [ ] `4.9` Handle large files gracefully (warn if > 1MB)

**Branch:** `feat/file-editor`
**Done when:** You can click a file in the tree, edit it in Monaco Editor, save it with Cmd+S, and verify the change on the server.

---

## Phase 5 — Terminal

> Raw SSH terminal inside the app.

- [ ] `5.1` Install and configure `xterm.js` + `xterm-addon-fit`
- [ ] `5.2` IPC handler: `ssh:shell` — opens an interactive shell session on the SSH connection
- [ ] `5.3` Build `Terminal` component — renders xterm.js, resizes to fit panel
- [ ] `5.4` Pipe user keystrokes to SSH shell, pipe shell output back to xterm
- [ ] `5.5` Add Terminal as a tab in the main panel (alongside file tabs)
- [ ] `5.6` Handle terminal resize (send new cols/rows to SSH shell)
- [ ] `5.7` Multiple terminal tabs support (nice to have)

**Branch:** `feat/terminal`
**Done when:** You can open a terminal tab and run commands on the remote server in real time.

---

## Phase 6 — Docker Panel

> See and manage Docker containers on the remote server.

- [ ] `6.1` IPC handler: `docker:list` — runs `docker ps -a --format json` over SSH, parses output
- [ ] `6.2` IPC handler: `docker:action` — runs `docker start|stop|restart <id>` over SSH
- [ ] `6.3` IPC handler: `docker:logs` — runs `docker logs --tail 100 <id>` over SSH
- [ ] `6.4` Build `DockerPanel` component — table of containers with name, image, status, ports
- [ ] `6.5` Start / Stop / Restart buttons per container
- [ ] `6.6` Click container to view last 100 log lines
- [ ] `6.7` Auto-refresh container list every 10 seconds
- [ ] `6.8` Handle "Docker not installed" gracefully

**Branch:** `feat/docker-panel`
**Done when:** You can see all containers, restart one, and read its logs — without touching the terminal.

---

## Phase 7 — Env Diff

> Compare `.env` files between two servers side by side.

- [ ] `7.1` Build `EnvDiff` component — two-column layout
- [ ] `7.2` Left column: pick server A + file path. Right column: pick server B + file path.
- [ ] `7.3` Fetch both files via `sftp:readfile`
- [ ] `7.4` Parse `.env` file into key-value pairs
- [ ] `7.5` Highlight: keys only in A (red), keys only in B (blue), keys with different values (yellow), matching keys (green)
- [ ] `7.6` Summary bar: "3 missing, 2 different, 10 matching"
- [ ] `7.7` Option to copy a value from one side to the other and save

**Branch:** `feat/env-diff`
**Done when:** You can load the same `.env` from staging and prod side by side and see exactly what's different.

---

## Phase 8 — Polish & Release

- [ ] `8.1` App icon (512x512 PNG)
- [ ] `8.2` About page (version, links)
- [ ] `8.3` Keyboard shortcuts reference panel
- [ ] `8.4` Error boundary — catch React crashes, show friendly error screen
- [ ] `8.5` Test on a fresh Mac (no Node.js installed) with the built `.dmg`
- [ ] `8.6` Record a 60-second demo video for README
- [ ] `8.7` Tag `v1.0.0` release on GitHub
- [ ] `8.8` Write a short post on dev.to or LinkedIn about what you built

**Branch:** `chore/release-v1`
**Done when:** App installs from `.dmg`, works without development setup, and is tagged on GitHub.

---

## Progress Tracker

| Phase | Status | Branch | Notes |
| --- | --- | --- | --- |
| 0 — Setup | `[~]` | `chore/project-setup` | Prettier still pending |
| 1 — Server Manager | `[x]` | `feat/server-manager` | Merged to `main` |
| 2 — SSH Connection | `[~]` | `feat/ssh-connection` | Built; needs manual verify against a real server |
| 3 — File Tree | `[ ]` | `feat/file-tree` | |
| 4 — File Editor | `[ ]` | `feat/file-editor` | |
| 5 — Terminal | `[ ]` | `feat/terminal` | |
| 6 — Docker Panel | `[ ]` | `feat/docker-panel` | |
| 7 — Env Diff | `[ ]` | `feat/env-diff` | |
| 8 — Polish | `[ ]` | `chore/release-v1` | |

---

## How to Use This File with Claude Code

At the start of each session, tell Claude Code:

> "Read CLAUDE.md and TASKS.md. I want to work on task [X.X]. Start from the branch listed for that phase."

When a task is done, update its checkbox from `[ ]` to `[x]`.
