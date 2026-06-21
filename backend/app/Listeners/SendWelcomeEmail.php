<?php

namespace App\Listeners;

use App\Events\UserCreated;
use App\Mail\WelcomeUserMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendWelcomeEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Crée l'écouteur d'événement.
     */
    public function __construct()
    {
        //
    }

    /**
     * Gère l'événement de création d'utilisateur.
     *
     * @param UserCreated $event
     * @return void
     */
    public function handle(UserCreated $event): void
    {
        Mail::to($event->user->email)->send(
            new WelcomeUserMail($event->user, $event->plainPassword)
        );
    }
}

