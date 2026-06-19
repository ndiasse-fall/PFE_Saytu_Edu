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
        Schema::create('classe_eleve', function (Blueprint $table) {
            $table->foreignId('id_classe')->constrained('classes')->onDelete('cascade');
            $table->foreignId('id_eleve')->constrained('users')->onDelete('cascade');
            $table->primary(['id_classe', 'id_eleve']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classe_eleve');
    }
};