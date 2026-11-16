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
**Note:** Manually verified against a real server — connect, bad-IP error path, and edit-while-connected all confirmed working. Found and fixed along the way: `close` firing right after `error` was clobbering the red error status back to gray; the save modal blocking on a 15s connect timeout; editing a server not retrying the connection. Also added beyond the original scope: a per-server actions menu (Connect/Disconnect/Edit/Delete) with a disabled, animated "Connecting…" state.
**Done when:** Clicking a server connects to it. Status dot turns green. Error message shows if connection fails.

---

## Phase 3 — File Tree

> Browse directories on the remote server.

- [x] `3.1` IPC handler: `sftp:listDir` — takes a path, returns list of files/folders with name, type, size, permissions
- [x] `3.2` Build `FileTree` component — shows folders and files, expand/collapse folders (lazy-loaded per directory)
- [x] `3.3` Start at `~` (home directory) on connect — resolved via a new `sftp:home` handler (`realpath('.')`)
- [x] `3.4` Show file type icons (folder, file, hidden file) — hidden (dotfile) entries are dimmed
- [x] `3.5` Show loading state while fetching directory contents
- [x] `3.6` Handle permission errors (can't read directory) — shown inline under the directory that failed
- [x] `3.7` Right-click context menu: Rename, Delete, Copy Path

**Branch:** `feat/file-tree`
**Note:** Built on `ssh2`'s native `Client.sftp()` channel (reusing the existing SSH connection from Phase 2) rather than `ssh2-sftp-client` as originally listed in the tech stack — `ssh2-sftp-client` manages its own internal connection and can't attach to an existing `ssh2.Client`, which would have violated the "don't open a separate SSH connection for SFTP" architecture rule. Removed it (and its `@types` package) as an unused dependency. Manually verified against a real server. Found and fixed along the way: a rename could double-submit (Enter + blur both firing) and throw a spurious "No such file" on the second call; rename/delete were re-fetching the entire directory from the server instead of updating the affected row in place (now optimistic — new name shown disabled immediately, re-enabled once the server confirms, no full reload).
**Done when:** You can browse the full directory tree of a connected server.

---

## Phase 4 — File Editor

> Open, edit, and save files on the remote server.

- [x] `4.1` IPC handler: `sftp:readFile` — takes a path, returns file content as string (built in Phase 3 alongside the other SFTP handlers)
- [x] `4.2` IPC handler: `sftp:writeFile` — takes path + content, writes to remote server (also from Phase 3)
- [x] `4.3` Integrate Monaco Editor in main panel
- [x] `4.4` Auto-detect language from file extension (`.env`, `.js`, `.json`, `.sh`, etc.) — explicit `detectLanguage.ts` map, since Monaco has no built-in association for `.env`
- [x] `4.5` Tab system — multiple files open at once, click to switch (store already existed from scaffold; now actually wired to file opens)
- [x] `4.6` Unsaved changes indicator (dot on tab) — real dot, not an asterisk
- [x] `4.7` Save with `Cmd+S` keyboard shortcut (Ctrl+S too)
- [x] `4.8` Confirm before closing a tab with unsaved changes
- [x] `4.9` Handle large files gracefully (warn if > 1MB) — checked against the size already known from the directory listing, before reading content

**Branch:** `feat/file-editor`
**Note:** Clicking a file in `FileTree` now reads it via `sftp:readFile` and opens it in a tab (`id: \`${serverId}:${remotePath}\``), with an "opening…" disabled state and a per-row error if the read fails. Save errors surface as a banner above the editor rather than silently failing.

Also fixed a real bug surfaced during testing: `@monaco-editor/react` defaults to fetching Monaco from a CDN, which our CSP (`script-src 'self'`) blocked outright — the editor was stuck on "Loading…" forever. Bundled Monaco locally instead (`monaco-editor` + `vite-plugin-monaco-editor-esm`, with `loader.config({ monaco })` pointing `@monaco-editor/react` at the bundled copy), which is also just correct per CLAUDE.md's offline/no-cloud principle. Two more issues found along the way, both now fixed:

- `monaco-editor` 0.55.0+ added a restrictive `package.json` `exports` map that blocks the deep worker import paths the Vite plugin relies on — pinned to `^0.54.0`, the last version before that.
- electron-vite resolves `build.outDir` to an absolute path, but the plugin assumes it's relative to `root` (true for a plain Vite app) and joins them incorrectly, silently writing the worker bundle to a bogus nested path instead of the real output directory. Fixed via the plugin's `customDistPath` option in `electron.vite.config.ts`.

Verified end-to-end, including manually opening/editing/saving a real file in a live window after the Monaco CDN fix.
**Done when:** You can click a file in the tree, edit it in Monaco Editor, save it with Cmd+S, and verify the change on the server.

---

## Phase 5 — Terminal

> Raw SSH terminal inside the app.

- [x] `5.1` Install and configure `xterm.js` + `xterm-addon-fit` — as `@xterm/xterm` + `@xterm/addon-fit` (already installed during scaffold)
- [x] `5.2` IPC handler: `ssh:shell` — as `terminal:open`/`terminal:input`/`terminal:resize`/`terminal:close`, opened via `client.shell()` on the existing SSH connection (reused, not a new connection)
- [x] `5.3` Build `Terminal` component — renders xterm.js, resizes to fit panel via `ResizeObserver` + `FitAddon`
- [x] `5.4` Pipe user keystrokes to SSH shell, pipe shell output back to xterm
- [x] `5.5` Add Terminal as a tab in the main panel (alongside file tabs) — folded `EditorTabs` into a new `MainPanel` that owns one combined tab bar for both
- [x] `5.6` Handle terminal resize (send new cols/rows to SSH shell)
- [x] `5.7` Multiple terminal tabs support — each gets its own `crypto.randomUUID()` session id; inactive terminals stay mounted (just hidden via CSS) so their scrollback/connection survives tab switches

**Branch:** `feat/terminal`
**Note:** `terminal:open` takes just a `serverId` (reuses `ssh.ts`'s `getConnection`), not raw connection details — consistent with how Phase 2/3 avoid re-sending credentials. Replaced `EditorTabs.tsx` with `MainPanel.tsx`, which owns a unified tab bar for files and terminals (one `mode: 'file' | 'terminal'` flag decides which content area shows; each store still owns its own list/active-id). New terminal tabs open against the sidebar's currently-selected connected server; the "+ terminal" button is disabled otherwise.

Verified against a real server, including multiple concurrent terminal tabs. Found and fixed along the way: `<React.StrictMode>` (in `main.tsx`) double-invokes effects in dev, which made each terminal tab briefly open two live shell channels — the first channel's already-in-flight login banner still landed in the same xterm instance before its cleanup could stop it, so a single tab showed two login banners and a mashed-together prompt. Removed StrictMode: its double-invoke targets web apps preparing for concurrent-rendering features, which doesn't fit a single-window Electron app opening real external resources (an SSH shell channel) inside an effect.
**Done when:** You can open a terminal tab and run commands on the remote server in real time.

---

## Phase 6 — Docker Panel

> See and manage Docker containers on the remote server.

- [x] `6.1` IPC handler: `docker:list` — runs `docker ps -a --format '{{json .}}'` over SSH (one JSON object per line; `--format json` isn't valid docker syntax), parses output
- [x] `6.2` IPC handler: `docker:action` — runs `docker start|stop|restart <id>` over SSH, with the action restricted to a literal union and the container id validated against a strict pattern before it ever reaches a shell command string
- [x] `6.3` IPC handler: `docker:logs` — runs `docker logs --tail 100 <id> 2>&1` over SSH (stderr redirected server-side so output stays in one ordered stream)
- [x] `6.4` Build `DockerPanel` component — card list (not a literal `<table>`, to fit the 320px right-panel width) with name, image, status, ports
- [x] `6.5` Start / Stop / Restart buttons per container — Stop/Restart confirm first via `ConfirmDialog` (per CLAUDE.md's "destructive actions require confirmation" rule); Start doesn't, since it's not destructive
- [x] `6.6` Click container to view last 100 log lines — opens `DockerLogsModal`, which fetches the full log once (`docker logs` with no `--tail`) and paginates it 100 lines at a time client-side, so Previous/Next don't re-run anything over SSH
- [x] `6.7` Auto-refresh container list every 10 seconds (only while the server is connected)
- [x] `6.8` Handle "Docker not installed" gracefully — exit code 127 or a "command not found" stderr match surfaces a friendly message instead of a raw error

**Branch:** `feat/docker-panel`
**Note:** All three handlers run through a new `execCommand` helper exported from `ssh.ts` (also used to finally implement the `ssh:exec` IPC channel that had been a stub since the original scaffold) — reuses the existing SSH connection, no new one opened. `DockerPanel` gates on the server's connection status the same way `FileTree` does (shows "Connect to this server…" and doesn't poll while disconnected). The logs modal fetches the full log once and paginates it 100 lines at a time client-side (Previous/Next), rather than re-fetching over SSH on every page turn. Verified against a real server: container list, start/stop/restart, logs pagination, and the no-Docker-installed case all confirmed working.
**Done when:** You can see all containers, restart one, and read its logs — without touching the terminal.

---

## Phase 7 — Env Diff

> Compare `.env` files between two servers side by side.

- [x] `7.1` Build `EnvDiff` component — stacked (not literal side-by-side columns; see note) picker sections, diff rows below
- [x] `7.2` Server A picker (server + file path), Server B picker (server + file path) — each has a Browse button opening a small remote file navigator (reuses `sftp.home`/`sftp.listDir`) instead of requiring a hand-typed absolute path; picking a file auto-loads it. Comparing two files on the *same* server works the same way — just pick that server for both sides.
- [x] `7.3` Fetch both files via `sftp:readFile` (reuses the handler from Phase 3/4, not a separate `sftp:readfile` channel)
- [x] `7.4` Parse `.env` file into key-value pairs — `envParser.ts`, skips blank lines/comments, keeps each key's line index so edits land back on the right line
- [x] `7.5` Highlight: keys only in A (red), keys only in B (blue), keys with different values (yellow), matching keys (green)
- [x] `7.6` Summary bar: "N missing, N different, N matching"
- [x] `7.7` Option to copy a value from one side to the other and save — per-row "to A"/"to B" buttons patch the in-memory file, a "Save A"/"Save B" button (shown only once that side is dirty) writes it back via `sftp:writeFile`

**Branch:** `feat/env-diff`
**Note:** CLAUDE.md's layout rule puts Diff in the right panel, which is a fixed 320px wide (`RightPanel.tsx`, `w-80`) — not enough room for a literal two-CSS-column side-by-side layout without being cramped, so the two picker sections stack vertically and each diff row shows both values stacked (`A: ...` / `B: ...`) rather than in adjacent cells. The comparison itself (what's missing/different/matching, colored, with copy actions) works the same either way. Only servers with status `connected` are selectable, consistent with how `FileTree`/`DockerPanel` gate on connection.

Added after initial feedback that hand-typing an absolute path for both sides was too much friction (including just comparing two files on the *same* server, which otherwise worked fine but still needed two manually-typed paths): each side now has a Browse button (`RemoteFileBrowserModal.tsx`) that opens a small remote file navigator reusing the existing `sftp.home`/`sftp.listDir` calls — click into directories, click a file, it auto-loads immediately.

Verified against real servers: loading both sides, every highlight color, copying values in both directions, saving, and the new Browse picker all confirmed working.
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
| 2 — SSH Connection | `[x]` | `feat/ssh-connection` | Verified against a real server; merged to `main` |
| 3 — File Tree | `[x]` | `feat/file-tree` | Verified against a real server; merged to `main` |
| 4 — File Editor | `[x]` | `feat/file-editor` | Verified against a real server; merged to `main` |
| 5 — Terminal | `[x]` | `feat/terminal` | Verified against a real server; merged to `main` |
| 6 — Docker Panel | `[x]` | `feat/docker-panel` | Verified against a real server; merged to `main` |
| 7 — Env Diff | `[x]` | `feat/env-diff` | Verified against real servers; merged to `main` |
| 8 — Polish | `[ ]` | `chore/release-v1` | |

---

## How to Use This File with Claude Code

At the start of each session, tell Claude Code:

> "Read CLAUDE.md and TASKS.md. I want to work on task [X.X]. Start from the branch listed for that phase."

When a task is done, update its checkbox from `[ ]` to `[x]`.
