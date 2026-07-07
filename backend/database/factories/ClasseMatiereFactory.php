<?php

namespace Database\Factories;

use App\Models\Classe;
use App\Models\ClasseMatiere;
use App\Models\Matieres;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClasseMatiereFactory extends Factory
{
    protected $model = ClasseMatiere::class;

    public function definition(): array
    {
        return [
            'id_classe' => Classe::factory(),
            'id_matiere' => Matieres::factory(),
            'coefficient' => 1,
        ];
    }
}
