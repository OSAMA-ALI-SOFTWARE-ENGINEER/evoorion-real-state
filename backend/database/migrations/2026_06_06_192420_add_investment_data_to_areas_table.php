<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('areas', function (Blueprint $table) {
            $table->string('hero_image_url')->nullable()->after('description');
            $table->decimal('latitude', 10, 7)->nullable()->after('hero_image_url');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->string('long_term_roi')->nullable()->after('longitude');
            $table->string('short_term_roi')->nullable()->after('long_term_roi');
            $table->string('appreciation')->nullable()->after('short_term_roi');
            $table->string('off_plan_discount')->nullable()->after('appreciation');
            $table->json('price_ranges')->nullable()->after('off_plan_discount');
            $table->string('meta_title')->nullable()->after('price_ranges');
            $table->string('meta_description')->nullable()->after('meta_title');
        });
    }

    public function down(): void
    {
        Schema::table('areas', function (Blueprint $table) {
            $table->dropColumn([
                'hero_image_url', 'latitude', 'longitude',
                'long_term_roi', 'short_term_roi', 'appreciation', 'off_plan_discount',
                'price_ranges', 'meta_title', 'meta_description',
            ]);
        });
    }
};
