<?php
// Vanilla PHP entry point — start here for a PHP project.
// The page is rendered on the server; no JavaScript is involved.

require __DIR__ . '/config/db.php';

$tasks = [];
$error = null;

try {
    db_init();
    $tasks = all_tasks();
} catch (Throwable $e) {
    $error = $e->getMessage();
}

/** Escape a value for safe output in HTML. */
function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WSC2026 · Vanilla PHP</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="card">
    <h1>Vanilla <span class="v">PHP</span></h1>
    <p>WSC2026 Web Technologies — no framework. This page is rendered by
      <code>index.php</code>, reading MySQL through <code>config/db.php</code>.
      The connection comes from <code>.env</code> — nothing is hardcoded.</p>

    <?php if ($error !== null): ?>
      <p class="warn">⚠️ Database not available: <?= e($error) ?></p>
    <?php else: ?>
      <ul>
        <?php foreach ($tasks as $task): ?>
          <li><?= $task['done'] ? '✅' : '⬜️' ?> <?= e($task['title']) ?></li>
        <?php endforeach; ?>
      </ul>
    <?php endif; ?>

    <p>JSON API: <code>GET api/tasks.php</code> —
      connection check: <code><a href="api/db-check.php">api/db-check.php</a></code></p>
    <p class="alt">Building with plain JavaScript instead? → <a href="index.html">index.html</a></p>
  </main>
</body>
</html>
