## 这一仓库在练什么

模板：Laravel。时间在服务端写进 HTML。查看源代码能看到时间字符串，刷新会变。不要用浏览器的 `new Date()`。

看 `routes/web.php` 和 `resources/views/info.blade.php`。

```bash
cp .env.example .env
docker compose up --build
```

---

# Laravel 12.61.1 — WSC2026

A real **Laravel 12.61.1** application (WorldSkills 2026 Web Technologies, TP17) backed by
**MySQL** — the same engine the deployed app uses, so what works locally works there. On
start it applies migrations, then serves.

## Run it

```bash
cp .env.example .env
docker compose up --build
```

Then open **http://localhost**. `docker compose` starts a MySQL server alongside the app,
using the credentials from your `.env`. Stop with `docker compose down`.

Confirm the database is reachable:

```bash
curl -fsS http://localhost/api/db-check
```

```json
{ "ok": true, "driver": "mysql", "host": "db", "port": 3306, "database": "app",
  "user": "app", "server_version": "8.4.11", "latency_ms": 1,
  "migrations": "table present" }
```

It returns **503** when the connection fails, naming the host, database and user it tried
and the driver's SQLSTATE — `1045` for a wrong password, `2002` for an unreachable host.
The password is never in the response. Every WSC2026 template answers the same check, so
one command works whatever stack you chose.

### API routes

`routes/api.php` holds the JSON routes, registered in `bootstrap/app.php` and prefixed with
`/api`. It needs **no package**: Laravel's `api` middleware group is just `SubstituteBindings`
— no session, no CSRF, no cookies — so the routes are stateless out of the box.

`/api/db-check` lives there rather than in `routes/web.php` deliberately: `SESSION_DRIVER` is
`database`, so a web route would query the sessions table before running and answer a bare 500
when the database is down — precisely when the reason matters. The `api` group cannot have that
problem.

If a project needs **token authentication**, run `php artisan install:api`. That installs
Laravel Sanctum, publishes its config and migration, and rewrites `routes/api.php` — so add it
when you need it rather than shipping it to everyone.

## Configuration

The database connection lives in two files and **nowhere else** — not in the code, the
`Dockerfile` or `docker-compose.yml`:

| File | Used for | In git? |
|------|----------|---------|
| `.env` | your local development database | No — gitignored |
| `.env.prod` | the deployed app; the platform fills in your credentials | Yes |

The entrypoint prefers **`.env.prod`** and copies it over `.env` on every start, so a
deployed container always runs the deployed configuration. With no `.env.prod` it falls back
to your `.env`, or to `.env.example` if you have none.

`docker compose` reads the same `.env` to start the local MySQL server *and* to configure
PHP, so the app and the database cannot drift apart.

### Injected environment variables

`php artisan serve` does **not** pass the container's environment to the processes that
handle requests — it forwards a short whitelist and nothing else. A `DB_HOST` set by
docker-compose or Kubernetes would therefore reach `artisan migrate` but not the running
app, which would quietly fall back to `.env`: migrations succeed against the right database
while every page reports "Connection refused" for another one.

`docker/sync-env.php`, run by the entrypoint, writes any injected `APP_*`/`DB_*` variables
into `.env` so both halves agree. Injected values win over the file.

The image carries both `pdo_mysql` and `pdo_sqlite`, so pointing `DB_CONNECTION` at either
engine works without a rebuild.

Behind the ingress the app is reached over https while the container itself is spoken to
over plain http. `bootstrap/app.php` trusts the forwarded headers, so `route()` and `url()`
emit `https://` links and form posts are not blocked as mixed content.

## Develop

The simplest loop is Docker: edit the source (see below), then rebuild:

```bash
docker compose up --build
```

Edit **routes/web.php and resources/views/** to change routes, controllers and views.

To run it natively instead you need **PHP 8.3** (with `pdo_mysql`), **Composer 2.9.5** and a
MySQL server of your own. Then:

```bash
cp .env.example .env    # point DB_HOST at your server (127.0.0.1 for a local one)
composer install
php artisan migrate
php artisan serve
```

## Front-end assets

CSS and JS go through **Vite**. `@vite([...])` resolves against `public/build/manifest.json`,
which is generated — never committed — so the Docker image builds it in a Node stage before
the app image is assembled. `docker compose up --build` therefore needs no npm on your
machine, and `@vite(...)` works in the container exactly as it does locally.

For a hot-reloading front-end loop natively you need **Node 24.1.0** and **npm 11.5.0**:

```bash
npm install
npm run dev     # or: npm run build
```

## Stack

- PHP 8.3 / Composer 2.9.5
- Laravel 12.61.1
- MySQL 8.4 (started by `docker compose`); `pdo_sqlite` also built in
- Node 24.1.0 / npm 11.5.0, Vite 7 + Tailwind 4 (compiled during the image build)
