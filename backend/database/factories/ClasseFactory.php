<?php

namespace Database\Factories;

use App\Models\Classe;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClasseFactory extends Factory
{
    protected $model = Classe::class;

    protected static array $classNames = [
        'PS A' => 'Préscolaire',
        'MS A' => 'Préscolaire',
        'GS A' => 'Préscolaire',
        'CI A' => 'Primaire',
        'CP A' => 'Primaire',
        'CE1 A' => 'Primaire',
        'CE2 A' => 'Primaire',
        'CM1 A' => 'Primaire',
        'CM2 A' => 'Primaire',
        '6ème A' => 'Collège',
        '5ème A' => 'Collège',
        '4ème A' => 'Collège',
        '3ème A' => 'Collège',
        'Seconde A' => 'Lycée',
        'Première A' => 'Lycée',
        'Terminale A' => 'Lycée',
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
