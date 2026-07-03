<?php

namespace Database\Seeders;

use App\Models\Absence;
use App\Models\Bulletin;
use App\Models\Classe;
use App\Models\EmploiDuTemps;
use App\Models\Matieres;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            MatiereSeeder::class,
            UserSeeder::class,
            ClasseSeeder::class,
            UserMatiereSeeder::class,
            ClasseMatiereSeeder::class,
        ]);

        $eleves = User::where('role', 'ELEVE')->get();
        $enseignants = User::where('role', 'ENSEIGNANT')->get();
        $classes = Classe::all();
        $matieres = Matieres::all();

        // Inscrire les élèves équitablement dans les classes
        if ($classes->isNotEmpty() && $eleves->isNotEmpty()) {
            $classIds = $classes->pluck('id')->all();
            $classCount = count($classIds);
            foreach ($eleves as $index => $eleve) {
                $assignedClassId = $classIds[$index % $classCount];
                $eleve->classes()->sync([$assignedClassId]);
            }
        }

        // Affecter les enseignants à au moins une classe de chaque niveau de classe
        if ($classes->isNotEmpty() && $enseignants->isNotEmpty()) {
            $classesByNiveau = $classes->groupBy('niveau');
            foreach ($enseignants as $enseignant) {
                $classIdsToAssign = [];
                foreach ($classesByNiveau as $niveau => $niveauClasses) {
                    if ($niveauClasses->isNotEmpty()) {
                        $classIdsToAssign[] = $niveauClasses->random()->id;
                    }
                }
                if (!empty($classIdsToAssign)) {
                    $enseignant->classes()->sync($classIdsToAssign);
                }
            }
        }

        // Créer des notes, absences, bulletins
        foreach ($eleves as $eleve) {
            if (! Note::where('id_eleve', $eleve->id)->exists()) {
                Note::factory()->count(5)->create([
                    'id_eleve' => $eleve->id,
                    'id_matiere' => $matieres->random()->id,
                ]);
            }

            if (! Absence::where('id_eleve', $eleve->id)->exists()) {
                Absence::factory()->count(2)->create([
                    'id_eleve' => $eleve->id,
                ]);
            }

            if (! Bulletin::where('id_eleve', $eleve->id)->exists()) {
                Bulletin::factory()->create([
                    'id_eleve' => $eleve->id,
                    'id_classe' => $eleve->classes()->first()?->id ?? $classes->random()->id,
                ]);
            }
        }

        // Créer l'emploi du temps
        if (! EmploiDuTemps::query()->exists()) {
            foreach ($classes as $classe) {
                foreach ($matieres->random(min(3, $matieres->count())) as $matiere) {
                    EmploiDuTemps::factory()->create([
                        'id_classe' => $classe->id,
                        'id_matiere' => $matiere->id,
                        'id_enseignant' => $enseignants->random()->id,
                    ]);
                }
            }
        }
    }
}
