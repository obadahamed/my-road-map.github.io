# Road Map — Red Team Journey

خارطة طريق شخصية لتعلم Red Team / Cybersecurity خلال 52 أسبوعاً.

🌐 **Live:** [obadahamed.github.io/my-road-map.github.io](https://obadahamed.github.io/my-road-map.github.io/)

---

## Project Structure

```
├── index.html                 # HTML shell (no inline CSS/JS)
├── assets/
│   ├── styles.css             # All styles — clean modern dashboard
│   ├── app.js                 # All app logic (state, render, features)
│   └── data/
│       └── weeks-data.js      # window.WEEKS_DATA — 52-week plan (unchanged)
└── README.md
```

---

## How to Run Locally

```bash
# Any simple HTTP server works — no build step required
python3 -m http.server 8080
```

Then open: [http://localhost:8080](http://localhost:8080)

> **Note:** Do not open `index.html` directly via `file://` — use an HTTP server so that the external JS/CSS files load correctly.

---

## Features

| Feature | Description |
|---|---|
| **Today View** | Daily tasks, routine tracker, focus timer, overdue/upcoming alerts |
| **Today Summary** | Quick banner: overdue count, weekly progress %, rooms done, streak, next task |
| **Roadmap View** | 52-week plan split into 3 phases with progress bars |
| **Roadmap Search** | Filter weeks/topics by keyword |
| **Skills View** | Skill matrix calculated from completed TryHackMe rooms |
| **Rooms View** | Track room status: pending / in progress / done |
| **Focus / Pomodoro** | 25-min or 50-min focus timer with progress bar |
| **Daily Routine** | Streak tracker (teeth brushing + exercise) |
| **Notes & Ratings** | Per-week notes and self-rating |
| **Backup / Restore** | Export/import all data as versioned JSON |
| **Daily Notifications** | Browser notifications at a chosen time |
| **RTL Support** | Full Arabic right-to-left layout |
| **Mobile Friendly** | Collapsible sidebar, responsive grid |

---

## How to Reset Local Data

All data is stored in your browser's `localStorage`. To reset:

1. Open the site in your browser
2. Open DevTools: `F12` → **Application** → **Local Storage**
3. Select the site's origin and delete the keys starting with `xenos_`

**Or** in the browser console:
```js
Object.keys(localStorage)
  .filter(k => k.startsWith('xenos_'))
  .forEach(k => localStorage.removeItem(k));
location.reload();
```

---

## How Backup / Restore Works

### Export (Backup)
- Click **↓ Backup** in the Today view topbar
- A file named `roadmap-backup-YYYY-MM-DD.json` will be downloaded
- This file contains: tasks, routine, rooms state, notes, ratings, notifications

### Import (Restore)
- Click **↑ Restore** in the Today view topbar
- Select your previously downloaded `.json` backup file
- Data is loaded and the view re-renders immediately
- If the backup is from a different version, a confirmation prompt will appear

### Backup Format
```json
{
  "version": 2,
  "exportedAt": "2026-03-09T...",
  "data": {
    "tasks": {},
    "routine": {},
    "extraRoomsCatalog": [],
    "roomsState": {},
    "notes": {},
    "ratings": {},
    "notifications": {}
  }
}
```

---

## WEEKS_DATA

The 52-week plan lives in `assets/data/weeks-data.js` as `window.WEEKS_DATA`.  
This data is **read-only** — it defines the roadmap structure and should not be modified unless you want to change the plan itself.

Each week entry has:
```json
{
  "num": 1,
  "phase": 1,
  "topic": "SQL Injection — ...",
  "dates": "02/03—08/03/2026",
  "days": [
    { "d": "الاثنين", "t": "thm", "task": "SQLi Room — Error-based + Union" },
    ...
  ]
}
```

Task types (`t`): `thm` (TryHackMe), `ps` (practice), `th` (theory), `pr` (project), `ctf`, `wu` (writeup), etc.

---

## Technologies

- Vanilla HTML, CSS, JavaScript — no frameworks, no build step
- Google Fonts: Inter + Cairo
- GitHub Pages compatible (static hosting)
- All data persisted via `localStorage`
