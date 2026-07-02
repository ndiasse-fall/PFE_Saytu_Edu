<?php

use Illuminate\Support\Facades\Route;

// Controllers existants
use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\EnseignantController;
use App\Http\Controllers\Api\EmploiDuTempsController;
use App\Http\Controllers\Api\AbsenceController;


use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes - Saytu Edu
|--------------------------------------------------------------------------
*/

// ======================================================
// ROUTES PUBLIQUES
// ======================================================

// Auth
Route::post('login', [AuthController::class, 'login']);
Route::post('auth/login', [AuthController::class, 'login']);


// ======================================================
// ROUTES PROTÉGÉES
// ======================================================
Route::middleware(['auth:sanctum', 'check.statut'])->group(function (): void {

    // =========================
    // AUTH CONNECTÉ
    // =========================
    Route::get('me', [AuthController::class, 'me']);
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // ==================================================
    // SUPER ADMIN ONLY
    // ==================================================
    Route::middleware('check.role:SUPER_ADMIN')->prefix('superadmin')->group(function (): void {
        Route::get('/dashboard', [SuperAdminController::class, 'dashboard']);
        Route::get('/users', [SuperAdminController::class, 'users']);
        Route::post('/admins', [SuperAdminController::class, 'storeAdmin']);
        Route::put('/users/{id}/role', [SuperAdminController::class, 'updateRole']);
        Route::delete('/users/{id}', [SuperAdminController::class, 'deleteUser']);
    });

    // ==================================================
    // ADMIN + SUPER ADMIN (GESTION PÉDAGOGIQUE)
    // ==================================================
    Route::middleware('check.role:SUPER_ADMIN,ADMIN')->group(function (): void {

        // Users
        Route::apiResource('users', UserController::class);
        Route::patch('users/{user}/toggle-active', [UserController::class, 'toggleActive']);

        // Classes
        Route::apiResource('classes', ClasseController::class);
        Route::post('classes/{id}/inscrire-eleve', [ClasseController::class, 'inscrireEleve']);
        Route::post('classes/{id}/affecter-enseignant', [ClasseController::class, 'affecterEnseignant']);

        // Matières
        Route::apiResource('matieres', MatiereController::class);

        // Emploi du temps (CRUD sauf index/show)
        Route::apiResource('emplois-du-temps', EmploiDuTempsController::class)
            ->except(['index', 'show']);
    });

    // ==================================================
    // CONSULTATION EMPLOI DU TEMPS (TOUS)
    // ==================================================
    Route::get('emplois-du-temps', [EmploiDuTempsController::class, 'index']);
    Route::get('emplois-du-temps/{id}', [EmploiDuTempsController::class, 'show']);

    // ==================================================
    // ABSENCES - LECTURE TOUS LES RÔLES CONNECTÉS
    // ==================================================
    Route::middleware('check.role:SUPER_ADMIN,ADMIN,ENSEIGNANT,ELEVE')->group(function (): void {
        Route::get('absences', [AbsenceController::class, 'index']);
        Route::get('absences/classe/{id}', [AbsenceController::class, 'byClasse']);
    });

    // ==================================================
    // ENSEIGNANT + ADMIN + SUPER ADMIN
    // ==================================================
    Route::middleware('check.role:ENSEIGNANT,SUPER_ADMIN,ADMIN')->group(function (): void {

        // Notes
        Route::post('notes/saisir', [EnseignantController::class, 'saisirNotes']);

        // Classes utiles pour les modules enseignant
        Route::get('mes-classes', [ClasseController::class, 'mesClasses']);
        Route::get('mes-classes/{id}/eleves', [ClasseController::class, 'elevesParClasse']);

        // Absences
        Route::post('absences', [AbsenceController::class, 'store']);
        Route::post('absences/enregistrer', [AbsenceController::class, 'store']);
        Route::put('absences/{id}', [AbsenceController::class, 'update']);
        Route::put('absences/{id}/justifier', [AbsenceController::class, 'updateJustification']);
        Route::delete('absences/{id}', [AbsenceController::class, 'destroy']);
    });

});
