<?php

namespace Tests\Feature;

use App\Models\Matieres;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatiereControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->superAdmin()->create());
    }

    public function test_can_list_matieres()
    {
        Matieres::factory()->count(3)->create();

        $response = $this->getJson('/api/matieres');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_can_create_matiere()
    {
        $data = [
            'nom_matiere' => 'Maths',
            'coefficient' => 4,
            'description' => 'Cours de maths',
        ];

        $response = $this->postJson('/api/matieres', $data);

        $response->assertStatus(201)
            ->assertJsonPath('nom_matiere', 'Maths');
    }

    public function test_can_delete_matiere()
    {
        $matiere = Matieres::factory()->create();

        $response = $this->deleteJson("/api/matieres/{$matiere->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('matieres', ['id' => $matiere->id]);
    }
}
