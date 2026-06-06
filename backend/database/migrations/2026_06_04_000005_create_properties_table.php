<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['villa', 'apartment', 'penthouse', 'townhouse', 'commercial']);
            $table->decimal('price', 15, 2);
            $table->string('currency', 3)->default('AED');
            $table->foreignId('area_id')->constrained();
            $table->string('location')->nullable();
            $table->decimal('area_sqft', 10, 2)->nullable();
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->foreignId('operation_type_id')->constrained();
            $table->enum('status', ['available', 'sold', 'rented'])->default('available');
            $table->boolean('is_featured')->default(false);
            $table->decimal('roi_min', 5, 2)->nullable();
            $table->decimal('roi_max', 5, 2)->nullable();
            $table->foreignId('developer_id')->constrained();
            $table->foreignId('primary_agent_id')->nullable()->constrained('users');
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();
            $table->integer('views_count')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
