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

class EleveApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_eleve_can_view_his_bulletin()
    {
        $eleve = User::factory()->create([
            'role' => RoleEnum::ELEVE,
            'actif' => true,
        ]);
        Sanctum::actingAs($eleve);

        $classe = Classe::factory()->create();
        $matiere = Matiere::factory()->create(['coefficient' => 2]);
        
        Note::factory()->create([
            'id_eleve' => $eleve->id,
            'id_classe' => $classe->id,
            'id_matiere' => $matiere->id,
            'valeur' => 16,
        ]);

        $response = $this->getJson('/api/mon-bulletin');

        $response->assertOk()
            ->assertJsonPath('moyenne_generale', 16)
            ->assertJsonCount(1, 'notes');
    }

    public function test_eleve_cannot_view_other_student_notes_via_direct_id()
    {
        $eleve = User::factory()->eleve()->create(['actif' => true]);
        $autreEleve = User::factory()->eleve()->create(['actif' => true]);
        Sanctum::actingAs($eleve);

        $note = Note::factory()->create(['id_eleve' => $autreEleve->id]);

        $response = $this->getJson("/api/notes/{$note->id}");

        $response->assertStatus(404);
    }
}
