# Express 5.2.1 — WSC2026 minimal app

```bash
cp .env.example .env
docker compose up --build
```

Open **http://localhost** (server-rendered page).
JSON API: `GET /api/tasks`, `POST /api/tasks` (`{ "title": "..." }`).
Connection check: `GET /api/db-check` — 200 when the database is reachable, 503 with
the reason when it is not.

Tasks are stored with **Prisma 7.3.0** in **MySQL**, which `docker compose` starts
alongside the app, in a table called `express_tasks` — every project shares one
database, so the prefix keeps them apart. The entrypoint copies `.env.prod` over
`.env`, applies `prisma/migrations` with `prisma migrate deploy`, then starts the
server; the app seeds two rows on first boot.

The connection is configured **only** in `.env` (local) and `.env.prod` (deployed) —
never in the code, the Dockerfile or this compose file. Compose reads `.env` to start
MySQL *and* to configure the app, so both sides always agree.

The app binds its port even when the database is unreachable, so a
misconfigured `DATABASE_URL` shows an explanatory page rather than a container
that never starts.

Pinned: Node 24.1.0 / npm 11.5.0, Express 5.2.1, Prisma 7.3.0.
