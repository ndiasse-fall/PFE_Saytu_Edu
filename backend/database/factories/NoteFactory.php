<?php

namespace Database\Factories;

use App\Models\Classe;
use App\Models\Matieres;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NoteFactory extends Factory
{
    protected $model = Note::class;

    public function definition(): array
    {
        return [
            'valeur' => fake()->randomFloat(1, 0, 20),
            'type_evaluation' => fake()->randomElement([
                'Devoir',
                'Examen',
                'Interrogation',
            ]),
            'periode' => fake()->randomElement(['Trimestre 1', 'Trimestre 2']),
            'id_eleve' => User::factory()->eleve(),
            'id_matiere' => Matieres::query()->inRandomOrder()->value('id')
                ?? Matieres::query()->firstOrCreate(
                    ['nom_matiere' => 'Mathématiques'],
                    ['coefficient' => 6, 'description' => 'Algèbre, géométrie et raisonnement mathématique.']
                )->id,
            'id_classe' => Classe::query()->inRandomOrder()->value('id')
                ?? Classe::query()->firstOrCreate(
                    ['nom_classe' => '2nde L A', 'annee_scolaire' => '2025-2026'],
                    ['niveau' => 'Seconde']
                )->id,
        ];
    }
}
