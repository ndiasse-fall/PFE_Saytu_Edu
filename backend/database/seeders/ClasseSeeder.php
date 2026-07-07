<?php

namespace Database\Seeders;

use App\Models\Classe;
use Illuminate\Database\Seeder;

class ClasseSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            ['nom_classe' => 'Seconde S A', 'niveau' => 'Seconde'],
            ['nom_classe' => 'Seconde L A', 'niveau' => 'Seconde'],
            ['nom_classe' => 'Seconde G A', 'niveau' => 'Seconde'],
            ['nom_classe' => 'Première S A', 'niveau' => 'Première'],
            ['nom_classe' => 'Première L A', 'niveau' => 'Première'],
            ['nom_classe' => 'Première G A', 'niveau' => 'Première'],
            ['nom_classe' => 'Terminale S A', 'niveau' => 'Terminale'],
            ['nom_classe' => 'Terminale L A', 'niveau' => 'Terminale'],
            ['nom_classe' => 'Terminale G A', 'niveau' => 'Terminale'],
        ];

        foreach ($classes as $classe) {
            Classe::query()->updateOrCreate(
                [
                    'nom_classe' => $classe['nom_classe'],
                    'annee_scolaire' => '2025-2026',
                ],
                [
                    ...$classe,
                    'annee_scolaire' => '2025-2026',
                ]
            );
        }
    }
}
