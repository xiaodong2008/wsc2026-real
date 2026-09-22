<?php

use Illuminate\Support\Facades\Route;

// The time below is rendered on the server. View Source must show the clock
// string before any JavaScript runs; a refresh must change it.
Route::get('/', function () {
    $now = now();

    return view('info', [
        'time' => $now->format('Y-m-d H:i:s'),
        'iso' => $now->toIso8601String(),
        'php' => PHP_VERSION,
        'host' => gethostname() ?: 'unknown',
        'os' => PHP_OS,
    ]);
});

// The database connection check lives in routes/api.php, on /api/db-check.
