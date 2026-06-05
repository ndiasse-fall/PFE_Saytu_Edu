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
        Schema::create('classe_enseignant', function (Blueprint $table) {
            $table->foreignId('id_classe')->constrained('classes')->onDelete('cascade');
            $table->foreignId('id_enseignant')->constrained('users')->onDelete('cascade');
            $table->primary(['id_classe', 'id_enseignant']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classe_enseignant');
    }
};