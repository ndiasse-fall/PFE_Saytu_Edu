<?php

namespace Database\Factories;

use App\Models\Matiere;
use Illuminate\Database\Eloquent\Factories\Factory;

class MatiereFactory extends Factory
{
    protected $model = Matiere::class;

    public function definition(): array
    {
        $matieres = ['Mathématiques', 'Français', 'Histoire-Géo', 'SVT', 'Physique-Chimie', 'Anglais', 'EPS', 'Philosophie'];
        return [
            'nom_matiere' => fake()->unique()->randomElement($matieres),
            'coefficient' => fake()->numberBetween(1, 5),
            'description' => fake()->sentence(),
        ];
    }
}
