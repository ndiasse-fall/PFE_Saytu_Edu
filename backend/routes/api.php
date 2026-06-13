<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\EmploiDuTempsController;
use App\Http\Controllers\NoteController;

// --- ROUTES PUBLIQUES ---
Route::post('login', [AuthController::class, 'login']);
Route::post('auth/login', [AuthController::class, 'login']);

// --- ROUTES PROTÉGÉES ---
Route::middleware(['auth:sanctum', 'check.statut'])->group(function (): void {
    Route::get('me', [AuthController::class, 'me']);
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

    // --- ACCÈS PÉDAGOGIE (SUPER ADMIN & ADMIN) ---
    Route::middleware('check.role:SUPER_ADMIN,ADMIN')->group(function (): void {
        Route::apiResource('users', UserController::class);
        Route::patch('users/{user}/toggle-active', [UserController::class, 'toggleActive']);

        Route::apiResource('classes', ClasseController::class);
        Route::post('classes/{id}/inscrire-eleve', [ClasseController::class, 'inscrireEleve']);
        Route::post('classes/{id}/affecter-enseignant', [ClasseController::class, 'affecterEnseignant']);

        // Écriture (store, update, destroy) : uniquement SUPER_ADMIN et ADMIN
        Route::post('emplois-du-temps', [EmploiDuTempsController::class, 'store']);
        Route::put('emplois-du-temps/{id}', [EmploiDuTempsController::class, 'update']);
        Route::delete('emplois-du-temps/{id}', [EmploiDuTempsController::class, 'destroy']);

        // Admin/SuperAdmin : lecture complète
        Route::apiResource('notes', NoteController::class)->only(['index', 'show']);
    });

    // Lecture (index, show) : accessible à SUPER_ADMIN, ADMIN, ENSEIGNANT, ELEVE
    Route::middleware('check.role:SUPER_ADMIN,ADMIN,ENSEIGNANT,ELEVE')->group(function (): void {
        Route::get('emplois-du-temps', [EmploiDuTempsController::class, 'index']);
        Route::get('emplois-du-temps/{id}', [EmploiDuTempsController::class, 'show']);
    });


    // Enseignant : CRUD complet
    Route::middleware('check.role:ENSEIGNANT')->group(function () {
        Route::post('notes/saisir', [NoteController::class, 'store']);
        Route::put('notes/{id}', [NoteController::class, 'update']);
        Route::delete('notes/{id}', [NoteController::class, 'destroy']);
    });

    // Élève : lecture seule
    Route::middleware('check.role:ELEVE')->group(function () {
        Route::get('notes', [NoteController::class, 'index']);
        Route::get('notes/{id}', [NoteController::class, 'show']);
    });
});
