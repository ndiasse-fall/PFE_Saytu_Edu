<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $this->upsertUserByEmail([
            'email' => 'superadmin@saytu.edu',
            'nom' => 'Sow',
            'prenom' => 'Abdou',
            'password' => Hash::make('password'),
            'telephone' => '770000000',
            'adresse' => 'Dakar',
            'role' => RoleEnum::SUPER_ADMIN->value,
            'statut' => RoleEnum::SUPER_ADMIN->value,
            'actif' => true,
        ]);

        $this->createMissingUsers(RoleEnum::ADMIN, 2);
        $this->createMissingUsers(RoleEnum::ENSEIGNANT, 10);
        $this->createMissingUsers(RoleEnum::ELEVE, 50);
    }

    /**
     * @param array<string, mixed> $attributes
     */
    private function upsertUserByEmail(array $attributes): User
    {
        $user = User::withTrashed()
            ->where('email', $attributes['email'])
            ->first();

        if (! $user) {
            return User::create($attributes);
        }

        $user->forceFill($attributes);

        if ($user->trashed()) {
            $user->restore();
        }

        $user->save();

        return $user;
    }

    private function createMissingUsers(RoleEnum $role, int $targetCount): void
    {
        $existingCount = User::query()
            ->where('role', $role->value)
            ->count();

        $missing = max(0, $targetCount - $existingCount);

        if ($missing === 0) {
            return;
        }

        $factory = User::factory();

        match ($role) {
            RoleEnum::ADMIN => $factory->admin()->count($missing)->create(),
            RoleEnum::ENSEIGNANT => $factory->enseignant()->count($missing)->create(),
            RoleEnum::ELEVE => $factory->eleve()->count($missing)->create(),
            default => null,
        };
    }
}