<?php

namespace Tests\Feature;

use App\Models\Absence;
use App\Models\Classe;
use App\Models\Matieres;
use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BulletinApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_bulletin_uses_class_subjects_real_notes_and_absences(): void
    {
        $admin = User::factory()->admin()->create(['actif' => true]);
        Sanctum::actingAs($admin);

        $classe = Classe::factory()->create(['nom_classe' => 'CM2 A', 'niveau' => 'Primaire']);
        $eleve = User::factory()->eleve()->create([
            'nom' => 'Ndiaye',
            'prenom' => 'Abdoulaye',
            'actif' => true,
        ]);
        $classe->eleves()->attach($eleve->id);

        $francais = Matieres::factory()->create(['nom_matiere' => 'Français', 'coefficient' => 4]);
        $philosophie = Matieres::factory()->create(['nom_matiere' => 'Philosophie', 'coefficient' => 3]);
        $classe->matieres()->sync([$francais->id]);

        Note::factory()->create([
            'id_eleve' => $eleve->id,
            'id_classe' => $classe->id,
            'id_matiere' => $francais->id,
            'type_evaluation' => 'Devoir 1',
            'periode' => 'Semestre 1',
            'valeur' => 14,
        ]);
        Note::factory()->create([
            'id_eleve' => $eleve->id,
            'id_classe' => $classe->id,
            'id_matiere' => $philosophie->id,
            'type_evaluation' => 'Devoir 1',
            'periode' => 'Semestre 1',
            'valeur' => 20,
        ]);
        Absence::factory()->create([
            'id_eleve' => $eleve->id,
            'date_absence' => '2026-06-10',
            'est_justifiee' => true,
        ]);

        $this->getJson("/api/bulletins/{$eleve->id}?periode=Semestre%201")
            ->assertOk()
            ->assertJsonPath('eleve.nom', 'Ndiaye')
            ->assertJsonPath('classe.nom', 'CM2 A')
            ->assertJsonPath('matieres.0.nom_matiere', 'Français')
            ->assertJsonCount(1, 'matieres')
            ->assertJsonPath('moyenne_generale', 14)
            ->assertJsonPath('total_coef', 4)
            ->assertJsonPath('absences.total', 1)
            ->assertJsonPath('absences.justifiees', 1);
    }
}
