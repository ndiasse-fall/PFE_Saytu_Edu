<?php

namespace Database\Seeders;

use App\Models\Classe;
use Illuminate\Database\Seeder;

class ClasseSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            ['nom_classe' => '2nde L A', 'niveau' => 'Seconde', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '2nde L B', 'niveau' => 'Seconde', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '2nde S A', 'niveau' => 'Seconde', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '2nde S B', 'niveau' => 'Seconde', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '1ère S1', 'niveau' => 'Première', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '1ère S2 A', 'niveau' => 'Première', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '1ère S2 B', 'niveau' => 'Première', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '1ère L1 A', 'niveau' => 'Première', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '1ère L1 B', 'niveau' => 'Première', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '1ère L2 A', 'niveau' => 'Première', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => '1ère L2 B', 'niveau' => 'Première', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => 'Tle S1', 'niveau' => 'Terminale', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => 'Tle S2 A', 'niveau' => 'Terminale', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => 'Tle S2 B', 'niveau' => 'Terminale', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => 'Tle L1 A', 'niveau' => 'Terminale', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => 'Tle L1 B', 'niveau' => 'Terminale', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => 'Tle L2 A', 'niveau' => 'Terminale', 'annee_scolaire' => '2025-2026'],
            ['nom_classe' => 'Tle L2 B', 'niveau' => 'Terminale', 'annee_scolaire' => '2025-2026'],
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