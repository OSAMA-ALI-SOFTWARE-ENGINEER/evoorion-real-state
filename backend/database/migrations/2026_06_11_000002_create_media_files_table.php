<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('media_files', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('url');
            $table->string('public_id');
            $table->string('mime_type')->nullable();
            $table->string('folder')->default('misc');
            $table->unsignedBigInteger('size')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->index('folder');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_files');
    }
};
