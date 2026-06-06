<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->foreignId('agency_id')->constrained()->onDelete('cascade');
            $table->string('phone');
            $table->string('whatsapp')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['agency_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};
