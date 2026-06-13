<?php

namespace Tests\Feature;

use App\Enums\RoleEnum;
use App\Models\Classe;
use App\Models\Matiere;
use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NoteApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_enseignant_can_saisir_and_update_notes_for_his_class(): void
    {
        $enseignant = User::factory()->create([
            'role' => RoleEnum::ENSEIGNANT,
            'actif' => true,
        ]);
        Sanctum::actingAs($enseignant);

        $classe = Classe::query()->create([
            'nom_classe' => '6e A',
            'niveau' => '6e',
            'annee_scolaire' => '2026-2027',
        ]);
        $matiere = Matiere::query()->create([
            'nom_matiere' => 'Mathématiques',
            'coefficient' => 4,
            'description' => 'Module de base',
        ]);

        $eleve = User::factory()->create([
            'role' => RoleEnum::ELEVE,
            'actif' => true,
        ]);

        $classe->enseignants()->attach($enseignant->id);
        $classe->eleves()->attach($eleve->id);

        $this->postJson('/api/notes/saisir', [
            'id_classe' => $classe->id,
            'id_matiere' => $matiere->id,
            'type_evaluation' => 'Devoir',
            'periode' => 'Trimestre 1',
            'notes' => [
                [
                    'id_eleve' => $eleve->id,
                    'valeur' => 14.5,
                ],
            ],
        ])
            ->assertCreated()
            ->assertJsonPath('data.0.id_eleve', $eleve->id)
            ->assertJsonPath('data.0.id_classe', $classe->id)
            ->assertJsonPath('data.0.id_matiere', $matiere->id)
            ->assertJsonPath('data.0.valeur', 14.5);

        $this->assertDatabaseHas('notes', [
            'id_eleve' => $eleve->id,
            'id_classe' => $classe->id,
            'id_matiere' => $matiere->id,
            'type_evaluation' => 'Devoir',
            'periode' => 'Trimestre 1',
        ]);

        $this->postJson('/api/notes/saisir', [
            'id_classe' => $classe->id,
            'id_matiere' => $matiere->id,
            'type_evaluation' => 'Devoir',
            'periode' => 'Trimestre 1',
            'notes' => [
                [
                    'id_eleve' => $eleve->id,
                    'valeur' => 17,
                ],
            ],
        ])
            ->assertCreated()
            ->assertJsonPath('data.0.valeur', 17);

        $this->assertSame(1, Note::query()->count());
        $this->assertDatabaseHas('notes', [
            'id_eleve' => $eleve->id,
            'valeur' => 17,
        ]);
    }

    public function test_enseignant_cannot_saisir_notes_for_unassigned_class(): void
    {
        $enseignant = User::factory()->create([
            'role' => RoleEnum::ENSEIGNANT,
            'actif' => true,
        ]);
        Sanctum::actingAs($enseignant);

        $classe = Classe::query()->create([
            'nom_classe' => '5e B',
            'niveau' => '5e',
            'annee_scolaire' => '2026-2027',
        ]);
        $matiere = Matiere::query()->create([
            'nom_matiere' => 'Français',
            'coefficient' => 3,
            'description' => 'Expression écrite',
        ]);
        $eleve = User::factory()->create([
            'role' => RoleEnum::ELEVE,
            'actif' => true,
        ]);
        $classe->eleves()->attach($eleve->id);

        $this->postJson('/api/notes/saisir', [
            'id_classe' => $classe->id,
            'id_matiere' => $matiere->id,
            'type_evaluation' => 'Examen',
            'periode' => 'Semestre 1',
            'notes' => [
                [
                    'id_eleve' => $eleve->id,
                    'valeur' => 12,
                ],
            ],
        ])
            ->assertForbidden()
            ->assertJsonPath('message', 'Accès refusé: vous n\'êtes pas affecté à cette classe.');
    }

    public function test_cannot_saisir_note_for_student_outside_the_class(): void
    {
        $enseignant = User::factory()->create([
            'role' => RoleEnum::ENSEIGNANT,
            'actif' => true,
        ]);
        Sanctum::actingAs($enseignant);

        $classe = Classe::query()->create([
            'nom_classe' => '4e C',
            'niveau' => '4e',
            'annee_scolaire' => '2026-2027',
        ]);
        $matiere = Matiere::query()->create([
            'nom_matiere' => 'SVT',
            'coefficient' => 2,
            'description' => 'Sciences',
        ]);
        $eleve = User::factory()->create([
            'role' => RoleEnum::ELEVE,
            'actif' => true,
        ]);

        $classe->enseignants()->attach($enseignant->id);

        $this->postJson('/api/notes/saisir', [
            'id_classe' => $classe->id,
            'id_matiere' => $matiere->id,
            'type_evaluation' => 'Interrogation',
            'periode' => 'Trimestre 2',
            'notes' => [
                [
                    'id_eleve' => $eleve->id,
                    'valeur' => 15,
                ],
            ],
        ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Certains élèves ne sont pas inscrits dans cette classe.')
            ->assertJsonPath('invalid_eleve_ids.0', $eleve->id);
    }

    public function test_enseignant_can_view_notes_of_student_in_his_class(): void
    {
        $enseignant = User::factory()->enseignant()->create(['actif' => true]);
        Sanctum::actingAs($enseignant);

        $classe = Classe::factory()->create();
        $classe->enseignants()->attach($enseignant->id);

        $eleve = User::factory()->eleve()->create(['actif' => true]);
        $classe->eleves()->attach($eleve->id);

        $note = Note::factory()->create([
            'id_eleve' => $eleve->id,
            'id_classe' => $classe->id,
            'valeur' => 18
        ]);

        $response = $this->getJson("/api/notes?id_eleve={$eleve->id}");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.valeur', 18);
    }

    public function test_enseignant_cannot_view_notes_of_student_outside_his_classes(): void
    {
        $enseignant = User::factory()->enseignant()->create(['actif' => true]);
        Sanctum::actingAs($enseignant);

        $autreClasse = Classe::factory()->create();
        $eleve = User::factory()->eleve()->create(['actif' => true]);
        $autreClasse->eleves()->attach($eleve->id);

        $note = Note::factory()->create([
            'id_eleve' => $eleve->id,
            'id_classe' => $autreClasse->id,
            'valeur' => 10
        ]);

        $response = $this->getJson("/api/notes?id_eleve={$eleve->id}");

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }
}