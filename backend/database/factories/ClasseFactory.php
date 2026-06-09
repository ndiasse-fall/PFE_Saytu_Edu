<?php

namespace Database\Factories;

use App\Models\Classe;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClasseFactory extends Factory
{
    protected $model = Classe::class;

    public function definition(): array
    {
        $niveaux = ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'];
        return [
            'nom_classe' => fake()->unique()->bothify('Classe-##??'),
            'niveau' => fake()->randomElement($niveaux),
            'annee_scolaire' => '2025-2026',
        ];
    }
}
