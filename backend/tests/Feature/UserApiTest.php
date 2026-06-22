<?php

namespace Tests\Feature;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserApiTest extends TestCase
{
    use RefreshDatabase;

    private function authenticate(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => RoleEnum::SUPER_ADMIN,
            'actif' => true,
        ]));
    }

    public function test_can_create_user(): void
    {
        $this->authenticate();

        $response = $this->postJson('/api/users', [
            'nom' => 'Diallo',
            'prenom' => 'Aminata',
            'email' => 'aminata@example.com',
            'password' => 'motdepasse123',
            'telephone' => '770000000',
            'adresse' => 'Dakar',
            'role' => RoleEnum::ENSEIGNANT->value,
            'actif' => true,
            'matricule_enseignant' => 'ENS-2026-001',
            'specialite' => 'Mathematiques',
            'date_embauche' => '2026-01-15',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.nom', 'Diallo')
            ->assertJsonPath('data.prenom', 'Aminata')
            ->assertJsonPath('data.email', 'aminata@example.com')
            ->assertJsonPath('data.role', RoleEnum::ENSEIGNANT->value)
            ->assertJsonPath('data.actif', true);

        $this->assertDatabaseHas('users', [
            'email' => 'aminata@example.com',
            'role' => RoleEnum::ENSEIGNANT->value,
        ]);

        $user = User::where('email', 'aminata@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('motdepasse123', $user->password));
    }

    public function test_can_list_users_with_filters(): void
    {
        $this->authenticate();

        User::factory()->create([
            'nom' => 'Fall',
            'prenom' => 'Moussa',
            'role' => RoleEnum::ADMIN,
            'actif' => true,
        ]);

        User::factory()->create([
            'nom' => 'Ndiaye',
            'prenom' => 'Awa',
            'role' => RoleEnum::ELEVE,
            'actif' => false,
        ]);

        $response = $this->getJson('/api/users?search=Fall&role=ADMIN&actif=1');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.nom', 'Fall')
            ->assertJsonPath('data.0.role', RoleEnum::ADMIN->value);
    }

    public function test_can_load_dashboard_summary_in_one_request(): void
    {
        $this->authenticate();

        User::factory()->admin()->count(2)->create();
        User::factory()->enseignant()->count(6)->create();
        User::factory()->eleve()->count(3)->create();

        $this->getJson('/api/dashboard/users-summary')
            ->assertOk()
            ->assertJsonPath('counts.total', 12)
            ->assertJsonPath('counts.admins', 2)
            ->assertJsonPath('counts.enseignants', 6)
            ->assertJsonPath('counts.eleves', 3)
            ->assertJsonPath('counts.actifs', 12)
            ->assertJsonPath('counts.inactifs', 0)
            ->assertJsonCount(5, 'recent_teachers');
    }

    public function test_can_show_user(): void
    {
        $this->authenticate();

        $user = User::factory()->create([
            'nom' => 'Ba',
            'prenom' => 'Fatou',
            'role' => RoleEnum::ELEVE,
        ]);

        $this->getJson("/api/users/{$user->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.nom', 'Ba')
            ->assertJsonPath('data.role', RoleEnum::ELEVE->value);
    }

    public function test_can_update_user(): void
    {
        $this->authenticate();

        $user = User::factory()->create([
            'email' => 'old@example.com',
            'password' => Hash::make('ancienpass'),
            'role' => RoleEnum::ELEVE,
        ]);

        $response = $this->putJson("/api/users/{$user->id}", [
            'nom' => 'Sow',
            'prenom' => 'Ibrahima',
            'email' => 'new@example.com',
            'password' => 'nouveaupass123',
            'role' => RoleEnum::ENSEIGNANT->value,
            'actif' => false,
            'matricule_enseignant' => 'ENS-2026-002',
            'specialite' => 'Physique',
            'date_embauche' => '2026-02-01',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.email', 'new@example.com')
            ->assertJsonPath('data.role', RoleEnum::ENSEIGNANT->value)
            ->assertJsonPath('data.actif', false);

        $user->refresh();

        $this->assertSame('Sow', $user->nom);
        $this->assertSame(RoleEnum::ENSEIGNANT, $user->role);
        $this->assertFalse($user->actif);
        $this->assertTrue(Hash::check('nouveaupass123', $user->password));
    }

    public function test_create_enseignant_requires_teacher_fields(): void
    {
        $this->authenticate();

        $this->postJson('/api/users', [
            'nom' => 'Diop',
            'prenom' => 'Mamadou',
            'email' => 'mamadou.diop@example.com',
            'password' => 'motdepasse123',
            'role' => RoleEnum::ENSEIGNANT->value,
            'actif' => true,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'matricule_enseignant',
                'specialite',
                'date_embauche',
            ]);
    }

    public function test_create_eleve_requires_student_fields(): void
    {
        $this->authenticate();

        $this->postJson('/api/users', [
            'nom' => 'Ndiaye',
            'prenom' => 'Awa',
            'email' => 'awa.ndiaye@example.com',
            'password' => 'motdepasse123',
            'role' => RoleEnum::ELEVE->value,
            'actif' => true,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'matricule_eleve',
                'date_naissance',
                'telephone_parent',
            ]);
    }

    public function test_can_toggle_user_status(): void
    {
        $this->authenticate();

        $user = User::factory()->create([
            'actif' => true,
        ]);

        $this->patchJson("/api/users/{$user->id}/toggle-active")
            ->assertOk()
            ->assertJsonPath('data.actif', false);

        $this->assertFalse($user->fresh()->actif);
    }

    public function test_can_soft_delete_user(): void
    {
        $this->authenticate();

        $user = User::factory()->create();

        $this->deleteJson("/api/users/{$user->id}")
            ->assertOk();

        $this->assertSoftDeleted('users', [
            'id' => $user->id,
        ]);
    }
}
