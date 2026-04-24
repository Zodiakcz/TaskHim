# TaskHim

Household to-do web app for Dave and Anna. Self-hosted on Proxmox, Czech UI.

## Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite via Prisma ORM
- **Deployment:** Single `docker-compose.yml` (pulls from GHCR), Caddy on lankapartycz host proxies `taskhim.lankapp.cloud` → `172.17.0.1:8083`
- **CI/CD:** GitHub Actions builds images → GHCR on push to `main` → Watchtower auto-pulls

## Project Structure

```
├── client/                  # React frontend (Vite)
│   ├── src/pages/           # Home, TaskDetail, TaskForm, History, Shopping
│   ├── src/components/      # Layout, TaskCard, UserPicker
│   ├── src/lib/             # api.ts, user.tsx (UserContext + cookie), types.ts
│   ├── nginx.conf
│   └── Dockerfile
├── server/                  # Express backend
│   ├── src/routes/          # tasks, completions, shopping
│   ├── src/middleware/       # user.ts (reads taskHim_user cookie)
│   ├── src/lib/             # prisma.ts singleton
│   ├── src/index.ts
│   ├── prisma/schema.prisma
│   └── Dockerfile
├── docker-compose.yml       # Production (pulls from GHCR)
└── .github/workflows/       # CI: build + push to ghcr.io/zodiakcz/taskHim
```

## Key Decisions

- **Auth:** No passwords. Cookie `taskHim_user` = "Dave" | "Anna". First visit shows name picker, sets cookie for 30 days.
- **Recurring tasks:** Single row model — `dueDate` advances on each completion, `activeSince` resets, subtasks reset.
- **Shopping auto-clear:** On-read filter: checked items older than 24h are excluded (no cron).
- **Live updates:** 30-second polling on home screen.
- **SQLite** — single file, easy backup, plenty for 2 users.
- **Leaderboard scoring:** Krátké=1, Střední=3, Dlouhé=8 points.
- **Design system:** Same component utilities as lankapartycz (`card`, `btn-primary`, etc.) in `client/src/index.css`.
- **Color palette:** `zinc-950` body, `zinc-900` cards, `indigo` accent. Dark mode only.
- **Mobile nav:** Bottom tab bar (4 tabs: Úkoly, Historie, Nákup, + new task).

## Local Development

```bash
# Terminal 1 — backend (http://localhost:3000)
cd server && npm run dev

# Terminal 2 — frontend (http://localhost:5173, proxies /api to :3000)
cd client && npm run dev
```

## Deployment

Push to `main` → GitHub Actions builds images → Watchtower auto-updates.

Manual update on server:
```bash
cd /opt/taskHim
sudo docker compose pull
sudo docker compose up -d
```

Add to lankapartycz Caddyfile:
```
taskhim.lankapp.cloud {
    reverse_proxy 172.17.0.1:8083
}
```

## GitHub

- Repo: https://github.com/Zodiakcz/TaskHim
- Images: ghcr.io/zodiakcz/taskHim/server and /client
