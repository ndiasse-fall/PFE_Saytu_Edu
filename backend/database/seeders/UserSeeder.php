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
        User::query()
            ->where('role', RoleEnum::SUPER_ADMIN->value)
            ->where('email', '!=', env('SUPER_ADMIN_EMAIL', 'superadmin@saytu.edu'))
            ->update([
                'role' => RoleEnum::ADMIN->value,
                'statut' => RoleEnum::ADMIN->value,
            ]);

        User::updateOrCreate(
            ['email' => env('SUPER_ADMIN_EMAIL', 'superadmin@saytu.edu')],
            [
                'nom' => env('SUPER_ADMIN_NOM', 'Sow'),
                'prenom' => env('SUPER_ADMIN_PRENOM', 'Abdou'),
                'password' => Hash::make(env('SUPER_ADMIN_PASSWORD', 'password')),
                'role' => RoleEnum::SUPER_ADMIN,
                'statut' => RoleEnum::SUPER_ADMIN->value,
                'actif' => true,
            ]
        );

        User::factory()->admin()->count(2)->create();
        User::factory()->enseignant()->count(10)->create();
        User::factory()->eleve()->count(50)->create();
    }
}
