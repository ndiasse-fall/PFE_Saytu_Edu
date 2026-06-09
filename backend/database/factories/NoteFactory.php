<?php

namespace Database\Factories;

use App\Models\Note;
use App\Models\User;
use App\Models\Matiere;
use Illuminate\Database\Eloquent\Factories\Factory;

class NoteFactory extends Factory
{
    protected $model = Note::class;

    public function definition(): array
    {
        return [
            'valeur' => fake()->randomFloat(2, 0, 20),
            'type_evaluation' => fake()->randomElement(['Devoir', 'Examen', 'Interrogation']),
            'periode' => fake()->randomElement(['Trimestre 1', 'Trimestre 2', 'Trimestre 3']),
            'id_eleve' => User::factory()->eleve(),
            'id_matiere' => Matiere::factory(),
        ];
    }
}
