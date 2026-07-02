<?php

namespace Database\Factories;

use App\Models\Absence;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AbsenceFactory extends Factory
{
    protected $model = Absence::class;

    public function definition(): array
    {
        return [
            'date_absence' => fake()->dateTimeBetween('-1 month', 'now'),
            'motif' => fake()->sentence(),
            'est_justifiee' => fake()->boolean(),
            'id_eleve' => User::factory()->eleve()->create()->id,
        ];
    }
}