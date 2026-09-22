<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

/*
|--------------------------------------------------------------------------
| API routes
|--------------------------------------------------------------------------
|
| Registered in bootstrap/app.php and prefixed with /api, so the route below
| answers on /api/db-check. Responses are JSON; bootstrap/app.php already
| renders exceptions as JSON for anything under api/*.
|
| These routes are stateless: the api middleware group is just
| SubstituteBindings — no session, no CSRF token, no cookies. Add your own
| routes here; for token authentication run `php artisan install:api`, which
| installs Laravel Sanctum and rewrites this file.
|
| Example:
|
|     Route::get('/tasks', fn () => Task::all());
|
*/

/*
 * Database connection check.
 *
 *   GET /api/db-check  → 200 {"ok":true,  ...}   connection works
 *                      → 503 {"ok":false, ...}   it does not, and why
 *
 * An expert can confirm the credentials work without reading any code:
 *
 *   curl -fsS http://localhost/api/db-check
 *
 * The 503 makes `curl -f` exit non-zero, so a whole room can be swept in one
 * loop. Every WSC2026 template answers the same check in the same shape.
 *
 * It lives here rather than in routes/web.php for a reason: a health check must
 * not depend on the thing it checks. SESSION_DRIVER is `database`, so the web
 * group's session middleware queries the sessions table before any route runs —
 * with the database unreachable that fails first and the endpoint answers a bare
 * 500 "Server Error", exactly when the reason matters most. The api group has no
 * session middleware, so the problem cannot arise.
 *
 * The connection itself is configured entirely in .env (local) and .env.prod
 * (deployed) — see config/database.php, which reads every value through env().
 * Nothing is hardcoded here.
 */
Route::get('/db-check', function () {
    $name   = config('database.default');
    $config = config("database.connections.{$name}");

    // Repeat the settings WITHOUT the password, so a failure says which database
    // was unreachable and a success cannot leak a credential.
    $base = [
        'driver'   => $config['driver'] ?? null,
        'host'     => $config['host'] ?? null,
        'port'     => isset($config['port']) ? (int) $config['port'] : null,
        'database' => $config['database'] ?? null,
        'user'     => $config['username'] ?? null,
    ];

    // No credentials at all is almost always a .env that never arrived, rather
    // than a database that is down. Say so plainly instead of timing out.
    if (blank($config['host'] ?? null) || blank($config['database'] ?? null)) {
        return response()->json($base + [
            'ok'    => false,
            'error' => 'DB_HOST or DB_DATABASE is not set',
            'hint'  => 'Local development: cp .env.example .env. Deployed: the platform writes '
                     . '.env.prod, which the entrypoint copies over .env at startup.',
        ], 503);
    }

    try {
        $started = microtime(true);

        // A real round trip, not just "the connection object was built".
        $version = DB::connection()->selectOne('select version() as version')->version;
        $latency = (int) round((microtime(true) - $started) * 1000);

        return response()->json($base + [
            'ok'             => true,
            'server_version' => $version,
            'latency_ms'     => $latency,
            'migrations'     => Schema::hasTable('migrations') ? 'table present' : 'table missing',
        ]);
    } catch (\Throwable $e) {
        return response()->json($base + [
            'ok'    => false,
            'error' => $e->getMessage(),
            'code'  => (string) $e->getCode(),
            'hint'  => 'Check the DB_* values in .env (local) or .env.prod (deployed). '
                     . 'Access denied means wrong credentials; connection refused or a '
                     . 'timeout means the host, port or network is wrong.',
        ], 503);
    }
});
