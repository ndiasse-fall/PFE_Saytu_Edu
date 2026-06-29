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
        $roleEnum = fake()->randomElement(RoleEnum::cases());
        $role = $roleEnum->value;
        $data = [
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName(),
            'email' => fake()->unique()->safeEmail(),
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

    public function enseignant(): static
    {
        return $this->state(fn(array $attributes) => [
            'role' => RoleEnum::ENSEIGNANT->value,
            'statut' => RoleEnum::ENSEIGNANT->value,
            'specialite' => fake()->word(),
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
