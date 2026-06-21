<?php

namespace Database\Seeders;

use App\Models\EmploiDuTemps;
use App\Models\Classe;
use App\Models\User;
use App\Models\Matieres;
use Illuminate\Database\Seeder;

class EmploiDuTempsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // On récupère des données existantes ou on en crée
        $classes = Classe::all();
        $enseignants = User::where('role', 'ENSEIGNANT')->get();
        $matieres = Matieres::all();

        if ($classes->isEmpty() || $enseignants->isEmpty() || $matieres->isEmpty()) {
            // Si pas assez de données, on utilise les factories
            EmploiDuTemps::factory()->count(10)->create();
            return;
        }

        $jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
        $heures = [
            ['08:00', '10:00'],
            ['10:00', '12:00'],
            ['15:00', '17:00'],
        ];

        foreach ($classes as $classe) {
            foreach ($jours as $jour) {
                // On crée 1 à 2 cours par jour par classe
                $nbCours = rand(1, 2);
                for ($i = 0; $i < $nbCours; $i++) {
                    EmploiDuTemps::create([
                        'jour' => $jour,
                        'heure_debut' => $heures[$i][0],
                        'heure_fin' => $heures[$i][1],
                        'salle' => 'Salle ' . rand(101, 205),
                        'id_classe' => $classe->id,
                        'id_enseignant' => $enseignants->random()->id,
                        'id_matiere' => $matieres->random()->id,
                    ]);
                }
            }
        }
    }
}