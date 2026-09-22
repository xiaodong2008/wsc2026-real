<?php
// Database connection check.
//
//   GET api/db-check.php  → 200 {"ok":true,  ...}   connection works
//                         → 503 {"ok":false, ...}   it does not, and why
//
// Point of this endpoint: an expert can confirm the database credentials work
// without reading any code or opening a browser, and the same command works on
// every WSC2026 template:
//
//   curl -fsS http://localhost/api/db-check.php
//
// It exits non-zero (via -f and the 503) when the connection is broken, so a
// whole room of competitors can be swept in one loop.
//
// The response repeats the settings the app actually used — host, port,
// database, user — so a failure tells you WHICH database was unreachable.
// The password is never included.

require __DIR__ . '/../config/db.php';

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), "\n";
    exit;
}

$config = db_config();
$base   = [
    'driver'   => 'mysql',
    'host'     => $config['host'],
    'port'     => $config['port'],
    'database' => $config['database'],
    'user'     => $config['username'],
];

// Configuration missing entirely — almost always a .env that never arrived,
// not a database that is down. Say so plainly instead of timing out.
$missing = db_missing_config();
if ($missing !== []) {
    respond(503, $base + [
        'ok'    => false,
        'error' => implode(', ', $missing) . ' not set',
        'hint'  => 'Local development: cp .env.example .env. Deployed: the platform '
                 . 'writes .env.prod, which the entrypoint copies over .env at startup.',
    ]);
}

try {
    $started = microtime(true);
    $pdo     = db();

    // A real round trip, not just "the client object was constructed".
    $version = $pdo->query('SELECT VERSION()')->fetchColumn();
    $latency = (int) round((microtime(true) - $started) * 1000);

    // Reported separately so the check still passes on a correctly configured
    // but not-yet-migrated database: credentials working and schema present are
    // two different questions.
    $table = $pdo->prepare('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ? AND table_name = ?');
    $table->execute([$config['database'], TASKS_TABLE]);
    $present = (int) $table->fetchColumn() === 1;

    respond(200, $base + [
        'ok'             => true,
        'server_version' => $version,
        'latency_ms'     => $latency,
        'demo_table'     => $present ? TASKS_TABLE . ' present' : TASKS_TABLE . ' missing',
    ]);
} catch (Throwable $e) {
    respond(503, $base + [
        'ok'    => false,
        'error' => $e->getMessage(),
        // SQLSTATE where PDO gives one: 28000 wrong credentials, 42000 no such
        // database, HY000 could not reach the server at all.
        'code'  => $e instanceof PDOException ? (string) $e->getCode() : null,
        'hint'  => 'Check the DB_* values in .env (local) or .env.prod (deployed). '
                 . 'Access denied means wrong credentials; connection refused or a '
                 . 'timeout means the host, port or network is wrong.',
    ]);
}
