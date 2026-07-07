<?php

namespace Database\Factories;

use App\Models\Classe;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClasseFactory extends Factory
{
    protected $model = Classe::class;

    protected static int $sequence = 0;

    protected static array $classNames = [
        'Seconde S A' => 'Seconde',
        'Seconde L A' => 'Seconde',
        'Seconde G A' => 'Seconde',
        'Première S A' => 'Première',
        'Première L A' => 'Première',
        'Première G A' => 'Première',
        'Terminale S A' => 'Terminale',
        'Terminale L A' => 'Terminale',
        'Terminale G A' => 'Terminale',
    ];

    protected function getDefaultAnneeScolaire(): string
    {
        return '2025-2026';
    }

    public function definition(): array
    {
        $anneeScolaire = $this->getDefaultAnneeScolaire();
        $classNames = array_keys(self::$classNames);
        $nom_classe = $classNames[static::$sequence % count($classNames)];
        static::$sequence++;

        return [
            'nom_classe' => $nom_classe,
            'niveau' => self::$classNames[$nom_classe],
            'annee_scolaire' => $anneeScolaire,
        ];
    }
}
