<?php

namespace Database\Seeders;

use App\Models\Matieres;
use Illuminate\Database\Seeder;

class MatiereSeeder extends Seeder
{
    public function run(): void
    {
        Matieres::factory()->count(8)->create();
    }
}