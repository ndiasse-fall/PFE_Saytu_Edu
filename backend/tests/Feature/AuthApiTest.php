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
            ->assertJsonPath('role', RoleEnum::ADMIN->value);
    }

    public function test_user_can_login_with_full_name_identifier(): void
    {
        $user = User::factory()->create([
            'nom' => 'Diallo',
            'prenom' => 'Aminata',
            'email' => 'aminata@saytou.test',
            'password' => Hash::make('password123'),
            'role' => RoleEnum::ADMIN,
            'actif' => true,
        ]);

        $this->postJson('/api/login', [
            'email' => 'Aminata Diallo',
            'password' => 'password123',
        ])
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('role', RoleEnum::ADMIN->value);
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
