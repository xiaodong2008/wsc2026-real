<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

// Table name is prefixed. Every project on the bench shares one MySQL database.
Route::get('/', function () {
    try {
        $rows = DB::table('starter03_records')->orderBy('id')->get();
        $error = null;
    } catch (\Throwable $e) {
        $rows = collect();
        $error = $e->getMessage();
    }

    return view('table', [
        'rows' => $rows,
        'error' => $error,
    ]);
});

// The database connection check lives in routes/api.php, on /api/db-check.
