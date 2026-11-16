# EnvDeck — 60-Second Demo Script

Screen recording only, no voiceover needed — captions do the talking. Record at the app's natural size (no need to resize the window), 1280×800 or your display's native resolution works fine. Target: **60 seconds total**, cut tight; it's fine to speed up mouse movement 1.5–2x in editing if a beat drags.

Before recording: have one real server already set up with a couple of Docker containers running and at least two `.env`-style files with a few differing values, so Scenes 4–5 have real content to show instead of empty states.

---

### SCENE 1 — Cold open (0:00–0:04)

**Visual:** App icon on a black background, fades into the app itself, already open with an empty sidebar.

**Caption:** `EnvDeck — manage remote servers without living in a terminal`

---

### SCENE 2 — Add & connect a server (0:04–0:14)

**Visual:** Click **+** in the sidebar → `AddServerModal` opens. Type name, IP, username, paste a PEM key. Click **Save**. New row appears with a gray dot. Click the row — dot flips gray → yellow ("connecting") → green ("connected") in real time.

**Caption:** `Add a server once — the key lives in the macOS Keychain, not in the app`

**Beat:** Hold on the green dot for half a second before cutting — it's the "it works" payoff of this scene.

---

### SCENE 3 — Browse & edit a file (0:14–0:28)

**Visual:** File tree populates under the server. Expand a folder or two. Right-click a file → show the context menu (Rename / Copy Path / Get Info / Delete) briefly, then dismiss it without clicking anything. Click a `.env` file — opens in a Monaco tab with syntax highlighting. Click into the editor, change one value. Dirty dot appears on the tab. Press `Cmd+S`. Dot disappears.

**Caption:** `A real file manager — right-click to rename, delete, or create — plus a full code editor`

---

### SCENE 4 — Terminal (0:28–0:38)

**Visual:** Click the **+ terminal** button in the tab bar. A shell opens. Type a short, visually satisfying command (`ls -la`, or `htop` if installed — something with immediate colorful output). Let it run for ~3 seconds.

**Caption:** `A real SSH shell, right next to your files — no separate terminal app`

---

### SCENE 5 — Docker panel (0:38–0:48)

**Visual:** Open the right panel's **Docker** tab. Containers list with status dots. Click **Restart** on one — confirmation dialog appears, click **Restart** again to confirm. Status updates after the auto-refresh. Click a container's **Logs** button — `DockerLogsModal` opens showing recent output.

**Caption:** `See and manage containers without memorizing docker CLI flags`

---

### SCENE 6 — Env Diff (0:48–0:58)

**Visual:** Switch the right panel to the **Diff** tab. Pick Server A + a `.env` path (use the folder-browse button, not typing). Pick Server B (can be the same server, a different path). Diff rows appear, color-coded. Point out one red (missing) and one yellow (different) row. Click a "→ to B" copy button on one row. Click **Save B**.

**Caption:** `Compare .env files across servers — see exactly what's different, fix it in place`

---

### SCENE 7 — Outro (0:58–1:00)

**Visual:** Quick cut back to the full app window, then fade to:

**Card:** `EnvDeck — open source, MIT licensed` + GitHub URL.

---

## Shot list summary (for quick reference while recording)

| #   | Scene              | Duration | Key moment to nail       |
| --- | ------------------ | -------- | ------------------------ |
| 1   | Cold open          | 4s       | Icon → app               |
| 2   | Add/connect server | 10s      | Dot turning green        |
| 3   | Browse/edit file   | 14s      | Context menu + Cmd+S     |
| 4   | Terminal           | 10s      | Real shell output        |
| 5   | Docker panel       | 10s      | Restart confirm → logs   |
| 6   | Env Diff           | 10s      | Colored diff + copy/save |
| 7   | Outro              | 2s       | License/link card        |

## Notes

- Don't show real IPs, hostnames, or PEM key contents on screen — blur them in editing or use a throwaway test server.
- If anything stalls (e.g. SSH handshake taking a couple seconds), cut around it rather than waiting live — nobody needs to watch a spinner for 60-second footage.
