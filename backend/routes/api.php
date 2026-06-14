<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EmploiDuTempsController;

use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\EnseignantController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmploiDuTempsController;
use App\Http\Controllers\UserController;
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
Route::post('login', [AuthController::class, 'login']);
Route::post('auth/login', [AuthController::class, 'login']);

// --- ROUTES PROTÉGÉES ---
Route::middleware(['auth:sanctum', 'check.statut'])->group(function (): void {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    // --- ACCÈS EXCLUSIF SUPER ADMIN ---
    Route::middleware('check.role:SUPER_ADMIN')->group(function (): void {
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
        Route::apiResource('users', UserController::class);
        Route::patch('users/{user}/toggle-active', [UserController::class, 'toggleActive']);

        Route::apiResource('classes', ClasseController::class);
        Route::post('classes/{id}/inscrire-eleve', [ClasseController::class, 'inscrireEleve']);
        Route::post('classes/{id}/affecter-enseignant', [ClasseController::class, 'affecterEnseignant']);

        Route::apiResource('matieres', MatiereController::class);
        Route::apiResource('emplois-du-temps', EmploiDuTempsController::class)->except(['index', 'show']);
    });

    // --- CONSULTATION EMPLOI DU TEMPS (TOUS) ---
    Route::get('emplois-du-temps', [EmploiDuTempsController::class, 'index']);
    Route::get('emplois-du-temps/{id}', [EmploiDuTempsController::class, 'show']);

    // --- ACCÈS ENSEIGNANT (ET ADMIN) ---
    Route::middleware('check.role:ENSEIGNANT,SUPER_ADMIN,ADMIN')->group(function (): void {
        Route::post('notes/saisir', [EnseignantController::class, 'saisirNotes']);
    });
});
