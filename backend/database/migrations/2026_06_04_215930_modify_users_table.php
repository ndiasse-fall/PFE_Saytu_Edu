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
        Schema::table('users', function (Blueprint $table) {
            // Statut/Rôle de l'utilisateur
            $table->enum('statut', ['SUPER_ADMIN', 'ADMIN', 'ENSEIGNANT', 'ELEVE'])->default('ELEVE');

            // Champs spécifiques Enseignant
            $table->string('matricule_enseignant')->unique()->nullable();
            $table->string('specialite')->nullable();
            $table->date('date_embauche')->nullable();

            // Champs spécifiques Élève
            $table->string('matricule_eleve')->unique()->nullable();
            $table->date('date_naissance')->nullable();
            $table->string('adresse')->nullable();
            $table->string('telephone_parent')->nullable();

            // Auto-jointure pour l'exclusivité du Super Admin
            $table->foreignId('id_parent_createur')->nullable()->constrained('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['id_parent_createur']);
            $table->dropColumn([
                'statut',
                'matricule_enseignant',
                'specialite',
                'date_embauche',
                'matricule_eleve',
                'date_naissance',
                'adresse',
                'telephone_parent',
                'id_parent_createur'
            ]);
        });
    }
};