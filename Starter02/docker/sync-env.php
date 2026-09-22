<?php
/**
 * Fold injected environment variables into .env.
 *
 * `php artisan serve` does NOT pass the container's environment through to the
 * processes that handle requests — it forwards a short whitelist (APP_ENV and a
 * handful of others) and nothing else. So a DB_HOST set by docker-compose or
 * Kubernetes reaches `artisan migrate` but not the running app, which quietly
 * falls back to whatever .env says. The symptom is migrations succeeding against
 * the right database while every page reports "Connection refused" for another.
 *
 * Writing the values into .env makes the two agree, and keeps the expected
 * precedence: an explicitly injected variable beats the file it is written into.
 *
 * Run by docker-entrypoint.sh, after .env.prod has been copied over .env.
 */

$keys = [
    'APP_ENV', 'APP_KEY', 'APP_DEBUG', 'APP_URL',
    'DB_CONNECTION', 'DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD',
];

$path  = __DIR__ . '/../.env';
$lines = is_file($path) ? file($path, FILE_IGNORE_NEW_LINES) : [];

foreach ($keys as $key) {
    $value = getenv($key);
    if ($value === false) {
        continue; // not injected — leave whatever .env already says
    }

    // Quote anything a bare value cannot hold: spaces, '#', or quotes of its own.
    // Passwords routinely contain all three.
    $needsQuotes = preg_match('/[\s#"\']/', $value) === 1;
    $line = $key . '=' . ($needsQuotes ? '"' . str_replace('"', '\"', $value) . '"' : $value);

    $found = false;
    foreach ($lines as $i => $existing) {
        if (str_starts_with($existing, $key . '=')) {
            $lines[$i] = $line;
            $found = true;
            break;
        }
    }

    if (! $found) {
        $lines[] = $line;
    }
}

file_put_contents($path, implode(PHP_EOL, $lines) . PHP_EOL);
