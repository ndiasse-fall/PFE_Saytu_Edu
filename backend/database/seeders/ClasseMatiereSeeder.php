<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\Matieres;
use Illuminate\Database\Seeder;

class ClasseMatiereSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classes = Classe::all();
        $matieres = Matieres::all();

        if ($classes->isEmpty() || $matieres->isEmpty()) {
            return;
        }

        foreach ($classes as $classe) {
            // Assigne 3 à 6 matières aléatoires à chaque classe
            $randomMatieres = $matieres->random(min(rand(3, 6), $matieres->count()));
            $classe->matieres()->syncWithoutDetaching($randomMatieres->pluck('id')->all());
        }
    }
}
