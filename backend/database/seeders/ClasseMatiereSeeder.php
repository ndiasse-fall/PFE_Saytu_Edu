<?php

namespace Database\Seeders;

use App\Models\Classe;
use App\Models\Matieres;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ClasseMatiereSeeder extends Seeder
{
    public function run(): void
    {
        $matiereIds = Matieres::query()->pluck('id', 'nom_matiere');

        Classe::query()->get()->each(function (Classe $classe) use ($matiereIds): void {
            $names = $this->matieresForClasse($classe);
            $ids = collect($names)
                ->map(fn (string $name) => $matiereIds[$name] ?? null)
                ->filter()
                ->values()
                ->all();

            $classe->matieres()->sync($ids);
        });
    }

    /**
     * @return array<int, string>
     */
    private function matieresForClasse(Classe $classe): array
    {
        if ($classe->niveau === 'Préscolaire') {
            return ['Langage', 'Graphisme', 'Activités numériques', 'Découverte du monde', 'EPS'];
        }

        if ($classe->niveau === 'Primaire') {
            return ['Français', 'Mathématiques', 'Lecture', 'Écriture', 'Sciences', 'Histoire-Géographie', 'Éducation civique', 'EPS'];
        }

        $nomClasse = Str::lower(Str::ascii($classe->nom_classe));

        if (Str::contains($nomClasse, 'seconde s') || Str::contains($nomClasse, 'premiere s') || Str::contains($nomClasse, 'terminale s')) {
            return ['Français', 'Mathématiques', 'Anglais', 'SVT', 'Physique-Chimie', 'Histoire-Géographie', 'Philosophie', 'Informatique', 'EPS'];
        }

        if (Str::contains($nomClasse, 'seconde l') || Str::contains($nomClasse, 'premiere l') || Str::contains($nomClasse, 'terminale l')) {
            return ['Français', 'Mathématiques', 'Anglais', 'Histoire-Géographie', 'Philosophie', 'Espagnol', 'Arabe', 'Informatique', 'EPS'];
        }

        if (Str::contains($nomClasse, 'seconde g') || Str::contains($nomClasse, 'premiere g') || Str::contains($nomClasse, 'terminale g')) {
            return ['Français', 'Mathématiques', 'Anglais', 'Histoire-Géographie', 'Économie', 'Informatique', 'EPS'];
        }

        return ['Français', 'Mathématiques', 'Anglais', 'SVT', 'Physique-Chimie', 'Histoire-Géographie', 'Espagnol', 'Arabe', 'Informatique', 'EPS'];
    }
}
