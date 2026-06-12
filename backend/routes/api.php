<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EmploiDuTempsController;

use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmploiDuTempsController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;

// Auth
Route::post('login', [AuthController::class, 'login']);
Route::post('auth/login', [AuthController::class, 'login']); // Alias pour compatibilité


// --- ROUTES PROTÉGÉES ---
Route::middleware(['auth:sanctum', 'check.statut'])->group(function (): void {

    // Informations utilisateur connecté
    Route::get('me', [AuthController::class, 'me']);
    Route::get('auth/me', [AuthController::class, 'me']);

    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::middleware('check.role:SUPER_ADMIN')->group(function (): void {
        Route::prefix('superadmin')->group(function (): void {
            Route::get('/dashboard', [SuperAdminController::class, 'dashboard']);
            Route::get('/users', [SuperAdminController::class, 'users']);
            Route::post('/admins', [SuperAdminController::class, 'storeAdmin']);
            Route::put('/users/{id}/role', [SuperAdminController::class, 'updateRole']);
            Route::delete('/users/{id}', [SuperAdminController::class, 'deleteUser']);
        });
    });

    Route::middleware('check.role:SUPER_ADMIN,ADMIN')->group(function (): void {
        // Gestion des Utilisateurs (CRUD complet)
        Route::apiResource('users', UserController::class);
        Route::patch('users/{user}/toggle-active', [UserController::class, 'toggleActive']);

        Route::apiResource('classes', ClasseController::class);
        Route::post('classes/{id}/inscrire-eleve', [ClasseController::class, 'inscrireEleve']);
        Route::post('classes/{id}/affecter-enseignant', [ClasseController::class, 'affecterEnseignant']);
        Route::apiResource('matieres', MatiereController::class);

        Route::get('/emplois-du-temps', [EmploiDuTempsController::class, 'index']);
        Route::post('/emplois-du-temps', [EmploiDuTempsController::class, 'store']);
    });
});