<?php

namespace Tests\Feature;

use App\Enums\RoleEnum;
use App\Events\UserCreated;
use App\Listeners\SendWelcomeEmail;
use App\Mail\WelcomeUserMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WelcomeEmailTest extends TestCase
{
    use RefreshDatabase;

    private function authenticateSuperAdmin(): void
    {
        Sanctum::actingAs(User::factory()->create([
            'role' => RoleEnum::SUPER_ADMIN,
            'actif' => true,
        ]));
    }

    /**
     * Teste que la création d'un utilisateur via l'API dispatche bien l'événement UserCreated.
     */
    public function test_creating_user_dispatches_user_created_event(): void
    {
        $this->authenticateSuperAdmin();
        Event::fake();

        $response = $this->postJson('/api/users', [
            'nom' => 'Ndiaye',
            'prenom' => 'Babacar',
            'email' => 'babacar@example.com',
            'password' => 'passer123',
            'telephone' => '771234567',
            'adresse' => 'Dakar',
            'role' => RoleEnum::ENSEIGNANT->value,
            'actif' => true,
        ]);

        $response->assertCreated();

        Event::assertDispatched(UserCreated::class, function ($event) {
            return $event->user->email === 'babacar@example.com' 
                && $event->plainPassword === 'passer123';
        });
    }

    /**
     * Teste que la création d'un administrateur via l'API SuperAdmin dispatche bien l'événement UserCreated.
     */
    public function test_creating_admin_dispatches_user_created_event(): void
    {
        $this->authenticateSuperAdmin();
        Event::fake();

        $response = $this->postJson('/api/superadmin/admins', [
            'nom' => 'Sow',
            'prenom' => 'Fatou',
            'email' => 'fatou.sow@example.com',
            'password' => 'adminpass123',
            'password_confirmation' => 'adminpass123',
            'telephone' => '778901234',
            'adresse' => 'Saint-Louis',
        ]);

        $response->assertCreated();

        Event::assertDispatched(UserCreated::class, function ($event) {
            return $event->user->email === 'fatou.sow@example.com' 
                && $event->plainPassword === 'adminpass123';
        });
    }

    /**
     * Teste que le Listener SendWelcomeEmail envoie bien la classe WelcomeUserMail.
     */
    public function test_listener_sends_welcome_email(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);
        $plainPassword = 'plainPassword123';

        $event = new UserCreated($user, $plainPassword);
        $listener = new SendWelcomeEmail();
        $listener->handle($event);

        Mail::assertSent(WelcomeUserMail::class, function ($mail) use ($user, $plainPassword) {
            return $mail->hasTo($user->email)
                && $mail->user->id === $user->id
                && $mail->plainPassword === $plainPassword;
        });
    }

    /**
     * Teste le rendu visuel et le contenu de l'e-mail WelcomeUserMail.
     */
    public function test_welcome_user_mail_content(): void
    {
        $user = User::factory()->create([
            'prenom' => 'Ndiasse',
            'nom' => 'Fall',
            'email' => 'ndiasse.fall@example.com',
        ]);
        $plainPassword = 'motdepasseenclair';

        $mailable = new WelcomeUserMail($user, $plainPassword);

        $mailable->assertSeeInHtml('Ndiasse Fall');
        $mailable->assertSeeInHtml('ndiasse.fall@example.com');
        $mailable->assertSeeInHtml('motdepasseenclair');
        $mailable->assertHasSubject('Bienvenue sur votre plateforme - Vos identifiants de connexion');
    }
}
