<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('operation_types', function (Blueprint $table) {
            $table->id();
            $table->enum('name', ['Buy', 'Rent', 'Stay', 'Off-plan'])->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operation_types');
    }
};
