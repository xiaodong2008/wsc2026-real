# Vanilla — WSC2026

A starting point for competitors who want to build **without a framework**, in plain PHP,
plain JavaScript, or both (WorldSkills 2026 Web Technologies, TP17).

Two entry points, one small task-list app, so you can see each stack working before you
delete the demo and write your own:

- **`index.php`** — rendered on the server. No JavaScript involved.
- **`index.html` + `scripts.js`** — rendered in the browser, fetching `api/tasks.php`.

Both read the same MySQL database through **`config/db.php`**.

## Run it

```bash
cp .env.example .env
docker compose up --build
```

The first command is the only setup step. `.env` holds the database connection;
`docker compose` starts a MySQL server with exactly those credentials and hands the
same values to PHP, so the two can never disagree.

- **http://localhost** → the PHP page
- **http://localhost/index.html** → the JavaScript page

Stop with `docker compose down`.

## How to use it

1. Building with plain PHP? Start from **`index.php`**.
2. Building with plain JavaScript? Start from **`index.html`** and **`scripts.js`**.
3. Either way, the database is already connected — see **Database** below.

Delete whichever half you don't need. There is no build step, no package manager, and no
dependencies — edit a file, reload the page.

## Files

| File | What it is |
|------|------------|
| `index.php` | Vanilla PHP entry point — server-rendered page |
| `index.html` | Vanilla JavaScript entry point — static markup |
| `scripts.js` | Fetches and renders the task list, handles the add form |
| `api/tasks.php` | JSON API: `GET` lists tasks, `POST` adds one |
| `api/db-check.php` | Connection check, also served at `/api/db-check` — is the database reachable, and if not, why |
| `config/db.php` | PDO connection + schema/seed helpers, configured from `.env` |
| `.env.example` | Template for your local `.env` (copy it before first run) |
| `.env.prod` | Deployed configuration, written by the competition platform |
| `styles.css` | Shared styling for both pages |

## Database

**MySQL**, reached with PDO through `config/db.php`. The connection is already
wired up — you should not need to write any of it.

Every value comes from an environment file, and **nothing is hardcoded**:

| File | Used for | In git? |
|------|----------|---------|
| `.env` | Your local development database | No — gitignored |
| `.env.prod` | The deployed app; the platform fills in your credentials | Yes |

`docker-entrypoint.sh` copies `.env.prod` over `.env` when the container starts, so the
deployed app always runs against the deployed configuration. Apache refuses to serve any
dotfile, so neither file can be downloaded over HTTP.

There is deliberately **no fallback connection**. If configuration is missing the app
says so loudly instead of quietly using some other database.

### Checking the connection

```bash
curl -fsS http://localhost/api/db-check
```

(`/api/db-check.php` works too — the extensionless URL is an Apache rewrite, so the same
command checks this template and every other WSC2026 one.)

```json
{ "ok": true, "driver": "mysql", "host": "db", "port": 3306, "database": "app",
  "user": "app", "server_version": "8.4.11", "latency_ms": 1,
  "demo_table": "vanilla_tasks present" }
```

It returns **503** when the connection fails, and reports which host, database and user
it tried — so "wrong password" and "wrong host" are told apart at a glance. The password
is never included in the response. Every WSC2026 template answers the same check, so the
same command works whatever stack you chose.

### Table names

Every project you create shares **one** MySQL database, so this template's table is
called `vanilla_tasks` rather than `tasks`. Keep a prefix of your own per project;
without one, two of your apps will fight over the same table.

## Stack

- PHP 8.3 (Apache, `pdo_mysql` + `mysqli`; `pdo_sqlite` also available)
- MySQL 8.4 (started by `docker compose`)
- No framework, no build step, no dependencies
