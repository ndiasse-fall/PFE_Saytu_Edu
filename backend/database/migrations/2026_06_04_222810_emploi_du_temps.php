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
        Schema::create('emploi_du_temps', function (Blueprint $table) {
            $table->id();
            $table->string('jour'); // Lundi, Mardi...
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->string('salle');
            $table->foreignId('id_classe')->constrained('classes')->onDelete('cascade');
            $table->foreignId('id_enseignant')->constrained('users')->onDelete('cascade');
            $table->foreignId('id_matiere')->constrained('matieres')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emploi_du_temps');
    }
};