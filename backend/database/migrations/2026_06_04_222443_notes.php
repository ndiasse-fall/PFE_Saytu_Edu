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
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->decimal('valeur', 5, 2);
            $table->string('type_evaluation'); // Ex: Devoir, Examen
            $table->string('periode'); // Ex: Trimestre 1
            $table->foreignId('id_eleve')->constrained('users')->onDelete('cascade');
            $table->foreignId('id_matiere')->constrained('matieres')->onDelete('cascade');
            $table->foreignId('id_classe')->nullable()->constrained('classes')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};