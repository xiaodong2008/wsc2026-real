<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// The database connection check lives in routes/api.php, on /api/db-check.
