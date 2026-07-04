<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            MatiereSeeder::class,
            ClasseSeeder::class,
            ClasseMatiereSeeder::class,
            UserSeeder::class,
            UserMatiereSeeder::class,
            EmploiDuTempsSeeder::class,
        ]);
    }
}
