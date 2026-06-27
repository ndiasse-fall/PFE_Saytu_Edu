<?php

namespace Database\Seeders;

use App\Models\Classe;
use Illuminate\Database\Seeder;

class ClasseSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            ['nom_classe' => '6A', 'niveau' => '6ème', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '6B', 'niveau' => '6ème', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '5A', 'niveau' => '5ème', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '5B', 'niveau' => '5ème', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '4A', 'niveau' => '4ème', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '3A', 'niveau' => '3ème', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '2nde A', 'niveau' => 'Seconde', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '2nde B', 'niveau' => 'Seconde', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '1ère S', 'niveau' => 'Première', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => 'Tle S', 'niveau' => 'Terminale', 'annee_scolaire' => '2025-2026'],
        ];

        foreach ($classes as $classe) {
            Classe::query()->updateOrCreate(
                [
                    'nom_classe' => $classe['nom_classe'],
                    'annee_scolaire' => $classe['annee_scolaire'],
                ],
                $classe
            );
        }
    }
}
