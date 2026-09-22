# ---------------------------------------------------------------------------
# Stage 1 — front-end assets.
#
# Vite compiles resources/css and resources/js into public/build. That directory
# is gitignored, so it never arrives with the source. Without this stage the
# image ships no build/manifest.json and every @vite(...) call fails at runtime
# with "Vite manifest not found" — in production only, while `npm run dev` on the
# competitor's own machine serves the very same page without complaint.
#
# The stock welcome.blade.php hides this: it guards @vite behind a file_exists()
# check on the manifest, so the template looks healthy either way. The first
# competitor to write @vite(...) unguarded in their own layout, exactly as every
# Laravel tutorial does, is the one who finds out.
# ---------------------------------------------------------------------------
FROM node:24.1.0-bookworm AS assets
WORKDIR /app
ARG NPM_REGISTRY=https://registry.npmjs.org/
RUN npm config set registry "$NPM_REGISTRY"
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 — the application.
# ---------------------------------------------------------------------------
FROM php:8.3-cli-bookworm
COPY --from=composer:2.9.5 /usr/bin/composer /usr/bin/composer
# pdo_mysql matters as much as pdo_sqlite: .env.example runs on sqlite so the app
# works offline, .env.prod points at this competitor's own MySQL database, and
# the same image has to serve both. Build only one driver and the deployment
# fails with "could not find driver" — and it fails quietly, because the
# entrypoint runs `migrate --force || true` so the container still starts, and
# APP_DEBUG=false turns the first database request into a bare 500.
# mysqlnd ships with the PHP image, so pdo_mysql needs no extra system library.
RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip libzip-dev libicu-dev libonig-dev libxml2-dev libsqlite3-dev \
        libpng-dev libjpeg-dev libfreetype6-dev \
    && docker-php-ext-configure gd --with-jpeg --with-freetype \
    && docker-php-ext-install -j"$(nproc)" intl pdo_mysql pdo_sqlite zip bcmath gd exif pcntl sockets mbstring dom xml \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY composer.json composer.lock ./
ARG COMPOSER_REGISTRY=https://repo.packagist.org
RUN composer config -g repos.packagist composer "$COMPOSER_REGISTRY"
RUN composer install --no-interaction --prefer-dist --no-scripts
COPY . .
# The compiled manifest and hashed assets from stage 1.
COPY --from=assets /app/public/build ./public/build
RUN composer dump-autoload --optimize --no-interaction
COPY docker-entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint
EXPOSE 80
ENTRYPOINT ["entrypoint"]
