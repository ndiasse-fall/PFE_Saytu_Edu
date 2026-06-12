<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EmploiDuTempsController;

use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\Api\SuperAdminController;

// Auth
Route::post('login', [AuthController::class, 'login']);
Route::post('auth/login', [AuthController::class, 'login']);

// ROUTES PROTÉGÉES
Route::middleware(['auth:sanctum', 'check.statut'])->group(function () {

    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::middleware('check.role:SUPER_ADMIN')->group(function () {
        Route::prefix('superadmin')->group(function () {
            Route::get('/dashboard', [SuperAdminController::class, 'dashboard']);
            Route::get('/users', [SuperAdminController::class, 'users']);
            Route::post('/admins', [SuperAdminController::class, 'storeAdmin']);
            Route::put('/users/{id}/role', [SuperAdminController::class, 'updateRole']);
            Route::delete('/users/{id}', [SuperAdminController::class, 'deleteUser']);
        });
    });

    Route::middleware('check.role:SUPER_ADMIN,ADMIN')->group(function () {

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