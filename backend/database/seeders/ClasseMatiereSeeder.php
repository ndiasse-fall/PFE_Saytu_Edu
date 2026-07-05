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
            // Assigne au minimum 7 matières aléatoires à chaque classe
            $minMatieres = min(7, $matieres->count());
            $randomMatieres = $matieres->random(rand($minMatieres, $matieres->count()));
            $classe->matieres()->syncWithoutDetaching($randomMatieres->pluck('id')->all());
        }
    }
}
