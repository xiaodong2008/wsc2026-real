<?php
/**
 * Database configuration — MySQL over PDO.
 *
 * Every connection detail comes from the environment: .env while you develop
 * locally, .env.prod once the container is deployed (the entrypoint copies it
 * over .env on start). Nothing is hardcoded here, so there is exactly one place
 * to change credentials and no way for the code to disagree with the config.
 *
 * There is deliberately NO fallback connection. A template that quietly falls
 * back to some other database when configuration is missing looks healthy while
 * running against the wrong data — so a missing value is a loud error instead,
 * reported by api/db-check.php.
 */

/**
 * Read one configuration value.
 *
 * Real environment variables win, so the deployment can inject credentials
 * without writing files. Otherwise fall back to the .env file, which plain PHP
 * does not load on its own the way a framework would.
 *
 * Returns null for both "not set" and "set to an empty string": an empty
 * DB_HOST is not a usable host, and treating it as configured only produces a
 * confusing connection error later.
 */
function env(string $key): ?string
{
    static $file = null;

    $value = getenv($key);
    if (is_string($value) && $value !== '') {
        return $value;
    }

    if ($file === null) {
        $file = [];
        $path = dirname(__DIR__) . '/.env';

        if (is_readable($path)) {
            foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                $line = trim($line);
                if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) {
                    continue;
                }

                [$name, $raw] = explode('=', $line, 2);
                // Values may be quoted; a password is free to contain '#', so
                // only strip comments that are not inside quotes.
                $raw = trim($raw);
                if (strlen($raw) >= 2 && ($raw[0] === '"' || $raw[0] === "'") && $raw[-1] === $raw[0]) {
                    $raw = substr($raw, 1, -1);
                }
                $file[trim($name)] = $raw;
            }
        }
    }

    $value = $file[$key] ?? '';

    return $value === '' ? null : $value;
}

/**
 * The connection settings, with no secrets included.
 *
 * api/db-check.php reports these back so an expert can see WHICH database the
 * app tried to reach. The password is deliberately never part of this array.
 *
 * @return array{host:string|null, port:int, database:string|null, username:string|null}
 */
function db_config(): array
{
    return [
        'host'     => env('DB_HOST'),
        'port'     => (int) (env('DB_PORT') ?? 3306),
        'database' => env('DB_DATABASE'),
        'username' => env('DB_USERNAME'),
    ];
}

/** Names of the settings that must be present before a connection is possible. */
function db_missing_config(): array
{
    $missing = [];
    foreach (['DB_HOST', 'DB_DATABASE', 'DB_USERNAME'] as $key) {
        if (env($key) === null) {
            $missing[] = $key;
        }
    }

    return $missing;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $missing = db_missing_config();
    if ($missing !== []) {
        throw new RuntimeException(
            implode(', ', $missing) . ' not set — copy .env.example to .env for local '
            . 'development, or check .env.prod for the deployed app.'
        );
    }

    $config = db_config();
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $config['host'],
        $config['port'],
        $config['database']
    );

    $pdo = new PDO($dsn, $config['username'], env('DB_PASSWORD') ?? '', [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        // Fail fast. The default waits long enough that an unreachable database
        // looks like a hung page rather than a configuration problem.
        PDO::ATTR_TIMEOUT            => 5,
    ]);

    return $pdo;
}

/**
 * The demo table.
 *
 * Every project a competitor creates shares ONE MySQL database, so the name is
 * prefixed to keep this app's rows apart from their other applications'.
 * Rename the prefix per project; do not drop it.
 */
const TASKS_TABLE = 'vanilla_tasks';

/** Create the schema and seed a few rows. Safe to call repeatedly. */
function db_init(): void
{
    $pdo = db();

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS ' . TASKS_TABLE . ' (
            id    INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            done  TINYINT(1)   NOT NULL DEFAULT 0
        )'
    );

    if ((int) $pdo->query('SELECT COUNT(*) FROM ' . TASKS_TABLE)->fetchColumn() === 0) {
        $insert = $pdo->prepare('INSERT INTO ' . TASKS_TABLE . ' (title, done) VALUES (?, ?)');
        $insert->execute(['Write plain PHP', 1]);
        $insert->execute(['Write plain JavaScript', 1]);
        $insert->execute(['Skip the framework', 0]);
    }
}

/** @return array<int, array{id:int, title:string, done:bool}> */
function all_tasks(): array
{
    $rows = db()->query('SELECT id, title, done FROM ' . TASKS_TABLE . ' ORDER BY id')->fetchAll();

    return array_map(static fn (array $r): array => [
        'id'    => (int) $r['id'],
        'title' => $r['title'],
        'done'  => (bool) $r['done'],
    ], $rows);
}

/** @return array{id:int, title:string, done:bool} */
function add_task(string $title): array
{
    $pdo = db();
    $pdo->prepare('INSERT INTO ' . TASKS_TABLE . ' (title) VALUES (?)')->execute([$title]);

    return ['id' => (int) $pdo->lastInsertId(), 'title' => $title, 'done' => false];
}
