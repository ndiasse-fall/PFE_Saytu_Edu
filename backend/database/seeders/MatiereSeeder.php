<?php

namespace Database\Seeders;

use App\Models\Matieres;
use Illuminate\Database\Seeder;

class MatiereSeeder extends Seeder
{
    public function run(): void
    {
        $matieres = [
            ['nom_matiere' => 'Langage', 'coefficient' => 1, 'description' => 'Expression orale et éveil linguistique au préscolaire.'],
            ['nom_matiere' => 'Graphisme', 'coefficient' => 1, 'description' => 'Pré-écriture et motricité fine.'],
            ['nom_matiere' => 'Activités numériques', 'coefficient' => 1, 'description' => 'Premiers repères numériques.'],
            ['nom_matiere' => 'Découverte du monde', 'coefficient' => 1, 'description' => 'Observation de l’environnement proche.'],
            ['nom_matiere' => 'Français', 'coefficient' => 4, 'description' => 'Expression écrite, orale, grammaire et littérature.'],
            ['nom_matiere' => 'Mathématiques', 'coefficient' => 5, 'description' => 'Calcul, géométrie, algèbre et résolution de problèmes.'],
            ['nom_matiere' => 'Lecture', 'coefficient' => 3, 'description' => 'Compréhension et fluidité de lecture.'],
            ['nom_matiere' => 'Écriture', 'coefficient' => 2, 'description' => 'Production écrite et calligraphie.'],
            ['nom_matiere' => 'Sciences', 'coefficient' => 2, 'description' => 'Initiation scientifique et environnement.'],
            ['nom_matiere' => 'Histoire-Géographie', 'coefficient' => 3, 'description' => 'Histoire, géographie et repères civiques.'],
            ['nom_matiere' => 'Éducation civique', 'coefficient' => 2, 'description' => 'Citoyenneté, valeurs républicaines et vie collective.'],
            ['nom_matiere' => 'Anglais', 'coefficient' => 3, 'description' => 'Communication et compréhension anglaise.'],
            ['nom_matiere' => 'SVT', 'coefficient' => 3, 'description' => 'Sciences de la vie et de la terre.'],
            ['nom_matiere' => 'Physique-Chimie', 'coefficient' => 4, 'description' => 'Physique, chimie et travaux pratiques.'],
            ['nom_matiere' => 'Espagnol', 'coefficient' => 2, 'description' => 'Langue vivante optionnelle.'],
            ['nom_matiere' => 'Arabe', 'coefficient' => 2, 'description' => 'Langue arabe optionnelle.'],
            ['nom_matiere' => 'Informatique', 'coefficient' => 2, 'description' => 'Culture numérique et algorithmique.'],
            ['nom_matiere' => 'Philosophie', 'coefficient' => 3, 'description' => 'Argumentation et réflexion critique.'],
            ['nom_matiere' => 'Économie', 'coefficient' => 3, 'description' => 'Notions économiques et sociales.'],
            ['nom_matiere' => 'EPS', 'coefficient' => 2, 'description' => 'Éducation physique et sportive.'],
        ];

        foreach ($matieres as $matiere) {
            Matieres::query()->updateOrCreate(
                ['nom_matiere' => $matiere['nom_matiere']],
                $matiere
            );
        }
    }
}
