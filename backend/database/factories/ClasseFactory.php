<?php

namespace Database\Factories;

use App\Models\Classe;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClasseFactory extends Factory
{
    protected $model = Classe::class;

    protected static array $classNames = [
        '2nde L A' => 'Seconde',
        '2nde L B' => 'Seconde',
        '2nde L C' => 'Seconde',
        '2nde L D' => 'Seconde',
        '2nde S A' => 'Seconde',
        '2nde S B' => 'Seconde',
        '2nde S C' => 'Seconde',
        '1ère L1 A' => 'Première',
        '1ère L1 B' => 'Première',
        '1ère L2 A' => 'Première',
        '1ère L2 B' => 'Première',
        '1ère S1' => 'Première',
        '1ère S2 A' => 'Première',
        '1ère S2 B' => 'Première',
        'Tle L1 A' => 'Terminale',
        'Tle L1 B' => 'Terminale',
        'Tle L2 A' => 'Terminale',
        'Tle L2 B' => 'Terminale',
        'Tle S1' => 'Terminale',
        'Tle S2 A' => 'Terminale',
        'Tle S2 B' => 'Terminale',
    ];

    protected static array $availableClassNames = [];

    protected function getDefaultAnneeScolaire(): string
    {
        return '2025-2026';
    }

    protected function resetAvailableClassNames(string $anneeScolaire): void
    {
        $usedClassNames = Classe::query()
            ->where('annee_scolaire', $anneeScolaire)
            ->pluck('nom_classe')
            ->all();

        static::$availableClassNames = array_values(array_diff(array_keys(self::$classNames), $usedClassNames));
    }

    public function definition(): array
    {
        $anneeScolaire = $this->getDefaultAnneeScolaire();

        if (empty(static::$availableClassNames)) {
            $this->resetAvailableClassNames($anneeScolaire);
        }

        if (empty(static::$availableClassNames)) {
            static::$availableClassNames = array_keys(self::$classNames);
        }

        $index = array_rand(static::$availableClassNames);
        $nom_classe = static::$availableClassNames[$index];
        unset(static::$availableClassNames[$index]);
        static::$availableClassNames = array_values(static::$availableClassNames);

        return [
            'nom_classe' => $nom_classe,
            'niveau' => self::$classNames[$nom_classe],
            'annee_scolaire' => $anneeScolaire,
        ];
    }
}
