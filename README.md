# EnvDeck

A Mac desktop app for developers to manage remote Linux servers — without VNC, without a remote GUI, without the mess.

Connect via SSH, browse files, edit `.env` configs, manage Docker containers, and diff environments — all from one clean interface on your Mac.

---

## The Problem

Managing a remote server today looks like this:

```cmd
ssh -i key.pem user@ip
→ cd /app
→ nano .env        # no syntax highlighting
→ docker restart app
→ repeat for staging
```

It's slow, error-prone, and miserable when you're juggling multiple servers.

## The Solution

EnvDeck gives you:

- **File Manager** — Browse and navigate your remote server's directories
- **Editor** — Open and edit any file (`.env`, configs, scripts) with full syntax highlighting
- **Terminal** — Raw SSH terminal when you need it
- **Docker Panel** — See all containers, restart them, tail logs
- **Env Diff** — Compare `.env` files across two servers side by side

No data leaves your machine. No cloud. No subscriptions.

---

## Tech Stack

- **Electron + Vite** — Desktop app framework
- **React + Tailwind CSS** — UI
- **ssh2 + ssh2-sftp-client** — SSH and SFTP operations
- **Monaco Editor** — Code editor (same as VSCode)
- **xterm.js** — Terminal emulator
- **keytar** — Secure PEM key storage in macOS Keychain
- **Zustand** — State management
- **electron-store** — Local preferences storage

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- macOS (v1 targets Mac only)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/envdeck.git
cd envdeck
npm install
npm run dev
```

### Build

```bash
npm run build
```

Produces a `.dmg` in the `dist/` folder.

---

## Usage

1. Click **Add Server**
2. Enter: Server Name, IP address, Username, and paste your PEM key
3. Click **Connect**
4. Browse files, edit `.env`, manage Docker — done

---

## Project Structure

```fs
envdeck/
├── src/
│   ├── main/          # Electron main process (SSH, SFTP, IPC)
│   ├── renderer/      # React UI
│   └── preload/       # Context bridge
├── docs/
│   ├── CLAUDE.md      # AI coding instructions
│   ├── GITHUB.md      # Git workflow guide
│   └── TASKS.md       # Task board
└── README.md
```

---

## Roadmap

- [x] v1: SSH connect, file manager, editor, terminal, Docker, env diff
- [ ] v2: SSH tunneling, port forwarding UI
- [ ] v2: Team sharing (export server config, no credentials)
- [ ] v3: Windows support

---

## Security

- PEM keys are stored in macOS Keychain via `keytar` — never written to disk
- All SSH operations run in Electron's main process — renderer has no direct system access
- No data is sent to any server or third-party service

---

## Contributing

See [docs/GITHUB.md](./docs/GITHUB.md) for branch strategy, commit conventions, and PR guidelines.

---

## License

MIT
