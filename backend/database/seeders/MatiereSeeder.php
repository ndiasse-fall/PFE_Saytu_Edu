<?php

namespace Database\Seeders;

use App\Models\Matieres;
use Illuminate\Database\Seeder;

class MatiereSeeder extends Seeder
{
    public function run(): void
    {
        $matieres = [
            ['nom_matiere' => 'Mathématiques', 'coefficient' => 5, 'description' => 'Algèbre, géométrie et résolution de problèmes.'],
            ['nom_matiere' => 'Français', 'coefficient' => 4, 'description' => 'Expression écrite, orale et littérature.'],
            ['nom_matiere' => 'Histoire-Géo', 'coefficient' => 3, 'description' => 'Histoire, géographie et éducation civique.'],
            ['nom_matiere' => 'SVT', 'coefficient' => 3, 'description' => 'Sciences de la vie et de la terre.'],
            ['nom_matiere' => 'Physique-Chimie', 'coefficient' => 4, 'description' => 'Physique, chimie et travaux pratiques.'],
            ['nom_matiere' => 'Anglais', 'coefficient' => 3, 'description' => 'Communication et compréhension anglaise.'],
            ['nom_matiere' => 'EPS', 'coefficient' => 2, 'description' => 'Éducation physique et sportive.'],
            ['nom_matiere' => 'Philosophie', 'coefficient' => 3, 'description' => 'Analyse, argumentation et réflexion.'],
            ['nom_matiere' => 'Informatique', 'coefficient' => 2, 'description' => 'Initiation aux outils numériques et aux algorithmes.'],
        ];

        foreach ($matieres as $matiere) {
            Matieres::query()->updateOrCreate(
                ['nom_matiere' => $matiere['nom_matiere']],
                $matiere
            );
        }
    }
}
