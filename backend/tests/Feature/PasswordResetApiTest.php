<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_rejects_invalid_email_format(): void
    {
        $this->postJson('/api/forgot-password', [
            'email' => 'not-an-email',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_forgot_password_rejects_unknown_email(): void
    {
        $this->postJson('/api/forgot-password', [
            'email' => 'missing@example.com',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_forgot_password_sends_reset_notification_with_frontend_url(): void
    {
        Notification::fake();
        config(['app.frontend_url' => 'http://localhost:5173']);

        $user = User::factory()->create([
            'email' => 'user@example.com',
            'actif' => true,
        ]);

        $this->postJson('/api/forgot-password', [
            'email' => 'user@example.com',
        ])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user): bool {
            $mail = $notification->toMail($user);

            return str_starts_with($mail->actionUrl, 'http://localhost:5173/reset-password?')
                && str_contains($mail->actionUrl, 'token=' . $notification->token)
                && str_contains($mail->actionUrl, 'email=user%40example.com');
        });

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'user@example.com',
        ]);
    }

    public function test_reset_password_updates_password_and_deletes_token(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('old-password'),
            'actif' => true,
        ]);
        $token = Password::broker()->createToken($user);

        $this->postJson('/api/reset-password', [
            'email' => 'user@example.com',
            'token' => $token,
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ])->assertOk();

        $this->assertTrue(Hash::check('new-password123', $user->fresh()->password));
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'user@example.com',
        ]);
    }

    public function test_reset_password_rejects_invalid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('old-password'),
            'actif' => true,
        ]);
        Password::broker()->createToken($user);

        $this->postJson('/api/reset-password', [
            'email' => 'user@example.com',
            'token' => 'invalid-token',
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ])->assertUnprocessable();

        $this->assertTrue(Hash::check('old-password', $user->fresh()->password));
    }

    public function test_reset_password_rejects_expired_token(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('old-password'),
            'actif' => true,
        ]);
        $token = Password::broker()->createToken($user);

        DB::table('password_reset_tokens')
            ->where('email', 'user@example.com')
            ->update([
                'created_at' => now()->subMinutes(config('auth.passwords.users.expire') + 1),
            ]);

        $this->postJson('/api/reset-password', [
            'email' => 'user@example.com',
            'token' => $token,
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ])->assertUnprocessable();

        $this->assertTrue(Hash::check('old-password', $user->fresh()->password));
    }
}
