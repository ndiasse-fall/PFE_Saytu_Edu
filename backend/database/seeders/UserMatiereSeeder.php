<?php

namespace Database\Seeders;

use App\Models\Matieres;
use App\Models\User;
use Illuminate\Database\Seeder;

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
            // Assigne uniquement la matière correspondant à la spécialité de l'enseignant
            $matiere = Matieres::where('nom_matiere', $enseignant->specialite)->first();
            if ($matiere) {
                $enseignant->matieres()->syncWithoutDetaching([$matiere->id]);
            }
        }
    }
}
