<?php

namespace Database\Seeders;

use App\Models\Matieres;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UserMatiereSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $enseignants = User::where('role', 'ENSEIGNANT')->get();
        $matieres = Matieres::all();

        if ($enseignants->isEmpty() || $matieres->isEmpty()) {
            return;
        }

        foreach ($enseignants as $enseignant) {
            $matiere = $this->resolveMatiereForSpecialite($enseignant->specialite);
            if ($matiere) {
                $enseignant->matieres()->syncWithoutDetaching([$matiere->id]);
            }
        }
    }

    private function resolveMatiereForSpecialite(?string $specialite): ?Matieres
    {
        if (blank($specialite)) {
            return Matieres::query()->orderBy('id')->first();
        }

        $normalizedSpecialite = Str::lower(Str::ascii($specialite));

        $matiere = Matieres::query()->get()->first(function (Matieres $matiere) use ($normalizedSpecialite): bool {
            $normalizedMatiere = Str::lower(Str::ascii($matiere->nom_matiere));

            return Str::contains($normalizedMatiere, $normalizedSpecialite)
                || Str::contains($normalizedSpecialite, $normalizedMatiere);
        });

        if ($matiere) {
            return $matiere;
        }

        $fallbackMap = [
            'mathematiques' => 'Mathématiques',
            'francais' => 'Français',
            'histoire' => 'Histoire-Géographie',
            'geographie' => 'Histoire-Géographie',
            'svt' => 'SVT',
            'physique' => 'Physique-Chimie',
            'chimie' => 'Physique-Chimie',
            'anglais' => 'Anglais',
            'espagnol' => 'Espagnol',
            'arabe' => 'Arabe',
            'informatique' => 'Informatique',
            'philosophie' => 'Philosophie',
            'economie' => 'Économie',
            'eps' => 'EPS',
            'lecture' => 'Lecture',
            'ecriture' => 'Écriture',
            'langage' => 'Langage',
            'civique' => 'Éducation civique',
            'graphisme' => 'Graphisme',
            'numeriques' => 'Activités numériques',
            'monde' => 'Découverte du monde',
            'sciences' => 'Sciences',
        ];

        foreach ($fallbackMap as $needle => $expectedName) {
            if (Str::contains($normalizedSpecialite, $needle)) {
                $candidate = Matieres::query()->where('nom_matiere', $expectedName)->first();

                if ($candidate) {
                    return $candidate;
                }
            }
        }

        return Matieres::query()->orderBy('id')->first();
    }
}
