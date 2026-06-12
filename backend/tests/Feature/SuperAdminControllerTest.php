<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperAdminControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->superAdmin()->create());
    }

    public function test_can_view_dashboard_stats()
    {
        User::factory()->admin()->count(2)->create();
        User::factory()->enseignant()->count(3)->create();
        User::factory()->eleve()->count(5)->create();

        $response = $this->getJson('/api/superadmin/dashboard');

        $response->assertStatus(200)
            ->assertJson([
                'admins' => 2,
                'enseignants' => 3,
                'eleves' => 5,
            ]);
    }

    public function test_can_store_admin()
    {
        // Adjust these values based on your Form Request's authorize() logic!
        $superAdmin = User::factory()->superAdmin()->create();

        $data = [
            'nom' => 'User',
            'prenom' => 'Admin',
            'email' => 'admin@test.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'ADMIN',
        ];

        $response = $this->actingAs($superAdmin)
            ->postJson('/api/superadmin/admins', $data);

        $response->assertStatus(201)
            ->assertJsonPath('admin.statut', 'ADMIN');
    }
    public function test_can_update_user_role()
    {
        $user = User::factory()->eleve()->create();

        $response = $this->putJson("/api/superadmin/users/{$user->id}/role", [
            'statut' => 'ENSEIGNANT'
        ]);

        $response->assertStatus(200);
        $this->assertEquals('ENSEIGNANT', $user->fresh()->statut);
    }
}