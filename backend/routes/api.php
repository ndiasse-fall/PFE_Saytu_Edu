<?php

use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);
Route::post('auth/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'check.statut'])->group(function (): void {
    Route::get('me', [AuthController::class, 'me']);
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::prefix('superadmin')->group(function (): void {
        Route::get('/dashboard', [SuperAdminController::class, 'dashboard']);
        Route::get('/users', [SuperAdminController::class, 'users']);
        Route::post('/admins', [SuperAdminController::class, 'storeAdmin']);
        Route::put('/users/{id}/role', [SuperAdminController::class, 'updateRole']);
        Route::delete('/users/{id}', [SuperAdminController::class, 'deleteUser']);
    });

    Route::middleware('check.role:SUPER_ADMIN,ADMIN')->group(function (): void {
        Route::apiResource('users', UserController::class);
        Route::patch('users/{user}/toggle-active', [UserController::class, 'toggleActive']);
    });
});

Route::apiResource('classes', ClasseController::class);
Route::post('classes/{id}/inscrire-eleve', [ClasseController::class, 'inscrireEleve']);
Route::post('classes/{id}/affecter-enseignant', [ClasseController::class, 'affecterEnseignant']);
Route::apiResource('matieres', MatiereController::class);

// Routes CRUD Enseignants
Route::get('/enseignants',         [AdminController::class, 'indexEnseignants']);
Route::post('/enseignants',        [AdminController::class, 'storeEnseignant']);
Route::put('/enseignants/{id}',    [AdminController::class, 'updateEnseignant']);
Route::delete('/enseignants/{id}', [AdminController::class, 'destroyEnseignant']);

// Routes CRUD Élèves
Route::get('/eleves',         [AdminController::class, 'indexEleves']);
Route::post('/eleves',        [AdminController::class, 'storeEleve']);
Route::put('/eleves/{id}',    [AdminController::class, 'updateEleve']);
Route::delete('/eleves/{id}', [AdminController::class, 'destroyEleve']);
