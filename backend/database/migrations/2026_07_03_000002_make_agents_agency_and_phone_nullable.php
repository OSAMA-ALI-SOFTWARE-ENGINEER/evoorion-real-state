<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The admin UI and form requests treat agency and phone as optional
     * ("— None —" agency option), but the original schema made both NOT NULL,
     * so creating an agent without them threw a raw SQL error instead of
     * passing validation.
     */
    public function up(): void
    {
        Schema::table('agents', function (Blueprint $table) {
            $table->foreignId('agency_id')->nullable()->change();
            $table->string('phone')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('agents', function (Blueprint $table) {
            $table->foreignId('agency_id')->nullable(false)->change();
            $table->string('phone')->nullable(false)->change();
        });
    }
};
