# FomoTracker — Browser Extension

**FomoTracker** is a browser extension that helps you manage your browsing time. Set time limits for distracting websites, get notified with an overlay when your time is up, and take structured breaks.

---

## Features

- ⏱ **Time Limits** — Set custom duration limits (in minutes) for any website
- ☕ **Break Timer** — Configure break durations; an enforced break resets the session
- 🔔 **Overlay Alert** — A full-screen overlay appears when your time runs out
- 🎛 **Toggle Rules** — Enable/disable rules without deleting them
- 📊 **Active Sessions** — See live session status in the popup
- 🌐 **SPA Support** — Works on single-page applications (React, Vue, etc.)

---

## Tech Stack

- **Next.js 16** (App Router, static export)
- **TypeScript**
- **Tailwind CSS v4**
- **Chrome Extension Manifest V3**
- **Bun** (package manager & build tool)

---

## Architecture

```
manifest.json          ← Extension manifest (V3)
public/
  background.js        ← Service worker: timer management, session state
  content.js           ← Injected on all pages: overlay rendering, tick loop
  icons/               ← Extension icons (16, 48, 128px)
app/
  page.tsx             ← Popup UI (Next.js)
  layout.tsx           ← Root layout with fonts
  globals.css          ← Design system CSS
out/                   ← Build output (load this as unpacked extension)
```

### How it works

1. The **popup** lets you add rules (URL + duration + break time)
2. Rules are saved to `chrome.storage.local` via the **background service worker**
3. When you visit a tracked URL, the **content script** starts a 1-second tick loop
4. The background worker tracks elapsed time and break state per rule
5. When the limit is reached, the **content script** injects a full-screen overlay
6. You can take a break (timer resets after break) or dismiss the overlay

---

## Development

### Prerequisites

- [Bun](https://bun.sh/) installed
- Chrome or Edge browser

### Install dependencies

```bash
bun install
```

### Build

```bash
bun run build
```

The extension will be built to the `out/` directory.

### Load into Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `out/` directory

### Dev server (for UI development only)

```bash
bun run dev
```

> Note: Chrome APIs won't work in dev mode. The popup gracefully falls back to localStorage.

---

## Usage

1. Click the **FomoTracker** extension icon
2. Click **+ Add Rule**
3. Enter a website URL (e.g. `youtube.com`)
4. Set your time limit (e.g. 30 minutes)
5. Set your break duration (e.g. 5 minutes)
6. Click **Add Rule**

When you visit a tracked site and exceed your time limit, an overlay will appear offering you to take a break. After the break timer expires, your session resets.

---

## Permissions

| Permission | Reason |
|---|---|
| `storage` | Save rules and session data |
| `tabs` | Detect active tab URL changes |
| `alarms` | Background timer support |
| `activeTab` | Access current tab URL |
| `host_permissions: <all_urls>` | Inject content script on all sites |
