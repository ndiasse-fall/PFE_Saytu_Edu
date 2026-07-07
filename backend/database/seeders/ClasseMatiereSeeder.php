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
            $payload = collect($names)->mapWithKeys(function (string $name) use ($matiereIds, $classe): array {
                $matiereId = $matiereIds[$name] ?? null;

                if (! $matiereId) {
                    return [];
                }

                return [
                    $matiereId => [
                        'coefficient' => $this->coefficientForClasseAndMatiere($classe, $name),
                    ],
                ];
            })->all();

            $classe->matieres()->sync($payload);
        });
    }

    /**
     * @return array<int, string>
     */
    private function matieresForClasse(Classe $classe): array
    {
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

    private function coefficientForClasseAndMatiere(Classe $classe, string $matiere): int
    {
        $nomClasse = Str::lower(Str::ascii($classe->nom_classe));
        $matiere = Str::lower(Str::ascii($matiere));

        if (Str::contains($nomClasse, 'seconde s') || Str::contains($nomClasse, 'premiere s') || Str::contains($nomClasse, 'terminale s')) {
            return match ($matiere) {
                'mathematiques' => 6,
                'physique-chimie' => 5,
                'svt' => 4,
                'francais' => 3,
                'anglais' => 2,
                'histoire-geographie' => 2,
                'philosophie' => 2,
                'informatique' => 2,
                default => 1,
            };
        }

        if (Str::contains($nomClasse, 'seconde l') || Str::contains($nomClasse, 'premiere l') || Str::contains($nomClasse, 'terminale l')) {
            return match ($matiere) {
                'francais' => 6,
                'philosophie' => 5,
                'histoire-geographie' => 5,
                'anglais' => 4,
                'mathematiques' => 3,
                'espagnol' => 3,
                'arabe' => 2,
                'informatique' => 2,
                default => 1,
            };
        }

        if (Str::contains($nomClasse, 'seconde g') || Str::contains($nomClasse, 'premiere g') || Str::contains($nomClasse, 'terminale g')) {
            return match ($matiere) {
                'francais' => 5,
                'mathematiques' => 5,
                'anglais' => 3,
                'histoire-geographie' => 3,
                'economie' => 4,
                'informatique' => 2,
                default => 1,
            };
        }

        return 1;
    }
}
