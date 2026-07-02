<?php

namespace Database\Factories;

use App\Models\Matieres;
use Illuminate\Database\Eloquent\Factories\Factory;

class MatieresFactory extends Factory
{
    protected $model = Matieres::class;

    protected static array $subjects = [
        ['nom_matiere' => 'Mathématiques', 'coefficient' => 6, 'description' => 'Algèbre, géométrie et raisonnement mathématique.'],
        ['nom_matiere' => 'Français', 'coefficient' => 5, 'description' => 'Expression écrite, orale et analyse littéraire.'],
        ['nom_matiere' => 'Histoire-Géo', 'coefficient' => 3, 'description' => 'Histoire, géographie et éducation civique.'],
        ['nom_matiere' => 'SVT', 'coefficient' => 4, 'description' => 'Sciences de la vie et de la terre.'],
        ['nom_matiere' => 'Physique-Chimie', 'coefficient' => 4, 'description' => 'Physique et chimie appliquées.'],
        ['nom_matiere' => 'Anglais', 'coefficient' => 3, 'description' => 'Communication et compréhension en anglais.'],
        ['nom_matiere' => 'Philosophie', 'coefficient' => 2, 'description' => 'Analyse conceptuelle et réflexion critique.'],
        ['nom_matiere' => 'EPS', 'coefficient' => 2, 'description' => 'Éducation physique et sportive.'],
        ['nom_matiere' => 'Informatique', 'coefficient' => 2, 'description' => 'Initiation aux outils numériques et algorithmes.'],
    ];

    protected static array $availableSubjects = [];

    public function definition(): array
    {
        if (empty(static::$availableSubjects)) {
            static::$availableSubjects = self::$subjects;
        }

        $index = array_rand(static::$availableSubjects);
        $subject = static::$availableSubjects[$index];
        unset(static::$availableSubjects[$index]);
        static::$availableSubjects = array_values(static::$availableSubjects);

        return $subject;
    }
}
