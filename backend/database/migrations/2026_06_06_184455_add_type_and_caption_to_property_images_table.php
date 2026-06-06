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
        Schema::table('property_images', function (Blueprint $table) {
            $table->enum('type', ['image', 'video', 'file'])->default('image')->after('order');
            $table->string('caption')->nullable()->after('type');
            $table->string('file_name')->nullable()->after('caption');
        });
    }

    public function down(): void
    {
        Schema::table('property_images', function (Blueprint $table) {
            $table->dropColumn(['type', 'caption', 'file_name']);
        });
    }
};
