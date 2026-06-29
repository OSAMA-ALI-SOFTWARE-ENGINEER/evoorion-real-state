<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Replace the old API domain (evoorion-api.osama-ali.com) with the production
 * domain (api.evoorionrealestate.com) in every table column that stores image URLs.
 */
return new class extends Migration {
    private const OLD = 'https://evoorion-api.osama-ali.com';
    private const NEW = 'https://api.evoorionrealestate.com';

    private function replaceInColumn(string $table, string $column): void
    {
        DB::statement("
            UPDATE `{$table}`
            SET `{$column}` = REPLACE(`{$column}`, ?, ?)
            WHERE `{$column}` LIKE ?
        ", [self::OLD, self::NEW, '%evoorion-api.osama-ali.com%']);
    }

    public function up(): void
    {
        // Plain string URL columns
        $this->replaceInColumn('property_images', 'url');
        $this->replaceInColumn('media_files', 'url');
        $this->replaceInColumn('blog_posts', 'featured_image_url');
        $this->replaceInColumn('agencies', 'logo_url');
        $this->replaceInColumn('developers', 'logo_url');
        $this->replaceInColumn('areas', 'hero_image_url');
        $this->replaceInColumn('users', 'avatar_url');

        // Text column — settings store arbitrary values including image URLs
        $this->replaceInColumn('settings', 'value');

        // JSON columns — MySQL REPLACE() works on the serialised string
        $this->replaceInColumn('areas', 'gallery');
        $this->replaceInColumn('page_contents', 'content');
    }

    public function down(): void
    {
        // Reversal not needed; the old domain no longer resolves correctly anyway
    }
};
