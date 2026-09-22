# Vanilla PHP + JavaScript — WSC2026 minimal app

```bash
cp .env.example .env
docker compose up --build
```

- **http://localhost** — the vanilla PHP page (`index.php`, server-rendered)
- **http://localhost/index.html** — the vanilla JavaScript page (`scripts.js` + fetch)

JSON API: `GET api/tasks.php`, `POST api/tasks.php` (`{ "title": "..." }`).
Connection check: `GET api/db-check` — 200 when the database is reachable, 503 with
the reason when it is not.

Apache serves both pages plus the JS and CSS from one document root. `DirectoryIndex` is
set to `index.php index.html` so `/` lands on the PHP page; each page links to the other.

Tasks live in **MySQL**, in a table called `vanilla_tasks` — every project shares one
database, so the prefix keeps them apart. Compose starts the server; the entrypoint
creates and seeds the table before Apache starts.

The connection is configured **only** in `.env` (local) and `.env.prod` (deployed) —
never in the code, the Dockerfile or this compose file. Compose reads `.env` to start
MySQL *and* to configure PHP, so both sides always agree. Apache serves no dotfile, so
`.env` cannot be fetched over HTTP.

Pinned: PHP 8.3 (Apache) and MySQL 8.4. No package manager, no build step, no dependencies.
