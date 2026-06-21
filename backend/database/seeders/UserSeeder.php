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
        // Création du Super Admin
        User::factory()->superAdmin()->create([
            'email' => 'superadmin@saytu.edu',
            'nom' => 'Sow',
            'prenom' => 'Abdou',
            'password' => Hash::make('password'),
        ]);

        // Création de quelques Admins
        User::factory()->admin()->count(2)->create();

        // Création des Enseignants
        User::factory()->enseignant()->count(10)->create();

        // Création des Élèves
        User::factory()->eleve()->count(50)->create();
    }
}
