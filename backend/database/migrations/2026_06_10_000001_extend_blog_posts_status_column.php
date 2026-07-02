<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // MODIFY COLUMN is MySQL-only; SQLite (tests) stores enums as TEXT with a
        // CHECK constraint Laravel can't alter, so the column is left as-is there.
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        // Replace ENUM with VARCHAR to support draft, published, pending, archived
        DB::statement("ALTER TABLE blog_posts MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'draft'");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE blog_posts MODIFY COLUMN status ENUM('draft','published') NOT NULL DEFAULT 'draft'");
    }
};
