<?php

namespace Database\Factories;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

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
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $role = fake()->randomElement(RoleEnum::cases());
        
        $data = [
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName(),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'telephone' => fake()->numerify('##########'),
            'adresse' => fake()->address(),
            'role' => $role,
            'statut' => $role->value,
            'actif' => true,
        ];

        if (Schema::hasColumn('users', 'name')) {
            $data['name'] = "{$data['prenom']} {$data['nom']}";
        }

        return $data;
    }

    public function superAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => RoleEnum::SUPER_ADMIN,
            'statut' => RoleEnum::SUPER_ADMIN->value,
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => RoleEnum::ADMIN,
            'statut' => RoleEnum::ADMIN->value,
        ]);
    }

    public function enseignant(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => RoleEnum::ENSEIGNANT,
            'statut' => RoleEnum::ENSEIGNANT->value,
            'matricule_enseignant' => 'ENS-' . fake()->unique()->numberBetween(1000, 9999),
            'specialite' => fake()->word(),
            'date_embauche' => fake()->date(),
        ]);
    }

    public function eleve(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => RoleEnum::ELEVE,
            'statut' => RoleEnum::ELEVE->value,
            'matricule_eleve' => 'ELV-' . fake()->unique()->numberBetween(10000, 99999),
            'date_naissance' => fake()->date('Y-m-d', '-10 years'),
            'telephone_parent' => fake()->numerify('##########'),
        ]);
    }
}
