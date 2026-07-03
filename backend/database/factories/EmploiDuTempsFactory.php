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
        $creneaux = [
            ['08:00', '10:00'],
            ['10:00', '12:00'],
            ['12:00', '14:00'],
            ['14:00', '16:00'],
            ['15:00', '17:00'],
        ];
        [$heureDebut, $heureFin] = fake()->randomElement($creneaux);

        return [
            'jour' => fake()->randomElement($jours),
            'heure_debut' => $heureDebut,
            'heure_fin' => $heureFin,
            'salle' => 'Salle ' . fake()->numberBetween(1, 20),
            'est_publie' => true,
            'id_classe' => Classe::query()->inRandomOrder()->value('id')
                ?? Classe::query()->firstOrCreate(
                    ['nom_classe' => '2nde L A', 'annee_scolaire' => '2025-2026'],
                    ['niveau' => 'Seconde']
                )->id,
            'id_enseignant' => User::query()->where('role', 'ENSEIGNANT')->inRandomOrder()->value('id')
                ?? User::factory()->enseignant()->create()->id,
            'id_matiere' => Matieres::query()->inRandomOrder()->value('id')
                ?? Matieres::query()->firstOrCreate(
                    ['nom_matiere' => 'Mathématiques'],
                    ['coefficient' => 6, 'description' => 'Algèbre, géométrie et raisonnement mathématique.']
                )->id,
        ];
    }
}
