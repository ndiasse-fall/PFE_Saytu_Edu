<?php

namespace Database\Factories;

use App\Models\EmploiDuTemps;
use App\Models\Classe;
use App\Models\User;
use App\Models\Matiere;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmploiDuTempsFactory extends Factory
{
    protected $model = EmploiDuTemps::class;

    public function definition(): array
    {
        $jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        return [
            'jour' => fake()->randomElement($jours),
            'heure_debut' => fake()->time('H:i', '12:00'),
            'heure_fin' => fake()->time('H:i', '18:00'),
            'salle' => fake()->bothify('Salle ###'),
            'id_classe' => Classe::factory(),
            'id_enseignant' => User::factory()->enseignant(),
            'id_matiere' => Matiere::factory(),
        ];
    }
}
