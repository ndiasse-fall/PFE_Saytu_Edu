<?php

namespace Tests\Feature;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SuperAdminApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_access_dashboard_metrics(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => RoleEnum::SUPER_ADMIN,
            'actif' => true,
        ]));

        User::factory()->create(['role' => RoleEnum::ADMIN]);
        User::factory()->create(['role' => RoleEnum::ENSEIGNANT]);
        User::factory()->create(['role' => RoleEnum::ELEVE]);

        $this->getJson('/api/superadmin/dashboard')
            ->assertOk()
            ->assertJsonPath('admins', 1)
            ->assertJsonPath('enseignants', 1)
            ->assertJsonPath('eleves', 1);
    }

    public function test_non_super_admin_cannot_access_superadmin_routes(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => RoleEnum::ADMIN,
            'actif' => true,
        ]));

        $this->getJson('/api/superadmin/dashboard')
            ->assertForbidden()
            ->assertJsonPath('message', 'Accès refusé: rôle non autorisé.');
    }

    public function test_super_admin_can_create_admin_with_legacy_payload(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => RoleEnum::SUPER_ADMIN,
            'actif' => true,
        ]));

        $response = $this->postJson('/api/superadmin/admins', [
            'name' => 'Awa Ndiaye',
            'email' => 'awa.admin@example.com',
            'password' => 'motdepasse123',
            'password_confirmation' => 'motdepasse123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('admin.email', 'awa.admin@example.com')
            ->assertJsonPath('admin.role', RoleEnum::ADMIN->value);

        $this->assertDatabaseHas('users', [
            'email' => 'awa.admin@example.com',
            'role' => RoleEnum::ADMIN->value,
            'statut' => RoleEnum::ADMIN->value,
        ]);

        $user = User::query()->where('email', 'awa.admin@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('motdepasse123', $user->password));
    }

    public function test_role_update_keeps_role_and_legacy_statut_in_sync(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => RoleEnum::SUPER_ADMIN,
            'actif' => true,
        ]));

        $user = User::factory()->create([
            'role' => RoleEnum::ELEVE,
            'statut' => RoleEnum::ELEVE->value,
        ]);

        $this->putJson("/api/superadmin/users/{$user->id}/role", [
            'statut' => RoleEnum::ENSEIGNANT->value,
        ])
            ->assertOk()
            ->assertJsonPath('user.role', RoleEnum::ENSEIGNANT->value)
            ->assertJsonPath('user.statut', RoleEnum::ENSEIGNANT->value);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'role' => RoleEnum::ENSEIGNANT->value,
            'statut' => RoleEnum::ENSEIGNANT->value,
        ]);
    }
}
