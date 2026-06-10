<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Replace ENUM with VARCHAR to support draft, published, pending, archived
        DB::statement("ALTER TABLE blog_posts MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'draft'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE blog_posts MODIFY COLUMN status ENUM('draft','published') NOT NULL DEFAULT 'draft'");
    }
};
