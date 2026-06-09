<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\UserService;
use App\Enums\RoleEnum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    private UserService $userService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->userService = new UserService();
    }

    public function test_can_list_users_with_filters()
    {
        User::factory()->admin()->count(2)->create();
        User::factory()->eleve()->count(3)->create();

        $allUsers = $this->userService->listUsers();
        $this->assertEquals(5, $allUsers->total());

        $admins = $this->userService->listUsers(['role' => RoleEnum::ADMIN]);
        $this->assertEquals(2, $admins->total());
    }

    public function test_can_create_user()
    {
        $userData = [
            'nom' => 'Doe',
            'prenom' => 'John',
            'email' => 'john@example.com',
            'password' => 'secret123',
            'role' => RoleEnum::ELEVE,
            'statut' => 'ELEVE',
        ];

        $user = $this->userService->createUser($userData);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('Doe', $user->nom);
        $this->assertEquals('John', $user->prenom);
    }

    public function test_can_update_user()
    {
        $user = User::factory()->create(['nom' => 'OldName']);

        $updatedUser = $this->userService->updateUser($user, ['nom' => 'NewName']);

        $this->assertEquals('NewName', $updatedUser->nom);
    }

    public function test_can_toggle_active_status()
    {
        $user = User::factory()->create(['actif' => true]);

        $user = $this->userService->toggleActive($user);
        $this->assertFalse($user->actif);

        $user = $this->userService->toggleActive($user);
        $this->assertTrue($user->actif);
    }
}