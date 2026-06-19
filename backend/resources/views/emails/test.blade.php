<?php
// Configuration des styles et variables (facilement modifiable pour correspondre au Frontend React)
$primaryColor = '#2f64f1';
$primaryHover = '#1f57df';
$bgColor = '#f5f7fb';
$cardBg = '#ffffff';
$textColor = '#516074';
$textStrong = '#0d1b35';
$borderColor = '#dbe3ef';
$accentBg = '#e8f0ff';
// URL de connexion frontend (configurablevia .env ou par défaut) 
$loginUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/login';
$appName = config('app.name', 'Saytu Edu'); ?>
<!DOCTYPE html>
<html lang="fr">

<head>
       
    <meta charset="UTF-8">
       
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue sur votre plateforme Saytu Edu</title>
       
    <!-- Chargement de la police Poppins identique au Frontend -->
       
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
        /* Styles de fallback pour les clients mail supportant les balises <style> */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                padding: 16px !important;
            }

            .credentials-table {
                width: 100% !important;
            }
        }
    </style>
</head>

<body style=`margin:0;padding:0;width:100%;background-color: {{ $bgColor }};font-family: 'Poppins' , 'Segoe UI' ,    
    Helvetica, Arial, sans-serif;`>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style=`background-color:
        {{ $bgColor }};padding:40px 0;`>
                <tr>
                        <td align="center">

                               
                <!-- Container principal -->
                                <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="600"  
                                      style=`background-color: {{ $cardBg }}; border: 1px solid {{ $borderColor }};
                    border-radius: 12px;                     box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08); overflow:
                    hidden; border-collapse: separate;`>

                                       
                    <!-- En-tête / Logo -->
                                        <tr>
                                                <td align="center" style=`background-color: {{ $primaryColor }};
                            padding: 30px 20px;`>
                                                        <h1                                
                                style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">
                                                                {{ $appName }}
                                                            </h1>
                                                        <p                                
                                style="color: rgba(255, 255, 255, 0.85); margin: 5px 0 0 0; font-size: 14px; font-weight: 400;">
                                                                Votre portail d'éducation en ligne
                                                            </p>
                                                    </td>
                                            </tr>

                                       
                    <!-- Contenu de l'e-mail -->
                                        <tr>
                                                <td style=`padding: 40px 30px; color: {{ $textColor }}; font-size: 15px;
                            line-height: 1.6;`>

                                                        <h2 style=`color: {{ $textStrong }}; margin-top: 0; font-size:
                                20px; font-weight: 600;`>
                                                                Bonjour {{ $user->prenom }} {{ $user->nom }},
                                                            </h2>

                                                        <p style="margin-bottom: 24px;">
                                                                Nous avons le plaisir de vous informer que votre compte
                                utilisateur a été créé avec
                                                                succès sur la plateforme
                                <strong>{{ $appName }}</strong>. Vous pouvez dès à présent
                                                                vous
                                                                connecter et accéder à votre espace de travail.
                                                           
                            </p>

                                                        <p style=`margin-bottom: 12px; font-weight: 500; color:
                                {{ $textStrong }};`>
                                                                Voici vos identifiants de connexion personnels :
                                                            </p>

                                                       
                            <!-- Carte des Identifiants -->
                                                        <table class="credentials-table" border="0" cellpadding="0"
                                cellspacing="0" width="100%"                                 style=`background-color:
                                {{ $accentBg }}; border-radius: 8px; margin-bottom: 30px;                              
                                  border-collapse: separate;`>
                                                                <tr>
                                                                        <td style="padding: 20px 24px;">
                                                                                <table border="0" cellpadding="0"
                                            cellspacing="0" width="100%">
                                                                                        <tr>
                                                                                                <td width="30%"
                                                    style=`padding-bottom: 10px; font-weight: 600; color:              
                                                                                          {{ $primaryColor }};
                                                    font-size: 14px; text-transform: uppercase;                        
                                                                                letter-spacing: 0.5px;`>
                                                                                                        Email
                                                                                                    </td>
                                                                                                <td
                                                    style=`padding-bottom: 10px; font-family: monospace; font-size:    
                                                                                                    15px; color:
                                                    {{ $textStrong }}; font-weight: 500;`>
                                                                                                       
                                                    {{ $user->email }}
                                                                                                   
                                                </td>
                                                                                            </tr>
                                                                                        <tr>
                                                                                                <td width="30%"
                                                    style=`font-weight: 600; color: {{ $primaryColor }};                
                                                                                        font-size: 14px; text-transform:
                                                    uppercase; letter-spacing: 0.5px;`>
                                                                                                        Mot de passe
                                                                                                    </td>
                                                                                                <td style=`font-family:
                                                    monospace; font-size: 15px; color:                                  
                                                                      {{ $textStrong }}; font-weight: 600;`>
                                                                                                       
                                                    {{ $plainPassword }}
                                                                                                   
                                                </td>
                                                                                            </tr>
                                                                                    </table>
                                                                            </td>
                                                                    </tr>
                                                            </table>

                                                       
                            <!-- Bouton d'action -->
                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                style="margin-bottom: 30px;">
                                                                <tr>
                                                                        <td align="center">
                                                                                <a href="{{ $loginUrl }}"
                                            target="_blank" style=`display: inline-block;                              
                                                          background-color: {{ $primaryColor }}; color: #ffffff;
                                            font-weight: 600;                                             font-size:
                                            15px; text-decoration: none; padding: 14px 30px; border-radius:            
                                                                            8px; box-shadow: 0 10px 24px rgba(31, 87,
                                            223, 0.15); transition:                                            
                                            background-color 0.2s ease;`>
                                                                                        Accéder à mon espace
                                                                                    </a>
                                                                            </td>
                                                                    </tr>
                                                            </table>

                                                       
                            <!-- Avertissement de sécurité -->
                                                        <table bor`er="0" cellpadding="0" cellspacing="0" width="100%"
                                style=`border-top: 1px solid                                 {{ $borderColor }};
                                padding-top: 20px; margin-top: 20px;`>
                                                                <tr>
                                                                        <td>
                                                                                <p                                      
                                                 
                                            style="margin: 0; font-size: 13px; color: #dc2626; font-style: italic; line-height: 1.5;">
                                                                                        <strong>Important :</strong> Par
                                            mesure de sécurité, nous vous
                                                                                        recommandons
                                                                                        vivement de modifier ce mot de
                                            passe temporaire dès votre première
                                                                                        connexion
                                                                                        dans les paramètres de votre
                                            profil. <br>
                                                                                    </p>
                                                                            </td>
                                                                    </tr>
                                                            </table>

                                                   
                        </td>
                                            </tr>

                                       
                    <!-- Pied de page -->
                                        <tr>
                                                <td align="center" style=`background-color: #f8fafc; border-top: 1px
                            solid {{ $borderColor }};                             padding: 24px 20px; font-size: 12px;
                            color: {{ $textColor }};`>
                                                        <p style="margin: 0 0 8px 0; font-weight: 500;">
                                                                Cet e-mail est généré automatiquement, merci de ne pas y
                                répondre directement.
                                                            </p>
                                                        <p style="margin: 0;">
                                                                &copy; {{ date('Y') }} {{ $appName }}. Tous droits
                                réservés.
                                                            </p>
                                                    </td>
                                            </tr>

                                   
                </table>

                           
            </td>
                    </tr>
            </table>

</body>

</html>