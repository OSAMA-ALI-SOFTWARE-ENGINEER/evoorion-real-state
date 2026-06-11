<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('page_contents', function (Blueprint $table) {
            $table->id();
            $table->string('page_slug');
            $table->string('section_key');
            $table->json('content');
            $table->timestamps();
            $table->unique(['page_slug', 'section_key']);
            $table->index('page_slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_contents');
    }
};
