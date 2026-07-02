<?php

namespace Database\Factories;

use App\Models\EmploiDuTemps;
use App\Models\Classe;
use App\Models\User;
use App\Models\Matieres;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmploiDuTempsFactory extends Factory
{
    protected $model = EmploiDuTemps::class;

    public function definition(): array
    {
        $jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        $numberSalles = 10; // Nombre de salles disponibles
        return [
            'jour' => fake()->randomElement($jours),
            'heure_debut' => fake()->time('H:i', '12:00'),
            'heure_fin' => fake()->time('H:i', '18:00'),
            'salle' => fake()->bothify('Salle ###'),
            'est_publie' => true,
            'id_classe' => Classe::query()->inRandomOrder()->value('id')
                ?? Classe::query()->firstOrCreate(
                    ['nom_classe' => '2nde L A', 'annee_scolaire' => '2025-2026'],
                    ['niveau' => 'Seconde']
                )->id,
            'id_enseignant' => User::factory()->enseignant(),
            'id_matiere' => Matieres::query()->inRandomOrder()->value('id')
                ?? Matieres::query()->firstOrCreate(
                    ['nom_matiere' => 'Mathématiques'],
                    ['coefficient' => 6, 'description' => 'Algèbre, géométrie et raisonnement mathématique.']
                )->id,
        ];
    }
}
