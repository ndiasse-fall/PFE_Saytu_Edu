<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserCreated
{
    use Dispatchable, SerializesModels;

    /**
     * Crée une nouvelle instance de l'événement.
     *
     * @param User $user L'utilisateur nouvellement créé
     * @param string $plainPassword Le mot de passe en clair avant d'être haché
     */
    public function __construct(
        public User $user,
        public string $plainPassword
    ) {}
}

