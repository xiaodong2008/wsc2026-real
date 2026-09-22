#!/usr/bin/env bash
set -e
cd /app

# The platform writes the deployed configuration into .env.prod. Copy it over
# .env so the migration step and the app read the same values. A .env baked into
# the image by a local build is superseded here, which is what we want: the
# deployed configuration wins.
if [ -f .env.prod ]; then
  cp .env.prod .env
fi

# Create-only migrations.
#
# NEVER run `prisma db push` or `prisma migrate dev` here. Every project a
# competitor creates shares ONE MySQL database, and both of those commands diff
# the whole database against schema.prisma and DROP every table they do not know
# about — which means another project's data. `migrate deploy` only runs the SQL
# committed under prisma/migrations and never computes a destructive diff.
#
# P3005 means the database already holds another project's tables but has no
# Prisma migration history yet. Baseline it: apply each migration's SQL directly
# (they are written CREATE TABLE IF NOT EXISTS) and record it as applied, so
# subsequent boots are an ordinary no-op.
#
# This is a separate process from the one below, so node's --env-file does not
# reach it; prisma.config.ts loads .env itself.
if out=$(npx prisma migrate deploy 2>&1); then
  echo "$out"
else
  echo "$out"
  if grep -q 'P3005' <<<"$out"; then
    echo "Existing non-empty database detected — baselining Prisma migration history"
    for dir in prisma/migrations/*/; do
      [ -f "$dir/migration.sql" ] || continue
      name=$(basename "$dir")
      npx prisma db execute --file "$dir/migration.sql" || true
      npx prisma migrate resolve --applied "$name" || true
    done
  else
    echo "WARNING: migrations did not apply — starting anyway; /api/db-check reports why" >&2
  fi
fi

# --env-file-if-exists rather than --env-file: the latter exits with code 9 when
# the file is absent, which would leave nothing listening and surface as
# "container failed to start and listen on the port" — the very error this
# template was fixed to avoid.
exec node --env-file-if-exists=.env server.js
