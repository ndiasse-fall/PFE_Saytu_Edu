<?php

namespace Database\Seeders;

use App\Models\Classe;
use Illuminate\Database\Seeder;

class ClasseSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            ['nom_classe' => 'PS A', 'niveau' => 'Préscolaire'],
            ['nom_classe' => 'MS A', 'niveau' => 'Préscolaire'],
            ['nom_classe' => 'GS A', 'niveau' => 'Préscolaire'],
            ['nom_classe' => 'CI A', 'niveau' => 'Primaire'],
            ['nom_classe' => 'CI B', 'niveau' => 'Primaire'],
            ['nom_classe' => 'CP A', 'niveau' => 'Primaire'],
            ['nom_classe' => 'CP B', 'niveau' => 'Primaire'],
            ['nom_classe' => 'CE1 A', 'niveau' => 'Primaire'],
            ['nom_classe' => 'CE1 B', 'niveau' => 'Primaire'],
            ['nom_classe' => 'CE2 A', 'niveau' => 'Primaire'],
            ['nom_classe' => 'CE2 B', 'niveau' => 'Primaire'],
            ['nom_classe' => 'CM1 A', 'niveau' => 'Primaire'],
            ['nom_classe' => 'CM1 B', 'niveau' => 'Primaire'],
            ['nom_classe' => 'CM2 A', 'niveau' => 'Primaire'],
            ['nom_classe' => 'CM2 B', 'niveau' => 'Primaire'],
            ['nom_classe' => '6ème A', 'niveau' => 'Collège'],
            ['nom_classe' => '6ème B', 'niveau' => 'Collège'],
            ['nom_classe' => '5ème A', 'niveau' => 'Collège'],
            ['nom_classe' => '5ème B', 'niveau' => 'Collège'],
            ['nom_classe' => '4ème A', 'niveau' => 'Collège'],
            ['nom_classe' => '4ème B', 'niveau' => 'Collège'],
            ['nom_classe' => '3ème A', 'niveau' => 'Collège'],
            ['nom_classe' => '3ème B', 'niveau' => 'Collège'],
            ['nom_classe' => 'Seconde S A', 'niveau' => 'Lycée'],
            ['nom_classe' => 'Seconde L A', 'niveau' => 'Lycée'],
            ['nom_classe' => 'Seconde G A', 'niveau' => 'Lycée'],
            ['nom_classe' => 'Première S A', 'niveau' => 'Lycée'],
            ['nom_classe' => 'Première L A', 'niveau' => 'Lycée'],
            ['nom_classe' => 'Première G A', 'niveau' => 'Lycée'],
            ['nom_classe' => 'Terminale S A', 'niveau' => 'Lycée'],
            ['nom_classe' => 'Terminale L A', 'niveau' => 'Lycée'],
            ['nom_classe' => 'Terminale G A', 'niveau' => 'Lycée'],
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
