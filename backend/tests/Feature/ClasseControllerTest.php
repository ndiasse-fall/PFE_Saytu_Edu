<?php

namespace Tests\Feature;

use App\Models\Classe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClasseControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->superAdmin()->create());
    }

    public function test_can_list_classes()
    {
        Classe::factory()->count(3)->create();

        $response = $this->getJson('/api/classes');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_can_create_classe()
    {
        $data = [
            'nom_classe' => '6ème A',
            'niveau' => 'Collège',
            'annee_scolaire' => '2025-2026',
        ];

        $response = $this->postJson('/api/classes', $data);

        $response->assertStatus(201)
                 ->assertJsonPath('nom_classe', '6ème A');
        
        $this->assertDatabaseHas('classes', ['nom_classe' => '6ème A']);
    }

    public function test_can_show_classe()
    {
        $classe = Classe::factory()->create();

        $response = $this->getJson("/api/classes/{$classe->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('id', $classe->id);
    }

    public function test_can_update_classe()
    {
        $classe = Classe::factory()->create(['nom_classe' => 'Old Name']);

        $response = $this->putJson("/api/classes/{$classe->id}", ['nom_classe' => 'New Name']);

        $response->assertStatus(200)
                 ->assertJsonPath('nom_classe', 'New Name');
    }

    public function test_can_delete_classe()
    {
        $classe = Classe::factory()->create();

        $response = $this->deleteJson("/api/classes/{$classe->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('classes', ['id' => $classe->id]);
    }

    public function test_can_inscrire_eleve()
    {
        $classe = Classe::factory()->create();
        $eleve = User::factory()->eleve()->create();

        $response = $this->postJson("/api/classes/{$classe->id}/inscrire-eleve", [
            'id_eleve' => $eleve->id
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('classe_eleve', [
            'id_classe' => $classe->id,
            'id_eleve' => $eleve->id
        ]);
    }

    public function test_can_affecter_enseignant()
    {
        $classe = Classe::factory()->create();
        $enseignant = User::factory()->enseignant()->create();

        $response = $this->postJson("/api/classes/{$classe->id}/affecter-enseignant", [
            'id_enseignant' => $enseignant->id
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('classe_enseignant', [
            'id_classe' => $classe->id,
            'id_enseignant' => $enseignant->id
        ]);
    }

    public function test_super_admin_can_list_all_classes_and_students_for_any_class(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $this->actingAs($superAdmin);

        $classeA = Classe::factory()->create(['niveau' => 'Collège', 'nom_classe' => '6A']);
        $classeB = Classe::factory()->create(['niveau' => 'Collège', 'nom_classe' => '5B']);
        $eleve = User::factory()->eleve()->create(['prenom' => 'Amina', 'nom' => 'Diallo']);
        $classeA->eleves()->attach($eleve->id);

        $response = $this->getJson('/api/mes-classes');
        $response->assertOk()
            ->assertJsonFragment(['id' => $classeA->id])
            ->assertJsonFragment(['id' => $classeB->id]);

        $studentsResponse = $this->getJson("/api/mes-classes/{$classeA->id}/eleves");
        $studentsResponse->assertOk()
            ->assertJsonFragment(['id' => $eleve->id]);
    }
}
