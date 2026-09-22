<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Stand-in for the media-folder import. On the day, import the real file with
 * phpMyAdmin and point the query at that table. This migration inserts the same
 * rows as database/data/records.csv so `php artisan migrate` is enough locally.
 * The starter03_ prefix avoids colliding with other projects in the shared MySQL.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('starter03_records', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category');
            $table->unsignedInteger('score');
            $table->date('recorded_on');
        });

        DB::table('starter03_records')->insert([
            ['name' => 'Mei Lin', 'category' => 'Visitor', 'score' => 12, 'recorded_on' => '2026-03-02'],
            ['name' => 'Jonah Peck', 'category' => 'Member', 'score' => 40, 'recorded_on' => '2026-03-04'],
            ['name' => 'Amina Shah', 'category' => 'Visitor', 'score' => 7, 'recorded_on' => '2026-03-04'],
            ['name' => 'Chris Adeyemi', 'category' => 'Staff', 'score' => 3, 'recorded_on' => '2026-03-06'],
            ['name' => 'Hana Suzuki', 'category' => 'Member', 'score' => 28, 'recorded_on' => '2026-03-09'],
            ['name' => 'Luis Ortega', 'category' => 'Visitor', 'score' => 15, 'recorded_on' => '2026-03-11'],
            ['name' => 'Nora Berg', 'category' => 'Member', 'score' => 33, 'recorded_on' => '2026-03-15'],
            ['name' => 'Owen Clarke', 'category' => 'Staff', 'score' => 5, 'recorded_on' => '2026-03-18'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('starter03_records');
    }
};
