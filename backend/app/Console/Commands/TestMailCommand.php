<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Mail\WelcomeUserMail;
use Illuminate\Support\Facades\Mail;

class TestMailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:test {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envoie un e-mail de test de bienvenue à l\'adresse spécifiée et affiche les diagnostics en cas d\'erreur.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info("Initialisation du test d'envoi d'e-mail...");
        $this->comment("Destinataire : {$email}");
        $this->comment("Pilote configuré : " . config('mail.default'));
        $this->comment("Hôte SMTP : " . config('mail.mailers.smtp.host') . ":" . config('mail.mailers.smtp.port'));
        $this->comment("Utilisateur SMTP : " . config('mail.mailers.smtp.username'));
        
        // Création d'un utilisateur factice en mémoire pour le test
        $user = new User([
            'prenom' => 'Jean',
            'nom' => 'Dupont',
            'email' => $email,
        ]);
        
        $plainPassword = 'PasswordTest123!';
        
        try {
            $this->info("Tentative d'envoi via Mail::to()...");
            
            Mail::to($email)->send(new WelcomeUserMail($user, $plainPassword));
            
            $this->info("Succès ! L'e-mail a été envoyé/mis en file d'attente avec succès.");
        } catch (\Throwable $e) {
            $this->error("Échec de l'envoi de l'e-mail !");
            $this->error("Erreur rencontrée : " . $e->getMessage());
            $this->line($e->getTraceAsString());
        }
    }
}

