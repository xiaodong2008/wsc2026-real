# Laravel 12.61.1 — WSC2026 app

```bash
cp .env.example .env
docker compose up --build
```

Open **http://localhost**. Connection check: `GET /api/db-check` — 200 when the database is
reachable, 503 with the reason when it is not. It is defined in `routes/api.php`, whose stateless
`api` middleware group means the check never depends on the database-backed session it checks. On start the entrypoint picks the configuration, ensures an app
key, runs migrations, then serves. Pinned: PHP 8.3 / Composer 2.9.5, laravel/framework 12.61.1.

## Which configuration is used

The entrypoint prefers **`.env.prod`** and copies it over `.env` on every start:

| Situation | What runs |
|---|---|
| `.env.prod` present | Deployed config — this competitor's own database, `APP_KEY` and hostname |
| No `.env.prod`, no `.env` | `.env.example` is copied — MySQL on the compose `db` service |
| No `.env.prod`, `.env` exists | Your local `.env` is left alone |

`.env.prod` is the deployment configuration, baked into the image. The values committed here
are placeholders — replace them on the deployment.

Tasks and sessions live in **MySQL**, which `docker compose` starts alongside the app from
the same `.env` the app reads — no credential appears in the compose file or the code. The
SQLite file is still created when `DB_CONNECTION=sqlite`, so either engine works without a
rebuild; the image builds `pdo_mysql` alongside `pdo_sqlite`.

`docker/sync-env.php` folds injected `APP_*`/`DB_*` environment variables into `.env` before
anything reads it — `artisan serve` does not pass the container's environment to the
processes that serve requests, so without it a `DB_HOST` from Kubernetes would reach the
migration step but not the app.

Migrations never fail the boot: an unreachable database leaves the app serving its error
page instead of crash-looping the pod, and `/api/db-check` reports exactly why.

The image is built in two stages. A Node stage runs `npm run build`, so `public/build` — the
Vite manifest and hashed assets, all gitignored — exists in the image and `@vite(...)`
resolves at runtime. `bootstrap/app.php` trusts the ingress's `X-Forwarded-*` headers, so the
app knows it is served over https and generates `https://` URLs.
