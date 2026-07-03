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
        $this->createMissingUsers(RoleEnum::ELEVE, 100);
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

        // Create exactly the missing number of users while avoiding duplicates.
        // Some environments may run seeders multiple times; ensure idempotence by
        // checking for existing emails before creating new records.
        $created = 0;
        $attempts = 0;
        $maxAttempts = max(1000, $missing * 10);

        while ($created < $missing && $attempts < $maxAttempts) {
            $attempts++;

            $user = match ($role) {
                RoleEnum::ADMIN => User::factory()->admin()->make(),
                RoleEnum::ENSEIGNANT => User::factory()->enseignant()->make(),
                RoleEnum::ELEVE => User::factory()->eleve()->make(),
                default => User::factory()->make(),
            };

            // If an identical email already exists, skip and continue.
            if (User::withTrashed()->where('email', $user->email)->exists()) {
                continue;
            }

            // Persist the user using only attributes declared in `$fillable`
            // to ensure relations or appended attributes (eg. `classes`) are not
            // accidentally inserted as columns.
            $fillable = (new User())->getFillable();
            $attrs = array_intersect_key($user->getAttributes(), array_flip($fillable));
            User::create($attrs);
            $created++;
        }

        if ($created < $missing) {
            // As a fallback, use factory bulk create for remaining (should be rare).
            $remaining = $missing - $created;
            if ($remaining > 0) {
                match ($role) {
                    RoleEnum::ADMIN => User::factory()->admin()->count($remaining)->create(),
                    RoleEnum::ENSEIGNANT => User::factory()->enseignant()->count($remaining)->create(),
                    RoleEnum::ELEVE => User::factory()->eleve()->count($remaining)->create(),
                    default => null,
                };
            }
        }
    }
}