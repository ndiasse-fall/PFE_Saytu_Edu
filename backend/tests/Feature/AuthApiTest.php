<?php

namespace Tests\Feature;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_and_get_token(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@saytou.test',
            'password' => Hash::make('password123'),
            'role' => RoleEnum::ADMIN,
            'actif' => true,
        ]);

        $this->postJson('/api/login', [
            'email' => 'admin@saytou.test',
            'password' => 'password123',
        ])
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('role', RoleEnum::ADMIN->value)
            ->assertJsonPath('must_change_password', false);
    }

    public function test_user_with_temporary_password_must_change_password(): void
    {
        $user = User::factory()->eleve()->create([
            'email' => 'eleve@saytou.test',
            'password' => Hash::make('temporaire123'),
            'actif' => true,
            'must_change_password' => true,
        ]);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'eleve@saytou.test',
            'password' => 'temporaire123',
        ]);

        $loginResponse
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('must_change_password', true);

        $token = $loginResponse->json('token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/change-password', [
                'current_password' => 'temporaire123',
                'password' => 'nouveaupass123',
                'password_confirmation' => 'nouveaupass123',
            ])
            ->assertOk()
            ->assertJsonPath('user.must_change_password', false);

        $user->refresh();

        $this->assertFalse($user->must_change_password);
        $this->assertTrue(Hash::check('nouveaupass123', $user->password));
    }

    public function test_change_password_rejects_wrong_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
            'actif' => true,
            'must_change_password' => true,
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/change-password', [
                'current_password' => 'wrong-password',
                'password' => 'nouveaupass123',
                'password_confirmation' => 'nouveaupass123',
            ])
            ->assertStatus(422)
            ->assertJsonPath('errors.current_password.0', 'Le mot de passe actuel est incorrect.');
    }

    public function test_login_is_rejected_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'admin@saytou.test',
            'password' => Hash::make('password123'),
            'role' => RoleEnum::ADMIN,
            'actif' => true,
        ]);

        $this->postJson('/api/login', [
            'email' => 'admin@saytou.test',
            'password' => 'wrong-password',
        ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Email ou mot de passe incorrect.');
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'inactive@saytou.test',
            'password' => Hash::make('password123'),
            'actif' => false,
        ]);

        $this->postJson('/api/login', [
            'email' => 'inactive@saytou.test',
            'password' => 'password123',
        ])
            ->assertForbidden();
    }

    public function test_authenticated_user_can_access_protected_route_with_valid_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_authenticated_user_can_update_own_profile(): void
    {
        $user = User::factory()->create([
            'nom' => 'Old',
            'prenom' => 'Name',
            'email' => 'old.profile@saytou.test',
            'telephone' => '770000000',
            'adresse' => 'Ancienne adresse',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson('/api/me', [
                'nom' => 'Ndiaye',
                'prenom' => 'Awa',
                'email' => 'awa.profile@saytou.test',
                'telephone' => '771111111',
                'adresse' => 'Dakar',
            ])
            ->assertOk()
            ->assertJsonPath('data.nom', 'Ndiaye')
            ->assertJsonPath('data.prenom', 'Awa')
            ->assertJsonPath('data.email', 'awa.profile@saytou.test');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'awa.profile@saytou.test',
            'telephone' => '771111111',
        ]);
    }

    public function test_authenticated_user_can_logout_and_token_is_deleted(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_users_endpoint_requires_authentication(): void
    {
        $this->getJson('/api/users')
            ->assertUnauthorized();
    }

    public function test_inactive_authenticated_user_is_blocked_from_protected_routes(): void
    {
        $user = User::factory()->create([
            'actif' => false,
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/me')
            ->assertForbidden()
            ->assertJsonPath('message', 'Accès refusé: utilisateur inactif.');
    }

    public function test_access_is_blocked_when_role_is_not_authorized(): void
    {
        $user = User::factory()->create([
            'role' => RoleEnum::ELEVE,
            'actif' => true,
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/users')
            ->assertForbidden()
            ->assertJsonPath('message', 'Accès refusé: rôle non autorisé.');
    }
}
