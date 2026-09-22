# SQLite-only Laravel — design

**Date:** 2026-07-04
**Repo:** ws26-laravel (WSC2026 TP17)

## Goal

Drop the MySQL database entirely. The app runs on **SQLite** — a self-contained
file created inside the container at startup. No database server in any
environment (local Docker Compose or the k8s production deploy). One image, one
mode.

This supersedes the earlier "local bundled DB vs. external hosted DB" split: with
SQLite there is no server to bundle or host, so the environments converge.

## Changes

### `docker-entrypoint.sh` (rewrite)
Remove the MySQL `sed` block and the 40× migrate-retry wait loop (nothing to wait
for). New flow:
1. Ensure `.env` exists (copy from `.env.example`).
2. Force `DB_CONNECTION=sqlite` in `.env`.
3. Ensure `database/database.sqlite` exists (`touch` if missing) — Laravel needs
   the file present before `migrate`.
4. `APP_KEY`: if an `APP_KEY` env var is injected, write it into `.env`; otherwise
   generate one only when `.env` has none.
5. `php artisan migrate --force` (instant against the local file).
6. `php artisan serve --host 0.0.0.0 --port 80`.

### `Dockerfile`
Swap the MySQL PHP extensions for SQLite: remove `pdo_mysql` and `mysqli`, add
`pdo_sqlite` (+ `libsqlite3-dev`). Everything else unchanged.

### `docker-compose.yml`
Remove the MySQL 8.4 `db` service, its healthcheck, the `laravel-db` volume, the
`depends_on`, and the MySQL `DB_*` env. Left with just the `app` service on port
80.

### `.env.example`
Already defaults to `DB_CONNECTION=sqlite` (Laravel 12 stock) — no change needed.

### `.gitlab-ci.yml`
No DB env vars required (it already injects none). The SQLite file is created in
the container at startup. No change needed beyond confirming a clean deploy.

### `DOCKER.md` / `README.md`
Update wording to "SQLite, no external database."

## Known trade-off

In k8s the pod filesystem is ephemeral, so the SQLite file resets on every
restart/redeploy. Acceptable for this WSC2026 demo app — migrations recreate the
schema on boot. Not adding a persistence volume (mounting over `database/` would
mask the migrations directory).

## Out of scope
No separate prod Dockerfile, no committed secrets, no unrelated refactoring.
