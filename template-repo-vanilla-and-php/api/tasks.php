<?php
// JSON API used by scripts.js.
//   GET  api/tasks.php  → { stack, tasks: [...] }
//   POST api/tasks.php  → { id, title, done }   body: {"title":"..."}

require __DIR__ . '/../config/db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    db_init();

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body  = json_decode(file_get_contents('php://input') ?: '', true);
        $title = trim($body['title'] ?? '');

        if ($title === '') {
            http_response_code(422);
            echo json_encode(['error' => 'title is required']);
            exit;
        }

        http_response_code(201);
        echo json_encode(add_task($title));
        exit;
    }

    echo json_encode(['stack' => 'Vanilla PHP', 'tasks' => all_tasks()]);
} catch (Throwable $e) {
    http_response_code(503);
    echo json_encode(['error' => 'database unavailable', 'detail' => $e->getMessage()]);
}
