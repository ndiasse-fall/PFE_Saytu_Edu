<?php

use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\EnseignantController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EmploiDuTempsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Ici se trouvent les routes de l'API de Saytu Edu.
| Elles sont protégées par le middleware Sanctum.
|
*/

// --- ROUTES PUBLIQUES ---
// Authentification
Route::post('login', [AuthController::class, 'login']);
Route::post('auth/login', [AuthController::class, 'login']); // Alias pour compatibilité


// --- ROUTES PROTÉGÉES ---
Route::middleware(['auth:sanctum', 'check.statut'])->group(function (): void {

    // Informations utilisateur connecté
    Route::get('me', [AuthController::class, 'me']);
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // --- ACCÈS EXCLUSIF SUPER ADMIN ---
    Route::middleware('check.role:SUPER_ADMIN')->group(function () {
        Route::prefix('superadmin')->group(function (): void {
            Route::get('/dashboard', [SuperAdminController::class, 'dashboard']);
            Route::get('/users', [SuperAdminController::class, 'users']);
            Route::post('/admins', [SuperAdminController::class, 'storeAdmin']);
            Route::put('/users/{id}/role', [SuperAdminController::class, 'updateRole']);
            Route::delete('/users/{id}', [SuperAdminController::class, 'deleteUser']);
        });
    });

    // --- ACCÈS PÉDAGOGIE (SUPER ADMIN & ADMIN) ---
    Route::middleware('check.role:SUPER_ADMIN,ADMIN')->group(function (): void {
        // Gestion des Utilisateurs (CRUD complet)
        Route::apiResource('users', UserController::class);
        Route::patch('users/{user}/toggle-active', [UserController::class, 'toggleActive']);

        // Gestion des Classes
        Route::apiResource('classes', ClasseController::class);
        Route::post('classes/{id}/inscrire-eleve', [ClasseController::class, 'inscrireEleve']);
        Route::post('classes/{id}/affecter-enseignant', [ClasseController::class, 'affecterEnseignant']);

        // Gestion des Matières
        Route::apiResource('matieres', MatiereController::class);

        // Gestion de l'Emploi du Temps (Création, Modification, Suppression)
        Route::apiResource('emplois-du-temps', EmploiDuTempsController::class)->except(['index', 'show']);
    });

    // --- CONSULTATION EMPLOI DU TEMPS (TOUS) ---
    Route::get('emplois-du-temps', [EmploiDuTempsController::class, 'index']);
    Route::get('emplois-du-temps/{id}', [EmploiDuTempsController::class, 'show']);

    // --- ACCÈS ENSEIGNANT (ET ADMIN) ---
    Route::middleware('check.role:ENSEIGNANT,SUPER_ADMIN,ADMIN')->group(function (): void {
        // Saisie des notes
        Route::post('notes/saisir', [EnseignantController::class, 'saisirNotes']);
    });

    // --- ACCÈS ÉLÈVE ---
    // (Ajouter ici les routes spécifiques aux élèves si nécessaire)

});