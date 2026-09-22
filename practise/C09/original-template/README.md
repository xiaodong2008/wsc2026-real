# Express 5.2.1 — WSC2026

A minimal **Express 5.2.1** back-end app (WorldSkills 2026 Web Technologies, TP17): a server-rendered
home page plus a small JSON API, with tasks persisted through **Prisma 7.3.0** (MySQL).

## Run it

```bash
cp .env.example .env
docker compose up --build
```

Then open **http://localhost** (JSON API under `/api`). Stop with `docker compose down`.

## Develop

You need **Node 24.1.0** and **npm 11.5.0** installed locally (the same versions the Docker image pins).

```bash
cp .env.example .env    # then edit DATABASE_URL if your database differs
npm install
npx prisma migrate deploy   # applies prisma/migrations and generates the client
npm start                   # or: node --watch server.js  (auto-restart on save)
```

`docker compose up` starts a MySQL service for you; running outside Docker needs
a MySQL server of your own, with `DATABASE_URL` pointed at it.

Edit **server.js**. With `node --watch` the server restarts automatically.

## Database

Tasks live in **MySQL**. The schema is `prisma/schema.prisma`; the connection string
comes from `DATABASE_URL`, wired up in `prisma.config.ts`.

There are two configuration files, and which one applies depends on where the app runs:

| File | Used by | In git? |
| --- | --- | --- |
| `.env` | your local machine | no — gitignored, so it never leaves your machine |
| `.env.prod` | the deployed app | yes — the competition platform writes your database credentials here |

`.env` is in both `.gitignore` and `.dockerignore`, so your local credentials reach
neither the repository nor an image. `docker compose` passes `DATABASE_URL` to the
container from `.env` instead, and `docker-entrypoint.sh` copies `.env.prod` over
`.env` when the container starts — so the migration step and the app always read
the same values.

Nothing is hardcoded: `server.js`, the `Dockerfile` and `docker-compose.yml` contain
no host, user or password. Compose starts the local MySQL server from the same
`.env` the app reads, so the two cannot drift apart.

Node does not load `.env` on its own, and the app and the Prisma CLI are separate
processes, so each loads it its own way:

- **The app** — started with `node --env-file-if-exists=.env` (see the `start`
  script). The `-if-exists` form matters: plain `--env-file` exits with code 9 when
  the file is missing, which would leave nothing listening.
- **The Prisma CLI** — `prisma.config.ts` imports `dotenv/config`. Prisma auto-loads
  `.env` only when there is no config file, and there is one here.

Remove either and that half falls back to a placeholder connection string.

### Checking the connection

```bash
curl -fsS http://localhost/api/db-check
```

```json
{ "ok": true, "driver": "mysql", "host": "db", "port": 3306, "database": "app",
  "user": "app", "server_version": "8.4.11", "latency_ms": 2,
  "demo_table": "express_tasks present" }
```

It returns **503** when the connection fails, naming the host, database and user it
tried and the driver's error code — `ER_ACCESS_DENIED_ERROR` for a wrong password,
`ENOTFOUND` for a wrong host. The password is never in the response. Every WSC2026
template answers the same check, so one command works whatever stack you chose.

### Changing the schema

Every project you create shares **one** MySQL database, so this template's table is
`express_tasks`, not `tasks`. Keep a prefix of your own per project.

Edit `prisma/schema.prisma`, then create a migration:

```bash
npx prisma migrate dev --name your_change   # local development only
```

**Never run `prisma db push` or `prisma migrate dev` against the competition
database.** Both diff the whole database against your schema and drop tables they
do not recognise — including your other projects' tables. The container only ever
runs `prisma migrate deploy`, which applies the committed SQL and nothing else.

## Stack

- Node 24.1.0 / npm 11.5.0
- Express 5.2.1
- Prisma 7.3.0 (`@prisma/adapter-mariadb`)
- `mariadb` 3.4.5 — the driver, used directly by `/api/db-check` for precise errors
- MySQL 8.4 (via `docker compose`)
- `dotenv` — used only by `prisma.config.ts`; the app uses node's native `--env-file-if-exists`
