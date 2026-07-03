<?php

namespace Database\Factories;

use App\Models\Bulletin;
use App\Models\User;
use App\Models\Classe;
use App\Models\Note;
use Illuminate\Database\Eloquent\Factories\Factory;

class BulletinFactory extends Factory
{
    protected $model = Bulletin::class;

    public function definition(): array
    {
        return [
            'periode' => fake()->randomElement(['Semestre 1', 'Semestre 2']),
            'moyenne_generale' => fake()->randomFloat(2, 5, 18),
            'rang' => fake()->numberBetween(1, 40),
            'id_eleve' => User::factory()->eleve(),
            'id_classe' => Classe::query()->inRandomOrder()->value('id'),
        ];
    }
}
