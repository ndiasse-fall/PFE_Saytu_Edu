<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeUserMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Crée une nouvelle instance de message.
     *
     * @param User $user L'utilisateur
     * @param string $plainPassword Le mot de passe en clair
     */
    public function __construct(
        public User $user,
        public string $plainPassword
    ) {}

    /**
     * Définit l'enveloppe du message (expéditeur, sujet, etc.).
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bienvenue sur votre plateforme - Vos identifiants de connexion',
        );
    }

    /**
     * Définit le contenu du message.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

