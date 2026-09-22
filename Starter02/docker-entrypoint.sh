#!/usr/bin/env bash
set -e
cd /app

# .env.prod is the deployed configuration, written per competitor by Mission
# Control: this student's own MySQL database, their own APP_KEY, and the
# hostname the ingress serves them on.
#
# It wins over whatever .env the repository happens to carry, and that is the
# point of having two files. The deployment used to read .env — the same file a
# student edits while working locally — so pointing .env at sqlite to work
# offline silently changed what production ran against on the next push.
if [ -f .env.prod ]; then
  cp .env.prod .env
elif [ ! -f .env ]; then
  cp .env.example .env
fi

# See the script for why this is needed: `artisan serve` does not pass the
# container's environment to the processes that serve requests, so injected
# values have to be written into .env or the running app never sees them.
php docker/sync-env.php

# Only sqlite needs its file created before migrating, and only when sqlite is
# genuinely the driver. This block used to rewrite DB_CONNECTION to sqlite
# unconditionally, "regardless of what .env shipped with", which made a database
# configured anywhere else impossible to reach no matter what was in the file.
if grep -q '^DB_CONNECTION=sqlite' .env; then
  mkdir -p database
  [ -f database/database.sqlite ] || touch database/database.sqlite
fi

# Generate an APP_KEY when neither the environment nor .env supplied one.
if ! grep -q '^APP_KEY=.\+' .env; then
  php artisan key:generate --force --no-interaction || true
fi

# Never fatal: a database that is unreachable for a moment should leave the app
# serving its error page — and /api/db-check reporting exactly why — rather than
# crash-looping the pod.
php artisan migrate --force --no-interaction || true

exec php artisan serve --host 0.0.0.0 --port 80
