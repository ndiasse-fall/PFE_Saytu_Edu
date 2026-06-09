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
        $data = [
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName(),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'telephone' => fake()->numerify('##########'),
            'adresse' => fake()->address(),
            'role' => fake()->randomElement(RoleEnum::cases()),
            'actif' => true,
        ];

        if (Schema::hasColumn('users', 'name')) {
            $data['name'] = fn (array $attributes): string => "{$attributes['prenom']} {$attributes['nom']}";
        }

        if (Schema::hasColumn('users', 'statut')) {
            $data['statut'] = fn (array $attributes): string => $attributes['role'] instanceof RoleEnum
                ? $attributes['role']->value
                : (string) $attributes['role'];
        }

        return $data;
    }
}
