<?php

namespace Database\Factories;

use App\Models\Matieres;
use App\Models\User;
use App\Models\UserMatiere;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserMatiereFactory extends Factory
{
    protected $model = UserMatiere::class;

    public function definition(): array
    {
        return [
            'id_user' => User::factory()->enseignant(),
            'id_matiere' => function (array $attributes) {
                $user = User::find($attributes['id_user']);
                return Matieres::where('nom_matiere', $user->specialite)->first()?->id
                    ?? Matieres::factory()->create(['nom_matiere' => $user->specialite])->id;
            },
        ];
    }
}
