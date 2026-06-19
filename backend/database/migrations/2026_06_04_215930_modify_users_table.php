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
        $hasStatut = Schema::hasColumn('users', 'statut');
        $hasMatriculeEnseignant = Schema::hasColumn('users', 'matricule_enseignant');
        $hasSpecialite = Schema::hasColumn('users', 'specialite');
        $hasDateEmbauche = Schema::hasColumn('users', 'date_embauche');
        $hasMatriculeEleve = Schema::hasColumn('users', 'matricule_eleve');
        $hasDateNaissance = Schema::hasColumn('users', 'date_naissance');
        $hasAdresse = Schema::hasColumn('users', 'adresse');
        $hasTelephoneParent = Schema::hasColumn('users', 'telephone_parent');
        $hasParentCreateur = Schema::hasColumn('users', 'id_parent_createur');

        Schema::table('users', function (Blueprint $table) use (
            $hasStatut,
            $hasMatriculeEnseignant,
            $hasSpecialite,
            $hasDateEmbauche,
            $hasMatriculeEleve,
            $hasDateNaissance,
            $hasAdresse,
            $hasTelephoneParent,
            $hasParentCreateur,
        ) {
            // Statut/Rôle de l'utilisateur
            if (! $hasStatut) {
                $table->enum('statut', ['SUPER_ADMIN', 'ADMIN', 'ENSEIGNANT', 'ELEVE'])->default('ELEVE');
            }

            // Champs spécifiques Enseignant
            if (! $hasMatriculeEnseignant) {
                $table->string('matricule_enseignant')->unique()->nullable();
            }
            if (! $hasSpecialite) {
                $table->string('specialite')->nullable();
            }
            if (! $hasDateEmbauche) {
                $table->date('date_embauche')->nullable();
            }

            // Champs spécifiques Élève
            if (! $hasMatriculeEleve) {
                $table->string('matricule_eleve')->unique()->nullable();
            }
            if (! $hasDateNaissance) {
                $table->date('date_naissance')->nullable();
            }
            if (! $hasAdresse) {
                $table->string('adresse')->nullable();
            }
            if (! $hasTelephoneParent) {
                $table->string('telephone_parent')->nullable();
            }

            // Auto-jointure pour l'exclusivité du Super Admin
            if (! $hasParentCreateur) {
                $table->foreignId('id_parent_createur')->nullable()->constrained('users')->onDelete('set null');
            }
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
