<?php

namespace App\Providers;

use App\Events\UserCreated;
use App\Listeners\SendWelcomeEmail;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token): string {
            $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
            $email = urlencode((string) $notifiable->getEmailForPasswordReset());

            return "{$frontendUrl}/reset-password?token={$token}&email={$email}";
        });

        Event::listen(
            UserCreated::class,
            SendWelcomeEmail::class
        );
    }
}
