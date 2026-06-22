<?php
// =========================================================================
// CONFIGURATION DU DESIGN (Ajustable pour correspondre au Frontend React)
// =========================================================================
$primaryColor   = '#2f64f1';       // Couleur principale (Boutons, En-tête, Libellés)
$bgColor        = '#f5f7fb';       // Fond de l'e-mail
$cardBg         = '#ffffff';       // Fond de la carte centrale
$textColor      = '#516074';       // Couleur du texte secondaire/paragraphes
$textStrong     = '#0d1b35';       // Couleur du texte principal/titres
$borderColor    = '#dbe3ef';       // Couleur des bordures et séparateurs
$accentBg       = '#e8f0ff';       // Fond de la zone des identifiants

// Liens et Variables d'Application
$loginUrl       = env('FRONTEND_URL', 'http://localhost:5173') . '/login';
$appName        = config('app.name', 'Saytu Edu');
?>
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur votre plateforme {{ $appName }}</title>

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

    <style>
    /* =========================================================================
           CSS ISOLÉ (Laravel s'occupe de l'injecter en ligne automatiquement)
           ========================================================================= */
    body {
        margin: 0;
        padding: 0;
        width: 100% !important;
        background-color: <?php echo $bgColor;
        ?>;
        font-family: 'Poppins', 'Segoe UI', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
    }

    .email-wrapper {
        width: 100%;
        background-color: <?php echo $bgColor;
        ?>;
        padding: 40px 0;
    }

    .email-container {
        background-color: <?php echo $cardBg;
        ?>;
        border: 1px solid <?php echo $borderColor;
        ?>;
        border-radius: 12px;
        box-shadow: 0 18px 34px rgba(15, 23, 42, 0.06);
        overflow: hidden;
        border-collapse: separate;
    }

    /* En-tête */
    .header-zone {
        background-color: <?php echo $primaryColor;
        ?>;
        padding: 35px 20px;
        text-align: center;
    }

    .logo-img {
        display: block;
        max-width: 100%;
        height: auto;
        border: 0;
        margin: 0 auto 12px auto;
    }

    .header-title {
        color: #ffffff;
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 0.5px;
    }

    .header-subtitle {
        color: rgba(255, 255, 255, 0.85);
        margin: 5px 0 0 0;
        font-size: 13px;
        font-weight: 400;
    }

    /* Corps */
    .content-zone {
        padding: 40px 30px;
        color: <?php echo $textColor;
        ?>;
        font-size: 15px;
        line-height: 1.6;
    }

    .content-title {
        color: <?php echo $textStrong;
        ?>;
        margin-top: 0;
        margin-bottom: 16px;
        font-size: 19px;
        font-weight: 600;
    }

    .text-spacing {
        margin-bottom: 24px;
    }

    .text-lead {
        margin-bottom: 12px;
        font-weight: 500;
        color: <?php echo $textStrong;
        ?>;
    }

    /* Zone Identifiants */
    .credentials-table {
        background-color: <?php echo $accentBg;
        ?>;
        border-radius: 8px;
        margin-bottom: 30px;
        border-collapse: separate;
    }

    .credentials-padding {
        padding: 20px 24px;
    }

    .label-cell {
        color: <?php echo $primaryColor;
        ?>;
        font-weight: 600;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding-bottom: 8px;
    }

    .value-cell {
        color: <?php echo $textStrong;
        ?>;
        font-family: monospace;
        font-size: 15px;
        font-weight: 500;
        padding-bottom: 8px;
    }

    .value-password {
        color: <?php echo $textStrong;
        ?>;
        font-family: monospace;
        font-size: 15px;
        font-weight: 600;
    }

    /* Bouton */
    .button-container {
        margin: 30px 0;
        text-align: center;
    }

    .btn-primary {
        display: inline-block;
        background-color: <?php echo $primaryColor;
        ?>;
        color: #ffffff !important;
        font-weight: 600;
        font-size: 14px;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 8px;
        box-shadow: 0 8px 20px rgba(47, 100, 241, 0.15);
    }

    /* Sécurité & Footer */
    .security-zone {
        border-top: 1px solid <?php echo $borderColor;
        ?>;
        padding-top: 20px;
        margin-top: 25px;
    }

    .security-text {
        margin: 0;
        font-size: 13px;
        color: #dc2626;
        font-style: italic;
        line-height: 1.5;
    }

    .footer-zone {
        background-color: #f8fafc;
        border-top: 1px solid <?php echo $borderColor;
        ?>;
        padding: 24px 20px;
        font-size: 12px;
        color: <?php echo $textColor;
        ?>;
        text-align: center;
    }

    .footer-text {
        margin: 0 0 6px 0;
        font-weight: 500;
    }

    .footer-copyright {
        margin: 0;
        opacity: 0.8;
    }

    /* Optimisations mobiles obligatoires dans le head */
    @media only screen and (max-width: 600px) {
        .email-container {
            width: 100% !important;
        }

        .content-zone {
            padding: 30px 20px !important;
        }

        .credentials-table {
            width: 100% !important;
        }
    }
    </style>
</head>

<body>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-wrapper">
        <tr>
            <td align="center">

                <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="600">

                    <tr>
                        <td class="header-zone">
                            <img src="{{ $message->embed(public_path('images/logo.png')) }}" alt="{{ $appName }}"
                                width="90" class="logo-img">
                            <h1 class="header-title">{{ $appName }}</h1>
                            <p class="header-subtitle">Votre portail d'éducation en ligne</p>
                        </td>
                    </tr>

                    <tr>
                        <td class="content-zone">

                            <h2 class="content-title">Bonjour {{ $user->prenom }} {{ $user->nom }},</h2>

                            <p class="text-spacing">
                                Votre compte utilisateur a été configuré avec succès sur la plateforme
                                <strong>{{ $appName }}</strong>. Vous disposez désormais d'un accès sécurisé pour
                                rejoindre votre espace de travail.
                            </p>

                            <p class="text-lead">Voici vos identifiants de connexion :</p>

                            <table class="credentials-table" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td class="credentials-padding">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td width="35%" class="label-cell">Email</td>
                                                <td class="value-cell">{{ $user->email }}</td>
                                            </tr>
                                            <tr>
                                                <td width="35%" class="label-cell" style="padding-bottom: 0;">Password
                                                </td>
                                                <td class="value-password" style="padding-bottom: 0;">
                                                    {{ $plainPassword }}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="button-container">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $loginUrl }}" target="_blank" class="btn-primary">
                                            Accéder à mon espace
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="security-zone">
                                <tr>
                                    <td>
                                        <p class="security-text">
                                            <strong>Sécurité :</strong> Nous vous recommandons de remplacer ce mot de
                                            passe temporaire dès votre première connexion depuis l'interface de votre
                                            profil.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <tr>
                        <td class="footer-zone">
                            <p class="footer-text">
                                Cet e-mail a été généré automatiquement, merci de ne pas y répondre.
                            </p>
                            <p class="footer-copyright">
                                &copy; {{ date('Y') }} {{ $appName }}. Tous droits réservés.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>