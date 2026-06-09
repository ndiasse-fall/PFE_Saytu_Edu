<?php

namespace Database\Seeders;

use App\Models\Absence;
use App\Models\Bulletin;
use App\Models\Classe;
use App\Models\EmploiDuTemps;
use App\Models\Matiere;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            ClasseSeeder::class,
            MatiereSeeder::class,
        ]);

        $eleves = User::where('role', 'ELEVE')->get();
        $enseignants = User::where('role', 'ENSEIGNANT')->get();
        $classes = Classe::all();
        $matieres = Matiere::all();

        // Inscrire les élèves dans des classes
        foreach ($eleves as $eleve) {
            $eleve->classes()->attach($classes->random()->id);
        }

        // Affecter les enseignants aux classes
        foreach ($enseignants as $enseignant) {
            $enseignant->classes()->attach($classes->random(2)->pluck('id'));
        }

        // Créer des notes, absences, bulletins
        foreach ($eleves as $eleve) {
            Note::factory()->count(5)->create([
                'id_eleve' => $eleve->id,
                'id_matiere' => $matieres->random()->id,
            ]);

            Absence::factory()->count(2)->create([
                'id_eleve' => $eleve->id,
            ]);

            Bulletin::factory()->create([
                'id_eleve' => $eleve->id,
                'id_classe' => $eleve->classes()->first()?->id ?? $classes->random()->id,
            ]);
        }

        // Créer l'emploi du temps
        foreach ($classes as $classe) {
            foreach ($matieres->random(3) as $matiere) {
                EmploiDuTemps::factory()->create([
                    'id_classe' => $classe->id,
                    'id_matiere' => $matiere->id,
                    'id_enseignant' => $enseignants->random()->id,
                ]);
            }
        }
    }
}
