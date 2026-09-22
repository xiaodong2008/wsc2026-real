# PHP pinned to the WSC2026 spec. Apache serves index.php, index.html, JS and CSS
# from one document root — no extra web server config needed.
FROM php:8.3-apache

# pdo_mysql is what config/db.php uses: the app talks to the competitor's own
# MySQL database, configured entirely through .env / .env.prod. mysqli is built
# too because plenty of plain-PHP code uses it directly, and pdo_sqlite stays for
# anyone who wants a throwaway local file. All three use libraries already in the
# PHP image (mysqlnd for the MySQL pair), so none of them costs an extra package.
RUN apt-get update && apt-get install -y --no-install-recommends libsqlite3-dev \
    && docker-php-ext-install -j"$(nproc)" pdo_sqlite pdo_mysql mysqli \
    && rm -rf /var/lib/apt/lists/*

# Serve index.php first; index.html stays reachable at /index.html.
RUN printf 'DirectoryIndex index.php index.html\n' > /etc/apache2/conf-available/directory-index.conf \
    && a2enconf directory-index

# The document root is the repository, so .env and .env.prod sit inside it and
# would otherwise be downloadable at /.env — handing the database password to
# anyone who asks. Apache serves neither, nor any other dotfile.
RUN printf '<FilesMatch "^\\.">\n  Require all denied\n</FilesMatch>\n' \
        > /etc/apache2/conf-available/deny-dotfiles.conf \
    && a2enconf deny-dotfiles

# So that ONE command checks every WSC2026 template, whatever the stack:
#   curl -fsS http://<host>/api/db-check
# Plain PHP has no router, so the file is api/db-check.php; this rewrite makes
# the extensionless URL the other templates use work here too. Both resolve to
# the same script.
# The rule lives in a <Directory> block on purpose: rewrite rules written in the
# global server config are NOT inherited by Debian's default virtual host, so the
# same two lines outside this block silently do nothing and the URL 404s.
RUN printf '<Directory /var/www/html>\n  RewriteEngine On\n  RewriteRule ^api/db-check$ api/db-check.php [L]\n</Directory>\n' \
        > /etc/apache2/conf-available/db-check-alias.conf \
    && a2enmod rewrite \
    && a2enconf db-check-alias

COPY . /var/www/html
RUN rm -f /var/www/html/Dockerfile /var/www/html/docker-compose.yml /var/www/html/docker-entrypoint.sh
RUN chown -R www-data:www-data /var/www/html

COPY docker-entrypoint.sh /usr/local/bin/entrypoint
# Strip any CR before making the entrypoint executable. .gitattributes already
# forces LF on checkout, but that only helps a fresh clone — this keeps a working
# copy that was checked out before it, or copied off a Windows share, from
# producing "env: 'bash\r': No such file or directory" and exit 127.
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint \
    && chmod +x /usr/local/bin/entrypoint

# No database configuration is baked into the image. The connection comes from
# .env locally and .env.prod once deployed — see config/db.php.

EXPOSE 80
ENTRYPOINT ["entrypoint"]
