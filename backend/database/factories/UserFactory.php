<?php

namespace Database\Factories;

use App\Enums\RoleEnum;
use App\Models\Matieres;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Emails already generated during this factory run.
     *
     * @var string[]
     */
    protected static array $generatedEmails = [];

    /**
     * Full name combinations already used during this factory run.
     *
     * @var string[]
     */
    protected static array $generatedNames = [];

    /**
     * Common Senegalese first names.
     *
     * @var string[]
     */
    protected static array $senegaleseFirstNames = [
        'Abdou',
        'Aissatou',
        'Mariama',
        'Fatou',
        'Ousmane',
        'Cheikh',
        'Ndeye',
        'Adama',
        'Bassirou',
        'Khady',
        'Mame',
        'Astou',
        'Samba',
        'Coumba',
        'Amadou',
        'Binta',
        'Elhadj',
        'Rokhaya',
        'Ibrahima',
        'Sokhna',
    ];

    /**
     * Common Senegalese last names.
     *
     * @var string[]
     */
    protected static array $senegaleseLastNames = [
        'Diop',
        'Ndiaye',
        'Sarr',
        'Ba',
        'Sow',
        'Fall',
        'Diallo',
        'Kane',
        'Cisse',
        'Faye',
        'Seck',
        'Thiam',
        'Gueye',
        'Diagne',
        'Niang',
        'Kebe',
        'Ndoye',
        'Sy',
        'Lo',
        'Toure',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $roleEnum = fake()->randomElement(RoleEnum::cases());
        $role = $roleEnum->value;
        ['prenom' => $prenom, 'nom' => $nom] = $this->generateUniqueName();

        $data = [
            'nom' => $nom,
            'prenom' => $prenom,
            'password' => static::$password ??= Hash::make('password'),
            'telephone' => fake()->numerify('##########'),
            'adresse' => fake()->address(),
            'role' => $role,
            'statut' => $roleEnum->value,
            'actif' => true,
        ];

        if (Schema::hasColumn('users', 'name')) {
            $data['name'] = "{$data['prenom']} {$data['nom']}";
        }

        return $data;
    }

    public function configure(): static
    {
        return $this->afterMaking(function (User $user): void {
            if (empty($user->email)) {
                $user->email = $this->generateEmail($user->prenom, $user->nom);
            }
        });
    }

    private function generateEmail(string $prenom, string $nom): string
    {
        $base = Str::of("{$prenom}.{$nom}")
            ->lower()
            ->ascii()
            ->replaceMatches('/[^a-z0-9\.]/', '')
            ->replace('..', '.')
            ->trim('.');

        $domain = 'saytu.test';
        $email = "{$base}@{$domain}";
        $counter = 1;

        while ($this->emailExists($email)) {
            $email = "{$base}{$counter}@{$domain}";
            $counter++;
        }

        static::$generatedEmails[] = $email;

        return $email;
    }

    private function emailExists(string $email): bool
    {
        if (in_array($email, static::$generatedEmails, true)) {
            return true;
        }

        // If the users table doesn't exist yet (during some migrate/fresh flows),
        // avoid querying it — treat as non-existing to let the seeder proceed.
        if (! Schema::hasTable('users')) {
            return false;
        }

        try {
            return User::withTrashed()->where('email', $email)->exists();
        } catch (\Throwable $e) {
            return false;
        }
    }

    private function generateUniqueName(): array
    {
        $attempts = 0;

        do {
            $prenom = fake()->randomElement(self::$senegaleseFirstNames);
            $nom = fake()->randomElement(self::$senegaleseLastNames);
            $key = "{$prenom}.{$nom}";
            $attempts++;

            // If we've tried many random combinations, fall back to a deterministic
            // suffix strategy to guarantee uniqueness instead of throwing.
            if ($attempts > 1000) {
                $basePrenom = $prenom;
                $baseNom = $nom;
                $suffix = 1;

                // Increment suffix until a unique combination is found.
                while ($this->nameExists($basePrenom, $baseNom . $suffix) || in_array("{$basePrenom}.{$baseNom}{$suffix}", static::$generatedNames, true)) {
                    $suffix++;
                    if ($suffix > 10000) {
                        throw new \RuntimeException('Impossible de générer un nom d’utilisateur unique.');
                    }
                }

                $prenom = $basePrenom;
                $nom = $baseNom . $suffix;
                $key = "{$prenom}.{$nom}";
                break;
            }
        } while ($this->nameExists($prenom, $nom) || in_array($key, static::$generatedNames, true));

        static::$generatedNames[] = $key;

        return ['prenom' => $prenom, 'nom' => $nom];
    }

    private function nameExists(string $prenom, string $nom): bool
    {
        // Guard against running before migrations have created the users table.
        if (! Schema::hasTable('users')) {
            return false;
        }

        try {
            return User::withTrashed()
                ->where('prenom', $prenom)
                ->where('nom', $nom)
                ->exists();
        } catch (\Throwable $e) {
            return false;
        }
    }

    public function superAdmin(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => RoleEnum::SUPER_ADMIN->value,
            'statut' => RoleEnum::SUPER_ADMIN->value,
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => RoleEnum::ADMIN->value,
            'statut' => RoleEnum::ADMIN->value,
        ]);
    }

    /**
     * Specialties available for teacher generation.
     *
     * @var string[]
     */
    protected static array $availableSpecialites = [];

    private static function refreshAvailableSpecialites(): void
    {
        static::$availableSpecialites = Matieres::query()
            ->inRandomOrder()
            ->pluck('nom_matiere')
            ->all();

        if (empty(static::$availableSpecialites)) {
            static::ensureDefaultMatieres();

            static::$availableSpecialites = Matieres::query()
                ->inRandomOrder()
                ->pluck('nom_matiere')
                ->all();
        }
    }

    private static function ensureDefaultMatieres(): void
    {
        $defaultMatieres = [
            ['nom_matiere' => 'Mathématiques', 'coefficient' => 6, 'description' => 'Algèbre, géométrie et raisonnement mathématique.'],
            ['nom_matiere' => 'Français', 'coefficient' => 5, 'description' => 'Expression écrite, orale et analyse littéraire.'],
            ['nom_matiere' => 'Histoire-Géo', 'coefficient' => 3, 'description' => 'Histoire, géographie et éducation civique.'],
            ['nom_matiere' => 'SVT', 'coefficient' => 4, 'description' => 'Sciences de la vie et de la terre.'],
            ['nom_matiere' => 'Physique-Chimie', 'coefficient' => 4, 'description' => 'Physique et chimie appliquées.'],
            ['nom_matiere' => 'Anglais', 'coefficient' => 3, 'description' => 'Communication et compréhension en anglais.'],
            ['nom_matiere' => 'EPS', 'coefficient' => 2, 'description' => 'Éducation physique et sportive.'],
            ['nom_matiere' => 'Philosophie', 'coefficient' => 2, 'description' => 'Analyse conceptuelle et réflexion critique.'],
            ['nom_matiere' => 'Informatique', 'coefficient' => 2, 'description' => 'Initiation aux outils numériques et algorithmes.'],
        ];

        foreach ($defaultMatieres as $matiere) {
            Matieres::query()->firstOrCreate(
                ['nom_matiere' => $matiere['nom_matiere']],
                $matiere
            );
        }
    }

    private static function pullSpecialite(): string
    {
        if (empty(static::$availableSpecialites)) {
            static::refreshAvailableSpecialites();
        }

        $index = array_rand(static::$availableSpecialites);
        $specialite = static::$availableSpecialites[$index];
        unset(static::$availableSpecialites[$index]);
        static::$availableSpecialites = array_values(static::$availableSpecialites);

        return $specialite;
    }

    public function enseignant(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => RoleEnum::ENSEIGNANT->value,
            'statut' => RoleEnum::ENSEIGNANT->value,
            'specialite' => self::pullSpecialite(),
            'date_embauche' => fake()->date(),
        ]);
    }

    public function eleve(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => RoleEnum::ELEVE->value,
            'statut' => RoleEnum::ELEVE->value,
            'date_naissance' => fake()->date('Y-m-d', '-10 years'),
            'telephone_parent' => fake()->numerify('##########'),
        ]);
    }
}
