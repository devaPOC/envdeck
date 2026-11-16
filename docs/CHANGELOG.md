# Changelog

All notable changes to this project are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] — 2026-11-16

First complete release: connect to a server and manage it end-to-end without touching a terminal for the basics.

### Added

- **Server Manager** — add/edit/delete SSH connections (name, host, username, PEM key); PEM keys stored in the macOS Keychain, never on disk or in app state.
- **SSH Connection** — connect/disconnect per server with a live status dot (connecting/connected/error/disconnected) and human-readable error messages instead of raw error codes.
- **File Manager** — SFTP-backed file browser with real file-manager affordances: expand/collapse, rename (inline), delete (with confirmation), copy path, create new files/folders, and a Get Info panel (size, permissions, modified date) — all via right-click, Finder-style.
- **File Editor** — Monaco Editor integration with automatic language detection (including `.env` files, which Monaco has no built-in support for), tabbed editing with unsaved-change indicators, `Cmd+S` to save, confirmation before closing an unsaved tab, and a warning before opening files over 1MB.
- **Terminal** — interactive SSH shell sessions as tabs, multiple concurrent sessions supported, resizes to fit the panel.
- **Docker Panel** — list containers with status/image/ports, start/stop/restart (Stop and Restart require confirmation), tail the last 100 log lines with Previous/Next pagination, auto-refreshes every 10 seconds, and a friendly message when Docker isn't installed on the target server.
- **Env Diff** — load a `.env` (or any file) from two servers (or two paths on the same server, with a built-in remote file browser instead of hand-typing paths), see a colored diff (missing/different/matching), and copy a value across before saving back to either side.
- **Polish** — custom app icon and DMG installer background, native macOS About panel, a keyboard shortcuts reference (`Cmd+S`/`Cmd+W`/`Cmd+T`), and a top-level error boundary with a recoverable error screen.

### Fixed

- SFTP operations (`listDir`, `readFile`, `writeFile`, etc.) were opening a brand-new SFTP channel on every single call — an extra two network round trips each time. Now one channel is opened per connection and reused, which was the main cause of the app feeling slow over real network latency.
- `Cmd+W` was closing the entire window instead of the active tab, because Electron's default (unbuilt) application menu binds it to a native "Close Window" accelerator — a different input path than the renderer's own keyboard handling. Fixed with an explicit application menu that leaves that accelerator unbound.
- A file rename could occasionally double-submit (Enter and the input's blur event both firing) and throw a spurious error on the second, now-redundant call.
- Rename/delete in the file manager used to re-fetch the entire parent directory from the server; both now update the affected row in place.

### Performance

- Pinned `monaco-editor` to the last version before its `package.json` added an `exports` map that broke the Vite worker-bundling plugin this app relies on.
- Bundled Monaco locally instead of letting `@monaco-editor/react` fetch it from a CDN (which the app's CSP blocks anyway, and which would make the editor non-functional offline).
- Import only the Monaco languages actually used (via `customMonaco.ts`) instead of its full language catalog, trimming unused language definitions from the renderer bundle.

### Known limitations

- macOS only (Apple Silicon + Intel); Windows/Linux are future work.
- The `.dmg` is signed locally but not notarized — Gatekeeper may warn on a machine other than the one it was built on (right-click → Open, or clear the quarantine attribute, gets past it).
