<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $attributes = [
            'nom' => 'Admin',
            'prenom' => 'Saytou',
            'email' => 'superadmin@saytou.com',
            'password' => Hash::make('super admin'),
            'role' => \App\Enums\RoleEnum::SUPER_ADMIN,
            'actif' => true,
        ];

        if (Schema::hasColumn('users', 'name')) {
            $attributes['name'] = 'Saytou Admin';
        }

        User::query()->updateOrCreate(
            ['role' => \App\Enums\RoleEnum::SUPER_ADMIN],
            $attributes,
        );
    }
}
