<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EmploiDuTempsController;

use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\EnseignantController;
use App\Http\Controllers\Api\EleveController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Routes API de Saytu Edu
|
*/

// ===============================
// ROUTES PUBLIQUES
// ===============================

Route::post('login', [AuthController::class, 'login']);
Route::post('auth/login', [AuthController::class, 'login']);

// ===============================
// ROUTES PROTÉGÉES
// ===============================

Route::middleware(['auth:sanctum', 'check.statut'])->group(function () {

    // Informations utilisateur connecté
    Route::get('me', [AuthController::class, 'me']);
    Route::get('auth/me', [AuthController::class, 'me']);

    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // ===============================
    // SUPER ADMIN UNIQUEMENT
    // ===============================

    Route::middleware('check.role:SUPER_ADMIN')->group(function () {

        Route::prefix('superadmin')->group(function () {

            Route::get('dashboard', [SuperAdminController::class, 'dashboard']);
            Route::get('users', [SuperAdminController::class, 'users']);

            Route::post('admins', [SuperAdminController::class, 'storeAdmin']);

            Route::put('users/{id}/role', [SuperAdminController::class, 'updateRole']);

            Route::delete('users/{id}', [SuperAdminController::class, 'deleteUser']);
        });
    });

    // ===============================
    // ADMIN + SUPER ADMIN
    // ===============================

    Route::middleware('check.role:SUPER_ADMIN,ADMIN')->group(function () {

        // Gestion utilisateurs
        Route::apiResource('users', UserController::class);

        Route::patch(
            'users/{user}/toggle-active',
            [UserController::class, 'toggleActive']
        );

        // Gestion classes
        Route::apiResource('classes', ClasseController::class);

        Route::post(
            'classes/{id}/inscrire-eleve',
            [ClasseController::class, 'inscrireEleve']
        );

        Route::post(
            'classes/{id}/affecter-enseignant',
            [ClasseController::class, 'affecterEnseignant']
        );

        // Gestion matières
        Route::apiResource('matieres', MatiereController::class);

        // Gestion emploi du temps
        Route::apiResource('emplois-du-temps', EmploiDuTempsController::class)
            ->except(['index', 'show']);
    });

    // ===============================
    // CONSULTATION EMPLOI DU TEMPS
    // ===============================

    Route::get(
        'emplois-du-temps',
        [EmploiDuTempsController::class, 'index']
    );

    Route::get(
        'emplois-du-temps/{id}',
        [EmploiDuTempsController::class, 'show']
    );

    // ===============================
    // ENSEIGNANTS
    // ===============================

    Route::middleware('check.role:ENSEIGNANT,SUPER_ADMIN,ADMIN')->group(function () {

        Route::post(
            'notes/saisir',
            [EnseignantController::class, 'saisirNotes']
        );
    });

    // ===============================
    // ÉLÈVES
    // ===============================

    Route::middleware('check.role:ELEVE')->group(function () {

        Route::get(
            'mon-bulletin',
            [EleveController::class, 'monBulletin']
        );

        Route::get(
            'mon-emploi-du-temps',
            [EleveController::class, 'monEmploiDuTemps']
        );
    });
});