#!/usr/bin/env bash
set -e

# The platform writes this competitor's own credentials into .env.prod. Copy it
# over .env so the app reads the deployed configuration rather than whatever
# .env happened to be built into the image.
#
# Local development keeps its own .env, which is gitignored and never shipped.
if [ -f /var/www/html/.env.prod ]; then
  cp /var/www/html/.env.prod /var/www/html/.env
fi

# Create the table and seed it before Apache starts, so the first request
# already has data.
#
# Never fatal: a database that is unreachable for a moment should leave the app
# serving its error page — and api/db-check.php reporting exactly why — rather
# than crash-looping the container.
php -r 'require "/var/www/html/config/db.php"; db_init();' || \
  echo "schema not created — see /api/db-check.php for the reason" >&2

exec apache2-foreground
