<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\Matieres;
use Illuminate\Database\Seeder;

class ClasseMatiereSeeder extends Seeder
{
    public function run(): void
    {
        $matiereIds = Matieres::query()->pluck('id', 'nom_matiere');

        $cycles = [
            'Préscolaire' => ['Langage', 'Graphisme', 'Activités numériques', 'Découverte du monde', 'EPS'],
            'Primaire' => ['Français', 'Mathématiques', 'Lecture', 'Écriture', 'Sciences', 'Histoire-Géographie', 'Éducation civique', 'EPS'],
            'Collège' => ['Français', 'Mathématiques', 'Anglais', 'SVT', 'Physique-Chimie', 'Histoire-Géographie', 'Espagnol', 'Arabe', 'Informatique', 'EPS'],
            'Lycée' => ['Français', 'Mathématiques', 'Anglais', 'SVT', 'Physique-Chimie', 'Histoire-Géographie', 'Philosophie', 'Économie', 'Informatique', 'EPS'],
        ];

        Classe::query()->get()->each(function (Classe $classe) use ($cycles, $matiereIds): void {
            $names = $cycles[$classe->niveau] ?? [];
            $ids = collect($names)
                ->map(fn (string $name) => $matiereIds[$name] ?? null)
                ->filter()
                ->values()
                ->all();

            $classe->matieres()->sync($ids);
        });
    }
}
